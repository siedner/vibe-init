#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { intro, outro, text, select, multiselect, confirm, spinner, note, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import figlet from 'figlet';
import gradient from 'gradient-string';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import os from 'os';

// --- Configuration Loading ---
import { fileURLToPath } from 'url';

// --- Configuration Loading ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Priority: Process Env > Local .vibe-init > Script Dir .vibe-init > Global .vibe-init
dotenv.config({ path: path.join(process.cwd(), '.vibe-init') }); // 1. Current Dir .vibe-init
dotenv.config({ path: path.join(__dirname, '.vibe-init') });     // 2. Script Dir .vibe-init (Tool Root)
dotenv.config({ path: path.join(os.homedir(), '.vibe-init') }); // 3. Home Dir .vibe-init

// --- Configuration ---
const ANTIGRAVITY_DIRS = [
    'memory-bank',
    '.agent/rules',
    '.agent/workflows'
];

// --- 1. VIBES (Philosophy) ---
const VIBES = {
    ship_fast: {
        name: '🚀 Rapid Prototyping',
        desc: 'Speed over perfection. For MVPs and indie projects.',
        recommendedStacks: ['next_supabase', 'next_netlify', 'generic_web', 'mobile_expo'],
        systemPrompt: `
## Philosophy: RAPID PROTOTYPING
Your goal is to SHIP FAST. Prioritize working prototypes over perfect abstraction.
- **Act, Don't Ask:** If the path is clear, write the code. Don't ask for permission to add a button.
- **Vibe:** Minimalist, clean, and interactive.
- **Testing:** Only test critical paths (e.g., payments). "Vibe Check" via browser is sufficient for UI.
`,
        outro: '🚀 Prototype shipped. Iterate fast.'
    },
    iron_clad: {
        name: '🛡️ Enterprise Grade',
        desc: 'Safety over speed. TDD, strict typing, documentation.',
        recommendedStacks: ['t3_stack', 'python_fastapi', 'golang_api'],
        systemPrompt: `
## Philosophy: ENTERPRISE GRADE
Your goal is SAFETY and STABILITY.
- **TDD Mandate:** You must write or request a failing test BEFORE writing implementation code.
- **Strictness:** No silent failures. All errors must be typed and handled.
- **Review:** Plan carefully before executing changes.
`,
        outro: '🛡️ Compliance verified. System secure.'
    },
    neural_core: {
        name: '🧠 AI & Research',
        desc: 'Research-first. Evaluation-driven prompt engineering.',
        recommendedStacks: ['python_fastapi', 'generic_web'],
        systemPrompt: `
## Philosophy: AI & RESEARCH
Your goal is ROGUE CAPABILITY with SAFEGUARDED EXECUTION.
- **Research First:** Verify assumptions before coding.
- **Evaluation:** Prompt changes must be accompanied by an evaluation script.
- **Security:** Never output API keys. Rely on \`.env\`.
`,
        outro: '🧠 Research complete. Findings documented.'
    },
    creative_rush: {
        name: '🎨 Creative & Design',
        desc: 'Aesthetics first. Motion, 3D, award-winning experiences.',
        recommendedStacks: ['next_supabase', 'next_netlify', 'generic_web'],
        systemPrompt: `
## Philosophy: CREATIVE & DESIGN
Your goal is to create AWWWARDS-WINNING digital experiences.
- **Persona:** You are a Creative Technologist (50% Dev, 50% Artist).
- **Tech Stack:**
  - **Three.js / R3F:** For 3D elements and WebGL scenes.
  - **GSAP:** For timeline-based complex animations.
  - **Lenis:** For smooth scrolling.
- **Rules:**
  - "Boring" is a bug. Add micro-interactions to everything.
  - Use custom cursors and noise textures to add depth.
  - Prioritize motion fidelity (60fps) over pure lighthouse scores if necessary.
`,
        outro: '🎨 Experience crafted. Dazzle delivered.'
    },
    pixel_perfect: {
        name: '👾 Game Development',
        desc: 'Gameplay mechanics. Game feel and performance focus.',
        recommendedStacks: ['web_game_phaser', 'godot_engine'],
        systemPrompt: `
## Philosophy: GAME DEVELOPMENT
Your goal is to create ADDICTIVE GAMEPLAY loops.
- **Persona:** You are a Gameplay Engineer (Mechanics First).
- **Rules:**
  - **Game Feel:** Add "juice" immediately (Screen shake, particles, squash & stretch).
  - **Input:** Input handling must be decoupled from game logic.
  - **Performance:** Zero allocations in the update loop. Use Object Pooling.
`,
        outro: '👾 Game loop polished. Ready to play.'
    },
    oss_maintainer: {
        name: '📖 Open Source',
        desc: 'Maintainability first. JSDoc, conventional commits, clarity.',
        recommendedStacks: ['generic_web', 'python_fastapi', 'golang_api'],
        systemPrompt: `
## Philosophy: OPEN SOURCE
Your goal is LONG-TERM MAINTAINABILITY.
- **Documentation:** Every exported function MUST have JSDoc/Docstrings explaining input/output.
- **Commits:** Use Conventional Commits (feat:, fix:, docs:) exclusively.
- **Simplicity:** Prefer verbose, clear code over clever one-liners.
- **No Magic:** Avoid "magic numbers" or hidden side effects. Explicit is better than implicit.
`,
        outro: '📖 Code documented. Contributors welcome.'
    },
    a11y_advocate: {
        name: '♿ Accessibility First',
        desc: 'WCAG 2.1 AA compliance. Semantic HTML, keyboard nav.',
        recommendedStacks: ['next_supabase', 'next_netlify', 'generic_web', 't3_stack'],
        systemPrompt: `
## Philosophy: ACCESSIBILITY FIRST
Your goal is WCAG 2.1 AA COMPLIANCE.
- **Semantic HTML:** Never use a \`div\` where a \`button\`, \`nav\`, or \`section\` works.
- **Keyboard:** All interactions must be usable via Tab/Enter/Space. Focus states must be visible.
- **Attributes:** Ensure all images have \`alt\` text and inputs have \`labels\`.
- **Testing:** When asked to test, check screen-reader compatibility first.
`,
        outro: '♿ Accessible to all. Inclusion achieved.'
    },
    data_wizard: {
        name: '📊 Data Science',
        desc: 'Reproducible notebooks. Pandas, visualization, analysis.',
        recommendedStacks: ['python_fastapi'],
        systemPrompt: `
## Philosophy: DATA SCIENCE
Your goal is REPRODUCIBLE INSIGHTS.
- **Visualization:** Prefer Plotly/Seaborn. Always label axes and add titles.
- **Data Safety:** Never print full dataframes. Use \`.head()\` or \`.info()\`.
- **Performance:** Vectorize operations (pandas/numpy) instead of looping.
- **Structure:** If in a notebook, keep cells independent. No hidden state.
`,
        outro: '📊 Analysis complete. Insights documented.'
    },
    ghost_operator: {
        name: '🤖 Browser Automation',
        desc: 'Stealth scraping. Persistent sessions, anti-detection.',
        recommendedStacks: ['python_scraper', 'node_browser'],
        systemPrompt: `
## Philosophy: BROWSER AUTOMATION
Your goal is INVISIBLE EXECUTION using PERSISTENT SESSIONS.

### 1. The "Login Logic" (Crucial)
You must ALWAYS implement the "Check-Login-Save" loop:
- IF auth.json exists: Load it. Go to Target URL.
- IF NOT Logged In (selector check): Perform Login. Save auth.json.
- ELSE: Perform Login. Save auth.json.

### 2. Stealth Rules
- **Humanity:** Randomize delays (500ms - 2000ms) between actions.
- **Resilience:** If a click fails, retry once with force=True or dispatchEvent.
- **Ethics:** Do not hammer servers. Use saved sessions to minimize requests.

### 3. CRITICAL SECURITY
- Never hardcode passwords. Use \`process.env.PASSWORD\`.
- Reuse cookies from \`auth.json\` to avoid triggering anti-bot login challenges.
`,
        outro: '🤖 Automation complete. No traces left.'
    }
};

