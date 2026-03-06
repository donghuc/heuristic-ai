// ──────────────────────────────────────────────────────────────
// rules/contrast.rule.ts
// WCAG 2.1 AA contrast ratio check
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, NormalizedFill, RuleResult } from '../shared/types';
import type { AuditRule } from './types';

// ── Math helpers ──────────────────────────────────────────────

function linearize(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(fg: NormalizedFill, bg: NormalizedFill): number {
    const L1 = relativeLuminance(fg.r, fg.g, fg.b);
    const L2 = relativeLuminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
}

function isLargeText(node: ExtractedNode): boolean {
    const size = node.fontSize ?? 0;
    const style = node.fontName?.style?.toLowerCase() ?? '';
    const isBold = style.includes('bold') || style.includes('heavy') || style.includes('black');
    // WCAG: large text = ≥18pt (24px) normal OR ≥14pt (≈18.67px) bold
    return size >= 24 || (isBold && size >= 18.67);
}

/**
 * Find the nearest ancestor background color for a text node.
 * We look for a FRAME/COMPONENT above the node with a solid fill.
 * Since we only have a flat node list (not a tree), we heuristically
 * find frames that contain this node's position.
 */
function findBackground(textNode: ExtractedNode, nodes: ExtractedNode[]): NormalizedFill | null {
    const tx = textNode.x;
    const ty = textNode.y;

    // Find frames that spatially contain this text node, pick smallest area (most specific)
    const containers = nodes
        .filter(n =>
            (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE' || n.type === 'RECTANGLE') &&
            n.fills && n.fills.length > 0 &&
            n.x <= tx && n.y <= ty &&
            n.x + n.width >= tx + textNode.width &&
            n.y + n.height >= ty + textNode.height
        )
        .sort((a, b) => (a.width * a.height) - (b.width * b.height));

    return containers[0]?.fills?.[0] ?? null;
}

// ── Context awareness for smart severities ─────────
function getIssueSeverity(textNode: ExtractedNode, nodes: ExtractedNode[]): 'Critical' | 'High' | 'Low' {
    const tx = textNode.x;
    const ty = textNode.y;

    const containers = nodes.filter(n =>
        n.id !== textNode.id &&
        n.x <= tx && n.y <= ty &&
        n.x + n.width >= tx + textNode.width &&
        n.y + n.height >= ty + textNode.height
    );

    const allNames = [textNode.name, ...containers.map(c => c.name)].join(' ').toLowerCase();

    if (allNames.includes('disable') || allNames.includes('inactive')) return 'Low';

    const isInteractive = allNames.includes('button') ||
        allNames.includes('btn') ||
        allNames.includes('cta') ||
        allNames.includes('input') ||
        allNames.includes('tab') ||
        containers.some(c => c.type === 'COMPONENT' || c.type === 'INSTANCE');

    return isInteractive ? 'Critical' : 'High';
}

function relativeLuminanceFromHex(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return relativeLuminance(r, g, b);
}

function hexToRgb(hex: string) {
    return {
        r: parseInt(hex.slice(1, 3), 16) / 255,
        g: parseInt(hex.slice(3, 5), 16) / 255,
        b: parseInt(hex.slice(5, 7), 16) / 255,
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Mathematically finds the nearest color that passes the threshold.
 */
function calculatePassingColor(fg: NormalizedFill, bg: NormalizedFill, threshold: number): string {
    const bgL = relativeLuminance(bg.r, bg.g, bg.b);
    let currR = fg.r;
    let currG = fg.g;
    let currB = fg.b;

    // Direction: darken if background is light, lighten if background is dark
    const step = bgL > 0.5 ? -0.05 : 0.05;

    // Safety loop to prevent infinite hangs (max 20 iterations)
    for (let i = 0; i < 20; i++) {
        const ratio = contrastRatio({ type: 'SOLID', r: currR, g: currG, b: currB, opacity: 1, hex: '' }, bg);
        if (ratio >= threshold + 0.1) break; // Buffer for safety

        currR = Math.max(0, Math.min(1, currR + step));
        currG = Math.max(0, Math.min(1, currG + step));
        currB = Math.max(0, Math.min(1, currB + step));
    }

    return rgbToHex(currR, currG, currB);
}

export const contrastRule: AuditRule = {
    id: 'CONTRAST_RATIO',
    name: 'WCAG 2.1 AA Contrast',
    description: 'Text must have ≥4.5:1 contrast for normal text, ≥3:1 for large text.',
    severity: 'critical',
    run(nodes): RuleResult {
        const issues = [];

        const textNodes = nodes.filter(
            n => n.type === 'TEXT' && n.characters?.trim() && n.fills && n.fills.length > 0
        );

        for (const node of textNodes) {
            const textFill = node.fills![0];
            const bgFill = findBackground(node, nodes);
            if (!bgFill) continue;

            const effectiveFg: NormalizedFill = {
                ...textFill,
                r: textFill.r * textFill.opacity + bgFill.r * (1 - textFill.opacity),
                g: textFill.g * textFill.opacity + bgFill.g * (1 - textFill.opacity),
                b: textFill.b * textFill.opacity + bgFill.b * (1 - textFill.opacity),
            };

            const ratio = contrastRatio(effectiveFg, bgFill);
            const threshold = isLargeText(node) ? 3.0 : 4.5;

            if (ratio < threshold) {
                const passingHex = calculatePassingColor(textFill, bgFill, threshold);
                const isComponentPart = node.isInsideInstance || node.type === 'INSTANCE' || node.type === 'COMPONENT';
                const hasToken = !!node.fillStyleId || node.hasVariables;

                const defaultDetail = `Contrast ${ratio.toFixed(2)}:1 — below ${threshold}:1 threshold for ${isLargeText(node) ? 'large' : 'normal'} text`;

                let tailoredDetail = defaultDetail;
                if (isComponentPart) {
                    tailoredDetail += '. This element is part of a Component. Please review the Main Component in your Design System to fix this issue globally.';
                } else if (hasToken) {
                    tailoredDetail += '. This element is bound to a Design System Token or Style. Please update the token value to fix this safely.';
                }

                const issue: import('../shared/types').RuleIssue = {
                    nodeId: node.id,
                    nodeName: node.name,
                    detail: tailoredDetail,
                    value: parseFloat(ratio.toFixed(2)),
                    threshold,
                    severity: getIssueSeverity(node, nodes),
                };

                if (!isComponentPart && !hasToken) {
                    issue.autoFix = {
                        type: 'CONTRAST' as const,
                        nodeId: node.id,
                        payload: { hex: passingHex }
                    };
                }

                issues.push(issue);
            }
        }

        return {
            ruleId: 'CONTRAST_RATIO',
            ruleName: 'WCAG 2.1 AA Contrast',
            severity: issues.length > 0 ? 'critical' : 'pass',
            passed: issues.length === 0,
            issues,
            summary: issues.length === 0
                ? 'All visible text elements pass WCAG 2.1 AA contrast requirements.'
                : `${issues.length} text element(s) fail WCAG AA contrast requirements.`,
        };
    },
};
