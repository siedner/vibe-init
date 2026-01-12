# Vibe Init - Antigravity God Mode Setup

![Vibe Init Banner](https://img.shields.io/badge/VIBE-INIT-cyan?style=for-the-badge)

A graphical CLI that instantly configures a structured, agentic environment for Google Antigravity. It sets up the persistent specific files and folders that turn your IDE into an autonomous coding partner.

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
2.  **Vibe**: Choose your philosophy (Ship Fast / Iron Clad / Neural Core).
3.  **Stack**: Choose your technology (Next.js / Python / Generic).
4.  **Editors**: multi-select (Antigravity, Cursor, Roo).

### Scenario B: Existing Project (Vibe-ify)
Navigate to an **existing project root** (containing `package.json` or code) and run `vibe-init`.
1.  **Detection**: It will ask: *"Existing files detected. Do you want to Vibe-ify this project?"*
2.  **Auto-Detect**: It will attempt to guess your project name and stack.
3.  **Injection**: It will create the `memory-bank`, `.agent`, or `.cursorrules` **without overwriting** your source code.

## 📦 Philosophy (VIBES) vs Technology (STACKS)

Vibe Init 3.0 decouples the *how* from the *what*.

| Vibe (Philosophy) | Motto | Best For |
| :--- | :--- | :--- |
| **🚀 Ship Fast** | "Act First, Ask Later" | Prototypes, Hackathons |
| **🛡️ Iron Clad** | "Safety First" | Enterprise, Fintech, large teams |
| **🧠 Neural Core** | "Research First" | AI, RAG, Complex Logic |

You can combine any Vibe with any Stack. For example:
-   **"Iron Clad" + "Python"**: Strict Typed Python with tests.
-   **"Ship Fast" + "Next.js"**: Rapid React prototyping.

## ✨ What It Generates

It creates a "God Mode" directory structure tailored to your Stack + Editor:

-   🧠 **`memory-bank/`**: (Universal)
    -   `projectbrief.md`: The "North Star" goals and stack definition.
    -   `activeContext.md`: The "Save State" of your current task.
    -   `progress.md`: High-level roadmap tracking.
-   📜 **Config Files**: (Dynamic)
    -   `.cursorrules` / `.clinerules` / `.agent/` based on selection.

## ⚠️ Important

**After running `vibe-init`, you MUST restart your IDE/Editor for the new rules to take effect.**
