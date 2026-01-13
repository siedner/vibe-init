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
        recommendedStacks: ['next_supabase', 'next_netlify', 'generic_web', 'mobile_expo', 'mobile_flutter', 'android_kotlin', 'nodejs_cli'],
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
        recommendedStacks: ['python_fastapi', 'generic_web', 'nodejs_cli'],
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
        recommendedStacks: ['generic_web', 'python_fastapi', 'golang_api', 'nodejs_cli'],
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
    mobile_flutter: {
        name: 'Flutter (Cross-Platform)',
        desc: 'Dart, Material Design, single codebase for iOS/Android',
        techRules: `
## Tech Stack: Flutter
- **Language:** Dart (Null Safety Required)
- **Framework:** Flutter 3.x+
- **State Management:** Riverpod (recommended) or Provider/Bloc.
- **Architecture:**
  - Use **Feature-First** folder structure: \`lib/features/auth/\`, \`lib/features/home/\`.
  - Separate UI from logic: Widgets should not contain business logic.
  - Use \`const\` constructors wherever possible for performance.
- **Styling:**
  - Use Material 3 (\`useMaterial3: true\`).
  - Define colors in \`ThemeData\`, not inline.
- **CRITICAL RULES:**
  - **No \`print()\`:** Use \`debugPrint()\` or a logger package.
  - **Async:** Always handle errors in \`Future\` and \`Stream\`.
  - **Platform:** Use \`Platform.isAndroid\` / \`Platform.isIOS\` for platform-specific code.
  - **Navigation:** Use \`go_router\` for declarative routing.
`,
        envVars: ``
    },
    android_kotlin: {
        name: 'Android Native (Kotlin)',
        desc: 'Kotlin, Jetpack Compose, Material Design 3',
        techRules: `
## Tech Stack: Android Native (Kotlin)
- **Language:** Kotlin (Strict null safety)
- **UI:** Jetpack Compose (Declarative UI)
- **Architecture:** MVVM with ViewModel + StateFlow
- **Dependencies:**
  - **DI:** Hilt (Dagger-based)
  - **Networking:** Retrofit + OkHttp
  - **Database:** Room
  - **Navigation:** Navigation Compose
- **CRITICAL RULES:**
  - **No XML Layouts:** Use Jetpack Compose exclusively for new screens.
  - **Coroutines:** Use \`viewModelScope\` for async operations.
  - **State:** UI state should be exposed as \`StateFlow\` from ViewModel.
  - **Theming:** Use Material 3 dynamic colors (\`dynamicColorScheme()\`).
  - **Lifecycle:** Respect lifecycle with \`repeatOnLifecycle\` for collecting flows.
- **Testing:**
  - Unit tests with JUnit5 + MockK.
  - UI tests with Compose Testing.
`,
        envVars: `ANDROID_API_KEY=`
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
    },
    nodejs_cli: {
        name: 'Node.js CLI Tool',
        desc: 'Beautiful terminal apps with Clack, Ink, or Commander',
        techRules: `
## Tech Stack: Node.js CLI Tool
- **Runtime:** Node.js 20+ (ESM Modules)
- **Module System:** Use \`"type": "module"\` in package.json. No CommonJS.
- **Entry Point:** Add shebang \`#!/usr/bin/env node\` and \`"bin"\` field in package.json.

### Library Recommendations
| Use Case | Library |
|----------|---------|
| **Interactive Prompts** | \`@clack/prompts\` (beautiful, minimal) |
| **Complex TUI** | \`ink\` (React for terminal) |
| **Arg Parsing** | \`commander\` (Git-style) or \`yargs\` (feature-rich) |
| **Colors** | \`picocolors\` (fastest) or \`chalk\` (popular) |
| **Spinners** | \`ora\` or Clack's built-in spinner |
| **ASCII Art** | \`figlet\` + \`gradient-string\` |

### UX Rules
- **Graceful Exit:** Always handle SIGINT (Ctrl+C) with cleanup.
- **Color Mode:** Respect \`NO_COLOR\` env variable.
- **JSON Output:** Offer \`--json\` flag for scripting/piping.
- **Exit Codes:** Use 0 for success, 1 for errors.
- **Progress:** Show spinners for operations >500ms.
- **Confirmations:** Always confirm destructive actions.

### Structure (Simple CLI)
\`\`\`
my-cli/
├── my-cli.js          # Entry point with shebang
├── lib/               # Core logic (optional)
├── package.json       # "bin": { "my-cli": "./my-cli.js" }
└── README.md
\`\`\`

### Patterns Used By Industry CLIs
- **Claude Code / GitHub Copilot CLI:** Ink (React TUI)
- **create-next-app / create-vite:** @clack/prompts
- **Heroku / Salesforce CLI:** oclif (plugin architecture)
`,
        envVars: ``,
        extraFiles: {
            'my-cli.js': `#!/usr/bin/env node

import { intro, outro, text, select, confirm, spinner, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\\n' + pc.yellow('Operation cancelled.'));
    process.exit(0);
});

async function main() {
    intro(pc.cyan('✨ My CLI Tool'));

    const name = await text({
        message: 'What is your name?',
        placeholder: 'Anonymous',
        validate(value) {
            if (!value) return 'Name is required';
        }
    });

    if (isCancel(name)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const action = await select({
        message: 'What would you like to do?',
        options: [
            { value: 'greet', label: '👋 Say Hello' },
            { value: 'joke', label: '😂 Tell a Joke' },
        ],
    });

    if (isCancel(action)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    const s = spinner();
    s.start('Processing...');
    await new Promise(r => setTimeout(r, 1000));
    s.stop('Done!');

    if (action === 'greet') {
        console.log(pc.green(\`\\n👋 Hello, \${name}!\\n\`));
    } else {
        console.log(pc.magenta(\`\\n😂 Why do programmers prefer dark mode? Because light attracts bugs!\\n\`));
    }

    outro(pc.green('Thanks for using My CLI Tool! 🚀'));
}

main().catch(console.error);
`,
            'package.json': `{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-cli": "./my-cli.js"
  },
  "scripts": {
    "start": "node my-cli.js"
  },
  "dependencies": {
    "@clack/prompts": "^0.7.0",
    "picocolors": "^1.0.0"
  }
}
`
        }
    }
};

