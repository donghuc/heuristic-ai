/// <reference types="@figma/plugin-typings" />
// ──────────────────────────────────────────────────────────────

// main.ts  — Figma plugin sandbox (no DOM)
// Handles: node traversal, rule execution, screenshot export,
//          clientStorage for settings, API calls, message routing
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, NormalizedFill, PluginSettings, AuditReportJSON, AuditIssue, FrameAuditPayload, RuleResult, RuleIssue } from './shared/types';
import type { UIToMain, MainToUI } from './shared/messages';
import { runAllRules } from './rules/index';
import { computeDeterministicScore } from './rules/score';
import { runAIAudit } from './services/ai.service';

// ── Constants ─────────────────────────────────────────────────
const MAX_DEPTH = 12;
const MAX_NODES = 500;
const STORAGE_KEY_SETTINGS = 'heuristic_settings';

// ── UI Window ─────────────────────────────────────────────────
figma.showUI(__html__, { width: 380, height: 600, title: 'AI UX Audit', themeColors: true });

// ── Helpers ───────────────────────────────────────────────────
function rgbToHex(color: RGB): string {
    const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
}

function normalizeFills(fills: readonly Paint[] | PluginAPI['mixed']): NormalizedFill[] {
    if (!fills || typeof fills === 'symbol') return [];
    return (fills as readonly Paint[])
        .filter((f): f is SolidPaint => f.type === 'SOLID' && (f.visible !== false))
        .map(f => ({
            type: 'SOLID',
            r: f.color.r,
            g: f.color.g,
            b: f.color.b,
            opacity: f.opacity ?? 1,
            hex: rgbToHex(f.color)
        }));
}

// ── Node Extractor ────────────────────────────────────────────
const SKIP_TYPES = new Set(['VECTOR', 'STAR', 'POLYGON', 'ELLIPSE', 'LINE', 'BOOLEAN_OPERATION']);
let collectedCount = 0;

async function extractNodeData(node: SceneNode): Promise<ExtractedNode | null> {
    if (SKIP_TYPES.has(node.type)) return null;
    if (!node.visible) return null;
    if ('opacity' in node && node.opacity === 0) return null;

    const base: ExtractedNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: 'absoluteBoundingBox' in node ? (node.absoluteBoundingBox?.x ?? 0) : 0,
        y: 'absoluteBoundingBox' in node ? (node.absoluteBoundingBox?.y ?? 0) : 0,
        width: 'width' in node ? node.width : 0,
        height: 'height' in node ? node.height : 0,
        visible: node.visible,
    };

    if (node.type === 'TEXT') {
        const t = node as TextNode;
        const MAX_CHARS = 200;
        const rawText = t.characters;
        return {
            ...base,
            characters: rawText.length > MAX_CHARS
                ? rawText.slice(0, MAX_CHARS) + ` [truncated — full length: ${rawText.length} chars]`
                : rawText,
            fontSize: typeof t.fontSize === 'number' ? t.fontSize : undefined,
            fontName: typeof t.fontName === 'symbol' ? undefined
                : { family: (t.fontName as FontName).family, style: (t.fontName as FontName).style },
            textStyleId: typeof t.textStyleId === 'string' ? t.textStyleId : undefined,
            fills: normalizeFills(t.fills),
        };
    }

    if (
        node.type === 'FRAME' || node.type === 'COMPONENT' ||
        node.type === 'INSTANCE' || node.type === 'GROUP'
    ) {
        const f = node as FrameNode;
        const result: ExtractedNode = {
            ...base,
            fills: normalizeFills(f.fills),
        };

        if (node.type !== 'GROUP') {
            const fn = node as FrameNode;
            result.layoutMode = fn.layoutMode;
            result.paddingTop = fn.paddingTop;
            result.paddingBottom = fn.paddingBottom;
            result.paddingLeft = fn.paddingLeft;
            result.paddingRight = fn.paddingRight;
            result.itemSpacing = fn.itemSpacing;
            result.primaryAxisAlignItems = fn.primaryAxisAlignItems;
            result.counterAxisAlignItems = fn.counterAxisAlignItems;
        }

        if (node.type === 'INSTANCE') {
            const inst = node as InstanceNode;
            try {
                const mainComp = await inst.getMainComponentAsync();
                result.componentName = mainComp?.name ?? null;
            } catch (err) {
                // If it fails (e.g., detached), fallback gracefully
                result.componentName = null;
            }
        }

        return result;
    }

    if (node.type === 'RECTANGLE') {
        const r = node as RectangleNode;
        return { ...base, fills: normalizeFills(r.fills) };
    }

    return null;
}

