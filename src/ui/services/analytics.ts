// ── Analytics Service (fetch-based, no SDK) ─────────────────────
// Sends events directly to PostHog's REST capture API via fetch().
// This avoids posthog-js's script injection which Figma's CSP blocks.
// ────────────────────────────────────────────────────────────────

const POSTHOG_TOKEN = 'phc_EuWQ2oSi1w5c2rOPv9HrTOBBXzWWAvgpdMg6NydaFdl';
const POSTHOG_HOST = 'https://us.i.posthog.com';

// Generate a stable session ID for this plugin session
const SESSION_ID = `figma-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const analytics = {
    init: () => {
        // No SDK to initialize — SESSION_ID is generated at module load.
    },

    track: (event: string, properties?: Record<string, unknown>) => {
        fetch(`${POSTHOG_HOST}/capture/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: POSTHOG_TOKEN,
                event,
                properties: {
                    distinct_id: SESSION_ID,
                    $lib: 'heuristic-ai-figma-plugin',
                    ...properties,
                },
                timestamp: new Date().toISOString(),
            }),
        }).catch(() => {
            // Fail silently — analytics should never break the plugin
        });
    },
};