// --- 2. STACKS (Technology) ---
const STACKS = {
    web_game_phaser: {
        name: 'Web Game (Phaser)',
        desc: 'Phaser 3 + TypeScript + Vite',
        techRules: `
## Tech Stack: Phaser 3 + Vite
- **Engine:** Phaser 3 (Arcade Physics default).
- **Language:** TypeScript (Strict).
- **Structure:**
  - Use **Scenes** for states (Boot, Preload, Menu, Game).
  - Use **Object Pooling** for bullets/enemies.
  - Assets: Manage in a central \`AssetLoader\`.
`,
        envVars: `VITE_GAME_TITLE=My Awesome Game
VITE_GAME_VERSION=0.0.1`
    },
    godot_engine: {
        name: 'Godot Engine',
        desc: 'Godot 4.x + GDScript',
        techRules: `
## Tech Stack: Godot 4
- **Engine:** Godot 4.x
- **Language:** GDScript (Use Type Hinting \`var x: int\`).
- **Patterns:**
  - Use **Signals** for decoupled communication.
  - Use **Resources** for data (stats, configs).
  - Composition over Inheritance (Attach scripts to Nodes).
- **AI Rules:**
  - Be careful with Godot 3 vs 4 syntax changes (e.g. \`tween_property\`).
  - Use \`await\` for coroutines.
`,
        envVars: ``
    },
    next_supabase: {
        name: 'Next.js + Supabase',
        desc: 'App Router, Tailwind v4, Postgres',
        techRules: `
## Tech Stack: Next.js + Supabase
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 (Utility-first)
- **Backend:** Supabase (Auth, Postgres, Edge Functions)
- **State:** Zustand (Client), React Query (Server/Infinite)
- **Data Fetching Rules:**
  - Use **Server Components** for initial data fetching.
  - Use **Cursor-based Pagination** for lists (performance over offset).
  - Use **React Query (\`useInfiniteQuery\`)** for infinite scroll.
  - **RLS:** Row Level Security must be enabled on ALL tables.
`
    },
    next_netlify: {
        name: 'Next.js + Netlify',
        desc: 'Netlify Hosted, Supabase Backend',
        techRules: `
## Tech Stack: Next.js + Netlify
- **Hosting:** Netlify (Edge Functions, CD)
- **Framework:** Next.js 15
- **API:** Use **Netlify Functions** or Next.js API Routes (deployed as Serverless/Edge).
- **Backend:** Supabase (Database only)
- **Config:** \`netlify.toml\` handles headers/redirects.
- **Edge:** Prefer Edge functions for latency-sensitive API routes.
`,
        envVars: `NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NETLIFY_AUTH_TOKEN=`,
        extraFiles: {
            'netlify.toml': `[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
`
        }
    },
    python_fastapi: {
        name: 'Python + FastAPI',
        desc: 'Python 3.12, Pydantic, Async',
        techRules: `
## Tech Stack: Python + FastAPI
- **Language:** Python 3.12+ (Type Hints Required)
- **Framework:** FastAPI
- **Validation:** **Pydantic V2** (Strict Mode).
- **Async:** Use \`async def\` for all IO-bound operations (DB, API calls).
- **Structure:** Modular router pattern (APIRouter).
- **Testing:** Pytest with async support (\`pytest-asyncio\`).
`,
        envVars: `OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql://user:password@localhost:5432/dbname`
    },
    generic_web: {
        name: 'Generic Web / Other',
        desc: 'General best practices for web',
        techRules: `
## Tech Stack: General Web
- **Standards:** ESM Modules, Modern JS/TS features.
- **Format:** Prettier + ESLint recommended.
`
    },
    mobile_expo: {
        name: 'Mobile (Expo / React Native)',
        desc: 'React Native, Expo Router, NativeWind',
        techRules: `
## Tech Stack: Expo (React Native)
- **Framework:** Expo SDK 52+
- **Routing:** Expo Router (File-based routing).
- **Styling:** NativeWind (Tailwind for Native) or StyleSheet.create.
- **CRITICAL RULES:**
  - **NO HTML:** Never use \`<div>\`, \`<span>\`, or \`<h1>\`. Use \`<View>\`, \`<Text>\`, \`<SafeAreaView>\`.
  - **Platform:** Handle iOS/Android differences using \`Platform.OS\`.
  - **Navigation:** Use \`<Stack>\` and \`<Tabs>\` from Expo Router.
`,
        envVars: `EXPO_PUBLIC_API_URL=`
    },
    t3_stack: {
        name: 'T3 Stack (Next.js + tRPC)',
        desc: 'Next.js, tRPC, Prisma, Tailwind',
        techRules: `
## Tech Stack: T3 (The "Grand" Stack)
- **API:** tRPC (Type-safe APIs). No REST endpoints unless external.
- **Database:** Prisma ORM (Schema-first).
- **Auth:** NextAuth.js (Auth.js).
- **Rules:**
  - **Type Safety:** The frontend must infer types from the backend router. No manual type duplication.
  - **Mutations:** Use Zod schemas for all mutation inputs.
  - **Server:** Keep heavy logic in the tRPC router, not the UI component.
`,
        envVars: `DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000`
    },
    chrome_ext: {
        name: 'Chrome Extension (Manifest V3)',
        desc: 'Plasmo or Vanilla, Service Workers',
        techRules: `
## Tech Stack: Chrome Extension (Manifest V3)
- **Manifest:** Version 3 (Strict Requirement).
- **Architecture:**
  - **Popup:** React/HTML UI for the toolbar icon.
  - **Content Script:** Runs in the webpage (isolated world).
  - **Background:** Service Worker (Ephemeral, no DOM access).
- **Communication:** Use \`chrome.runtime.sendMessage\` for passing data between contexts.
- **Storage:** Use \`chrome.storage.local\` (Async).
`,
        envVars: ``
    },
    golang_api: {
        name: 'Go API (Backend)',
        desc: 'Go 1.24+, Chi/Gin, SQLC',
        techRules: `
## Tech Stack: Go (Golang)
- **Language:** Go 1.24+
- **Router:** Chi or Gin.
- **Database:** SQLC (Type-safe SQL) or GORM.
- **Idioms:**
  - **Error Handling:** Strictly \`if err != nil\`. No exceptions/try-catch.
  - **Context:** Always pass \`ctx context.Context\` as the first argument to long-running functions.
  - **Concurrency:** Use Goroutines + Channels, not Async/Await.
`,
        envVars: `PORT=8080
DB_DSN=postgres://user:pass@localhost:5432/db`
    },
    python_scraper: {
        name: 'Python Playwright (Browser Automation)',
        desc: 'Python, Async, Persistent Auth',
        techRules: `
## Tech Stack: Python Automation
- **Engine:** Playwright (Python Async).
- **Auth Strategy:**
  1. Check \`auth.json\` for context storage state.
  2. Use \`context = await browser.new_context(storage_state="auth.json")\`.
  3. If file missing, log in and run \`await context.storage_state(path="auth.json")\`.
`,
        envVars: `HEADLESS=false
TARGET_URL=https://example.com`,
        extraFiles: {
            'auth_manager.py': `import os
import json
from playwright.async_api import BrowserContext

AUTH_FILE = "auth.json"

async def load_session(browser):
    """Creates a context with saved state if available"""
    if os.path.exists(AUTH_FILE):
        print(f"🍪 Loading session from {AUTH_FILE}")
        return await browser.new_context(storage_state=AUTH_FILE)
    
    print("⚠️ No session found. Starting fresh.")
    return await browser.new_context()

async def save_session(context: BrowserContext):
    """Saves current cookies and local storage"""
    print(f"💾 Saving session to {AUTH_FILE}")
    await context.storage_state(path=AUTH_FILE)

def has_session():
    return os.path.exists(AUTH_FILE)
`
        }
    },
    node_browser: {
        name: 'Node.js Browser (Playwright)',
        desc: 'TypeScript, Playwright, Stealth, Persistent Auth',
        techRules: `
## Tech Stack: Node.js Automation
- **Engine:** Playwright (TS).
- **Auth Strategy:**
  1. ALWAYS try to load session from \`auth.json\` first.
  2. If the session is invalid (logged out), perform login AND save new state to \`auth.json\`.
  3. Use the \`AuthHelper\` class in \`src/auth-helper.ts\`.
- **Stealth:**
  - Randomize mouse movements using \`page.mouse.move()\`.
  - Never click generic coordinates. Click specific selectors.
`,
        extraFiles: {
            'src/auth-helper.ts': `import { Page, BrowserContext } from '@playwright/test';
import fs from 'fs';

const AUTH_FILE = 'auth.json';

export class AuthHelper {
  
  /**
   * Tries to load cookies/localStorage from auth.json
   */
  static async loadSession(context: BrowserContext): Promise<boolean> {
    if (fs.existsSync(AUTH_FILE)) {
      console.log('🍪 Loading saved session...');
      const state = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      await context.addCookies(state.cookies);
      return true;
    }
    return false;
  }

  /**
   * Saves the current cookies/localStorage to auth.json
   */
  static async saveSession(context: BrowserContext) {
    console.log('💾 Saving session to auth.json...');
    const cookies = await context.cookies();
    const state = { cookies };
    fs.writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
  }

  /**
   * Check if we are actually logged in (Customize selector)
   */
  static async isLoggedIn(page: Page, selector: string = '#user-menu'): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}
`
        }
    }
};