// --- Stack Display Order (controls UI without reordering code) ---
const STACK_ORDER = [
    // Web (most common)
    'next_supabase', 'next_netlify', 't3_stack', 'generic_web',
    // Mobile
    'mobile_expo', 'mobile_flutter', 'android_kotlin',
    // Backend
    'python_fastapi', 'golang_api',
    // CLI & Tools
    'nodejs_cli', 'chrome_ext',
    // Browser Automation
    'python_scraper', 'node_browser',
    // Games (niche)
    'web_game_phaser', 'godot_engine'
];

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

// --- Version-Specific Gotchas Database (Offline) ---
const GOTCHAS = {
    // Framework gotchas
    'next': {
        '15': 'Next.js 15: Server Components are default. Add "use client" at top of file for interactivity.',
        '14': 'Next.js 14: App Router is stable. Prefer it over Pages Router for new projects.',
        '*': 'Next.js: Use next/image for automatic image optimization.'
    },
    'tailwindcss': {
        '4': 'Tailwind v4: Uses CSS-first configuration with @theme directive. No tailwind.config.js needed.',
        '3': 'Tailwind v3: Configure in tailwind.config.js. Use @apply sparingly.',
        '*': 'Tailwind: Avoid @apply in components - use utility classes directly.'
    },
    'prisma': {
        '5': 'Prisma 5: Use $extends for middleware, not deprecated middleware API.',
        '*': 'Prisma: Always run prisma generate after schema changes.'
    },
    '@supabase/supabase-js': {
        '*': 'Supabase: Enable RLS on ALL tables. Use service_role key ONLY server-side.'
    },
    'zod': {
        '*': 'Zod: Validate ALL external inputs (API, forms). Use .safeParse() for error handling.'
    },
    'react': {
        '19': 'React 19: Use new use() hook for data fetching. Actions replace useTransition patterns.',
        '18': 'React 18: Prefer useId() for SSR-safe unique IDs.',
        '*': 'React: Use React.memo() sparingly - profile first.'
    },
    'typescript': {
        '5': 'TypeScript 5: Use satisfies operator for type-safe object literals.',
        '*': 'TypeScript: Enable strict mode. Avoid "any" - use "unknown" instead.'
    },
    'playwright': {
        '*': 'Playwright: Use locator strategies (getByRole, getByText) over CSS selectors.'
    },
    'flutter': {
        '*': 'Flutter: Use const constructors. Avoid setState in favor of state management.'
    }
};

