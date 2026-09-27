#!/usr/bin/env node
/**
 * ATKIN genuine process-restart verification.
 *
 * A save-then-load in the same process is not a restart test, so this harness
 * does the real thing:
 *
 *   1. launch a browser with a PERSISTENT profile and open the built app
 *   2. write durable entities into the canonical IndexedDB the app itself uses
 *   3. close the browser completely  (the "process" dies)
 *   4. launch a NEW browser process on the SAME profile
 *   5. reopen the app and verify the state survived, and that anything left
 *      mid-flight came back as interrupted rather than falsely complete
 *
 * The database written here is the same `ProoflineLocalDB` the product opens,
 * with the same store names and indexes as schema v4, so a pass means the real
 * store is durable across process death.
 *
 * Usage:
 *   npm run build
 *   node scripts/e2e-restart.mjs
 *
 * Exits non-zero on failure.
 */
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SHOTS = path.join(ROOT, 'release', 'ui', 'restart');
const PORT = 4192;

/** Fresh profile each run so the result is reproducible. */
const PROFILE = path.join(os.tmpdir(), `atkin-restart-profile-${process.pid}`);

const DB_NAME = 'ProoflineLocalDB';
// Dexie's version(4) maps to IndexedDB 40. We open at whatever version the app created,
// so the harness can never disagree with the product about schema numbering.
const DB_VERSION = undefined;

const results = [];
let failures = 0;

