# Vibe Init - Antigravity God Mode Setup

![Vibe Init Banner](https://img.shields.io/badge/VIBE-INIT-cyan?style=for-the-badge)

A graphical CLI that instantly configures a structured, agentic environment for AI coding assistants. It sets up the persistent files and folders that turn your IDE into an autonomous coding partner.

## 🚀 Installation

### 1. Prerequisite
Ensure you have Node.js installed.

### 2. Setup Alias
Add this to your shell config (`.zshrc` or `.bashrc`) to run it from anywhere.

```bash
# If the folder is in /Users/mac/vibe-init
alias vibe-init="node /Users/mac/vibe-init/vibe-init.js"

# If the folder is in /Users/mac/code/vibe-init
alias vibe-init="node /Users/mac/code/vibe-init/vibe-init.js"
```

Reload your shell: `source ~/.zshrc`

> [!NOTE]
> **Project-Level Scope**: `vibe-init` generates configuration files (like `.cursorrules`) **inside your project folder**. It does NOT change your global IDE settings. This allows you to have different "vibes" (e.g., Ship Fast vs. Iron Clad) for different projects on the same machine.

## 🎮 Usage

## 🎮 Usage

### Scenario A: New Project
Navigate to an **empty folder** and run `vibe-init`.
1.  **Project Name**: Enter a name.
2.  **Vibe**: Choose your philosophy (Ship Fast / Iron Clad / Neural Core / and more).
3.  **Stack**: Choose your technology (Next.js / Python / Generic / Go / etc.).
4.  **Editors**: multi-select (Universal AGENTS.md, Gemini, Claude, Cursor, Roo, Windsurf, Aider).

### Scenario B: Existing Project (Vibe-ify)
Navigate to an **existing project root** (containing `package.json` or code) and run `vibe-init`.
1.  **Detection**: It will ask: *"Existing files detected. Do you want to Vibe-ify this project?"*
2.  **Auto-Detect**: It will attempt to guess your project name and stack.
3.  **Injection**: It will create the `memory-bank`, `.agent`, or `.cursor/rules/` **without overwriting** your source code.

## 📦 Philosophy (VIBES) vs Technology (STACKS)

Vibe Init 3.5 decouples the *how* from the *what*.

| Vibe (Philosophy) | Motto | Best For |
| :--- | :--- | :--- |
| **🚀 Ship Fast** | "Act First, Ask Later" | Prototypes, Hackathons |
| **🛡️ Iron Clad** | "Safety First" | Enterprise, Fintech, large teams |
| **🧠 Neural Core** | "Research First" | AI, RAG, Complex Logic |
| **🎨 Creative Rush**| "Boring is a bug" | 3D, Motion, Portfolios |

You can combine any Vibe with any Stack. For example:
-   **"Iron Clad" + "Python"**: Strict Typed Python with tests.
-   **"Ship Fast" + "Next.js"**: Rapid React prototyping.

## 🧠 AI-Powered Rules (Optional)

Vibe Init can use LLMs to generate tailored project rules based on your detected stack:

| Provider | Env Variable | Model Variable |
| :--- | :--- | :--- |
| **OpenAI** | `OPENAI_API_KEY` | `VIBE_AI_MODEL` (default: `gpt-4o`) |
| **Groq** | `GROQ_API_KEY` | `GROQ_MODEL` (default: `llama-3.3-70b-versatile`) |

> **Priority**: OpenAI → Groq. If neither is set, uses static templates (still great!).

Create a `.vibe-init` file in your home or project directory:
```bash
OPENAI_API_KEY=sk-...
# OR
GROQ_API_KEY=gsk-...
GROQ_MODEL=llama-3.3-70b-versatile
```

## 🔍 Smart Project Analysis (Offline)

Even without an LLM, Vibe Init scans your project and:
- **Detects frameworks** from `package.json`, `requirements.txt`, `pubspec.yaml`
- **Shows version-specific gotchas** (e.g., "Tailwind v4: Use @theme, not config.js")
- **Pre-fills `projectbrief.md`** with detected stack info

## ✨ 2025 Agent Standards Support

Vibe Init now follows the latest industry standards for AI Agent configuration:

-   🌍 **`AGENTS.md`**: (Universal) Open standard supported by GitHub Copilot, Roo Code, and more.
-   ⚡ **`GEMINI.md`**: (Gemini CLI / Antigravity) Auto-loads rules at project root.
-   💬 **`CLAUDE.md`**: (Claude Code) Persistent project-level instructions.
-   🚀 **`.cursor/rules/`**: (Modern Cursor) Structured `.mdc` rules for granular context.
-   🏄 **`.windsurfrules`**: (Windsurf) Agent-specific instructions.
-   🛠️ **`CONVENTIONS.md`**: (Aider) Standard convention loading.

## ✨ What It Generates

It creates a "God Mode" directory structure tailored to your Stack + Editor:

-   🧠 **`memory-bank/`**: (Universal)
    -   `projectbrief.md`: The "North Star" goals and stack definition.
    -   `activeContext.md`: The "Save State" of your current task.
    -   `progress.md`: High-level roadmap tracking.
-   📜 **Config Files**: (Dynamic)
    -   `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.cursor/rules/*.mdc`, etc. based on selection.

## ⚠️ Important (The "Read First" Mandate)

All generated configurations include a **Bootstrap Instruction** that forces the AI Agent to read `memory-bank/activeContext.md` before taking any action. This solves the "context amnesia" problem common in complex tasks.

**After running `vibe-init`, you MUST restart your IDE/Editor for the new rules to take effect.**

## 🛠️ Available Stacks

| Category | Stacks |
| :--- | :--- |
| **Web** | Next.js + Supabase, Next.js + Netlify, T3 Stack, Generic Web |
| **Mobile** | Expo (React Native), Flutter, Android Native (Kotlin) |
| **Backend** | Python + FastAPI, Go API |
| **CLI/Tools** | Node.js CLI, Chrome Extension |
| **Automation** | Python Playwright, Node.js Playwright |
| **Games** | Phaser, Godot Engine |

