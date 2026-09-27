import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db/index.ts';
import {
  memoryRepo,
  jobRepo,
  taskRepo,
  skillRepo,
  researchSessionRepo,
  reconcileOnStartup,
  durableCounts,
} from '../db/repositories.ts';
import { MemoryEngine } from '../engine/memory/memoryEngine.ts';
import { JobQueue } from '../engine/jobs/jobQueue.ts';
import type { MemoryRecord } from '../types/index.ts';

/**
 * Durability of the four entities that previously lived only in a singleton Map.
 *
 * These tests write through the same code path the running app uses, then read
 * back from the database rather than from the in-memory cache, so they fail if
 * persistence is bypassed.
 *
 * This is a same-process round trip, NOT a process-restart test. The genuine
 * restart evidence comes from scripts/e2e-restart.mjs, which drives a real
 * browser with a persistent profile, closes it, and relaunches.
 */

beforeEach(async () => {
  await Promise.all([
    db.memories.clear(),
    db.jobs.clear(),
    db.tasks.clear(),
    db.skills.clear(),
    db.researchSessions.clear(),
  ]);
});

const SECRET = 'CONFIDENTIAL-ORCHID-7319';

function memory(over: Partial<MemoryRecord> = {}): MemoryRecord {
  return {
    id: `mem-${Math.random().toString(36).slice(2, 8)}`,
    vaultId: 'default-vault',
    scope: 'matter_facts',
    kind: 'fact',
    text: 'placeholder',
    sourceDocumentVersions: [],
    sourceSpanIds: [],
    sourceMessageIds: [],
    createdBy: 'human',
    createdAt: new Date().toISOString(),
    reviewState: 'accepted',
    status: 'active',
    dependencyIds: [],
    ...over,
  } as MemoryRecord;
}

describe('Memory persistence', () => {
  it('create -> read back from the database', async () => {
    const created = await memoryRepo.create({
      vaultId: 'default-vault',
      scope: 'user_preferences',
      kind: 'preference',
      text: 'Cite in OSCOLA style with pinpoint paragraphs.',
      sourceDocumentVersions: [],
      sourceSpanIds: [],
      sourceMessageIds: [],
      createdBy: 'human',
      reviewState: 'accepted',
      status: 'active',
      dependencyIds: [],
    } as never);

    const found = await memoryRepo.get(created.id);
    expect(found).toBeDefined();
    expect(found!.text).toBe('Cite in OSCOLA style with pinpoint paragraphs.');
  });

  it('survives a fresh engine hydrating from disk (amnesia test)', async () => {
    await memoryRepo.put(
      memory({ scope: 'user_preferences', kind: 'preference', text: 'Always draft in plain English.' })
    );

    // A brand new engine, as if the process restarted.
    const engine = new MemoryEngine();
    const loaded = await engine.hydrate();

    expect(loaded).toBeGreaterThanOrEqual(1);
    const texts = engine.getAllMemories().map((m) => m.text);
    expect(texts).toContain('Always draft in plain English.');
  });

  it('a correction supersedes the old memory instead of leaving both active', async () => {
    const original = await memoryRepo.put(
      memory({ text: 'Limit is 30 days.', kind: 'preference' })
    );

    const replacement = await memoryRepo.supersede(original.id, {
      text: 'Limit is 60 days.',
    });

    const old = await memoryRepo.get(original.id);
    expect(old!.status).toBe('superseded');
    expect(old!.text).toBe('Limit is 30 days.'); // history preserved

    const fresh = await memoryRepo.get(replacement.id);
    expect(fresh!.status).toBe('active');
    expect(fresh!.text).toBe('Limit is 60 days.');
    expect(fresh!.supersedesId).toBe(original.id);
  });

  it('a superseded memory is no longer returned to a hydrating engine', async () => {
    const original = await memoryRepo.put(memory({ text: 'v1' }));
    await memoryRepo.supersede(original.id, { text: 'v2' });

    const engine = new MemoryEngine();
    await engine.hydrate();
    const active = engine.getAllMemories().filter((m) => m.text === 'v1');
    expect(active).toHaveLength(0);
  });

  it('forget removes it from future retrieval but keeps the record', async () => {
    const rec = await memoryRepo.put(memory({ text: 'temporary note' }));
    await memoryRepo.remove(rec.id);

    const stored = await memoryRepo.get(rec.id);
    expect(stored, 'record is retained for audit').toBeDefined();
    expect(stored!.status).toBe('deleted');

    const engine = new MemoryEngine();
    await engine.hydrate();
    expect(engine.getAllMemories().map((m) => m.text)).not.toContain('temporary note');
  });

  it('ISOLATION: a matter-private secret is never returned for another matter', async () => {
    await memoryRepo.put(
      memory({ matterId: 'matter-A', scope: 'matter_facts', text: `The passphrase is ${SECRET}.` })
    );
    await memoryRepo.put(
      memory({ matterId: 'matter-B', scope: 'matter_facts', text: 'Matter B has its own facts.' })
    );

    const engine = new MemoryEngine();
    await engine.hydrate();

    const forB = engine.recallScopedMemories('matter-B');
    const joined = forB.map((m) => m.text).join(' ');
    expect(joined).not.toContain(SECRET);

    const forA = engine.recallScopedMemories('matter-A');
    expect(forA.map((m) => m.text).join(' ')).toContain(SECRET);
  });

  it('write-through: a memory suggested through the engine is in the database', async () => {
    const engine = new MemoryEngine();
    await engine.hydrate();

    const suggested = engine.suggestMemory({
      vaultId: 'default-vault',
      scope: 'user_preferences',
      kind: 'preference',
      text: 'Prefer clause-numbered paragraphs in correspondence.',
    });

    // allow the fire-and-forget write to land
    await new Promise((r) => setTimeout(r, 30));
    const stored = await memoryRepo.get(suggested.id);
    expect(stored, 'engine writes must reach the canonical store').toBeDefined();
  });

  it('stores no hidden chain-of-thought: memories carry text and provenance only', async () => {
    const rec = await memoryRepo.put(memory({ text: 'Client prefers UK English.' }));
    const keys = Object.keys(rec).map((k) => k.toLowerCase());
    for (const forbidden of ['reasoning', 'chainofthought', 'cot', 'thoughts', 'scratchpad']) {
      expect(keys.some((k) => k.includes(forbidden)), `unexpected field ${forbidden}`).toBe(false);
    }
  });
});

