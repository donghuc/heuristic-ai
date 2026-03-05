import type { AuditReportJSON, FrameAuditPayload } from '../shared/types';
import { SYSTEM_PROMPT, buildAuditPrompt } from './prompt.builder';
import { parseAIResponse, AIError } from './ai.utils';

export async function runAuditAnthropic(
    payload: FrameAuditPayload,
    apiKey: string,
    includeScreenshot: boolean
): Promise<AuditReportJSON> {
    const userText = buildAuditPrompt(payload);

    type ContentPart =
        | { type: 'text'; text: string }
        | { type: 'image'; source: { type: 'base64'; media_type: 'image/png'; data: string } };

    const content: ContentPart[] = [];
    if (includeScreenshot && payload.screenshot) {
        content.push({
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: payload.screenshot },
        });
    }
    content.push({ type: 'text', text: userText });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content }],
            max_tokens: 2048,
            temperature: 0.2,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new AIError(err.error?.message ?? `HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    return parseAIResponse(text) as AuditReportJSON;
}
