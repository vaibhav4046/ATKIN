/**
 * Durable entities that previously existed only in memory.
 *
 * These were the four gaps recorded in docs/state-authority-map.md §4: memory,
 * work/research jobs, tasks and user skills all lived in a `Map` inside a
 * singleton, so closing the tab destroyed them. They now have real stores in the
 * canonical Dexie database (schema v4) via src/db/repositories.ts.
 *
 * No second persistence system was introduced. `localStorage` is deliberately
 * not used for any of this: the product database already exists and is the
 * system of record.
 */

import type { MemoryRecord, DeepResearchSession } from './index.ts';
import type { WorkJob } from '../engine/jobs/jobQueue.ts';

/** Lifecycle of a task. `archived` is a soft delete so history is never lost. */
export type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'done' | 'archived';

/**
 * A unit of legal work with an owner-visible lifecycle.
 *
 * Distinct from `WorkJob` (a background execution) and from
 * `MorningQueueItem` (a derived, read-only projection shown on Home). This is
 * the thing a lawyer actually ticks off.
 */
export interface MatterTask {
  id: string;
  matterId: string;
  title: string;
  detail?: string;
  status: TaskStatus;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  /** ISO date. A task with a due date is a deadline the user can rely on. */
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  /** Free-text origin, e.g. 'manual', 'deadline_engine', 'research_job'. */
  createdBy: string;
  /** Set when this task was produced by a research job, for traceability. */
  sourceJobId?: string;
  /** Soft-delete / archive reason, retained for audit. */
  archivedReason?: string;
}

/**
 * A skill the practice has saved, as opposed to a built-in one.
 *
 * `LegalSkill` (domain/skills/legalSkill.ts) describes the shape; this adds the
 * mutable, user-owned state: which matter it came from, whether it is enabled,
 * and whether it has actually worked.
 */
export interface SavedSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  /** 'practice' skills are shared across matters; 'user_learned' are personal. */
  category: 'practice' | 'user_learned';
  jurisdictionSupport: string[];
  permissions: Array<
    'READ_LOCAL' | 'READ_EXTERNAL' | 'WRITE_LOCAL' | 'WRITE_EXTERNAL' | 'DESTRUCTIVE'
  >;
  requiredTools: string[];
  sourcePolicy: 'strict_citation_required' | 'authorities_required' | 'discretionary';
  /** Ordered trigger phrases that route a query to this skill. */
  triggers: string[];
  workflow: string[];
  successCriteria: string[];
  knownFailureModes: string[];
  systemInstructions: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  /** Provenance: the matter or message this skill was distilled from. */
  createdFrom?: { matterId?: string; messageId?: string; documentId?: string };
  /** Real usage outcomes. Only incremented when the skill actually ran. */
  successCount: number;
  failureCount: number;
  lastUsedAt?: string;
}

/** Persisted shapes, re-exported so repositories can be typed without cycles. */
export type { MemoryRecord, DeepResearchSession, WorkJob };