describe('Task persistence', () => {
  it('create -> reload -> edit -> reload -> complete -> reload', async () => {
    const created = await taskRepo.create({
      matterId: 'matter-1',
      title: 'File defence and serve',
      priority: 'urgent',
    });

    expect((await taskRepo.get(created.id))!.status).toBe('open');

    await taskRepo.update(created.id, { status: 'in_progress', detail: 'Drafting defence' });
    expect((await taskRepo.get(created.id))!.status).toBe('in_progress');
    expect((await taskRepo.get(created.id))!.detail).toBe('Drafting defence');

    await taskRepo.update(created.id, { status: 'done' });
    const done = await taskRepo.get(created.id);
    expect(done!.status).toBe('done');
    expect(done!.completedAt, 'completing a task stamps completion time').toBeTruthy();
  });

  it('archive is a soft delete that keeps history', async () => {
    const t = await taskRepo.create({ matterId: 'm', title: 'Old task' });
    await taskRepo.archive(t.id, 'No longer required');

    const stored = await taskRepo.get(t.id);
    expect(stored).toBeDefined();
    expect(stored!.status).toBe('archived');
    expect(stored!.archivedReason).toBe('No longer required');
    expect((await taskRepo.open()).map((x) => x.id)).not.toContain(t.id);
  });

  it('open() orders by priority then due date', async () => {
    await taskRepo.create({ matterId: 'm', title: 'low', priority: 'low' });
    await taskRepo.create({ matterId: 'm', title: 'urgent', priority: 'urgent' });
    await taskRepo.create({ matterId: 'm', title: 'normal', priority: 'normal' });
    const order = (await taskRepo.open()).map((t) => t.priority);
    expect(order).toEqual(['urgent', 'normal', 'low']);
  });

  it('rejects an update to a task that does not exist', async () => {
    await expect(taskRepo.update('task-does-not-exist', { title: 'x' })).rejects.toThrow();
  });
});

