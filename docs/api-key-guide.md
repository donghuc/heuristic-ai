# Getting Your API Key — A Designer's Guide

**AI UX Audit uses your own AI account to analyze your designs.** This keeps your design data 100% private — it never passes through our servers. Here's how to set it up in under 2 minutes.

---

## What is an API Key?
Think of it like a password that lets the plugin talk directly to an AI (like ChatGPT) on your behalf. You create it once, paste it in, and forget about it. The plugin uses it every time you run an audit.

**Cost:** OpenAI charges per use — typically less than $0.02 (2 cents) per audit. You only pay for what you actually use.

---

## Step-by-Step: OpenAI Setup

**Step 1 — Create your account**
Go to [platform.openai.com](https://platform.openai.com) and sign up for free.

**Step 2 — Add a payment method**
Go to **Settings → Billing → Add payment method**. Add a credit card. You won't be charged until you use it. We recommend setting a monthly budget limit of $5–$10 to stay in control.

**Step 3 — Generate your key**
Go to **Dashboard → API keys → Create new secret key**. Give it a name like "Figma Plugin". Click Create.

**Step 4 — Copy the key**
Your key starts with `sk-`. Copy it immediately — OpenAI only shows it once.

**Step 5 — Paste it into the plugin**
Return to the plugin panel in Figma, paste the key into the field, and click **Save & Start Auditing**.

---

## Your privacy, guaranteed
- Your key is saved **only on your computer** in Figma's local storage.
- Your design frames are sent **directly from your machine to OpenAI** — not through us.
- We never see your key, your designs, or your audit results.

---

## Frequently Asked Questions

**"Can I use Claude (Anthropic) instead?"**
Yes. The plugin also supports Anthropic. Follow the same steps at [console.anthropic.com](https://console.anthropic.com).

**"What if I run out of credits?"**
The audit will fail with a clear error message. Simply top up your OpenAI balance to continue.

**"Is this safe?"**
Yes. Never share your API key publicly (e.g., in a GitHub repo or Slack channel). The plugin only stores it locally on your device.
