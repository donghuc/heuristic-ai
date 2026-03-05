import React, { useEffect, useState, useRef } from 'react';
import type { PluginMessage, MainToUI } from '../../shared/messages';
import type { AuditReportJSON, AIProvider, DesignPlatform } from '../../shared/types';
import { ApiKeySetup } from './ApiKeySetup';
import { EmptyState } from './EmptyState';
import { LoadingScreen } from './LoadingScreen';
import { ResultsScreen } from './ResultsScreen';
import { Button } from './shared/Button';
import { analytics } from '../services/analytics';

type ViewState = 'INIT' | 'BYOK' | 'IDLE' | 'LOADING' | 'RESULTS';

export function App() {
    const [view, setView] = useState<ViewState>('INIT');
    const [hasSelection, setHasSelection] = useState(false);
    const [hasExistingKey, setHasExistingKey] = useState(false);
    const [report, setReport] = useState<AuditReportJSON | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const auditStartTime = useRef<number | null>(null);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const msg = event.data.pluginMessage as MainToUI;
            if (!msg) return;

            switch (msg.type) {
                case 'INIT_STATE':
                    analytics.track('plugin_opened', { has_api_key_configured: msg.payload.hasApiKey });
                    setHasExistingKey(msg.payload.hasApiKey);
                    setView(msg.payload.hasApiKey ? 'IDLE' : 'BYOK');
                    break;
                case 'SELECTION_CHANGED':
                    setHasSelection(msg.payload.hasValidSelection);
                    break;
                case 'AUDIT_COMPLETE': {
                    const duration = auditStartTime.current ? Date.now() - auditStartTime.current : 0;
                    analytics.track('audit_completed', {
                        duration_ms: duration,
                        total_issues_found: msg.payload.issues.length,
                        overall_score: msg.payload.score,
                        deterministic_fails: msg.payload.issues.filter(i => !i.id.startsWith('ai-')).length
                    });
                    setReport(msg.payload);
                    setView('RESULTS');
                    break;
                }
                case 'ERROR':
                    analytics.track('audit_failed', { error_type: msg.payload.message });
                    setErrorMsg(msg.payload.message);
                    setView('IDLE');
                    setTimeout(() => setErrorMsg(null), 5000);
                    break;
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const sendMain = (msg: any) => {
        parent.postMessage({ pluginMessage: msg }, '*');
    };

    const handleSaveKey = (key: string, provider: AIProvider, platform: DesignPlatform) => {
        analytics.track('onboarding_completed', { llm_provider: provider });
        sendMain({ type: 'SAVE_API_KEY', payload: { key, provider, platform } });
        setView('IDLE');
    };

    const handleRunAudit = () => {
        auditStartTime.current = Date.now();
        analytics.track('audit_started');
        setView('LOADING');
        sendMain({ type: 'START_AUDIT' });
    };

    const handleFocusNode = (nodeId: string) => {
        sendMain({ type: 'FOCUS_NODE', payload: { nodeId } });
    };

    const handleNewAudit = () => {
        setReport(null);
        setView('IDLE');
    };

    if (view === 'INIT') {
        return <div className="h-full bg-figma-bg" />;
    }

    if (view === 'BYOK') {
        return (
            <ApiKeySetup
                onSave={handleSaveKey}
                onCancel={hasExistingKey ? () => setView('IDLE') : undefined}
            />
        );
    }

    return (
        <div className="flex flex-col h-[100vh] bg-figma-bg relative overflow-hidden">
            {/* Error Toast */}
            {errorMsg && (
                <div className="absolute top-2 left-2 right-2 bg-figma-critical text-white px-3 py-2 rounded text-[11px] font-medium shadow z-50 animate-pulse">
                    {errorMsg}
                </div>
            )}

            {/* Header — shown on IDLE only */}
            {view === 'IDLE' && (
                <div className="flex items-center justify-between px-3 py-2 border-b border-figma-border shrink-0">
                    <span className="text-[12px] font-semibold text-figma-text">AI UX Audit</span>
                    <button
                        onClick={() => setView('BYOK')}
                        title="Change API Key / Settings"
                        className="p-1 rounded hover:bg-figma-bg-secondary text-figma-textMuted hover:text-figma-text transition-colors"
                        aria-label="Settings"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            {view === 'LOADING' && <LoadingScreen />}
            {view === 'RESULTS' && report && (
                <ResultsScreen report={report} onFocusNode={handleFocusNode} onNewAudit={handleNewAudit} />
            )}
            {view === 'IDLE' && (
                <>
                    <EmptyState />
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-figma-bg border-figma-border shadow-2xl">
                        <Button
                            fullWidth
                            onClick={handleRunAudit}
                            disabled={!hasSelection}
                        >
                            Run Heuristic Audit
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
