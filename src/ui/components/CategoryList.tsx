import React, { useState } from 'react';
import type { AuditIssue } from '../../shared/types';
import { IssueItem } from './IssueItem';

interface Props {
    category: string;
    issues: AuditIssue[];
    onFocusNode: (nodeId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Accessibility': (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    ),
    'Heuristics': (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    'Copy & Clarity': (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    'Visual Hierarchy': (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    ),
};

export function CategoryList({ category, issues, onFocusNode }: Props) {
    const [isOpen, setIsOpen] = useState(true);

    if (issues.length === 0) return null;

    const icon = CATEGORY_ICONS[category] ?? CATEGORY_ICONS['Heuristics'];

    return (
        <div className="mb-5">
            <button
                className="section-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-2">
                    <span className="text-figma-textMuted">{icon}</span>
                    <span>{category}</span>
                    {/* Count pill */}
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-figma-border text-[10px] font-bold text-figma-text ml-0.5">
                        {issues.length}
                    </span>
                </span>

                {/* Chevron */}
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div className="flex flex-col gap-2 mt-3">
                    {issues.map(issue => (
                        <IssueItem key={issue.id} issue={issue} onFocus={onFocusNode} />
                    ))}
                </div>
            )}
        </div>
    );
}