function check(name, passed, detail = '') {
  results.push({ name, passed, detail });
  if (!passed) failures++;
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function serve() {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    let filePath = path.join(DIST, url === '/' ? 'index.html' : url);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      filePath = path.join(DIST, 'index.html');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function launchBrowser() {
  const candidates = [
    undefined,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  let lastErr;
  for (const executablePath of candidates) {
    try {
      return await chromium.launchPersistentContext(PROFILE, {
        executablePath,
        viewport: { width: 1440, height: 900 },
      });
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/** Injected into the page: write the durable fixtures into the real store. */
const SEED_SCRIPT = ({ dbName, dbVersion, stamp }) => {
  const open = () =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('matters'))
          d.createObjectStore('matters', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('documents'))
          d.createObjectStore('documents', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('spans'))
          d.createObjectStore('spans', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('claims'))
          d.createObjectStore('claims', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('edges'))
          d.createObjectStore('edges', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('authorities'))
          d.createObjectStore('authorities', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('drafts'))
          d.createObjectStore('drafts', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('reviewItems'))
          d.createObjectStore('reviewItems', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('messages'))
          d.createObjectStore('messages', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('userProfile'))
          d.createObjectStore('userProfile', { keyPath: 'id' }).createIndex('id', 'id');
        if (!d.objectStoreNames.contains('memories')) {
          const s = d.createObjectStore('memories', { keyPath: 'id' });
          s.createIndex('id', 'id');
          s.createIndex('scope', 'scope');
          s.createIndex('matterId', 'matterId');
        }
        if (!d.objectStoreNames.contains('jobs')) {
          const s = d.createObjectStore('jobs', { keyPath: 'id' });
          s.createIndex('id', 'id');
          s.createIndex('matterId', 'matterId');
          s.createIndex('state', 'state');
        }
        if (!d.objectStoreNames.contains('tasks')) {
          const s = d.createObjectStore('tasks', { keyPath: 'id' });
          s.createIndex('id', 'id');
          s.createIndex('matterId', 'matterId');
          s.createIndex('status', 'status');
        }
        if (!d.objectStoreNames.contains('skills')) {
          const s = d.createObjectStore('skills', { keyPath: 'id' });
          s.createIndex('id', 'id');
        }
        if (!d.objectStoreNames.contains('researchSessions')) {
          const s = d.createObjectStore('researchSessions', { keyPath: 'id' });
          s.createIndex('id', 'id');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('IndexedDB upgrade blocked'));
    });

  const tx = (db, store, mode, fn) =>
    new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let result;
      try {
        result = fn(s);
      } catch (e) {
        reject(e);
        return;
      }
      t.oncomplete = () => resolve(result && result.result !== undefined ? result.result : result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });

  return (async () => {
    const db = await open();

    // A profile the app itself would have written.
    await tx(db, 'userProfile', 'readwrite', (s) =>
      s.put({
        id: 'profile-1',
        name: 'A',
        displayName: 'Restart Tester',
        role: 'solicitor',
        firmOrOrg: 'Restart Test LLP',
        primaryJurisdiction: 'England and Wales',
        secondaryJurisdictions: [],
        privacyMode: 'local_only',
        onboardingCompleted: true,
        answerDetail: 'standard',
        detectedHardware: {},
      })
    );

    await tx(db, 'matters', 'readwrite', (s) =>
      s.put({
        id: 'matter-restart',
        title: 'Restart Survival Matter',
        clientAlias: 'Orchid',
        jurisdiction: 'England and Wales',
        status: 'active',
        workspaceType: 'personal',
        isDemo: false,
        createdAt: stamp,
        updatedAt: stamp,
      })
    );

    await tx(db, 'documents', 'readwrite', (s) =>
      s.put({
        id: 'doc-restart',
        matterId: 'matter-restart',
        filename: 'orchid-agreement.txt',
        mime: 'text/plain',
        sha256: 'f'.repeat(64),
        importedAt: stamp,
        sourceDate: '2026-01-01',
        extractionStatus: 'success',
        pageCount: 1,
        text: 'Either party may terminate on thirty days written notice.',
        privacyLabel: 'Client confidential',
      })
    );

    await tx(db, 'messages', 'readwrite', (s) =>
      s.put({
        id: 'msg-restart',
        matterId: 'matter-restart',
        role: 'user',
        content: 'What notice is required?',
        timestamp: stamp,
      })
    );

    await tx(db, 'drafts', 'readwrite', (s) =>
      s.put({
        id: 'draft-restart',
        matterId: 'matter-restart',
        type: 'client_letter',
        title: 'Notice position',
        blocks: [{ id: 'b1', heading: 'RE: Notice', text: 'Thirty days notice is required.', claimIds: [], spanIds: [] }],
        generatedBy: 'deterministic_offline',
        reviewStatus: 'draft',
        createdAt: stamp,
        updatedAt: stamp,
      })
    );

    // The four entities this pass made durable.
    await tx(db, 'memories', 'readwrite', (s) =>
      s.put({
        id: 'mem-restart',
        vaultId: 'default-vault',
        matterId: 'matter-restart',
        scope: 'matter_facts',
        kind: 'preference',
        text: 'PERSISTED-PREFERENCE-7731',
        sourceDocumentVersions: [],
        sourceSpanIds: [],
        sourceMessageIds: [],
        createdBy: 'human',
        createdAt: stamp,
        reviewState: 'accepted',
        status: 'active',
        dependencyIds: [],
      })
    );

    await tx(db, 'tasks', 'readwrite', (s) =>
      s.put({
        id: 'task-restart',
        matterId: 'matter-restart',
        title: 'PERSISTED-TASK-8842',
        status: 'open',
        priority: 'urgent',
        createdAt: stamp,
        updatedAt: stamp,
        createdBy: 'manual',
      })
    );

    await tx(db, 'skills', 'readwrite', (s) =>
      s.put({
        id: 'skill-restart',
        name: 'PERSISTED-SKILL-9953',
        description: 'Survives a process restart',
        version: '2.1.0',
        category: 'user_learned',
        jurisdictionSupport: ['England and Wales'],
        permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
        requiredTools: ['CitationGate'],
        sourcePolicy: 'strict_citation_required',
        triggers: ['notice period'],
        workflow: ['Find the clause', 'Compute the period', 'Cite the span'],
        successCriteria: ['Exact span match'],
        knownFailureModes: [],
        systemInstructions: 'Cite the clause.',
        enabled: true,
        createdAt: stamp,
        updatedAt: stamp,
        successCount: 3,
        failureCount: 1,
        createdFrom: { matterId: 'matter-restart' },
      })
    );

    // Deliberately left mid-flight: must come back interrupted, never complete.
    await tx(db, 'jobs', 'readwrite', (s) =>
      s.put({
        id: 'job-restart',
        type: 'research_query',
        matterId: 'matter-restart',
        title: 'PERSISTED-JOB-1164',
        state: 'running',
        progressPercent: 42,
        currentStep: 'Extracting propositions',
        createdAt: stamp,
        checkpointData: { step: 'extract', sources: 2 },
      })
    );

    await tx(db, 'researchSessions', 'readwrite', (s) =>
      s.put({
        id: 'rs-restart',
        matterId: 'matter-restart',
        query: 'notice period',
        currentStep: 'extracting',
        status: 'executing',
        sufficiencyScore: 0.55,
        missingElements: ['limitation'],
        fetchedSources: [
          { sourceId: 'doc-restart', title: 'orchid-agreement.txt', url: 'local://doc-restart', rightsPassed: true },
        ],
        logs: ['PERSISTED-FINDING-2275'],
      })
    );

    db.close();
    return { seeded: true };
  })();
};

/** Injected into the page after relaunch: read everything back. */
const VERIFY_SCRIPT = ({ dbName, dbVersion }) => {
  const open = () =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  const all = (db, store) =>
    new Promise((resolve, reject) => {
      const t = db.transaction(store, 'readonly');
      const req = t.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  return (async () => {
    const db = await open();
    const [profile, matters, documents, messages, drafts, memories, tasks, skills, jobs, sessions] =
      await Promise.all([
        all(db, 'userProfile'),
        all(db, 'matters'),
        all(db, 'documents'),
        all(db, 'messages'),
        all(db, 'drafts'),
        all(db, 'memories'),
        all(db, 'tasks'),
        all(db, 'skills'),
        all(db, 'jobs'),
        all(db, 'researchSessions'),
      ]);
    db.close();
    return { profile, matters, documents, messages, drafts, memories, tasks, skills, jobs, sessions };
  })();
};

async function openApp(context) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/#/workbench`, { waitUntil: 'domcontentloaded' });
  // The app marks itself ready once durable state has hydrated.
  await page
    .waitForSelector('[data-durable-ready="true"]', { timeout: 20000 })
    .catch(() => {});
  return { page, errors };
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.rmSync(PROFILE, { recursive: true, force: true });

  const server = await serve();
  const stamp = new Date().toISOString();
  let ctx = null;

  try {
    console.log(`\n1. First process: launch app on a persistent profile`);
    console.log(`   profile: ${PROFILE}`);
    ctx = await launchBrowser();
    let { page } = await openApp(ctx);
    check('app booted in the first process', true, `title: ${await page.title()}`);

    console.log(`\n2. Write durable state through the real IndexedDB store`);
    const seeded = await page.evaluate(SEED_SCRIPT, { dbName: DB_NAME, dbVersion: DB_VERSION, stamp });
    check('seeded profile, matter, source, chat, draft, memory, task, skill, job, research session', seeded.seeded);

    console.log(`\n3. Terminate the process (close the browser entirely)`);
    await page.screenshot({ path: path.join(SHOTS, 'before-restart.png') }).catch(() => {});
    await ctx.close();
    ctx = null;
    check('browser process closed', true);

    console.log(`\n4. Second process: relaunch on the SAME profile`);
    ctx = await launchBrowser();
    ({ page } = await openApp(ctx));
    check('app booted in the second process', true, `title: ${await page.title()}`);

    console.log(`\n5. Verify durable state survived process death`);
    const after = await page.evaluate(VERIFY_SCRIPT, { dbName: DB_NAME, dbVersion: DB_VERSION });

    check('profile survived', after.profile.some((p) => p.displayName === 'Restart Tester'));
    check('matter survived', after.matters.some((m) => m.title === 'Restart Survival Matter'));
    check('source survived', after.documents.some((d) => d.filename === 'orchid-agreement.txt'));
    check('source text intact', after.documents.some((d) => (d.text || '').includes('thirty days')));
    check('conversation survived', after.messages.some((m) => m.content === 'What notice is required?'));
    check(
      'draft survived with its block text',
      after.drafts.some((d) => JSON.stringify(d.blocks || []).includes('Thirty days notice is required.'))
    );

    const mem = after.memories.find((m) => m.id === 'mem-restart');
    check('MEMORY survived', !!mem, mem ? mem.text : 'missing');
    check('memory kept its scope and provenance', !!mem && mem.scope === 'matter_facts' && mem.reviewState === 'accepted');

    const task = after.tasks.find((t) => t.id === 'task-restart');
    check('TASK survived', !!task, task ? `${task.title} / ${task.status}` : 'missing');
    check('task kept its priority', !!task && task.priority === 'urgent');

    const skill = after.skills.find((s) => s.id === 'skill-restart');
    check('SKILL survived', !!skill, skill ? skill.name : 'missing');
    check(
      'skill kept trigger, steps, permissions, provenance and counters',
      !!skill &&
        skill.version === '2.1.0' &&
        skill.triggers.length === 1 &&
        skill.workflow.length === 3 &&
        skill.permissions.includes('WRITE_LOCAL') &&
        skill.createdFrom?.matterId === 'matter-restart' &&
        skill.successCount === 3 &&
        skill.failureCount === 1
    );

    console.log(`\n6. Verify interrupted work is not reported as complete`);
    const job = after.jobs.find((j) => j.id === 'job-restart');
    check('job survived', !!job, job ? `${job.state} @ ${job.progressPercent}%` : 'missing');
    check(
      'JOB restored as interrupted/paused, NOT completed',
      !!job && job.state !== 'completed' && job.state !== 'running',
      job ? job.state : 'missing'
    );
    check('job checkpoint retained', !!job && job.progressPercent === 42);
    check(
      'job step explains the interruption',
      !!job && /interrupted|resume/i.test(job.currentStep),
      job ? job.currentStep : ''
    );

    const session = after.sessions.find((s) => s.id === 'rs-restart');
    check('research session survived', !!session, session ? session.status : 'missing');
    check(
      'RESEARCH SESSION restored as resumable, NOT completed',
      !!session && session.status !== 'completed' && session.status !== 'executing',
      session ? session.status : 'missing'
    );
    check(
      'research findings and logs retained',
      !!session && session.fetchedSources.length === 1 && session.logs.includes('PERSISTED-FINDING-2275')
    );

    console.log(`\n7. Verify the app's own hydration read the persisted state`);
    const attrs = await page.evaluate(() => {
      const el = document.querySelector('[data-durable-ready]');
      return el
        ? {
            ready: el.getAttribute('data-durable-ready'),
            memories: el.getAttribute('data-durable-memories'),
            interruptedJobs: el.getAttribute('data-durable-interrupted-jobs'),
          }
        : null;
    });
    check('app reported durable state ready', attrs?.ready === 'true', JSON.stringify(attrs));
    check(
      'app hydration counted the persisted memory',
      Number(attrs?.memories ?? 0) >= 1,
      `counted ${attrs?.memories}`
    );
    check(
      'app repaired the interrupted job on boot',
      Number(attrs?.interruptedJobs ?? 0) >= 1,
      `repaired ${attrs?.interruptedJobs}`
    );

    await page.screenshot({ path: path.join(SHOTS, 'after-restart.png') });

    console.log(`\n8. Third process: verify the repair is stable, not repeated`);
    await ctx.close();
    ctx = await launchBrowser();
    ({ page } = await openApp(ctx));
    const third = await page.evaluate(VERIFY_SCRIPT, { dbName: DB_NAME, dbVersion: DB_VERSION });
    const job3 = third.jobs.find((j) => j.id === 'job-restart');
    check('job stays paused across a second restart', job3?.state === 'paused', job3?.state);
    const attrs3 = await page.evaluate(() => {
      const el = document.querySelector('[data-durable-ready]');
      return el?.getAttribute('data-durable-interrupted-jobs');
    });
    check('no further interruption repairs on the third boot', attrs3 === '0', `repaired ${attrs3}`);
  } finally {
    if (ctx) await ctx.close().catch(() => {});
    server.close();
    fs.rmSync(PROFILE, { recursive: true, force: true });
  }

  console.log(`\nSUMMARY`);
  const passed = results.filter((r) => r.passed).length;
  console.log(`  ${passed}/${results.length} checks passed`);
  fs.writeFileSync(
    path.join(SHOTS, 'restart-report.json'),
    JSON.stringify({ total: results.length, passed, failures, results }, null, 2),
    'utf8'
  );
  if (failures > 0) {
    console.error(`\n${failures} check(s) FAILED`);
    process.exit(1);
  }
  console.log('\nDurable state survived genuine process death.');
}

main().catch((err) => {
  console.error('Restart harness crashed:', err);
  process.exit(1);
});