async function traverseNode(node: SceneNode, depth: number): Promise<ExtractedNode[]> {
    if (depth > MAX_DEPTH || collectedCount >= MAX_NODES) return [];
    // Short-circuit: skip invisible subtrees entirely
    if (!node.visible) return [];

    const results: ExtractedNode[] = [];
    const extracted = await extractNodeData(node);
    if (extracted) {
        results.push(extracted);
        collectedCount++;
    }

    if ('children' in node) {
        for (const child of (node as ChildrenMixin).children) {
            if (collectedCount >= MAX_NODES) break;
            const childResults = await traverseNode(child, depth + 1);
            results.push(...childResults);
        }
    }

    return results;
}

// ── Screenshot Export ─────────────────────────────────────────
async function exportScreenshot(frame: FrameNode): Promise<string | null> {
    try {
        if (frame.width > 4000 || frame.height > 4000) {
            console.warn('[Heuristic AI] Frame too large for screenshot export');
            return null;
        }
        const bytes = await frame.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 0.5 },
        });

        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        // figma sandbox contains figma.base64Encode, use that instead of btoa
        return figma.base64Encode(bytes);
    } catch (err) {
        console.error('[Heuristic AI] Screenshot export failed:', err);
        return null;
    }
}

// ── Settings Storage ──────────────────────────────────────────
async function getSettings(): Promise<PluginSettings> {
    const data = await figma.clientStorage.getAsync(STORAGE_KEY_SETTINGS);
    return data ?? { apiKey: '', provider: 'openai', platform: 'Mobile', includeScreenshot: false };
}

// ── Selection Monitor ─────────────────────────────────────────
function notifySelectionChange() {
    const sel = figma.currentPage.selection;
    const frame = sel.find(n => n.type === 'FRAME') as FrameNode | undefined;
    const msg: MainToUI = {
        type: 'SELECTION_CHANGED',
        payload: {
            hasValidSelection: !!frame,
            frameName: frame?.name ?? undefined,
        }
    };
    figma.ui.postMessage(msg);
}

figma.on('selectionchange', notifySelectionChange);

