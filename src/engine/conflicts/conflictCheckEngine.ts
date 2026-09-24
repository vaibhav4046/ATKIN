import type { 
  ConflictEntity, 
  ConflictCheckMatch 
} from '../../types/index.ts';

export class ConflictCheckEngine {
  private conflictIndex: Map<string, ConflictEntity> = new Map();

  constructor() {
    this.seedDefaultIndex();
  }

  private seedDefaultIndex() {
    // Grounded entities across realistic institutional and consumer matters
    const defaultEntities: ConflictEntity[] = [
      {
        id: 'ent-post-office-ltd',
        canonicalName: 'Post Office Limited',
        aliases: ['Post Office', 'POL', 'Royal Mail Post Office Group'],
        entityType: 'corporation',
        associatedMatterIds: ['matter-bates-post-office'],
        roles: ['adverse_party']
      },
      {
        id: 'ent-fujitsu-services',
        canonicalName: 'Fujitsu Services Limited',
        aliases: ['Fujitsu UK', 'ICL Pathway Limited', 'Fujitsu ICL'],
        entityType: 'corporation',
        associatedMatterIds: ['matter-bates-post-office'],
        roles: ['adverse_party', 'witness']
      },
      {
        id: 'ent-alan-bates',
        canonicalName: 'Alan Bates',
        aliases: ['Mr Alan Bates', 'Bates, A.'],
        entityType: 'individual',
        associatedMatterIds: ['matter-bates-post-office'],
        roles: ['client']
      },
      {
        id: 'ent-novacorp',
        canonicalName: 'NovaCorp Technologies Limited',
        aliases: ['NovaCorp Global', 'NovaCorp UK'],
        entityType: 'corporation',
        associatedMatterIds: ['matter-contract-novacorp'],
        roles: ['client']
      },
      {
        id: 'ent-meridian-solutions',
        canonicalName: 'Meridian Cloud Solutions PLC',
        aliases: ['Meridian Cloud', 'Meridian Software'],
        entityType: 'corporation',
        associatedMatterIds: ['matter-contract-novacorp'],
        roles: ['adverse_party']
      },
      {
        id: 'ent-thorne-estates',
        canonicalName: 'Thorne Residential Property Holdings Ltd',
        aliases: ['Thorne Estates', 'Thorne Lettings'],
        entityType: 'corporation',
        associatedMatterIds: ['matter-tenancy-thorne'],
        roles: ['adverse_party']
      },
      {
        id: 'ent-elena-rostova',
        canonicalName: 'Elena Rostova',
        aliases: ['Ms Rostova', 'E. Rostova'],
        entityType: 'individual',
        associatedMatterIds: ['matter-tenancy-thorne'],
        roles: ['client']
      }
    ];

    defaultEntities.forEach(ent => {
      this.conflictIndex.set(ent.id, ent);
    });
  }

  /**
   * Search for conflicts against the role-gated index.
   * INVARIANT: Never exposes matter facts, strategy, or confidential text.
   * Only matches normalized entity aliases, adverse parties, and corporate affiliations.
   */
  public searchConflicts(partyName: string, prospectiveMatterId?: string): ConflictCheckMatch[] {
    const query = partyName.trim().toLowerCase();
    if (!query || query.length < 2) return [];

    const matches: ConflictCheckMatch[] = [];

    for (const entity of this.conflictIndex.values()) {
      const canonicalMatch = entity.canonicalName.toLowerCase().includes(query);
      const aliasMatch = entity.aliases.some(a => a.toLowerCase().includes(query));

      if (canonicalMatch || aliasMatch) {
        // Evaluate conflict severity under SRA Principle 7 & Code of Conduct 6.2
        const isClient = entity.roles.includes('client');
        const isAdverse = entity.roles.includes('adverse_party');

        let severity: ConflictCheckMatch['severity'] = 'informational';
        let conflictType: ConflictCheckMatch['conflictType'] = 'corporate_affiliate';
        let explanation = '';

        if (isClient) {
          severity = 'blocking';
          conflictType = 'former_client';
          explanation = `Entity "${entity.canonicalName}" is an existing or former client of the firm. Representation adverse to this party is strictly prohibited without informed consent and information barriers.`;
        } else if (isAdverse) {
          severity = 'flagged';
          conflictType = 'direct_adverse';
          explanation = `Entity "${entity.canonicalName}" is currently adverse in existing matter (${entity.associatedMatterIds.join(', ')}). Proceed with caution regarding common legal positions.`;
        } else {
          explanation = `Entity "${entity.canonicalName}" appears as witness or affiliate in matter history.`;
        }

        for (const matterId of entity.associatedMatterIds) {
          // If checking against the same matter, skip self-match
          if (prospectiveMatterId && matterId === prospectiveMatterId) continue;

          matches.push({
            matchedEntityId: entity.id,
            canonicalName: entity.canonicalName,
            queryTerm: partyName,
            conflictType,
            matterId,
            severity,
            explanation
          });
        }
      }
    }

    return matches;
  }

  /**
   * Register a new entity into the conflict index.
   */
  public registerEntity(entity: Omit<ConflictEntity, 'id'>): ConflictEntity {
    const id = `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: ConflictEntity = {
      ...entity,
      id
    };
    this.conflictIndex.set(id, record);
    return record;
  }

  public getAllEntities(): ConflictEntity[] {
    return Array.from(this.conflictIndex.values());
  }
}

export const conflictCheckEngine = new ConflictCheckEngine();
