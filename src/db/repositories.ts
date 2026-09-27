/**
 * Canonical persistence for the durable entities.
 *
 * This is the system of record for memories, work/research jobs, tasks, saved
 * skills and research sessions. It writes to the same Dexie database as matters
 * and drafts (schema v4) — it is not a second persistence system, and it does
 * not use localStorage.
 *
 * Every function is fail-safe in the direction that matters: a write that throws
 * is reported, never silently swallowed, because a caller that believes it
 * persisted something it did not is how a workspace loses a lawyer's work.
 */

import { db } from './index.ts';
import type {
  MatterTask,
  SavedSkill,
  TaskStatus,
} from '../types/persistence.ts';
import type { MemoryRecord, DeepResearchSession } from '../types/index.ts';
import type { WorkJob } from '../engine/jobs/jobQueue.ts';

const now = () => new Date().toISOString();

function warn(op: string, err: unknown) {
  console.warn(`[ATKIN persistence] ${op} failed:`, err);
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

export const memoryRepo = {
  async all(): Promise<MemoryRecord[]> {
    return db.memories.toArray();
  },

  async forMatter(matterId: string): Promise<MemoryRecord[]> {
    const scoped = await db.memories.where('matterId').equals(matterId).toArray();
    const global = await db.memories
      .filter((m) => m.scope === 'user_preferences' || m.scope === 'workspace_playbooks')
      .toArray();
    return [...scoped, ...global];
  },

  async get(id: string): Promise<MemoryRecord | undefined> {
    return db.memories.get(id);
  },

  /** Insert or replace. Returns the record actually stored. */
  async put(memory: MemoryRecord): Promise<MemoryRecord> {
    await db.memories.put(memory);
    return memory;
  },

  async create(partial: Omit<MemoryRecord, 'id' | 'createdAt'> & { id?: string }): Promise<MemoryRecord> {
    const record: MemoryRecord = {
      ...partial,
      id: partial.id ?? `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now(),
    } as MemoryRecord;
    await db.memories.put(record);
    return record;
  },

  async update(id: string, patch: Partial<MemoryRecord>): Promise<void> {
    await db.memories.update(id, patch);
  },

  /**
   * Soft delete. A memory is evidence of something a user once decided, so it is
   * marked `deleted` rather than removed. `getAllMemories` filters on status.
   */
  async remove(id: string): Promise<void> {
    await db.memories.update(id, { status: 'deleted' as MemoryRecord['status'] });
  },

  /**
   * Replace a memory's content and supersede the old record.
   *
   * This is what makes correction work: the previous memory is retained with
   * `supersedesId` pointing forward and its own status set to `superseded`, so
   * retrieval stops returning it but the history stays inspectable.
   */
  async supersede(
    id: string,
    replacement: Partial<MemoryRecord> & { text: string }
  ): Promise<MemoryRecord> {
    const previous = await db.memories.get(id);
    if (!previous) throw new Error(`Cannot supersede unknown memory ${id}`);

    await db.memories.update(id, { status: 'superseded' as MemoryRecord['status'] });

    const next: MemoryRecord = {
      ...previous,
      ...replacement,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now(),
      supersedesId: id,
      status: 'active' as MemoryRecord['status'],
    } as MemoryRecord;

    await db.memories.put(next);
    return next;
  },

  async count(): Promise<number> {
    return db.memories.count();
  },
};

// ---------------------------------------------------------------------------
// Work / research jobs
// ---------------------------------------------------------------------------

export const jobRepo = {
  async all(): Promise<WorkJob[]> {
    const jobs = await db.jobs.toArray();
    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async forMatter(matterId: string): Promise<WorkJob[]> {
    return db.jobs.where('matterId').equals(matterId).toArray();
  },

  async get(id: string): Promise<WorkJob | undefined> {
    return db.jobs.get(id);
  },

  async put(job: WorkJob): Promise<WorkJob> {
    await db.jobs.put(job);
    return job;
  },

  /**
   * Persist a state transition, including its checkpoint.
   *
   * A job that was mid-flight when the process died is restored as `paused` with
   * an explicit "interrupted" step, never as `completed`. Silently reporting a
   * finished job that never finished is the failure this guards against.
   */
  async update(id: string, patch: Partial<WorkJob>): Promise<void> {
    await db.jobs.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    await db.jobs.delete(id);
  },

  /**
   * Called at startup. Any job recorded as `running` was interrupted by the
   * process ending, so it is downgraded to `paused` with a truthful step.
   * Returns the ids that were repaired.
   */
  async reconcileInterrupted(): Promise<string[]> {
    const running = await db.jobs.filter((j) => j.state === 'running').toArray();
    for (const job of running) {
      await db.jobs.update(job.id, {
        state: 'paused',
        currentStep: 'Interrupted when the application closed. Ready to resume.',
      });
    }
    return running.map((j) => j.id);
  },

  async count(): Promise<number> {
    return db.jobs.count();
  },
};

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const taskRepo = {
  async all(): Promise<MatterTask[]> {
    const tasks = await db.tasks.toArray();
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Open work only. Archived and done tasks are history, not to-do. */
  async open(): Promise<MatterTask[]> {
    const tasks = await db.tasks.toArray();
    return tasks
      .filter((t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'blocked')
      .sort((a, b) => {
        if (a.priority !== b.priority) return rank(a.priority) - rank(b.priority);
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  async forMatter(matterId: string): Promise<MatterTask[]> {
    return db.tasks.where('matterId').equals(matterId).toArray();
  },

  async get(id: string): Promise<MatterTask | undefined> {
    return db.tasks.get(id);
  },

  async create(
    partial: Pick<MatterTask, 'matterId' | 'title'> &
      Partial<Omit<MatterTask, 'id' | 'matterId' | 'title' | 'createdAt' | 'updatedAt'>>
  ): Promise<MatterTask> {
    const timestamp = now();
    const task: MatterTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'open',
      priority: 'normal',
      createdBy: 'manual',
      createdAt: timestamp,
      updatedAt: timestamp,
      ...partial,
    };
    await db.tasks.put(task);
    return task;
  },

  async update(id: string, patch: Partial<MatterTask>): Promise<void> {
    const existing = await db.tasks.get(id);
    if (!existing) throw new Error(`Cannot update unknown task ${id}`);
    const next: Partial<MatterTask> = { ...patch, updatedAt: now() };
    if (patch.status === 'done' && !existing.completedAt) {
      next.completedAt = now();
    }
    if (patch.status && patch.status !== 'done') {
      next.completedAt = undefined;
    }
    await db.tasks.update(id, next);
  },

  /** Soft delete: archive with a reason so the history survives. */
  async archive(id: string, reason = 'Archived by user'): Promise<void> {
    await db.tasks.update(id, {
      status: 'archived' as TaskStatus,
      archivedReason: reason,
      updatedAt: now(),
    });
  },

  async remove(id: string): Promise<void> {
    await db.tasks.delete(id);
  },

  async count(): Promise<number> {
    return db.tasks.count();
  },
};

function rank(p: MatterTask['priority']): number {
  return { urgent: 0, high: 1, normal: 2, low: 3 }[p] ?? 4;
}

// ---------------------------------------------------------------------------
// Saved skills
// ---------------------------------------------------------------------------

export const skillRepo = {
  async all(): Promise<SavedSkill[]> {
    return db.skills.toArray();
  },

  async enabled(): Promise<SavedSkill[]> {
    return db.skills.filter((s) => s.enabled).toArray();
  },

  async get(id: string): Promise<SavedSkill | undefined> {
    return db.skills.get(id);
  },

  async put(skill: SavedSkill): Promise<SavedSkill> {
    await db.skills.put(skill);
    return skill;
  },

  async create(
    partial: Pick<SavedSkill, 'name' | 'description'> &
      Partial<Omit<SavedSkill, 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'>>
  ): Promise<SavedSkill> {
    const timestamp = now();
    const skill: SavedSkill = {
      id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      version: '1.0.0',
      category: 'user_learned',
      jurisdictionSupport: [],
      permissions: ['READ_LOCAL'],
      requiredTools: [],
      sourcePolicy: 'strict_citation_required',
      triggers: [],
      workflow: [],
      successCriteria: [],
      knownFailureModes: [],
      systemInstructions: '',
      enabled: true,
      successCount: 0,
      failureCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...partial,
    };
    await db.skills.put(skill);
    return skill;
  },

  async update(id: string, patch: Partial<SavedSkill>): Promise<void> {
    await db.skills.update(id, { ...patch, updatedAt: now() });
  },

  /** Records a real outcome. Only called when a skill actually executed. */
  async recordOutcome(id: string, outcome: 'success' | 'failure'): Promise<void> {
    const skill = await db.skills.get(id);
    if (!skill) return;
    await db.skills.update(id, {
      successCount: skill.successCount + (outcome === 'success' ? 1 : 0),
      failureCount: skill.failureCount + (outcome === 'failure' ? 1 : 0),
      lastUsedAt: now(),
      updatedAt: now(),
    });
  },

  async setEnabled(id: string, enabled: boolean): Promise<void> {
    await db.skills.update(id, { enabled, updatedAt: now() });
  },

  async remove(id: string): Promise<void> {
    await db.skills.delete(id);
  },

  async count(): Promise<number> {
    return db.skills.count();
  },
};

// ---------------------------------------------------------------------------
// Research sessions (checkpoints)
// ---------------------------------------------------------------------------

export const researchSessionRepo = {
  async all(): Promise<DeepResearchSession[]> {
    return db.researchSessions.toArray();
  },

  async forMatter(matterId: string): Promise<DeepResearchSession[]> {
    return db.researchSessions.where('matterId').equals(matterId).toArray();
  },

  async get(id: string): Promise<DeepResearchSession | undefined> {
    return db.researchSessions.get(id);
  },

  async put(session: DeepResearchSession): Promise<DeepResearchSession> {
    await db.researchSessions.put(session);
    return session;
  },

  async update(id: string, patch: Partial<DeepResearchSession>): Promise<void> {
    await db.researchSessions.update(id, patch);
  },

  async remove(id: string): Promise<void> {
    await db.researchSessions.delete(id);
  },

  /**
   * A session left `executing` did not finish. It is restored as `idle` with its
   * fetched sources and logs intact so the user can resume, and is never
   * reported as `completed`.
   */
  async reconcileInterrupted(): Promise<string[]> {
    const executing = await db.researchSessions
      .filter((s) => s.status === 'executing')
      .toArray();
    for (const s of executing) {
      await db.researchSessions.update(s.id, { status: 'idle' });
    }
    return executing.map((s) => s.id);
  },

  async count(): Promise<number> {
    return db.researchSessions.count();
  },
};

// ---------------------------------------------------------------------------
// Startup reconciliation + summary
// ---------------------------------------------------------------------------

export interface DurableCounts {
  memories: number;
  jobs: number;
  tasks: number;
  skills: number;
  researchSessions: number;
}

/**
 * Run once at startup, before the UI reads any of these entities.
 *
 * Repairs jobs and research sessions that were mid-flight when the process last
 * exited, so the user never sees a job claiming to be running that is not.
 */
export async function reconcileOnStartup(): Promise<{
  interruptedJobs: string[];
  interruptedSessions: string[];
}> {
  const [interruptedJobs, interruptedSessions] = [await jobRepo.reconcileInterrupted(), await researchSessionRepo.reconcileInterrupted()];
  return { interruptedJobs, interruptedSessions };
}

export async function durableCounts(): Promise<DurableCounts> {
  const [memories, jobs, tasks, skills, researchSessions] = await Promise.all([
    memoryRepo.count().catch((e) => { warn('count memories', e); return 0; }),
    jobRepo.count().catch((e) => { warn('count jobs', e); return 0; }),
    taskRepo.count().catch((e) => { warn('count tasks', e); return 0; }),
    skillRepo.count().catch((e) => { warn('count skills', e); return 0; }),
    researchSessionRepo.count().catch((e) => { warn('count researchSessions', e); return 0; }),
  ]);
  return { memories, jobs, tasks, skills, researchSessions };
}
