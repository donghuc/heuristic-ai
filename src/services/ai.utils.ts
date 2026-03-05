export class AIError extends Error {
    constructor(message: string, public readonly statusCode?: number) {
        super(message);
        this.name = 'AIError';
    }
}

export function parseAIResponse(text: string): any {
    try {
        let clean = text.trim();
        if (clean.startsWith('```json')) clean = clean.substring(7);
        else if (clean.startsWith('```')) clean = clean.substring(3);
        if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);

        const data = JSON.parse(clean);

        // Basic schema validation against AuditReportJSON
        if (typeof data.score !== 'number') data.score = 0;
        if (typeof data.summary !== 'string') data.summary = 'Analysis completed.';
        if (!Array.isArray(data.issues)) data.issues = [];

        return data;
    } catch (err) {
        console.error('[Heuristic AI] Failed to parse AI JSON', err, text);
        throw new AIError('Failed to parse AI response as JSON');
    }
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (err instanceof AIError && err.statusCode === 429 && i < retries) {
                const waitMs = Math.pow(2, i) * 1000;
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            throw err;
        }
    }
    throw new Error('Unreachable code');
}
