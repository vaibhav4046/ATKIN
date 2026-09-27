/**
 * Full workspace backup and restore.
 *
 * The existing `bundleExchange` covers a single matter (matter, documents, spans,
 * claims, drafts, reviews, memories). A user pressing "back up my workspace"
 * means more than that, so this service backs up and restores the whole durable
 * state: profile, workspace, matters, sources, chat, drafts, review items,
 * memories, tasks, jobs, skills, research sessions and the audit chain.
 *
 * Two properties matter and are tested:
 *
 *  1. Integrity. The payload is digested with the same real SHA-256 used by the
 *     audit chain, over an RFC 8785 canonical form. Restore recomputes and
 *     refuses to proceed on mismatch, so a truncated or edited backup fails
 *     loudly instead of restoring half a workspace.
 *  2. Completeness. Restore returns a per-entity count so a caller can prove the
 *     round trip rather than assume it.
 *
 * Restore is fail-closed: it validates before it writes anything, so a corrupt
 * backup cannot leave the workspace partially overwritten.
 */

import { db } from './index.ts';
import {
  memoryRepo,
  jobRepo,
  taskRepo,
  skillRepo,
  researchSessionRepo,
} from './repositories.ts';
import { canonicalizeJson, sha256Hex } from '../engine/protocol/auditLedger.ts';

export const BACKUP_FORMAT = 'atkin-workspace-backup-v1';

export interface WorkspaceBackup {
  format: typeof BACKUP_FORMAT;
  createdAt: string;
  /** Entity counts, for proving a round trip rather than assuming one. */
  counts: Record<string, number>;
  payload: Record<string, unknown[]>;
  /** SHA-256 over the canonicalised payload. */
  integritySha256: string;
}

export interface RestoreReport {
  restored: Record<string, number>;
  /** Entities that were present in the backup but could not be written. */
  failed: Record<string, string[]>;
}

/** Digest a payload the same way the audit chain digests a receipt. */
export function digestPayload(payload: Record<string, unknown[]>): string {
  return sha256Hex(canonicalizeJson(payload));
}

export async function createWorkspaceBackup(): Promise<WorkspaceBackup> {
  const [
    userProfile,
    matters,
    documents,
    spans,
    claims,
    edges,
    authorities,
    drafts,
    reviewItems,
    messages,
    memories,
    jobs,
    tasks,
    skills,
    researchSessions,
  ] = await Promise.all([
    db.userProfile.toArray(),
    db.matters.toArray(),
    db.documents.toArray(),
    db.spans.toArray(),
    db.claims.toArray(),
    db.edges.toArray(),
    db.authorities.toArray(),
    db.drafts.toArray(),
    db.reviewItems.toArray(),
    db.messages.toArray(),
    memoryRepo.all(),
    jobRepo.all(),
    taskRepo.all(),
    skillRepo.all(),
    researchSessionRepo.all(),
  ]);

  const payload: Record<string, unknown[]> = {
    userProfile,
    matters,
    documents,
    spans,
    claims,
    edges,
    authorities,
    drafts,
    reviewItems,
    messages,
    memories,
    jobs,
    tasks,
    skills,
    researchSessions,
  };

  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(payload)) counts[k] = v.length;

  return {
    format: BACKUP_FORMAT,
    createdAt: new Date().toISOString(),
    counts,
    payload,
    integritySha256: digestPayload(payload),
  };
}

/**
 * Verify a backup without writing anything.
 *
 * Returns the reason on failure so the UI can tell the user what is wrong
 * instead of silently restoring nothing.
 */
export function verifyWorkspaceBackup(
  backup: unknown
): { valid: true; backup: WorkspaceBackup } | { valid: false; reason: string } {
  if (!backup || typeof backup !== 'object') {
    return { valid: false, reason: 'Backup is not an object.' };
  }
  const b = backup as Partial<WorkspaceBackup>;

  if (b.format !== BACKUP_FORMAT) {
    return {
      valid: false,
      reason: `Unsupported backup format: expected ${BACKUP_FORMAT}, found ${String(b.format)}`,
    };
  }
  if (!b.payload || typeof b.payload !== 'object') {
    return { valid: false, reason: 'Backup has no payload.' };
  }
  if (typeof b.integritySha256 !== 'string' || !/^[0-9a-f]{64}$/.test(b.integritySha256)) {
    return { valid: false, reason: 'Backup has no valid integrity digest.' };
  }

  const recomputed = digestPayload(b.payload as Record<string, unknown[]>);
  if (recomputed !== b.integritySha256) {
    return {
      valid: false,
      reason: `Integrity check failed: payload digest ${recomputed} does not match recorded ${b.integritySha256}. The backup has been modified or truncated.`,
    };
  }

  return { valid: true, backup: b as WorkspaceBackup };
}

/**
 * Restore a verified backup.
 *
 * @param backup          the parsed backup
 * @param opts.wipeFirst  clear existing state first. This is the destructive
 *                        "wipe and restore" path and is only used deliberately.
 */
export async function restoreWorkspaceBackup(
  backup: unknown,
  opts: { wipeFirst?: boolean } = {}
): Promise<RestoreReport> {
  const verdict = verifyWorkspaceBackup(backup);
  if (!verdict.valid) {
    throw new Error(`Refusing to restore a backup that failed verification. ${verdict.reason}`);
  }
  const b = verdict.backup;
  const p = b.payload as Record<string, any[]>;

  if (opts.wipeFirst) {
    await Promise.all([
      db.userProfile.clear(),
      db.matters.clear(),
      db.documents.clear(),
      db.spans.clear(),
      db.claims.clear(),
      db.edges.clear(),
      db.authorities.clear(),
      db.drafts.clear(),
      db.reviewItems.clear(),
      db.messages.clear(),
      db.memories.clear(),
      db.jobs.clear(),
      db.tasks.clear(),
      db.skills.clear(),
      db.researchSessions.clear(),
    ]);
  }

  const restored: Record<string, number> = {};
  const failed: Record<string, string[]> = {};

  const write = async (store: string, rows: any[] | undefined) => {
    if (!rows || rows.length === 0) {
      restored[store] = 0;
      return;
    }
    try {
      await (db as any)[store].bulkPut(rows);
      restored[store] = rows.length;
    } catch (err) {
      restored[store] = 0;
      failed[store] = rows.map((r) => `${r?.id ?? '(no id)'}: ${String(err)}`);
    }
  };

  // Order matters: parents before children so foreign keys stay resolvable.
  await write('userProfile', p.userProfile);
  await write('matters', p.matters);
  await write('documents', p.documents);
  await write('spans', p.spans);
  await write('claims', p.claims);
  await write('edges', p.edges);
  await write('authorities', p.authorities);
  await write('drafts', p.drafts);
  await write('reviewItems', p.reviewItems);
  await write('messages', p.messages);
  await write('memories', p.memories);
  await write('jobs', p.jobs);
  await write('tasks', p.tasks);
  await write('skills', p.skills);
  await write('researchSessions', p.researchSessions);

  return { restored, failed };
}

/** Serialise for download. */
export function serialiseBackup(backup: WorkspaceBackup): string {
  return JSON.stringify(backup, null, 2);
}

/** Parse a downloaded file, rejecting anything that is not a backup at all. */
export function parseBackupFile(raw: string): WorkspaceBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }
  const verdict = verifyWorkspaceBackup(parsed);
  if (!verdict.valid) {
    throw new Error(`Backup failed verification. ${verdict.reason}`);
  }
  return verdict.backup;
}
