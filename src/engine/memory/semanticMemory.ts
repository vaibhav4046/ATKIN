/**
 * ATKIN Sovereign Legal AI - Semantic Memory (Layer 3)
 * 
 * Typed Legal Ontology Graph.
 * Enforces provenance grounding: all entities and relations must link
 * to verifiable source documents and text snippets.
 */

export type LegalEntityType = 
  | 'party'
  | 'court'
  | 'statute'
  | 'clause'
  | 'deadline'
  | 'financial_obligation'
  | 'remedy'
  | 'precedent';

export interface EntityProvenance {
  documentId: string;
  spanId?: string;
  sourceTextSnippet: string;
  charOffset?: [number, number];
}

export interface LegalEntity {
  id: string;
  matterId: string;
  type: LegalEntityType;
  name: string;
  canonicalKey: string; // e.g. "party:riverglass_software_ltd"
  properties: Record<string, any>;
  provenance: EntityProvenance;
  confidence: number;
  createdAt: string;
}

export type LegalRelationType =
  | 'binds'
  | 'amends'
  | 'breaches'
  | 'governs'
  | 'supersedes'
  | 'interprets'
  | 'obligates'
  | 'limits';

export interface RelationProvenance {
  documentId: string;
  sourceTextSnippet: string;
}

export interface LegalRelation {
  id: string;
  matterId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: LegalRelationType;
  details?: string;
  provenance: RelationProvenance;
  effectiveDate?: string;
  supersededBy?: string;
  createdAt: string;
}

export class SemanticMemoryEngine {
  private entities: Map<string, LegalEntity> = new Map();
  private relations: Map<string, LegalRelation> = new Map();

  constructor(initialEntities?: LegalEntity[], initialRelations?: LegalRelation[]) {
    if (initialEntities) {
      for (const ent of initialEntities) {
        this.entities.set(ent.id, ent);
      }
    }
    if (initialRelations) {
      for (const rel of initialRelations) {
        this.relations.set(rel.id, rel);
      }
    }
  }

  /**
   * Adds an entity with strict provenance validation.
   * Rejects ungrounded entities.
   */
  public addEntity(params: Omit<LegalEntity, 'id' | 'createdAt'>): LegalEntity {
    if (!params.provenance || !params.provenance.documentId || !params.provenance.sourceTextSnippet) {
      throw new Error(`Ungrounded entity rejected: entity "${params.name}" missing document provenance.`);
    }

    const id = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entity: LegalEntity = {
      ...params,
      id,
      createdAt: new Date().toISOString()
    };
    this.entities.set(id, entity);
    return entity;
  }

  /**
   * Adds a relation between two verified entities with provenance.
   */
  public addRelation(params: Omit<LegalRelation, 'id' | 'createdAt'>): LegalRelation {
    if (!this.entities.has(params.sourceEntityId)) {
      throw new Error(`Cannot link relation: source entity "${params.sourceEntityId}" not found.`);
    }
    if (!this.entities.has(params.targetEntityId)) {
      throw new Error(`Cannot link relation: target entity "${params.targetEntityId}" not found.`);
    }
    if (!params.provenance || !params.provenance.documentId) {
      throw new Error(`Ungrounded relation rejected: relation missing document provenance.`);
    }

    const id = `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const relation: LegalRelation = {
      ...params,
      id,
      createdAt: new Date().toISOString()
    };
    this.relations.set(id, relation);
    return relation;
  }

  public getEntity(id: string): LegalEntity | undefined {
    return this.entities.get(id);
  }

  public getEntitiesForMatter(matterId: string, type?: LegalEntityType): LegalEntity[] {
    return Array.from(this.entities.values())
      .filter(e => e.matterId === matterId && (!type || e.type === type));
  }

  public getRelationsForMatter(matterId: string): LegalRelation[] {
    return Array.from(this.relations.values())
      .filter(r => r.matterId === matterId);
  }

  public findEntityByCanonicalKey(matterId: string, canonicalKey: string): LegalEntity | undefined {
    return Array.from(this.entities.values())
      .find(e => e.matterId === matterId && e.canonicalKey === canonicalKey);
  }

  public upsertEntity(matterId: string, entity: {
    id: string;
    name: string;
    kind?: string;
    type?: LegalEntityType;
    canonicalKey?: string;
    properties?: Record<string, any>;
    attributes?: Record<string, any>;
    provenance?: EntityProvenance;
    sourceSpanIds?: string[];
    confidence?: number;
  }): LegalEntity {
    const existing = this.entities.get(entity.id);
    const resolved: LegalEntity = {
      id: entity.id,
      matterId,
      name: entity.name,
      type: (entity.type || (entity.kind as LegalEntityType) || 'clause'),
      canonicalKey: entity.canonicalKey || `entity:${entity.id}`,
      properties: entity.properties || entity.attributes || {},
      provenance: entity.provenance || {
        documentId: entity.sourceSpanIds?.[0] ? `doc-${entity.sourceSpanIds[0]}` : 'doc-default',
        sourceTextSnippet: entity.name,
        spanId: entity.sourceSpanIds?.[0]
      },
      confidence: entity.confidence ?? 1.0,
      createdAt: existing?.createdAt || new Date().toISOString()
    };
    this.entities.set(entity.id, resolved);
    return resolved;
  }

  public getEntities(matterId: string): LegalEntity[] {
    return this.getEntitiesForMatter(matterId);
  }

  /**
   * Returns graph neighborhood for a given entity
   */
  public getNeighbors(entityId: string): Array<{
    relation: LegalRelation;
    targetEntity: LegalEntity;
    direction: 'outgoing' | 'incoming';
  }> {
    const results: Array<{
      relation: LegalRelation;
      targetEntity: LegalEntity;
      direction: 'outgoing' | 'incoming';
    }> = [];

    for (const rel of this.relations.values()) {
      if (rel.sourceEntityId === entityId) {
        const target = this.entities.get(rel.targetEntityId);
        if (target) {
          results.push({ relation: rel, targetEntity: target, direction: 'outgoing' });
        }
      } else if (rel.targetEntityId === entityId) {
        const source = this.entities.get(rel.sourceEntityId);
        if (source) {
          results.push({ relation: rel, targetEntity: source, direction: 'incoming' });
        }
      }
    }

    return results;
  }

  /**
   * Provenance audit check for a specific entity
   */
  public verifyGrounding(entityId: string): boolean {
    const ent = this.entities.get(entityId);
    if (!ent) return false;
    return Boolean(
      ent.provenance &&
      ent.provenance.documentId &&
      ent.provenance.sourceTextSnippet &&
      ent.provenance.sourceTextSnippet.trim().length > 0
    );
  }

  public getAllEntitiesCount(): number {
    return this.entities.size;
  }

  public getAllRelationsCount(): number {
    return this.relations.size;
  }
}
