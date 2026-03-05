// ──────────────────────────────────────────────────────────────
// rules/missing-states.rule.ts
// Detects form inputs missing error or empty state indicators
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, RuleResult } from '../shared/types';
import type { AuditRule } from './types';

const FORM_KEYWORDS = ['input', 'field', 'form', 'textbox', 'textarea', 'email', 'password', 'search'];
const STATE_KEYWORDS = ['error', 'empty', 'helper', 'validation', 'invalid', 'success', 'hint', 'placeholder'];

function hasNearbyStateIndicator(formNode: ExtractedNode, allNodes: ExtractedNode[]): boolean {
    // Look for siblings within 80px vertically that indicate a state
    const siblings = allNodes.filter(n => {
        if (n.id === formNode.id) return false;
        const yDistance = Math.abs(n.y - (formNode.y + formNode.height));
        const xOverlap = n.x < formNode.x + formNode.width && n.x + n.width > formNode.x;
        return xOverlap && yDistance < 80;
    });

    return siblings.some(n => {
        const nameLower = n.name.toLowerCase();
        const textLower = (n.characters ?? '').toLowerCase();
        return STATE_KEYWORDS.some(kw => nameLower.includes(kw) || textLower.includes(kw));
    });
}

export const missingStatesRule: AuditRule = {
    id: 'MISSING_ERROR_STATE',
    name: 'Missing Error / Empty States',
    description: 'Form inputs should have associated error or validation state indicators.',
    severity: 'info',
    run(nodes): RuleResult {
        const formNodes = nodes.filter(n => {
            const nameLower = n.name.toLowerCase();
            return FORM_KEYWORDS.some(kw => nameLower.includes(kw));
        });

        if (formNodes.length === 0) {
            return {
                ruleId: 'MISSING_ERROR_STATE',
                ruleName: 'Missing Error / Empty States',
                severity: 'pass',
                passed: true,
                issues: [],
                summary: 'No form inputs detected — rule not applicable.',
            };
        }

        const issues = formNodes
            .filter(n => !hasNearbyStateIndicator(n, nodes))
            .map(n => ({
                nodeId: n.id,
                nodeName: n.name,
                detail: 'No error or validation state indicator found near this input',
            }));

        return {
            ruleId: 'MISSING_ERROR_STATE',
            ruleName: 'Missing Error / Empty States',
            severity: issues.length > 0 ? 'info' : 'pass',
            passed: issues.length === 0,
            issues,
            summary: issues.length === 0
                ? 'All form inputs have nearby state indicators.'
                : `${issues.length} form input(s) may be missing error or helper state indicators.`,
        };
    },
};
