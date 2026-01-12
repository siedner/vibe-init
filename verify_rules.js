import { generateVibe } from './vibe-init.js';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const TEST_DIR = 'test-suite-rules';

async function runTests() {
    if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEST_DIR);

    console.log('🧪 Starting Vibe Init Rule Verification...\n');

    // Case 1: Creative Rush (Expect GSAP, Three.js)
    const CASE_1_DIR = path.join(TEST_DIR, 'creative-rules');
    fs.mkdirSync(CASE_1_DIR);
    await generateVibe({
        project: 'ArtApp',
        vibeKey: 'creative_rush',
        stackKey: 'next_netlify',
        ideKeys: ['cursor'],
        useStrictMemory: false,
        cwd: CASE_1_DIR
    });

    const cursorRules = fs.readFileSync(path.join(CASE_1_DIR, '.cursorrules'), 'utf-8');
    assert.ok(cursorRules.includes('Three.js / R3F'), '❌ Rules must include Three.js');
    assert.ok(cursorRules.includes('Netlify Functions'), '❌ Rules must include Netlify Functions');
    console.log('✅ Creative + Netlify Rules Verified\n');

    // Case 2: Next.js + Supabase (Expect Cursor Pagination)
    const CASE_2_DIR = path.join(TEST_DIR, 'next-rules');
    fs.mkdirSync(CASE_2_DIR);
    await generateVibe({
        project: 'SupaApp',
        vibeKey: 'ship_fast',
        stackKey: 'next_supabase',
        ideKeys: ['cursor'],
        useStrictMemory: false,
        cwd: CASE_2_DIR
    });

    const nextRules = fs.readFileSync(path.join(CASE_2_DIR, '.cursorrules'), 'utf-8');
    assert.ok(nextRules.includes('Cursor-based Pagination'), '❌ Rules must include Cursor Pagination');
    console.log('✅ Next.js + Supabase Rules Verified\n');

    console.log('🎉 All Rule Content Verified!');
}

runTests().catch(err => {
    console.error('❌ Tests Failed:', err);
    process.exit(1);
});
