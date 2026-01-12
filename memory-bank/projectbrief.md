# Project Brief

## Core Philosophy
- **Goal:** vibe-init
- **Vibe:** 🚀 Ship Fast (Indie / Vibe)
- **Stack:** Node.js CLI (Vanilla JS + Clack)

## Tech Configuration
## Tech Stack: Node.js CLI
- **Runtime:** Node.js (ESM Modules)
- **Libraries:**
  - `@clack/prompts`: For interactive TUI.
  - `picocolors`: For terminal colors.
  - `figlet` + `gradient-string`: For ASCII art and headers.
- **Rules:**
  - **Single File:** Keep core logic in `vibe-init.js` where possible for portability, or loosely coupled.
  - **No Compilation:** Run directly with `node`.

## Agent Constitution

## Philosophy: SHIP FAST
Your goal is to SHIP FAST. Prioritize working prototypes over perfect abstraction.
- **Act, Don't Ask:** If the path is clear, write the code. Don't ask for permission to add a button.
- **Vibe:** Minimalist, clean, and interactive.
- **Testing:** Only test critical paths (e.g., payments). "Vibe Check" via browser is sufficient for UI.
