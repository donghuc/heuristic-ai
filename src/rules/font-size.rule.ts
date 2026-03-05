// ──────────────────────────────────────────────────────────────
// rules/font-size.rule.ts
// Minimum font size threshold (11px)
// ──────────────────────────────────────────────────────────────

import type { RuleResult } from '../shared/types';
import type { AuditRule } from './types';

const MIN_FONT_SIZE = 11;

export const fontSizeRule: AuditRule = {
    id: 'FONT_SIZE_MINIMUM',
    name: 'Minimum Font Size',
    description: `All visible text should be at least ${MIN_FONT_SIZE}px.`,
    severity: 'info',
    run(nodes): RuleResult {
        const textNodes = nodes.filter(
            n => n.type === 'TEXT' && typeof n.fontSize === 'number' && n.characters?.trim()
        );

        const issues = textNodes
            .filter(n => (n.fontSize as number) < MIN_FONT_SIZE)
            .map(n => ({
                nodeId: n.id,
                nodeName: n.name,
                detail: `Font size ${n.fontSize}px — below ${MIN_FONT_SIZE}px minimum`,
                value: n.fontSize,
                threshold: MIN_FONT_SIZE,
            }));

        return {
            ruleId: 'FONT_SIZE_MINIMUM',
            ruleName: 'Minimum Font Size',
            severity: issues.length > 0 ? 'info' : 'pass',
            passed: issues.length === 0,
            issues,
            summary: issues.length === 0
                ? `All text is at or above the ${MIN_FONT_SIZE}px minimum font size.`
                : `${issues.length} text element(s) use a font size below ${MIN_FONT_SIZE}px.`,
        };
    },
};