// --- 3. MEMORY POLICIES ---
const MEMORY_POLICIES = {
    strict: `
# MEMORY BANK MANDATE
1. **Read First:** Never start a task without reading \`/memory-bank/activeContext.md\`.
2. **Update Last:** You are FORBIDDEN from finishing a turn without updating \`/memory-bank/activeContext.md\` if you changed any code.
3. **Verification:** If you forget step #2, you have failed the user.
`,
    casual: `
# Memory Bank
Please read \`/memory-bank/activeContext.md\` at the start of every session and keep it updated.
`
};

const COMMON_FILES = {
    'memory-bank/projectbrief.md': `# Project Brief
## Core Philosophy
- **Goal:** {{PROJECT_NAME}}
- **Vibe:** {{VIBE_NAME}}
- **Stack:** {{STACK_NAME}}

## Tech Configuration
{{TECH_RULES}}

## Agent Constitution
{{VIBE_RULES}}
`,
    'memory-bank/activeContext.md': `# Active Context
*AGENT INSTRUCTION: Update this file after every successful task.*

## Current Focus
- **Task:** Initial Vibe Setup
- **Current Step:** Reviewing project structure and rules.

## Recent Changes
- [Today]: Applied Vibe Init ({{VIBE_NAME}}).
`,
    'memory-bank/progress.md': `# Project Progress

## Phase 1: Foundation [Status: In Progress]
- [x] Vibe Initialization
`
};

