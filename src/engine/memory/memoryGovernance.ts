/**
 * ATKIN Sovereign Legal AI - Memory Governance (Layer 5)
 * 
 * Retention & TTL management, episodic compaction, supersession tracking,
 * contradiction radar, and strict cross-matter isolation enforcement.
 */

import type { LegalEntity, LegalRelation } from './semanticMemory.ts';
import type { TaskEpisode } from './episodicMemory.ts';

export class MemoryIsolationError extends Error {
  constructor(message: string) {
    super(`[ATKIN Isolation Gate] ${message}`);
    this.name = 'MemoryIsolationError';
  }
}

export interface GovernancePolicy {
  workingMemoryTtlHours: number; // default 24
  episodicTtlDays: number;       // default 365
  maxEpisodesPerMatter: number;   // default 50 before compaction
}

export interface ContradictionFinding {
  id: string;
  matterId: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  sourceA: {
    entityOrClaimId: string;
    label: string;
    text: string;
    documentId: string;
  };
  sourceB: {
    entityOrClaimId: string;
    label: string;
    text: string;
    documentId: string;
  };
  status: 'active' | 'resolved' | 'dismissed';
  detectedAt: string;
  resolutionNote?: string;
}

export class MemoryGovernance {
  private policy: GovernancePolicy;

  constructor(policy?: Partial<GovernancePolicy>) {
    this.policy = {
      workingMemoryTtlHours: policy?.workingMemoryTtlHours ?? 24,
      episodicTtlDays: policy?.episodicTtlDays ?? 365,
      maxEpisodesPerMatter: policy?.maxEpisodesPerMatter ?? 50,
    };
  }

  /**
   * STRICT ISOLATION GATE
   * Ensures that queries originating from Matter A can NEVER view or retrieve
   * matter-specific records belonging to Matter B.
   */
  public assertMatterAccess(
    callerMatterId: string, 
    recordMatterId?: string, 
    recordScope?: string
  ): void {
    // Global user preferences and workspace playbooks are permitted across matters
    if (recordScope === 'user_preferences' || recordScope === 'workspace_playbooks') {
      return;
    }

    if (!recordMatterId) {
      // Record has no matter ID and is not explicitly global -> isolate
      throw new MemoryIsolationError(
        `Access denied: Unscoped record cannot be accessed by matter "${callerMatterId}".`
      );
    }

    if (callerMatterId !== recordMatterId) {
      throw new MemoryIsolationError(
        `Cross-matter violation: Matter "${callerMatterId}" attempted to access data belonging to matter "${recordMatterId}".`
      );
    }
  }

  /**
   * Purges episodic records that exceed the retention TTL window.
   */
  public purgeExpiredEpisodes(
    episodes: TaskEpisode[], 
    now = new Date()
  ): { retained: TaskEpisode[]; purgedCount: number } {
    const cutoffMs = now.getTime() - (this.policy.episodicTtlDays * 24 * 60 * 60 * 1000);
    const retained: TaskEpisode[] = [];
    let purgedCount = 0;

    for (const ep of episodes) {
      const epDate = new Date(ep.createdAt).getTime();
      if (epDate >= cutoffMs) {
        retained.push(ep);
      } else {
        purgedCount++;
      }
    }

    return { retained, purgedCount };
  }

