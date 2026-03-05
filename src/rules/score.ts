// ──────────────────────────────────────────────────────────────
// rules/score.ts
// Computes aggregate deterministic UX score 0–100
// ──────────────────────────────────────────────────────────────

import type { RuleResult, Severity } from '../shared/types';

const PENALTIES: Record<Severity, number> = {
    critical: 15,
    warning: 5,
    info: 1,
};

export function computeDeterministicScore(results: RuleResult[]): number {
    let score = 100;
    for (const result of results) {
        if (!result.passed && result.severity !== 'pass') {
            const penalty = PENALTIES[result.severity as Severity] ?? 0;
            score -= penalty * result.issues.length;
        }
    }
    return Math.max(0, Math.min(100, score));
}
