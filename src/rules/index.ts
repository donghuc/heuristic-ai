// ──────────────────────────────────────────────────────────────
// rules/index.ts
// Rule registry and runner
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, RuleResult } from '../shared/types';
import type { AuditRule } from './types';
import { contrastRule } from './contrast.rule';
import { touchTargetRule } from './touch-target.rule';
import { fontSizeRule } from './font-size.rule';
import { multipleCTARule } from './multiple-cta.rule';
import { missingStatesRule } from './missing-states.rule';

export const RULE_REGISTRY: AuditRule[] = [
    contrastRule,
    touchTargetRule,
    fontSizeRule,
    multipleCTARule,
    missingStatesRule,
];

export function runAllRules(nodes: ExtractedNode[]): RuleResult[] {
    return RULE_REGISTRY.map(rule => {
        try {
            return rule.run(nodes);
        } catch (err) {
            // Never let a rule crash the entire audit
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                severity: 'info' as const,
                passed: false,
                issues: [],
                summary: `Rule error: ${String(err)}`,
            };
        }
    });
}
