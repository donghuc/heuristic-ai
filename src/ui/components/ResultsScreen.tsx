import React, { useMemo } from 'react';
import type { AuditReportJSON } from '../../shared/types';
import { ScoreCard } from './ScoreCard';
import { CategoryList } from './CategoryList';
import { Button } from './shared/Button';
import { analytics } from '../services/analytics';

interface Props {
    report: AuditReportJSON;
    onFocusNode: (nodeId: string) => void;
    onNewAudit: () => void;
}

export function ResultsScreen({ report, onFocusNode, onNewAudit }: Props) {
    const groupedIssues = useMemo(() => {
        const acc = {
            Accessibility: [],
            Heuristics: [],
            Copy: [],
            Hierarchy: []
        } as Record<string, typeof report.issues>;

        report.issues.forEach(issue => {
            if (acc[issue.category]) {
                acc[issue.category].push(issue);
            } else {
                acc['Heuristics'].push(issue); // Fallback
            }
        });

        return acc;
    }, [report.issues]);

    const handleExport = () => {
        analytics.track('report_exported', { format: 'markdown' });
        // Generate a simple markdown string from JSON output for clipboard export
        let md = `# Heuristic AI Audit Report\n**Score:** ${report.score}/100\n**Summary:** ${report.summary}\n\n`;
        report.issues.forEach(i => {
            md += `### [${i.severity}] ${i.title}\n**Category:** ${i.category}\n${i.description}\n**Fix:** ${i.recommendation}\n\n`;
        });

        // Fallback naive copy logic - a proper copy-to-clipboard mechanism
        const el = document.createElement('textarea');
        el.value = md;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Report Markdown copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-full bg-figma-bg p-4 pb-0 h-[100vh] overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 pb-24">
                <ScoreCard score={report.score} />

                <p className="text-[12px] text-gray-300 italic bg-[#1E1E1E] p-3 rounded border border-figma-border/50 mb-6 leading-relaxed">
                    "{report.summary}"
                </p>

                <CategoryList category="Accessibility" issues={groupedIssues.Accessibility} onFocusNode={onFocusNode} />
                <CategoryList category="Heuristics" issues={groupedIssues.Heuristics} onFocusNode={onFocusNode} />
                <CategoryList category="Copy & Clarity" issues={groupedIssues.Copy} onFocusNode={onFocusNode} />
                <CategoryList category="Visual Hierarchy" issues={groupedIssues.Hierarchy} onFocusNode={onFocusNode} />

                {report.issues.length === 0 && (
                    <div className="text-center py-8 text-figma-textMuted text-xs">
                        🎉 No issues found! Fantastic work.
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-figma-bg border-t border-figma-border flex gap-3 shadow-2xl">
                <Button variant="secondary" fullWidth onClick={handleExport}>
                    Copy Report
                </Button>
                <Button variant="primary" fullWidth onClick={onNewAudit}>
                    New Audit
                </Button>
            </div>
        </div>
    );
}
