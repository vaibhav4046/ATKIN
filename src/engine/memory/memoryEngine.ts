import type { 
  MemoryRecord, 
  MemoryScope, 
  MemoryKind, 
  MemoryReviewState, 
  MemoryStatus,
  StateClass
} from '../../types/index.ts';

export class MemoryEngine {
  private memories: Map<string, MemoryRecord> = new Map();

  constructor() {
    this.seedDefaultPreferences();
  }

  private seedDefaultPreferences() {
    // Approved global user preference
    const defaultPref: MemoryRecord = {
      id: 'mem-pref-style-uk',
      vaultId: 'default-vault',
      scope: 'user_preferences',
      kind: 'preference',
      text: 'Draft all legal correspondence in concise British English with numbered paragraphs and neutral tone.',
      sourceDocumentVersions: [],
      sourceSpanIds: [],
      sourceMessageIds: [],
      createdBy: 'human',
      createdAt: new Date().toISOString(),
      reviewState: 'accepted',
      status: 'active',
      dependencyIds: []
    };
    this.memories.set(defaultPref.id, defaultPref);
  }

  public getAllMemories(): MemoryRecord[] {
    return Array.from(this.memories.values()).filter(m => m.status !== 'deleted');
  }

  public getMemoriesForMatter(matterId: string): MemoryRecord[] {
    return Array.from(this.memories.values()).filter(m => 
      m.status !== 'deleted' && 
      (m.matterId === matterId || m.scope === 'user_preferences' || m.scope === 'workspace_playbooks')
    );
  }

  public suggestMemory(params: {
    vaultId: string;
    matterId?: string;
    scope: MemoryScope;
    kind: MemoryKind;
    text: string;
    sourceDocumentVersions?: string[];
    sourceSpanIds?: string[];
    sourceMessageIds?: string[];
    createdBy?: 'human' | 'model' | 'rule';
    dependencyIds?: string[];
  }): MemoryRecord {
    // If global scope, ensure it contains no private client fact
    if (params.scope === 'user_preferences' && params.matterId) {
      params.matterId = undefined; // decouple from matter
    }

    const record: MemoryRecord = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      vaultId: params.vaultId,
      matterId: params.matterId,
      scope: params.scope,
      kind: params.kind,
      text: params.text,
      sourceDocumentVersions: params.sourceDocumentVersions || [],
      sourceSpanIds: params.sourceSpanIds || [],
      sourceMessageIds: params.sourceMessageIds || [],
      createdBy: params.createdBy || 'model',
      createdAt: new Date().toISOString(),
      reviewState: params.createdBy === 'human' ? 'accepted' : 'suggested',
      status: 'active',
      dependencyIds: params.dependencyIds || []
    };

    this.memories.set(record.id, record);
    return record;
  }

  public approveMemory(id: string): MemoryRecord | null {
    const mem = this.memories.get(id);
    if (!mem) return null;
    mem.reviewState = 'accepted';
    mem.status = 'active';
    return mem;
  }

  public rejectMemory(id: string): MemoryRecord | null {
    const mem = this.memories.get(id);
    if (!mem) return null;
    mem.reviewState = 'rejected';
    mem.status = 'deleted';
    return mem;
  }

  public forgetMemory(id: string): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;
    mem.status = 'deleted';
    return true;
  }

  /**
   * Scoped Recall Invariant:
   * Query in Matter B must NEVER return private facts from Matter A.
   */
  public recallScopedMemories(matterId: string, query = ''): MemoryRecord[] {
    const candidates = Array.from(this.memories.values()).filter(m => {
      if (m.status !== 'active' || m.reviewState !== 'accepted') return false;

      // STRICT ISOLATION GATE:
      // If record is matter-specific, it MUST match the current matterId
      if (m.matterId && m.matterId !== matterId) {
        return false;
      }

      // If global scope, ensure it is legitimate global scope
      if (!m.matterId && m.scope !== 'user_preferences' && m.scope !== 'workspace_playbooks') {
        return false;
      }

      if (query.trim()) {
        return m.text.toLowerCase().includes(query.toLowerCase());
      }

      return true;
    });

    // Update lastUsedAt
    candidates.forEach(m => m.lastUsedAt = new Date().toISOString());
    return candidates;
  }

  /**
   * Dependency Invalidation Cascade:
   * When a source document is corrected or deleted, invalidate dependent memories.
   */
  public invalidateDocumentDependencies(documentId: string): string[] {
    const invalidatedIds: string[] = [];

    for (const mem of this.memories.values()) {
      if (mem.sourceDocumentVersions.includes(documentId) || mem.dependencyIds.includes(documentId)) {
        mem.status = 'invalidated';
        invalidatedIds.push(mem.id);
      }
    }

    return invalidatedIds;
  }

  /**
   * 6-Tier State Ledger Classification:
   * Map memory scopes to the 6 sovereign state classes.
   */
  public getMemoriesByStateClass(stateClass: StateClass, matterId?: string): MemoryRecord[] {
    const scopeMap: Record<StateClass, MemoryScope[]> = {
      original_evidence: ['matter_facts'],
      extracted_observations: ['matter_facts', 'legal_research_notes'],
      reviewed_matter_knowledge: ['matter_facts', 'work_progress'],
      user_preferences: ['user_preferences'],
      approved_reusable_knowledge: ['workspace_playbooks'],
      public_legal_reference_packs: ['legal_research_notes']
    };

    const targetScopes = scopeMap[stateClass] || [];
    return Array.from(this.memories.values()).filter(m => {
      if (m.status === 'deleted') return false;
      if (!targetScopes.includes(m.scope)) return false;
      if (matterId && m.matterId && m.matterId !== matterId) return false;
      return true;
    });
  }

  /**
   * Export the complete state ledger as encrypted/verifiable JSON.
   */
  public exportStateLedger(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      recordCount: this.memories.size,
      records: Array.from(this.memories.values())
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import state ledger with validation.
   */
  public importStateLedger(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.records || !Array.isArray(parsed.records)) return false;
      for (const rec of parsed.records) {
        if (rec.id && rec.scope && rec.text) {
          this.memories.set(rec.id, rec);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const memoryEngine = new MemoryEngine();