// --- Helpers ---
function detectStack() {
    if (fs.existsSync('package.json')) {
        const content = fs.readFileSync('package.json', 'utf-8');
        if (content.includes('next')) return 'next_supabase';
    }
    if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml')) {
        return 'python_fastapi';
    }
    return null;
}

function getProjectName(isExisting) {
    if (isExisting) {
        if (fs.existsSync('package.json')) {
            try {
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
                if (pkg.name) return pkg.name;
            } catch (e) { }
        }
        return path.basename(process.cwd());
    }
    return null;
}

// --- Smart Context Helper ---
function getVitalContext(cwd) {
    if (!fs.existsSync(path.join(cwd, 'package.json'))) return '';
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Filter for "High Impact" packages only
        const highImpactList = [
            'next', 'react', 'vue', 'nuxt', 'svelte', 'express', 'fastapi',
            'supabase', 'firebase', 'prisma', 'drizzle', 'mongoose',
            'tailwindcss', 'framer-motion', 'gsap', 'three',
            'zod', 'yup', 'typescript', 'jest', 'vitest', 'cypress',
            'phaser', 'pixi', 'kaboom'
        ];

        const vital = Object.keys(allDeps).filter(d =>
            highImpactList.some(k => d.includes(k))
        );

        return vital.length > 0 ? `Detected Frameworks: ${vital.join(', ')}` : '';
    } catch (e) { return ''; }
}