// ── Message Handler ───────────────────────────────────────────
figma.ui.onmessage = async (raw: unknown) => {
    const msg = raw as UIToMain;

    if (msg.type === 'RESIZE_WINDOW') {
        figma.ui.resize(msg.payload.width, msg.payload.height);
        return;
    }

    if (msg.type === 'FOCUS_NODE') {
        const node = await figma.getNodeByIdAsync(msg.payload.nodeId);
        if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
            figma.currentPage.selection = [node as SceneNode];
            figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
        }
        return;
    }

    if (msg.type === 'SAVE_API_KEY') {
        const settings = await getSettings();
        settings.apiKey = msg.payload.key;
        settings.provider = msg.payload.provider;
        settings.platform = msg.payload.platform;
        await figma.clientStorage.setAsync(STORAGE_KEY_SETTINGS, settings);

        // Notify UI that init state is ready
        figma.ui.postMessage({ type: 'INIT_STATE', payload: { hasApiKey: true } } as MainToUI);
        return;
    }

    if (msg.type === 'START_AUDIT') {
        const selection = figma.currentPage.selection;
        const frame = selection.find(n => n.type === 'FRAME') as FrameNode | undefined;

        if (!frame) {
            figma.ui.postMessage({ type: 'ERROR', payload: { message: 'Please select a Frame.' } } as MainToUI);
            return;
        }

        const settings = await getSettings();
        if (!settings.apiKey) {
            figma.ui.postMessage({ type: 'ERROR', payload: { message: 'API Key missing.' } } as MainToUI);
            return;
        }

        try {
            collectedCount = 0;
            const nodes = await traverseNode(frame, 0);
            const truncated = collectedCount >= MAX_NODES;

            const deterministicResults = runAllRules(nodes);
            const detIssues: AuditIssue[] = [];

            deterministicResults.forEach(r => {
                if (!r.passed && r.issues.length > 0) {
                    r.issues.forEach(i => {
                        detIssues.push({
                            id: `det-${Math.random().toString(36).substring(2, 9)}`,
                            nodeId: i.nodeId,
                            category: 'Accessibility',
                            severity: r.severity === 'critical' ? 'Critical' : r.severity === 'warning' ? 'High' : 'Low',
                            title: r.ruleName,
                            description: i.detail,
                            recommendation: r.ruleId === 'TOUCH_TARGET_SIZE'
                                ? 'Resize this element to at least 44×44px to meet the minimum touch target requirement.'
                                : r.ruleId === 'CONTRAST_RATIO'
                                    ? 'Increase the text or background color to achieve a minimum 4.5:1 contrast ratio (WCAG AA). Use a contrast checker tool to find the nearest passing color value.'
                                    : r.summary,
                        });
                    });
                }
            });

            // Build the list of already-flagged nodeIds to pass to the AI
            const alreadyFlaggedNodeIds: string[] = [];
            deterministicResults.forEach((r: RuleResult) => {
                if (!r.passed) {
                    r.issues.forEach((i: RuleIssue) => alreadyFlaggedNodeIds.push(i.nodeId));
                }
            });

            // Prepare payload for AI
            const screenshotAllowed = settings.includeScreenshot ?? false;
            let screenshotRef: string | undefined;
            if (screenshotAllowed) {
                const b64 = await exportScreenshot(frame);
                if (b64) screenshotRef = b64;
            }

            const aiPayload: FrameAuditPayload = {
                meta: {
                    frameId: frame.id,
                    frameName: frame.name,
                    width: frame.width,
                    height: frame.height,
                    extractedAt: new Date().toISOString(),
                    nodeCount: nodes.length,
                    truncated,
                },
                nodes,
                deterministicResults,
                deterministicScore: computeDeterministicScore(deterministicResults),
                platform: settings.platform ?? 'Mobile',
                alreadyFlaggedNodeIds,
                screenshot: screenshotRef,
            };

            const aiResult = await runAIAudit(aiPayload, settings);

            // Re-map            // Merge deterministic + AI issues
            const aiIssues = (aiResult.issues || []).map(i => ({
                ...i,
                id: i.id || `ai-${Math.random().toString(36).substring(2, 9)}`
            }));

            // Mobile post-processing: strip non-actionable icon label findings
            // (Figma designers cannot add aria-labels; these are dev-time concerns)
            const MOBILE_FILTER_PATTERNS = [
                // Icon label patterns (designers can't fix these in Figma)
                /missing accessible name/i,
                /missing label/i,
                /missing semantic label/i,
                /icon.*label/i,
                /label.*icon/i,
                /aria-label/i,
                // Truncation false positives (LLM complaining about the tool marker)
                /\[truncated\]/i,
                /incomplete .* text/i,
                /trailing ellipsis/i,
                /truncated text/i,
                /lack of context/i,
            ];

            const filteredAiIssues = (settings.platform ?? 'Mobile') === 'Mobile'
                ? aiIssues.filter(issue => {
                    // Filter out patterns regardless of category on mobile
                    return !MOBILE_FILTER_PATTERNS.some(pattern => pattern.test(issue.title) || pattern.test(issue.description));
                })
                : aiIssues;

            const combined: AuditReportJSON = {
                score: Math.round((aiResult.score * 0.75) + (aiPayload.deterministicScore * 0.25)),
                summary: aiResult.summary || 'Audit combined successfully.',
                issues: [...detIssues, ...filteredAiIssues]
            };

            figma.ui.postMessage({ type: 'AUDIT_COMPLETE', payload: combined } as MainToUI);

        } catch (err: any) {
            console.error(err);
            figma.ui.postMessage({ type: 'ERROR', payload: { message: err.message || 'Audit failed.' } } as MainToUI);
        }
        return;
    }
};

// Start initialization
getSettings().then(settings => {
    figma.ui.postMessage({ type: 'INIT_STATE', payload: { hasApiKey: !!settings.apiKey } } as MainToUI);
    notifySelectionChange();
});
