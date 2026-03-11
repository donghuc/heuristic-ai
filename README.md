Heuristic AI is a powerful, locally-run Figma plugin that combines strict deterministic rules with the reasoning capabilities of Large Language Models (LLMs) to automatically audit your UI designs against industry-standard accessibility and usability heuristics.
---
## ✨ Features
- **Hybrid Analysis Engine**: Uses deterministic math for pixel-perfect checks (e.g., WCAG 2.1 color contrast, 44x44px touch targets) and LLMs (OpenAI GPT-4o or Anthropic Claude 3.5 Sonnet) for contextual design patterns (e.g., Nielsen's Heuristics, Copy Clarity, Visual Hierarchy).
- **✨ Safe Auto-Fix**: Instantly correct issues like insufficient contrast or small touch targets with a single click. *Design System Aware:* The auto-fix engine actively protects your design system by gracefully refusing to break component instances or detach color tokens.
- **BYOK (Bring Your Own Key)**: 100% free forever. There is no subscription tier. Simply plug in your own OpenAI or Anthropic API key and pay only for the exact tokens you use.
- **Absolute Privacy**: Your API keys are stored securely and locally inside your Figma client storage. The plugin communicates directly with the LLM providers—there is no middleware, no tracking proxy, and your design data is never stored on our servers.
- **Intuitive UI**: A clean, native-feeling interface built with React & Tailwind CSS that integrates seamlessly into your workflow.
---
## 🚀 How to Use (For Designers)
1. **Install the Plugin**: Find "Heuristic AI" in the Figma Community and click **Try it out**.
2. **Add Your API Key**: On first launch, the plugin will ask for an OpenAI or Anthropic API Key. Follow [this guide](https://donghuc.github.io/heuristic-ai/api-key-guide) if you need help generating one.
3. **Select a Frame**: Select any top-level frame in your Figma canvas (e.g., a Mobile Screen or Web Page).
4. **Run Audit**: Click "Run Heuristic Audit". The plugin will scan the node tree, extract relevant text and styles, and generate a comprehensive UX report.
5. **Review & Fix**: Click on issues in the Results Dashboard to instantly highlight the offending nodes on the canvas. Use the **Auto-Fix** button to resolve accessibility violations instantly.
---
## 🛠 Development Setup
If you want to contribute, fork, or build your own custom heuristics, follow these steps to run the plugin locally:
### Prerequisites
- Node.js (v18+)
- Figma Desktop App
### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/donghuc/heuristic-ai.git
   cd heuristic-ai
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the build watcher:**
   ```bash
   npm run dev
   ```
   *This command runs Vite in watch mode, continually compiling both the UI and the Main Figma sandbox scripts.*
4. **Load into Figma:**
   - Open the Figma Desktop App.
   - Go to **Plugins** > **Development** > **Import plugin from manifest...**
   - Select the `manifest.json` file located in the root of this project folder.
### Project Structure
- `src/main.ts`: The entry point for the Figma sandbox environment. Handles node extraction, UI messaging, and orchestrating the AI service.
- `src/ui/`: The React + Tailwind frontend application.
- `src/rules/`: Deterministic testing rules (`contrast.rule.ts`, `touch-target.rule.ts`, etc.).
- `src/services/ai.service.ts`: Handles the direct API calls to OpenAI and Anthropic.
- `src/shared/`: Types and message protocols shared between the UI frame and the Main sandbox.
---
## 🛡️ Security & Privacy Philosophy
This plugin was built with enterprise-grade privacy in mind:
- We **do not** have a backend server processing your prompts.
- We **do not** collect or store your API keys. They remain in your browser/desktop client.
- The only data sent to the AI providers is the required node structure (text, colors, hierarchy) and an optional compressed image of the frame boundaries.
- We track completely anonymous usage metrics (e.g., "An audit was run") purely to understand plugin health. We never see your project names, copy, or results.
For more details, please see our [Privacy Policy](docs/privacy-policy.md).
---
## 🤝 Contributing
Pull requests are welcome! If you have ideas for new deterministic rules or refined LLM prompts, feel free to open an issue or submit a PR.
## 📄 License
This project is licensed under the MIT License.
