// ──────────────────────────────────────────────────────────────
// rules/types.ts
// Rule interface and result types (runs in main.ts - Figma sandbox)
// ──────────────────────────────────────────────────────────────

import type { ExtractedNode, RuleResult, Severity } from '../shared/types';

export interface AuditRule {
    id: string;
    name: string;
    description: string;
    severity: Severity;
    run(nodes: ExtractedNode[]): RuleResult;
}
