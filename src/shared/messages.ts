// ──────────────────────────────────────────────────────────────
// shared/messages.ts
// Typed message envelopes for postMessage between threads
// ──────────────────────────────────────────────────────────────

import type { AuditReportJSON, AIProvider, DesignPlatform } from './types';

// Messages from main.ts to UI
export type MainToUI =
    | { type: 'INIT_STATE'; payload: { hasApiKey: boolean } }
    | { type: 'SELECTION_CHANGED'; payload: { hasValidSelection: boolean; frameName?: string } }
    | { type: 'AUDIT_COMPLETE'; payload: AuditReportJSON }
    | { type: 'ERROR'; payload: { message: string } };

// Messages from UI to main.ts
export type UIToMain =
    | { type: 'SAVE_API_KEY'; payload: { key: string; provider: AIProvider; platform: DesignPlatform } }
    | { type: 'START_AUDIT' }
    | { type: 'FOCUS_NODE'; payload: { nodeId: string } }
    | { type: 'RESIZE_WINDOW'; payload: { width: number; height: number } };

export type PluginMessage = MainToUI | UIToMain;
