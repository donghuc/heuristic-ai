// ──────────────────────────────────────────────────────────────
// rules/multiple-cta.rule.ts
// Detects multiple primary CTAs on the same screen
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, RuleResult } from '../shared/types';
import type { AuditRule } from './types';

const CTA_KEYWORDS = ['primary', 'cta', 'sign up', 'get started', 'subscribe', 'buy now', 'purchase', 'submit', 'continue'];
const BUTTON_KEYWORDS = ['button', 'btn'];

function isCTACandidate(node: ExtractedNode): boolean {
    if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') return false;
    const nameLower = node.name.toLowerCase();
    const hasCTAKW = CTA_KEYWORDS.some(kw => nameLower.includes(kw));
    const hasBtnKW = BUTTON_KEYWORDS.some(kw => nameLower.includes(kw));
    if (!hasBtnKW && !hasCTAKW) return false;

    // Must have a strong solid fill (high-saturation indicates a primary button)
    const fill = node.fills?.[0];
    if (!fill) return false;

    // Simple saturation check: if any channel is much higher than others it's likely a primary color
    const max = Math.max(fill.r, fill.g, fill.b);
    const min = Math.min(fill.r, fill.g, fill.b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    return saturation > 0.25; // Visually distinct color = likely primary CTA
}

export const multipleCTARule: AuditRule = {
    id: 'MULTIPLE_PRIMARY_CTA',
    name: 'Multiple Primary CTAs',
    description: 'A screen should have at most one primary call-to-action to avoid decision paralysis.',
    severity: 'warning',
    run(nodes): RuleResult {
        const ctaCandidates = nodes.filter(isCTACandidate);

        if (ctaCandidates.length <= 1) {
            return {
                ruleId: 'MULTIPLE_PRIMARY_CTA',
                ruleName: 'Multiple Primary CTAs',
                severity: 'pass',
                passed: true,
                issues: [],
                summary: 'No multiple primary CTAs detected.',
            };
        }

        const issues = ctaCandidates.map(n => ({
            nodeId: n.id,
            nodeName: n.name,
            detail: `Detected as a primary CTA (${n.width}×${n.height}px, high-saturation fill)`,
        }));

        return {
            ruleId: 'MULTIPLE_PRIMARY_CTA',
            ruleName: 'Multiple Primary CTAs',
            severity: 'warning',
            passed: false,
            issues,
            summary: `${ctaCandidates.length} potential primary CTAs detected — consider promoting only one.`,
        };
    },
};
