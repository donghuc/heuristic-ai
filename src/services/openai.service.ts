import type { AuditReportJSON, FrameAuditPayload } from '../shared/types';
import { SYSTEM_PROMPT, buildAuditPrompt } from './prompt.builder';
import { parseAIResponse, AIError } from './ai.utils';

export async function runAuditOpenAI(
    payload: FrameAuditPayload,
    apiKey: string,
    includeScreenshot: boolean
): Promise<AuditReportJSON> {
    const userText = buildAuditPrompt(payload);

    type ContentPart =
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string; detail: 'low' | 'high' | 'auto' } };

    const userContent: ContentPart[] = [{ type: 'text', text: userText }];

    if (includeScreenshot && payload.screenshot) {
        userContent.push({
            type: 'image_url',
            image_url: {
                url: `data:image/png;base64,${payload.screenshot}`,
                detail: 'low',
            },
        });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userContent },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 2048,
            temperature: 0.2,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new AIError(err.error?.message ?? `HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    return parseAIResponse(content) as AuditReportJSON;
}