  /**
   * Compaction: When a matter accumulates too many episodes, compact older successful
   * episodes into milestone summary digests to prevent token and memory bloat.
   */
  public compactEpisodes(
    matterId: string, 
    episodes: TaskEpisode[]
  ): { activeEpisodes: TaskEpisode[]; compactedSummary?: TaskEpisode } {
    const matterEpisodes = episodes.filter(e => e.matterId === matterId);
    if (matterEpisodes.length <= this.policy.maxEpisodesPerMatter) {
      return { activeEpisodes: episodes };
    }

    // Sort ascending by creation
    const sorted = [...matterEpisodes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const excessCount = sorted.length - this.policy.maxEpisodesPerMatter;
    const toCompact = sorted.slice(0, excessCount);
    const toKeep = sorted.slice(excessCount);

    // Build consolidated summary episode
    const compactedSummary: TaskEpisode = {
      id: `ep-compacted-${matterId}-${Date.now()}`,
      matterId,
      taskType: 'advisory_memo',
      queryOrGoal: `Archived milestone summary (${toCompact.length} historical episodes)`,
      approachSummary: `Consolidated decisions from episodes: ${toCompact.map(e => e.id).join(', ')}`,
      keyDecisions: toCompact.flatMap(e => e.keyDecisions),
      spansReferenced: Array.from(new Set(toCompact.flatMap(e => e.spansReferenced))),
      authoritiesReferenced: Array.from(new Set(toCompact.flatMap(e => e.authoritiesReferenced))),
      outcome: 'success',
      tokensUsed: 0,
      createdAt: new Date().toISOString()
    };

    const otherMatterEpisodes = episodes.filter(e => e.matterId !== matterId);
    return {
      activeEpisodes: [...otherMatterEpisodes, compactedSummary, ...toKeep],
      compactedSummary
    };
  }

  /**
   * Supersession: Marks an old entity or relation as superseded by a newer term.
   */
  public applySupersession(
    oldRelation: LegalRelation,
    newRelationId: string
  ): LegalRelation {
    return {
      ...oldRelation,
      relationType: 'supersedes',
      supersededBy: newRelationId
    };
  }

  /**
   * Contradiction Radar: Inspects entities within a matter for conflicting factual terms
   * (e.g. conflicting notice periods, conflicting payment deadlines, or conflicting party names).
   */
  public detectContradictions(
    matterId: string,
    entities: LegalEntity[]
  ): ContradictionFinding[] {
    const matterEntities = entities.filter(e => e.matterId === matterId);
    const findings: ContradictionFinding[] = [];

    // 1. Group entities by canonical key category (e.g. deadline:dispute_notice)
    const deadlineEntities = matterEntities.filter(e => e.type === 'deadline');
    for (let i = 0; i < deadlineEntities.length; i++) {
      for (let j = i + 1; j < deadlineEntities.length; j++) {
        const entA = deadlineEntities[i];
        const entB = deadlineEntities[j];

        // If both refer to dispute notice or payment period but have differing days/amounts
        if (
          entA.properties?.days && 
          entB.properties?.days && 
          entA.properties.days !== entB.properties.days &&
          entA.canonicalKey === entB.canonicalKey
        ) {
          findings.push({
            id: `contra-${Date.now()}-${i}-${j}`,
            matterId,
            severity: 'high',
            title: `Contradictory Deadline in ${entA.canonicalKey}`,
            description: `Document "${entA.provenance.documentId}" specifies ${entA.properties.days} days, whereas document "${entB.provenance.documentId}" specifies ${entB.properties.days} days.`,
            sourceA: {
              entityOrClaimId: entA.id,
              label: entA.name,
              text: entA.provenance.sourceTextSnippet,
              documentId: entA.provenance.documentId
            },
            sourceB: {
              entityOrClaimId: entB.id,
              label: entB.name,
              text: entB.provenance.sourceTextSnippet,
              documentId: entB.provenance.documentId
            },
            status: 'active',
            detectedAt: new Date().toISOString()
          });
        }
      }
    }

    // 2. Financial obligations with conflicting amounts
    const financialEntities = matterEntities.filter(e => e.type === 'financial_obligation');
    for (let i = 0; i < financialEntities.length; i++) {
      for (let j = i + 1; j < financialEntities.length; j++) {
        const entA = financialEntities[i];
        const entB = financialEntities[j];

        if (
          entA.properties?.amount && 
          entB.properties?.amount && 
          entA.properties.amount !== entB.properties.amount &&
          entA.canonicalKey === entB.canonicalKey
        ) {
          findings.push({
            id: `contra-${Date.now()}-fin-${i}-${j}`,
            matterId,
            severity: 'high',
            title: `Conflicting Financial Sum in ${entA.canonicalKey}`,
            description: `Document "${entA.provenance.documentId}" states ${entA.properties.amount} ${entA.properties.currency || ''}, but document "${entB.provenance.documentId}" states ${entB.properties.amount} ${entB.properties.currency || ''}.`,
            sourceA: {
              entityOrClaimId: entA.id,
              label: entA.name,
              text: entA.provenance.sourceTextSnippet,
              documentId: entA.provenance.documentId
            },
            sourceB: {
              entityOrClaimId: entB.id,
              label: entB.name,
              text: entB.provenance.sourceTextSnippet,
              documentId: entB.provenance.documentId
            },
            status: 'active',
            detectedAt: new Date().toISOString()
          });
        }
      }
    }

    return findings;
  }
}
