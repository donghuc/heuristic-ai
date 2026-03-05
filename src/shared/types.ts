// ──────────────────────────────────────────────────────────────
// shared/types.ts
// All data types shared between main.ts and ui thread
// ──────────────────────────────────────────────────────────────

export interface NormalizedFill {
    type: 'SOLID';
    r: number; // 0–1
    g: number; // 0–1
    b: number; // 0–1
    opacity: number;
    hex: string; // e.g. "#FF5733"
}

/// <reference types="@figma/plugin-typings" />
export interface ExtractedNode {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    // Text-specific
    characters?: string;
    fontSize?: number;
    fontName?: { family: string; style: string };
    textStyleId?: string;
    lineHeight?: { value: number; unit: 'PIXELS' | 'PERCENT' | 'AUTO' };
    letterSpacing?: { value: number; unit: 'PIXELS' | 'PERCENT' };
    // Fill
    fills?: NormalizedFill[];
    // Frame / Component / Instance
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    itemSpacing?: number;
    primaryAxisAlignItems?: string;
    counterAxisAlignItems?: string;
    componentName?: string | null;
}

// ── Deterministic Rule Types ──────────────────────────────────

export type Severity = 'critical' | 'warning' | 'info';
export type RuleSeverityResult = Severity | 'pass';

export interface RuleIssue {
    nodeId: string;
    nodeName: string;
    detail: string;
    value?: number | string;
    threshold?: number | string;
    severity?: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface RuleResult {
    ruleId: string;
    ruleName: string;
    severity: RuleSeverityResult;
    passed: boolean;
    issues: RuleIssue[];
    summary: string;
}

// ── Main Payload ──────────────────────────────────────────────

export interface FrameAuditPayload {
    meta: {
        frameId: string;
        frameName: string;
        width: number;
        height: number;
        extractedAt: string; // ISO 8601
        nodeCount: number;
        truncated: boolean;
    };
    nodes: ExtractedNode[];
    deterministicResults: RuleResult[];
    deterministicScore: number;
    platform?: DesignPlatform;             // passed through to prompt builder
    alreadyFlaggedNodeIds?: string[];      // nodeIds already caught by deterministic checks
    screenshot?: string;                   // base64 PNG/JPEG
}

// ── AI Audit Result ───────────────────────────────────────────

export interface AuditIssue {
    id: string; // Used for React keys
    nodeId: string; // The Figma Node ID to zoom to when clicked
    category: 'Accessibility' | 'Heuristics' | 'Copy' | 'Hierarchy';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string; // e.g., "Insufficient Color Contrast"
    description: string; // Detailed "why"
    recommendation: string; // Exactly how to fix it
}

export interface AuditReportJSON {
    score: number; // 0-100
    summary: string; // One sentence TL;DR from the LLM
    issues: AuditIssue[];
}

export type AIProvider = 'openai' | 'anthropic';
export type DesignPlatform = 'Mobile' | 'Web' | 'Tablet';

export interface PluginSettings {
    apiKey: string;
    provider: AIProvider;
    platform: DesignPlatform;
    includeScreenshot: boolean;
}