// --- AI Logic ---
async function generateDynamicRules(apiKey, project, vibe, stack, cwd) {
    let prompt;
    let model = process.env.VIBE_AI_MODEL || 'gpt-4o';

    try {
        const openai = new OpenAI({ apiKey });

        // Scan package.json for context (Smart Filter)
        const pkgContext = getVitalContext(cwd);

        prompt = `
# ROLE
You are the world's leading Senior Architect for ${stack.name}. You prioritize "${vibe.name}" (${vibe.desc}).

# INPUT CONTEXT
- Project Name: ${project}
- Key Dependencies: ${pkgContext || 'None detected (new project)'}

# TASK
Generate a strictly structured system instruction file (Markdown) for an AI coding agent.

# CRITICAL CONSTRAINTS
1. **No Fluff:** Do not write "Write clean code." Write actionable rules like "Use early returns" or "Prefer const over let".
2. **Dependency Aware:** If 'zod' is present, mandate "All API inputs must be validated with Zod schemas." If 'tailwindcss' is present, mandate "Use utility classes, do not create custom CSS files."
3. **Vibe Check:**
   - If Vibe includes "Ship Fast", mandate "Skip unit tests for UI components. Browser testing is sufficient."
   - If Vibe includes "Iron Clad", mandate "Every function requires a Docstring and a Type definition. TDD is mandatory."
   - If Vibe includes "Neural Core", mandate "All prompts must have an evaluation script."

# OUTPUT FORMAT
Return ONLY the raw Markdown content. Do not wrap in \`\`\` code blocks.
Start immediately with: # Project Rules for ${project}
`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: model,
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from AI');

        return {
            rules: content,
            prompt: prompt,
            model: model,
            success: true
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            prompt: prompt || 'Prompt generation failed',
            model: model || 'unknown'
        };
    }
}

