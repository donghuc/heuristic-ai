// ──────────────────────────────────────────────────────────────
// rules/touch-target.rule.ts
// Minimum 44x44px interactive element size (Apple HIG / Material)
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, RuleResult } from '../shared/types';
import type { AuditRule } from './types';

const INTERACTIVE_KEYWORDS = [
    'button', 'btn', 'cta', 'tab', 'link', 'toggle',
    'checkbox', 'radio', 'chip', 'action', 'nav', 'menu-item',
];

const MIN_SIZE = 44;

function isInteractiveNode(node: ExtractedNode): boolean {
    const nameLower = node.name.toLowerCase();
    const hasKeyword = INTERACTIVE_KEYWORDS.some(kw => nameLower.includes(kw));
    const isInteractiveType = node.type === 'COMPONENT' || node.type === 'INSTANCE';
    return hasKeyword && isInteractiveType;
}

export const touchTargetRule: AuditRule = {
    id: 'TOUCH_TARGET_SIZE',
    name: 'Minimum Touch Target Size',
    description: 'Interactive elements must be at least 44×44px.',
    severity: 'warning',
    run(nodes): RuleResult {
        const candidates = nodes.filter(isInteractiveNode);
        const issues = candidates
            .filter(n => n.width < MIN_SIZE || n.height < MIN_SIZE)
            .map(n => ({
                nodeId: n.id,
                nodeName: n.name,
                detail: `${n.width}×${n.height}px — below the ${MIN_SIZE}×${MIN_SIZE}px minimum`,
                value: `${n.width}×${n.height}px`,
                threshold: `${MIN_SIZE}×${MIN_SIZE}px`,
            }));

        return {
            ruleId: 'TOUCH_TARGET_SIZE',
            ruleName: 'Minimum Touch Target Size',
            severity: issues.length > 0 ? 'warning' : 'pass',
            passed: issues.length === 0,
            issues,
            summary: issues.length === 0
                ? 'All detected interactive elements meet the 44px minimum touch target.'
                : `${issues.length} interactive element(s) are below 44px minimum.`,
        };
    },
};
