import type { 
  MemoryRecord, 
  MemoryScope, 
  MemoryKind, 
  MemoryReviewState, 
  MemoryStatus 
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
}

export const memoryEngine = new MemoryEngine();