// --- Comprehensive Project Analysis (Works Offline) ---
function analyzeProject(cwd) {
    const analysis = {
        frameworks: [],
        dependencies: {},
        structure: [],
        gotchas: [],
        language: 'unknown'
    };

    // --- Node.js / JavaScript Projects ---
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            analysis.dependencies = allDeps;
            analysis.language = allDeps.typescript ? 'TypeScript' : 'JavaScript';

            // Detect frameworks with versions
            const frameworkMap = {
                'next': 'Next.js',
                'react': 'React',
                'vue': 'Vue.js',
                'nuxt': 'Nuxt',
                'svelte': 'Svelte',
                'express': 'Express',
                '@supabase/supabase-js': 'Supabase',
                'firebase': 'Firebase',
                'prisma': 'Prisma',
                'drizzle-orm': 'Drizzle',
                'tailwindcss': 'Tailwind CSS',
                'zod': 'Zod',
                'playwright': 'Playwright',
                '@playwright/test': 'Playwright'
            };

            for (const [dep, name] of Object.entries(frameworkMap)) {
                if (allDeps[dep]) {
                    const version = allDeps[dep].replace(/[\^~>=<]/g, '').split('.')[0];
                    analysis.frameworks.push({ name, version: allDeps[dep], majorVersion: version });

                    // Add version-specific gotchas
                    if (GOTCHAS[dep]) {
                        const versionGotcha = GOTCHAS[dep][version] || GOTCHAS[dep]['*'];
                        if (versionGotcha && !analysis.gotchas.includes(versionGotcha)) {
                            analysis.gotchas.push(versionGotcha);
                        }
                    }
                }
            }
        } catch (e) { /* ignore parse errors */ }
    }

    // --- Python Projects ---
    const reqPath = path.join(cwd, 'requirements.txt');
    const pyprojectPath = path.join(cwd, 'pyproject.toml');
    if (fs.existsSync(reqPath) || fs.existsSync(pyprojectPath)) {
        analysis.language = 'Python';
        if (fs.existsSync(reqPath)) {
            const content = fs.readFileSync(reqPath, 'utf-8');
            if (content.includes('fastapi')) analysis.frameworks.push({ name: 'FastAPI', version: 'detected' });
            if (content.includes('django')) analysis.frameworks.push({ name: 'Django', version: 'detected' });
            if (content.includes('flask')) analysis.frameworks.push({ name: 'Flask', version: 'detected' });
            if (content.includes('playwright')) {
                analysis.frameworks.push({ name: 'Playwright', version: 'detected' });
                analysis.gotchas.push(GOTCHAS['playwright']['*']);
            }
        }
    }

    // --- Flutter Projects ---
    const pubspecPath = path.join(cwd, 'pubspec.yaml');
    if (fs.existsSync(pubspecPath)) {
        analysis.language = 'Dart';
        analysis.frameworks.push({ name: 'Flutter', version: 'detected' });
        analysis.gotchas.push(GOTCHAS['flutter']['*']);
    }

    // --- Android Projects ---
    const gradlePath = path.join(cwd, 'build.gradle.kts');
    const gradlePathOld = path.join(cwd, 'build.gradle');
    if (fs.existsSync(gradlePath) || fs.existsSync(gradlePathOld)) {
        analysis.language = 'Kotlin';
        analysis.frameworks.push({ name: 'Android', version: 'detected' });
        analysis.gotchas.push('Android: Use Jetpack Compose for new UI. Avoid XML layouts.');
    }

    // --- Folder Structure Detection ---
    if (fs.existsSync(path.join(cwd, 'app'))) analysis.structure.push('App Router / app directory');
    if (fs.existsSync(path.join(cwd, 'pages'))) analysis.structure.push('Pages Router');
    if (fs.existsSync(path.join(cwd, 'src'))) analysis.structure.push('src/ layout');
    if (fs.existsSync(path.join(cwd, 'lib'))) analysis.structure.push('lib/ directory');
    if (fs.existsSync(path.join(cwd, 'components'))) analysis.structure.push('components/ directory');
    if (fs.existsSync(path.join(cwd, 'prisma'))) analysis.structure.push('Prisma schema');
    if (fs.existsSync(path.join(cwd, 'supabase'))) analysis.structure.push('Supabase config');

    return analysis;
}