// --- Core Logic ---
export async function generateVibe(options) { // Export for testing
    const { project, vibeKey, stackKey, ideKeys, useStrictMemory, cwd = process.cwd() } = options;
    const generatedFiles = [];

    const selectedVibe = VIBES[vibeKey];
    const selectedStack = STACKS[stackKey];
    const memoryPolicy = useStrictMemory ? MEMORY_POLICIES.strict : MEMORY_POLICIES.casual;

    // --- AI Hybrid Check ---
    let combinedRules;
    let llmLog;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (openAiKey) {
        // AI Mode
        const aiResult = await generateDynamicRules(openAiKey, project, selectedVibe, selectedStack, cwd);

        if (aiResult.success) {
            combinedRules = aiResult.rules + `\n\n${memoryPolicy}`;
            llmLog = { ...aiResult, vibe: selectedVibe.name, stack: selectedStack.name };
        } else {
            // Fallback with Error Log
            combinedRules = `# Role: Vibe Coder\n\n${selectedVibe.systemPrompt}\n\n${selectedStack.techRules}\n\n${memoryPolicy}`;
            llmLog = { ...aiResult, vibe: selectedVibe.name, stack: selectedStack.name, note: 'AI Generation Failed, fell back to static.' };
        }
    } else {
        // Static Mode
        combinedRules = `# Role: Vibe Coder\n\n${selectedVibe.systemPrompt}\n\n${selectedStack.techRules}\n\n${memoryPolicy}`;
        llmLog = { note: 'Static Mode (No API Key)', vibe: selectedVibe.name, stack: selectedStack.name };
    }

    // Create Memory Bank (Shared)
    const memBankDir = path.join(cwd, 'memory-bank');
    if (!fs.existsSync(memBankDir)) fs.mkdirSync(memBankDir, { recursive: true });

    for (const [filePath, content] of Object.entries(COMMON_FILES)) {
        if (filePath.startsWith('memory-bank')) {
            const fullPath = path.join(cwd, filePath);
            let finalContent = content
                .replace(/{{PROJECT_NAME}}/g, project)
                .replace(/{{VIBE_NAME}}/g, selectedVibe.name)
                .replace(/{{STACK_NAME}}/g, selectedStack.name)
                .replace(/{{TECH_RULES}}/g, selectedStack.techRules)
                .replace(/{{VIBE_RULES}}/g, selectedVibe.systemPrompt);

            if (!fs.existsSync(fullPath)) {
                fs.writeFileSync(fullPath, finalContent);
                generatedFiles.push({ path: filePath, content: finalContent });
            }
        }
    }

    // Generate Editor Configs
    if (ideKeys.includes('antigravity')) {
        for (const dir of ANTIGRAVITY_DIRS) {
            const fullPath = path.join(cwd, dir);
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
        }
        const agentRulesPath = '.agent/rules/tech-stack.md';
        fs.writeFileSync(path.join(cwd, agentRulesPath), combinedRules);
        generatedFiles.push({ path: agentRulesPath, content: combinedRules });

        // Dynamic Workflow based on Vibe
        let workflowContent = '';
        let workflowName = '';

        if (vibeKey === 'ship_fast') {
            workflowName = 'ship';
            workflowContent = `---
description: Rapid deployment workflow for indie developers
---
# Workflow: Speed Run

Trigger: /ship

1. Analyze changed files for critical errors only.
2. If no critical errors, stage all changes: \`git add .\`
3. Commit with message: \`git commit -m "wip: rapid prototype update"\`
4. Push to remote: \`git push\`
5. Echo success: "🚀 Shipped."`;
        } else if (vibeKey === 'iron_clad') {
            workflowName = 'audit';
            workflowContent = `---
description: Enterprise safety check workflow
---
# Workflow: Safety Check

Trigger: /audit

1. Run static analysis (eslint, tsc --noEmit).
2. Check for missing types and docstrings.
3. Verify test coverage > 80%.
4. If any check fails, abort and list issues.
5. If all pass, echo: "🛡️ Audit Passed. Ready for PR."`;
        } else if (vibeKey === 'neural_core') {
            workflowName = 'eval';
            workflowContent = `---
description: AI Research evaluation workflow
---
# Workflow: Evaluate

Trigger: /eval

1. Identify changed prompts or AI logic.
2. Generate an evaluation script for the changes.
3. Run the evaluation and report metrics.
4. Log results to memory-bank/evaluations.md.`;
        } else if (vibeKey === 'creative_rush') {
            workflowName = 'wow';
            workflowContent = `---
description: Creative polish workflow
---
# Workflow: Wow Check

Trigger: /wow

1. Identify UI components with no animations.
2. Add micro-interactions (hover, focus states).
3. Check for consistent motion timing.
4. Echo: "🎨 Dazzle applied."`;
        } else if (vibeKey === 'pixel_perfect') {
            workflowName = 'juice';
            workflowContent = `---
description: Game feel polish workflow
---
# Workflow: Juice It

Trigger: /juice

1. Identify player actions without feedback.
2. Add screen shake, particles, or sound cues.
3. Verify frame rate > 60fps.
4. Echo: "👾 Juiced."`;
        } else if (vibeKey === 'oss_maintainer') {
            workflowName = 'docs';
            workflowContent = `---
description: Documentation and clean code workflow
---
# Workflow: Document

Trigger: /docs

1. Find all exported functions without JSDoc comments.
2. Add proper JSDoc with @param and @returns.
3. Verify all commits follow Conventional Commits format.
4. Echo: "📖 Documentation complete."`;
        } else if (vibeKey === 'a11y_advocate') {
            workflowName = 'a11y-check';
            workflowContent = `---
description: Accessibility compliance workflow
---
# Workflow: A11y Check

Trigger: /a11y

1. Scan for non-semantic HTML (div buttons, span links).
2. Check all images have alt text.
3. Verify keyboard navigation works (Tab through all interactive elements).
4. Run axe-core or similar accessibility audit.
5. Echo: "♿ Accessibility verified."`;
        } else if (vibeKey === 'data_wizard') {
            workflowName = 'notebook';
            workflowContent = `---
description: Reproducible notebook workflow
---
# Workflow: Notebook Check

Trigger: /notebook

1. Verify all cells run top-to-bottom without errors.
2. Check no dataframe is printed without .head() or .info().
3. Ensure all plots have labeled axes.
4. Echo: "🧙‍♂️ Notebook reproducible."`;
        } else if (vibeKey === 'ghost_operator') {
            workflowName = 'debug-scrape';
            workflowContent = `---
description: Visual debug workflow for browser automation
---
# Workflow: Visual Debug

Trigger: /debug-scrape

1. Run the scraper in **Headful** mode (headless: false).
2. If it fails:
   - Take a Screenshot (page.screenshot).
   - Dump the current page HTML to logs/error.html.
   - Analyze the HTML to see if the selector changed.
3. Propose a selector fix based on the HTML dump.
4. Echo: "👻 Debug complete."`;
        } else {
            workflowName = 'refactor';
            workflowContent = `---
description: General deep refactor workflow
---
# Workflow: Deep Refactor

Trigger: /refactor

1. Analyze projectbrief.md
2. Plan
3. Execute
4. Verify`;
        }

        const wfPath = `.agent/workflows/${workflowName}.md`;
        if (!fs.existsSync(path.join(cwd, wfPath))) {
            fs.writeFileSync(path.join(cwd, wfPath), workflowContent);
            generatedFiles.push({ path: wfPath, content: workflowContent });
        }
    }
    if (ideKeys.includes('cursor')) {
        fs.writeFileSync(path.join(cwd, '.cursorrules'), combinedRules);
        generatedFiles.push({ path: '.cursorrules', content: combinedRules });
    }
    if (ideKeys.includes('roo')) {
        fs.writeFileSync(path.join(cwd, '.clinerules'), combinedRules);
        generatedFiles.push({ path: '.clinerules', content: combinedRules });
    }

    // --- Secrets Template ---
    if (selectedStack.envVars) {
        const envPath = '.env.example';
        if (!fs.existsSync(path.join(cwd, envPath))) {
            fs.writeFileSync(path.join(cwd, envPath), selectedStack.envVars);
            generatedFiles.push({ path: envPath, content: selectedStack.envVars });
        }
    }

    // --- Extra Files (Stack Specific) ---
    if (selectedStack.extraFiles) {
        for (const [fileName, fileContent] of Object.entries(selectedStack.extraFiles)) {
            if (!fs.existsSync(path.join(cwd, fileName))) {
                fs.writeFileSync(path.join(cwd, fileName), fileContent);
                generatedFiles.push({ path: fileName, content: fileContent });
            }
        }
    }

    return { generatedFiles, llmLog };
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// --- Delight: Hacker Spinner ---
async function runHackerSpinner(s) {
    const msgs = [
        'Injecting Neural Patterns...',
        'Optimizing Vibe Matrix...',
        'Calibrating Agent Persona...',
        'Compiling Success Protocols...',
        'Decrypting Mainframe...',
        'Synthesizing Context...'
    ];
    for (const msg of msgs) {
        s.message(msg);
        await new Promise(r => setTimeout(r, 300 + getRandomInt(500)));
    }
}

function printHelp() {
    console.log(pc.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                   VIBE INIT - USER GUIDE                     ║
╚══════════════════════════════════════════════════════════════╝
`));
    console.log(pc.white(`
WHAT IS THIS?
-------------
Vibe Init is a "Context Generator" for AI coding agents. 
It creates the perfect system instructions to make AI tools like
Cursor, Windsurf, and Cline behave exactly how you want.

HOW TO USE
----------
1. ${pc.bold('Select a Vibe')}: The "Philosophy" or personality of the AI.
   - ${pc.green('Ship Fast')}: Hacky, speed-focused, minimal testing.
   - ${pc.blue('Iron Clad')}: Enterprise-grade, TDD, strict patterns.
   - ${pc.magenta('Creativity')}: Visual-focused, design-first.

2. ${pc.bold('Select a Stack')}: The actual technology you are using.
   - We generate specific "Tech Rules" for Next.js, Python, etc.
   - e.g. "Use Server Components", "Use Pydantic v2".

3. ${pc.bold('Select IDE')}: Where you work.
   - We generate .cursorrules (Cursor), .clinerules (VS Code), etc.

FEATURES
--------
- ${pc.yellow('Vibe-ify Mode')}: Add rules to existing projects safely.
- ${pc.yellow('Strict Memory')}: Force AI to update documentation.
- ${pc.yellow('Auto-Detect')}: We guess your stack from package.json.

${pc.dim('Press Enter to return to menu...')}
`));
}

async function main() {
    console.clear();
    figlet('VIBE INIT', (err, data) => console.log(gradient.pastel.multiline(data)));
    await new Promise(resolve => setTimeout(resolve, 100));
    intro(`${pc.bgCyan(pc.black(' GOD MODE ACTIVATED '))}`);

    // Vibe-ify check (omitted for brevity, assume flow)
    // ... (This part requires significant move of existing logic into main, 
    // but the previous code structure had main calling logic inline. 
    // I am replacing the inline logic with a call to generateVibe)

    // ... (Keep detection logic here)
    // 1. Detect Environment (New vs Existing)
    const cwd = process.cwd();
    const files = fs.readdirSync(cwd).filter(f => !f.startsWith('.') && f !== 'vibe-init.js' && f !== 'node_modules');
    const isExisting = files.length > 0;

    let mode = 'new';
    if (isExisting) {
        const useExisting = await confirm({
            message: `${pc.yellow('Existing files detected.')} Do you want to ${pc.cyan('Vibe-ify')} this project?`,
        });
        if (isCancel(useExisting)) { cancel('Cancelled.'); process.exit(0); }
        if (useExisting) mode = 'existing';
        else {
            cancel('Please run vibe-init in an empty folder for a new project.');
            process.exit(0);
        }
    }

    // 2. Project Name
    let project = getProjectName(mode === 'existing');
    if (!project) {
        project = await text({
            message: 'What is the name of this project?',
            placeholder: 'my-vibe-app',
            validate: (val) => val.length === 0 ? 'Value is required!' : undefined,
        });
        if (isCancel(project)) { cancel('Cancelled.'); process.exit(0); }
    } else {
        note(`${pc.bold(project)}`, 'Project Name Detected');
    }

    // 3. Select VIBE (Philosophy)
    let vibeKey;
    while (true) {
        vibeKey = await select({
            message: 'Choose your Vibe (Philosophy):',
            options: [
                ...Object.entries(VIBES).map(([key, val]) => ({ value: key, label: val.name, hint: val.desc })),
                { value: 'help', label: 'ℹ️  READ ME / HELP', hint: 'Learn how this tool works' }
            ],
        });

        if (isCancel(vibeKey)) { cancel('Cancelled.'); process.exit(0); }

        if (vibeKey === 'help') {
            printHelp();
            continue;
        }
        break;
    }

    // 4. Select STACK (Tech) - Auto-detect attempt
    const detectedStack = detectStack();
    let stackKey = detectedStack;

    if (detectedStack) {
        note(`${STACKS[detectedStack].name}`, 'Tech Stack Detected');
        const confirmStack = await confirm({ message: `Use detected stack?` });
        if (!confirmStack) stackKey = null;
    }

    if (!stackKey) {
        // Get recommended stacks for selected vibe
        const selectedVibe = VIBES[vibeKey];
        const recommendedKeys = selectedVibe.recommendedStacks || [];

        // Build options: Recommended first, then Others
        const recommendedOptions = recommendedKeys
            .filter(key => STACKS[key])
            .map(key => ({
                value: key,
                label: `⭐ ${STACKS[key].name}`,
                hint: `Recommended for ${selectedVibe.name}`
            }));

        const otherOptions = Object.entries(STACKS)
            .filter(([key]) => !recommendedKeys.includes(key))
            .map(([key, val]) => ({
                value: key,
                label: val.name,
                hint: val.desc
            }));

        while (true) {
            stackKey = await select({
                message: `Choose your Tech Stack (${recommendedOptions.length} recommended for ${selectedVibe.name}):`,
                options: [
                    ...recommendedOptions,
                    ...otherOptions,
                    { value: 'custom', label: '🔧 Custom Stack', hint: 'Describe it yourself' },
                    { value: 'help', label: 'ℹ️  READ ME / HELP', hint: 'Learn about Stacks' }
                ],
            });
            if (isCancel(stackKey)) { cancel('Cancelled.'); process.exit(0); }

            if (stackKey === 'help') {
                printHelp();
                continue;
            }

            if (stackKey === 'custom') {
                const customStackName = await text({
                    message: 'Name your stack (e.g. "Rust + Actix"):',
                    validate: (val) => val.length === 0 ? 'Name is required!' : undefined
                });
                if (isCancel(customStackName)) { cancel('Cancelled.'); process.exit(0); }

                const customContext = await text({
                    message: 'List key libraries (comma separated):',
                    placeholder: 'e.g. actix-web, tokio, serde'
                });
                if (isCancel(customContext)) { cancel('Cancelled.'); process.exit(0); }

                STACKS['custom'] = {
                    name: customStackName,
                    desc: 'User defined stack',
                    techRules: `## Tech Stack: ${customStackName}\n- Key Libraries: ${customContext || 'None specified'}\n- Rule: Follow best practices for these libraries.`,
                    envVars: ''
                };
            }
            break;
        }
    }

    // 5. Select Editors
    const ideKeys = await multiselect({
        message: 'Which AI Editors do you use?',
        options: [
            { value: 'antigravity', label: 'Antigravity (.agent)', hint: 'Google\'s Agentic IDE' },
            { value: 'cursor', label: 'Cursor (.cursorrules)', hint: 'VS Code Fork' },
            { value: 'roo', label: 'VS Code (Roo Code)', hint: 'Autonomous Extension' },
        ],
        required: true,
        initialValues: ['antigravity', 'cursor', 'roo']
    });
    if (isCancel(ideKeys)) { cancel('Cancelled.'); process.exit(0); }

    // 6. Memory Policy
    const useStrictMemory = await confirm({
        message: 'Enable Strict Memory Policy? (Forces AI to update memory)',
        initialValue: true
    });
    if (isCancel(useStrictMemory)) { cancel('Cancelled.'); process.exit(0); }

    // --- Generation Logic ---
    const s = spinner();
    s.start('Initializing Vibe...');
    await runHackerSpinner(s);

    if (process.env.OPENAI_API_KEY) {
        const model = process.env.VIBE_AI_MODEL || 'gpt-4o';
        s.message(`🧠 OpenAI Key Detected. Consulting Neural Core (${model})...`);
    }

    try {
        const { generatedFiles, llmLog } = await generateVibe({
            project,
            vibeKey,
            stackKey,
            ideKeys,
            useStrictMemory,
            cwd: process.cwd()
        });

        // --- Logging (Safe) ---
        let logPath = 'Not Created';
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            logPath = path.join(process.cwd(), 'logs', `vibe-init-${project}-${timestamp}.log`);
            const logData = {
                timestamp: new Date().toISOString(),
                project,
                vibe: VIBES[vibeKey].name,
                stack: STACKS[stackKey].name,
                editors: ideKeys,
                ai_data: llmLog
            };

            fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
            fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
        } catch (logError) {
            // Non-blocking log failure
            // console.error('Log write failed', logError); 
        }

        s.stop('Vibe applied successfully.');

        // --- Preview Loop ---
        let viewFiles = await confirm({ message: 'Would you like to review the generated files?' });
        if (isCancel(viewFiles)) process.exit(0);

        while (viewFiles) {
            const fileToView = await select({
                message: 'Select a file to review:',
                options: generatedFiles.map(f => ({ value: f, label: f.path })),
            });
            if (isCancel(fileToView)) break;

            note(fileToView.content, fileToView.path);

            viewFiles = await confirm({ message: 'Review another file?' });
            if (isCancel(viewFiles) || !viewFiles) break;
        }

        const outroMsg = VIBES[vibeKey].outro || 'Vibes Initialized.';
        outro(pc.magenta(`
    ${pc.bold('Vibe Init 3.0 Complete')}
    ${pc.green('●')} Project: ${pc.white(project)}
    ${pc.green('●')} Vibe:    ${pc.cyan(VIBES[vibeKey].name)}
    ${pc.green('●')} Stack:   ${pc.yellow(STACKS[stackKey].name)}
    ${pc.green('●')} Editors: ${pc.dim(ideKeys.join(', '))}
    ${pc.green('●')} Log:     ${pc.dim(logPath)}
    
    "${pc.italic(outroMsg)}"
    `));

    } catch (error) {
        s.stop('Failed.');
        console.error(error);
    }
}

// Only run main if directly executed
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
