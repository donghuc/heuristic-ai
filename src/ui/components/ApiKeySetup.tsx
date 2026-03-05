import React, { useState } from 'react';
import type { AIProvider, DesignPlatform } from '../../shared/types';
import { Button } from './shared/Button';

interface Props {
    onSave: (key: string, provider: AIProvider, platform: DesignPlatform) => void;
    onCancel?: () => void;
}

export function ApiKeySetup({ onSave, onCancel }: Props) {
    const [key, setKey] = useState('');
    const [provider, setProvider] = useState<AIProvider>('openai');
    const [platform, setPlatform] = useState<DesignPlatform>('Mobile');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim(), provider, platform);
        }
    };

    return (
        <div className="flex flex-col h-full bg-figma-bg px-5 py-6">

            {/* Back button — only shown when accessed via settings (not first-time onboarding) */}
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-1.5 text-[11px] text-figma-textMuted hover:text-figma-text transition-colors mb-4 -ml-1 w-fit"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
            )}

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
                {/* Lock icon */}
                <div className="w-12 h-12 rounded-2xl bg-figma-blue/10 border border-figma-blue/20 flex items-center justify-center mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--figma-color-bg-brand,#18A0FB)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <h1 className="text-[15px] font-semibold text-figma-text mb-1.5">
                    Heuristic AI
                </h1>
                <p className="text-[13px] text-figma-textMuted leading-relaxed max-w-[260px]">
                    Connect your AI provider to run Nielsen heuristic audits directly on your Figma frames.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-figma-textMuted uppercase tracking-wide">
                        Provider
                    </label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as AIProvider)}
                        className="figma-input"
                    >
                        <option value="openai">OpenAI — GPT-4o (Recommended)</option>
                        <option value="anthropic">Anthropic — Claude 3.5 Sonnet</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-figma-textMuted uppercase tracking-wide">
                        API Key
                    </label>
                    <input
                        type="password"
                        placeholder="sk-..."
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="figma-input"
                        required
                        autoFocus
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-figma-textMuted uppercase tracking-wide">
                        Design Platform
                    </label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as DesignPlatform)}
                        className="figma-input"
                    >
                        <option value="Mobile">Mobile — iOS / Android</option>
                        <option value="Web">Web — Browser</option>
                        <option value="Tablet">Tablet</option>
                    </select>
                </div>

                {/* Helper link */}
                <button
                    type="button"
                    onClick={() => window.open('https://donghuc.github.io/heuristic-ai/api-key-guide', '_blank')}
                    className="text-[11px] text-figma-textMuted hover:underline text-left w-fit"
                >
                    How do I get an API key? →
                </button>

                <Button type="submit" fullWidth disabled={!key.trim()} className="mt-2">
                    Save &amp; Continue
                </Button>
            </form>

            {/* Trust footer */}
            <div className="mt-auto pt-6">
                <div className="flex items-center justify-center gap-4 text-[11px] text-figma-textMuted">
                    <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Stored locally
                    </span>
                    <span className="w-px h-3 bg-figma-border" />
                    <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        No proxy
                    </span>
                    <span className="w-px h-3 bg-figma-border" />
                    <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Pay per audit
                    </span>
                </div>

                {/* Privacy Disclosure */}
                <p className="mt-4 text-[10px] text-figma-textMuted text-center leading-normal opacity-80">
                    We track basic, anonymous usage metrics (how many audits are run) to improve the plugin.
                    We NEVER see your design data, prompts, or LLM results.
                </p>
            </div>
        </div>
    );
}