// --- AI Logic (Multi-Provider Support) ---
function getLLMProvider() {
    // Priority: OpenAI > Groq
    if (process.env.OPENAI_API_KEY) {
        return {
            name: 'OpenAI',
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.VIBE_AI_MODEL || 'gpt-4o',
            baseURL: undefined // default OpenAI
        };
    }
    if (process.env.GROQ_API_KEY) {
        return {
            name: 'Groq',
            apiKey: process.env.GROQ_API_KEY,
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            baseURL: 'https://api.groq.com/openai/v1'
        };
    }
    return null;
}

async function generateDynamicRules(provider, project, vibe, stack, cwd, analysis = null) {
    let prompt;

    try {
        const openai = new OpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseURL
        });

        // Use analysis if provided, fallback to basic context
        const pkgContext = getVitalContext(cwd);

        // Build rich context from analysis
        let analysisContext = '';
        if (analysis && analysis.frameworks.length > 0) {
            analysisContext = `
## Detected Stack (Auto-Analyzed)
- Language: ${analysis.language}
- Frameworks: ${analysis.frameworks.map(f => `${f.name} ${f.version}`).join(', ')}
- Structure: ${analysis.structure.join(', ') || 'Standard'}

## Version-Specific Warnings (Include These)
${analysis.gotchas.map(g => `- ${g}`).join('\n')}
`;
        }

        prompt = `
# ROLE
You are the world's leading Senior Architect for ${stack.name}. You prioritize "${vibe.name}" (${vibe.desc}).

# INPUT CONTEXT
- Project Name: ${project}
- Key Dependencies: ${pkgContext || 'None detected (new project)'}
${analysisContext}

# TASK
Generate a strictly structured system instruction file (Markdown) for an AI coding agent.

# CRITICAL CONSTRAINTS
1. **No Fluff:** Do not write "Write clean code." Write actionable rules like "Use early returns" or "Prefer const over let".
2. **Dependency Aware:** Generate rules specific to the detected frameworks and versions. Include the version-specific warnings provided.
3. **Vibe Check:**
   - If Vibe includes "Ship Fast", mandate "Skip unit tests for UI components. Browser testing is sufficient."
   - If Vibe includes "Iron Clad", mandate "Every function requires a Docstring and a Type definition. TDD is mandatory."
   - If Vibe includes "Neural Core", mandate "All prompts must have an evaluation script."
4. **Actionable:** Every rule should be something an AI can verify/enforce.

# OUTPUT FORMAT
Return ONLY the raw Markdown content. Do not wrap in \`\`\` code blocks.
Start immediately with: # Project Rules for ${project}
`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: provider.model,
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from AI');

        return {
            rules: content,
            prompt: prompt,
            model: provider.model,
            provider: provider.name,
            success: true
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            prompt: prompt || 'Prompt generation failed',
            model: provider.model,
            provider: provider.name
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

    // --- Run Project Analysis (Works Offline) ---
    const analysis = analyzeProject(cwd);

    // Format analysis for templates
    const frameworksList = analysis.frameworks.length > 0
        ? analysis.frameworks.map(f => `- ${f.name} (${f.version})`).join('\n')
        : '- No frameworks detected (new project)';

    const gotchasList = analysis.gotchas.length > 0
        ? analysis.gotchas.map(g => `> ⚠️ ${g}`).join('\n\n')
        : '';

    const structureList = analysis.structure.length > 0
        ? analysis.structure.map(s => `- ${s}`).join('\n')
        : '- Standard structure';

    // --- AI Hybrid Check (Multi-Provider) ---
    let combinedRules;
    let llmLog;
    const llmProvider = getLLMProvider();

    if (llmProvider) {
        // AI Mode - pass analysis for richer context
        const aiResult = await generateDynamicRules(llmProvider, project, selectedVibe, selectedStack, cwd, analysis);

        if (aiResult.success) {
            combinedRules = aiResult.rules + `\n\n${memoryPolicy}`;
            llmLog = { ...aiResult, vibe: selectedVibe.name, stack: selectedStack.name, analysisUsed: true };
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

    // Create Memory Bank (Shared) with Analysis Data
    const memBankDir = path.join(cwd, 'memory-bank');
    if (!fs.existsSync(memBankDir)) fs.mkdirSync(memBankDir, { recursive: true });

    // Enhanced projectbrief template with analysis
    const projectBriefContent = `# Project Brief

## Core Philosophy
- **Project:** ${project}
- **Vibe:** ${selectedVibe.name}
- **Stack:** ${selectedStack.name}
- **Language:** ${analysis.language}

## Detected Environment
### Frameworks & Dependencies
${frameworksList}

### Project Structure
${structureList}

${gotchasList ? `## Version-Specific Notes\n${gotchasList}\n` : ''}
## Tech Configuration
${selectedStack.techRules}

## Agent Constitution
${selectedVibe.systemPrompt}
`;

    // Write projectbrief.md
    const briefPath = path.join(cwd, 'memory-bank/projectbrief.md');
    if (!fs.existsSync(briefPath)) {
        fs.writeFileSync(briefPath, projectBriefContent);
        generatedFiles.push({ path: 'memory-bank/projectbrief.md', content: projectBriefContent });
    }

    // Write other memory bank files
    for (const [filePath, content] of Object.entries(COMMON_FILES)) {
        if (filePath.startsWith('memory-bank') && filePath !== 'memory-bank/projectbrief.md') {
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

    // --- Generate Cross-Tool Universal Standard ---
    // AGENTS.md - Works with Roo Code, GitHub Copilot, Cursor, and others
    if (ideKeys.includes('agents_md')) {
        const agentsMdContent = `# Agent Guidelines for ${project}

## Session Start Protocol
**CRITICAL**: Before starting ANY task, you MUST:
1. Read \`memory-bank/activeContext.md\` for current project context
2. Review \`memory-bank/projectbrief.md\` for architecture decisions

## Coding Philosophy
${selectedVibe.systemPrompt}

## Tech Stack Rules
${selectedStack.techRules}

${memoryPolicy}
`;
        fs.writeFileSync(path.join(cwd, 'AGENTS.md'), agentsMdContent);
        generatedFiles.push({ path: 'AGENTS.md', content: agentsMdContent });
    }

    // --- Gemini CLI / Antigravity ---
    if (ideKeys.includes('gemini')) {
        // Create GEMINI.md at project root (auto-loaded by Gemini CLI)
        const geminiMdContent = `# Gemini Agent Instructions for ${project}

## First Steps (MANDATORY)
At the start of EVERY session, read these files:
1. \`memory-bank/activeContext.md\` - Current task context
2. \`memory-bank/projectbrief.md\` - Project architecture

## After Completing Work
Update \`memory-bank/activeContext.md\` with your changes.

---

${combinedRules}
`;
        fs.writeFileSync(path.join(cwd, 'GEMINI.md'), geminiMdContent);
        generatedFiles.push({ path: 'GEMINI.md', content: geminiMdContent });

        // Also create .agent/ structure for Antigravity IDE
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

    // --- Claude Code ---
    if (ideKeys.includes('claude')) {
        const claudeMdContent = `# Claude Code Instructions for ${project}

## Session Protocol (MANDATORY)
Before starting ANY task:
1. Read \`memory-bank/activeContext.md\` for current context
2. Check \`memory-bank/projectbrief.md\` for architecture decisions

After completing work:
- Update \`memory-bank/activeContext.md\` with your changes

---

${combinedRules}
`;
        fs.writeFileSync(path.join(cwd, 'CLAUDE.md'), claudeMdContent);
        generatedFiles.push({ path: 'CLAUDE.md', content: claudeMdContent });
    }

    // --- Cursor (Modern .cursor/rules/ structure) ---
    if (ideKeys.includes('cursor')) {
        // Create .cursor/rules/ directory structure
        const cursorRulesDir = path.join(cwd, '.cursor', 'rules');
        if (!fs.existsSync(cursorRulesDir)) fs.mkdirSync(cursorRulesDir, { recursive: true });

        // Core rules file (mdc format)
        const cursorCoreContent = `---
description: Core project rules for ${project}
globs: ["**/*"]
---

## Session Start Protocol
Read \`memory-bank/activeContext.md\` before starting work.

${selectedVibe.systemPrompt}

${memoryPolicy}
`;
        const cursorCorePath = '.cursor/rules/00-core.mdc';
        fs.writeFileSync(path.join(cwd, cursorCorePath), cursorCoreContent);
        generatedFiles.push({ path: cursorCorePath, content: cursorCoreContent });

        // Tech stack rules
        const cursorTechContent = `---
description: Tech stack rules for ${selectedStack.name}
globs: ["**/*"]
---

${selectedStack.techRules}
`;
        const cursorTechPath = '.cursor/rules/01-tech-stack.mdc';
        fs.writeFileSync(path.join(cwd, cursorTechPath), cursorTechContent);
        generatedFiles.push({ path: cursorTechPath, content: cursorTechContent });

        // Also create legacy .cursorrules for backwards compatibility
        fs.writeFileSync(path.join(cwd, '.cursorrules'), combinedRules);
        generatedFiles.push({ path: '.cursorrules', content: combinedRules });
    }

    // --- Cline / Roo Code ---
    if (ideKeys.includes('cline')) {
        fs.writeFileSync(path.join(cwd, '.clinerules'), combinedRules);
        generatedFiles.push({ path: '.clinerules', content: combinedRules });
    }

    // --- Windsurf ---
    if (ideKeys.includes('windsurf')) {
        const windsurfContent = `# Windsurf Rules for ${project}

## Session Protocol
Read \`memory-bank/activeContext.md\` at session start.

${combinedRules}
`;
        fs.writeFileSync(path.join(cwd, '.windsurfrules'), windsurfContent);
        generatedFiles.push({ path: '.windsurfrules', content: windsurfContent });
    }

    // --- Aider ---
    if (ideKeys.includes('aider')) {
        const conventionsContent = `# Coding Conventions for ${project}

## Session Start
Run: \`/read memory-bank/activeContext.md\` to load project context.

${selectedVibe.systemPrompt}

${selectedStack.techRules}

${memoryPolicy}
`;
        fs.writeFileSync(path.join(cwd, 'CONVENTIONS.md'), conventionsContent);
        generatedFiles.push({ path: 'CONVENTIONS.md', content: conventionsContent });

        // Also create .aider.conf.yml to auto-load conventions
        const aiderConfContent = `# Aider Configuration
read:
  - CONVENTIONS.md
  - memory-bank/activeContext.md
`;
        if (!fs.existsSync(path.join(cwd, '.aider.conf.yml'))) {
            fs.writeFileSync(path.join(cwd, '.aider.conf.yml'), aiderConfContent);
            generatedFiles.push({ path: '.aider.conf.yml', content: aiderConfContent });
        }
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

    // Show keyboard shortcuts hint
    console.log(pc.dim(`  ↑↓ Navigate  •  Enter Select  •  Ctrl+C Quit\n`));

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

    // --- Selection Flow with Back Navigation (State Machine) ---
    let step = 'vibe'; // States: vibe, stack, editors, memory, done
    let vibeKey, stackKey, ideKeys, useStrictMemory;
    const detectedStack = detectStack();

    while (step !== 'done') {
        switch (step) {
            // --- STEP: VIBE ---
            case 'vibe': {
                vibeKey = await select({
                    message: 'Choose your Vibe (Philosophy):',
                    options: [
                        ...Object.entries(VIBES).map(([key, val]) => ({ value: key, label: val.name, hint: val.desc })),
                        { value: 'help', label: 'ℹ️  READ ME / HELP', hint: 'Learn how this tool works' }
                    ],
                });
                if (isCancel(vibeKey)) { cancel('Cancelled.'); process.exit(0); }
                if (vibeKey === 'help') { printHelp(); break; }
                step = 'stack';
                break;
            }

            // --- STEP: STACK ---
            case 'stack': {
                // Try auto-detect first
                if (detectedStack && stackKey === undefined) {
                    note(`${STACKS[detectedStack].name}`, 'Tech Stack Detected');
                    const confirmStack = await confirm({ message: `Use detected stack?` });
                    if (isCancel(confirmStack)) { cancel('Cancelled.'); process.exit(0); }
                    if (confirmStack) {
                        stackKey = detectedStack;
                        step = 'editors';
                        break;
                    }
                }

                // Manual selection
                const selectedVibe = VIBES[vibeKey];
                const recommendedKeys = selectedVibe.recommendedStacks || [];


                const recommendedOptions = recommendedKeys
                    .filter(key => STACKS[key])
                    .map(key => ({
                        value: key,
                        label: `⭐ ${STACKS[key].name}`,
                        hint: `Recommended for ${selectedVibe.name}`
                    }));

                const otherOptions = STACK_ORDER
                    .filter(key => STACKS[key] && !recommendedKeys.includes(key))
                    .map(key => ({
                        value: key,
                        label: STACKS[key].name,
                        hint: STACKS[key].desc
                    }));

                stackKey = await select({
                    message: `Choose your Tech Stack (${recommendedOptions.length} recommended for ${selectedVibe.name}):`,
                    options: [
                        ...recommendedOptions,
                        ...otherOptions,
                        { value: 'custom', label: '🔧 Custom Stack', hint: 'Describe it yourself' },
                        { value: 'help', label: 'ℹ️  READ ME / HELP', hint: 'Learn about Stacks' },
                        { value: '__back__', label: '← Back', hint: 'Go back to Vibe selection' },
                    ],
                });
                if (isCancel(stackKey)) { cancel('Cancelled.'); process.exit(0); }

                if (stackKey === '__back__') { step = 'vibe'; break; }
                if (stackKey === 'help') { printHelp(); break; }

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
                step = 'editors';
                break;
            }

            // --- STEP: EDITORS ---
            case 'editors': {
                ideKeys = await multiselect({
                    message: 'Which AI Editors do you use?',
                    options: [
                        { value: 'agents_md', label: 'AGENTS.md (Universal)', hint: 'Cross-tool standard (Copilot, Roo, etc.)' },
                        { value: 'gemini', label: 'Gemini CLI / Antigravity', hint: 'GEMINI.md + .agent/' },
                        { value: 'claude', label: 'Claude Code', hint: 'CLAUDE.md' },
                        { value: 'cursor', label: 'Cursor', hint: '.cursor/rules/' },
                        { value: 'cline', label: 'Cline / Roo Code', hint: '.clinerules' },
                        { value: 'windsurf', label: 'Windsurf', hint: '.windsurfrules' },
                        { value: 'aider', label: 'Aider', hint: 'CONVENTIONS.md' },
                        { value: '__back__', label: '← Back', hint: 'Go back to Stack selection' },
                    ],
                    required: false,
                    initialValues: ['agents_md', 'gemini', 'cursor']
                });
                if (isCancel(ideKeys)) { cancel('Cancelled.'); process.exit(0); }

                if (ideKeys.includes('__back__')) {
                    stackKey = undefined; // Reset for re-selection
                    step = 'stack';
                    break;
                }

                // Filter out __back__ and validate
                ideKeys = ideKeys.filter(k => k !== '__back__');
                if (ideKeys.length === 0) {
                    note('Please select at least one editor.', '⚠️');
                    break;
                }
                step = 'memory';
                break;
            }

            // --- STEP: MEMORY POLICY ---
            case 'memory': {
                useStrictMemory = await select({
                    message: 'Memory Policy:',
                    options: [
                        { value: true, label: '📝 Strict (Recommended)', hint: 'Forces AI to update memory-bank after each task' },
                        { value: false, label: '😎 Casual', hint: 'Gentle reminder to update memory' },
                        { value: '__back__', label: '← Back', hint: 'Go back to Editor selection' },
                    ],
                });
                if (isCancel(useStrictMemory)) { cancel('Cancelled.'); process.exit(0); }

                if (useStrictMemory === '__back__') { step = 'editors'; break; }
                step = 'done';
                break;
            }
        }
    }

    // --- Generation Logic ---
    const s = spinner();
    s.start('Initializing Vibe...');
    await runHackerSpinner(s);

    const llmProviderInfo = getLLMProvider();
    if (llmProviderInfo) {
        s.message(`🧠 ${llmProviderInfo.name} Detected. Consulting Neural Core (${llmProviderInfo.model})...`);
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
        let viewFiles = await confirm({ message: 'Would you like to review the generated files?', initialValue: false });
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
