import React, { useState } from 'react';
import type { AuditIssue } from '../../shared/types';
import { Badge } from './shared/Badge';

interface Props {
    issue: AuditIssue;
    onFocus: (nodeId: string) => void;
}

const SEVERITY_BORDER: Record<string, string> = {
    Critical: 'severity-critical',
    High: 'severity-high',
    Medium: 'severity-medium',
    Low: 'severity-low',
};

export function IssueItem({ issue, onFocus }: Props) {
    const [showFix, setShowFix] = useState(true);
    const borderClass = SEVERITY_BORDER[issue.severity] ?? 'severity-low';

    return (
        <div
            className={`audit-card border-l-4 ${borderClass} rounded-lg overflow-hidden`}
            onClick={() => onFocus(issue.nodeId)}
        >
            <div className="px-3 pt-3 pb-2">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-[13px] font-semibold text-figma-text leading-snug">
                        {issue.title}
                    </h4>
                    <Badge severity={issue.severity} />
                </div>

                {/* Description */}
                <p className="text-[11px] text-figma-textMuted leading-relaxed mb-2">
                    {issue.description}
                </p>

                {/* Fix recommendation — collapsible */}
                <button
                    className="flex items-center gap-1 text-[11px] text-figma-blue font-medium mb-1 hover:opacity-80 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setShowFix(v => !v); }}
                >
                    <svg
                        width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className="transition-transform duration-200"
                        style={{ transform: showFix ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Fix suggestion
                </button>

                {showFix && (
                    <div className="fix-block">
                        {issue.recommendation}
                    </div>
                )}
            </div>

            {/* Focus hint */}
            <div className="px-3 py-2 border-t border-figma-border/50 flex items-center gap-1.5 text-[11px] text-figma-textMuted">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Click to highlight on canvas
            </div>
        </div>
    );
}
