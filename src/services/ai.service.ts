import type { AuditReportJSON, FrameAuditPayload, PluginSettings } from '../shared/types';
import { runAuditOpenAI } from './openai.service';
import { runAuditAnthropic } from './anthropic.service';
import { AIError, withRetry } from './ai.utils';

export async function runAIAudit(
    payload: FrameAuditPayload,
    settings: PluginSettings
): Promise<AuditReportJSON> {
    if (!settings.apiKey) {
        throw new AIError('API Key is missing. Please configure it in Settings.');
    }

    const runCall = () => {
        if (settings.provider === 'anthropic') {
            return runAuditAnthropic(payload, settings.apiKey, settings.includeScreenshot);
        }
        return runAuditOpenAI(payload, settings.apiKey, settings.includeScreenshot);
    };

    return withRetry(runCall);
}