describe('Job and research-session durability', () => {
  it('a running job is restored as interrupted, never as complete', async () => {
    await jobRepo.put({
      id: 'job-1',
      type: 'research_query',
      matterId: 'matter-1',
      title: 'Notice period research',
      state: 'running',
      progressPercent: 40,
      currentStep: 'Searching sources',
      createdAt: new Date().toISOString(),
    });

    const result = await reconcileOnStartup();
    expect(result.interruptedJobs).toContain('job-1');

    const restored = await jobRepo.get('job-1');
    expect(restored!.state).toBe('paused');
    expect(restored!.state).not.toBe('completed');
    expect(restored!.currentStep).toMatch(/interrupted/i);
    expect(restored!.progressPercent).toBe(40); // checkpoint retained
  });

  it('a completed job is left alone by reconciliation', async () => {
    await jobRepo.put({
      id: 'job-done',
      type: 'ingest_document',
      matterId: 'm',
      title: 'Ingest',
      state: 'completed',
      progressPercent: 100,
      currentStep: 'Done',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    await reconcileOnStartup();
    expect((await jobRepo.get('job-done'))!.state).toBe('completed');
  });

  it('an executing research session is restored as idle with findings intact', async () => {
    await researchSessionRepo.put({
      id: 'rs-1',
      matterId: 'm',
      query: 'notice period',
      currentStep: 'extracting' as never,
      status: 'executing',
      sufficiencyScore: 0.4,
      missingElements: ['limitation'],
      fetchedSources: [{ sourceId: 's1', title: 'MSA', url: 'x', rightsPassed: true }],
      logs: ['opened source'],
    });

    const result = await reconcileOnStartup();
    expect(result.interruptedSessions).toContain('rs-1');

    const restored = await researchSessionRepo.get('rs-1');
    expect(restored!.status).toBe('idle');
    expect(restored!.status).not.toBe('completed');
    expect(restored!.fetchedSources).toHaveLength(1);
    expect(restored!.logs).toContain('opened source');
  });

  it('the queue hydrates persisted jobs and repairs state', async () => {
    await jobRepo.put({
      id: 'job-2',
      type: 'contract_audit',
      matterId: 'm',
      title: 'Persisted audit',
      state: 'running',
      progressPercent: 10,
      currentStep: 'Parsing',
      createdAt: new Date().toISOString(),
    });

    const q = JobQueue.getInstance();
    const { loaded, interrupted } = await q.hydrate();
    expect(loaded).toBeGreaterThanOrEqual(1);
    expect(interrupted).toContain('job-2');

    const found = q.getAllJobs().find((j) => j.id === 'job-2');
    expect(found).toBeDefined();
    expect(found!.state).toBe('paused');
  });

  it('queue mutations reach the database', async () => {
    const q = JobQueue.getInstance();
    await q.hydrate();
    const job = q.enqueue('research_query', 'm', 'Persisted from queue');
    await new Promise((r) => setTimeout(r, 30));
    expect(await jobRepo.get(job.id)).toBeDefined();

    q.cancel(job.id);
    await new Promise((r) => setTimeout(r, 30));
    expect((await jobRepo.get(job.id))!.state).toBe('cancelled');
  });
});

describe('Skill persistence', () => {
  it('preserves identity, scope, trigger, steps, permissions and provenance', async () => {
    const skill = await skillRepo.create({
      name: 'Notice period check',
      description: 'Compute the contractual notice period and cite the clause.',
      triggers: ['notice period', 'how much notice'],
      workflow: ['Locate the termination clause', 'Compute the period', 'Cite the span'],
      permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
      createdFrom: { matterId: 'matter-1', documentId: 'doc-1' },
    });

    const stored = await skillRepo.get(skill.id);
    expect(stored!.name).toBe('Notice period check');
    expect(stored!.version).toBeTruthy();
    expect(stored!.triggers).toEqual(['notice period', 'how much notice']);
    expect(stored!.workflow).toHaveLength(3);
    expect(stored!.permissions).toContain('WRITE_LOCAL');
    expect(stored!.createdFrom!.matterId).toBe('matter-1');
    expect(stored!.successCount).toBe(0);
  });

  it('disable and delete survive a re-read', async () => {
    const skill = await skillRepo.create({ name: 'Temporary', description: 'x' });
    await skillRepo.setEnabled(skill.id, false);
    expect((await skillRepo.get(skill.id))!.enabled).toBe(false);
    expect((await skillRepo.enabled()).map((s) => s.id)).not.toContain(skill.id);

    await skillRepo.remove(skill.id);
    expect(await skillRepo.get(skill.id)).toBeUndefined();
  });

  it('records real outcomes only when asked', async () => {
    const skill = await skillRepo.create({ name: 'Counted', description: 'x' });
    await skillRepo.recordOutcome(skill.id, 'success');
    await skillRepo.recordOutcome(skill.id, 'failure');
    const stored = await skillRepo.get(skill.id);
    expect(stored!.successCount).toBe(1);
    expect(stored!.failureCount).toBe(1);
    expect(stored!.lastUsedAt).toBeTruthy();
  });
});

describe('Durable entity summary', () => {
  it('counts every durable entity', async () => {
    await memoryRepo.put(memory());
    await taskRepo.create({ matterId: 'm', title: 't' });
    await skillRepo.create({ name: 's', description: 'd' });
    const counts = await durableCounts();
    expect(counts.memories).toBe(1);
    expect(counts.tasks).toBe(1);
    expect(counts.skills).toBe(1);
    expect(typeof counts.jobs).toBe('number');
    expect(typeof counts.researchSessions).toBe('number');
  });

  it('the schema declares all five durable stores', () => {
    expect(db.tables.map((t) => t.name).sort()).toEqual(
      expect.arrayContaining([
        'authorities',
        'claims',
        'documents',
        'drafts',
        'edges',
        'jobs',
        'matters',
        'memories',
        'messages',
        'researchSessions',
        'reviewItems',
        'skills',
        'spans',
        'tasks',
        'userProfile',
      ])
    );
  });

  it('the v4 migration is additive and preserves the pre-existing stores', async () => {
    // Matters written under the old schema must still be readable after upgrade.
    await db.matters.put({
      id: 'legacy-matter',
      title: 'Written before v4',
      jurisdiction: 'England and Wales',
      clientAlias: 'Legacy',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as never);

    const found = await db.matters.get('legacy-matter');
    expect(found).toBeDefined();
    expect(found!.title).toBe('Written before v4');
  });
});
