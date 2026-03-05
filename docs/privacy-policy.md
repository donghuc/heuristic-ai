# Privacy Policy for "AI UX Audit & Auto-Review" (Figma Plugin)

**Effective Date:** March 2025

This Privacy Policy describes how "AI UX Audit & Auto-Review" ("we", "us", "our") collects, uses, and protects your information when you use our Figma plugin. 

Our core philosophy is simple: **Your design data is yours.** We designed this plugin using a "Bring Your Own Key" (BYOK) model to ensure your proprietary designs, frames, and layers never touch our servers.

## 1. Information We Do NOT Collect
To provide a secure environment for your design work, we specifically do **NOT** collect:
*   Figma node data, layer names, text content, or design structures.
*   Screenshots or image exports of your Figma canvas.
*   Your OpenAI (GPT) or Anthropic (Claude) API keys.
*   The results, recommendations, or usability scores generated during audits.

All design extraction and communication occurs strictly between your local Figma client and the third-party LLM provider (OpenAI or Anthropic) using the API key you provide.

## 2. API Keys and Third-Party Services
Because this plugin uses a Bring Your Own Key (BYOK) model:
*   **Local Storage:** Your API key is stored securely in your local browser/Figma client storage (`figma.clientStorage`). We cannot see, access, or retrieve it.
*   **Data Transmission:** When you run an audit, the text, structure, and a screenshot of your selected frame are sent via a direct client-side request from your machine to the AI provider you selected (e.g., OpenAI or Anthropic).
*   **Third-Party Policies:** The data sent to these providers is governed by their respective API Privacy Policies. We recommend reviewing the policies for [OpenAI](https://openai.com/policies/privacy-policy) and [Anthropic](https://www.anthropic.com/legal/privacy). 

*Note: By default, OpenAI and Anthropic do NOT use data submitted via their paid APIs to train their models.*

## 3. Anonymous Telemetry
To improve the plugin, we collect basic, strictly anonymous usage events using PostHog.

The data we collect is limited to:
*   **Plugin Events:** When the plugin is opened, when an audit is started/completed, or if an API error occurs.
*   **Aggregated Metrics:** How long an audit took, or how many issues were flagged overall.
*   **System Info:** Non-identifying metadata such as Figma client type (Desktop vs. Web).

**None of this telemetry is tied to your personal identity, Figma email, or specific design files.**

## 4. Changes to this Policy
We may update this Privacy Policy from time to time. We will announce significant changes in the plugin release notes within the Figma Community.

## 5. Contact Us
If you have questions about how your data is handled, please contact us via the Figma Community plugin page.
