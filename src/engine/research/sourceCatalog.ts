import type { 
  LegalSourcePack, 
  RightsOperation, 
  RightsDecision,
  Jurisdiction
} from '../../types/index.ts';

export class SourceCatalog {
  private sources: Map<string, LegalSourcePack> = new Map();

  constructor() {
    this.initDefaultSources();
  }

  private initDefaultSources() {
    const packs: LegalSourcePack[] = [
      {
        id: 'src-uk-legislation',
        name: 'UK Legislation (legislation.gov.uk)',
        jurisdiction: 'UK',
        publisher: 'The National Archives / UK Government',
        officialUrl: 'https://www.legislation.gov.uk',
        description: 'Official revised UK statutory legislation including Acts of Parliament (e.g. Consumer Rights Act 2015) and Statutory Instruments.',
        capabilities: {
          search: true,
          fetchById: true,
          localImport: true,
          incrementalUpdates: true,
          requiresCredentials: false
        },
        rightsDecisions: {
          fetch: 'allowed',
          store: 'allowed',
          index: 'allowed',
          embed: 'allowed',
          redistribute: 'allowed',
          train: 'allowed'
        },
        rightsRationale: 'Licensed under Open Government Licence (OGL) v3.0. Re-use permitted worldwide, royalty-free, perpetual, non-exclusive with attribution.',
        lastCheckedDate: '2026-09-23',
        installedLocally: true,
        recordCount: 14200,
        coverageCaveat: 'Primary legislation current up to latest official revision; prospective amendments flagged.'
      },
      {
        id: 'src-uk-find-case-law',
        name: 'The National Archives: Find Case Law',
        jurisdiction: 'UK',
        publisher: 'The National Archives on behalf of Ministry of Justice',
        officialUrl: 'https://caselaw.nationalarchives.gov.uk',
        description: 'Judgments from England and Wales High Court, Court of Appeal, UK Supreme Court, and upper tribunals published under Open Justice Licence.',
        capabilities: {
          search: true,
          fetchById: true,
          localImport: false,
          incrementalUpdates: false,
          requiresCredentials: false
        },
        rightsDecisions: {
          fetch: 'allowed',
          store: 'allowed',
          index: 'requires_permission', // Crucial legal-tech rights boundary!
          embed: 'requires_permission',
          redistribute: 'not_allowed',
          train: 'not_allowed'
        },
        rightsRationale: 'Published under Open Justice Licence (OJL) v2.0. Explicitly excludes bulk computational indexing, commercial redistribution, and AI training without bespoke permission.',
        lastCheckedDate: '2026-09-23',
        installedLocally: false,
        recordCount: 68500,
        coverageCaveat: 'Single judgment retrieval allowed with click-through; bulk vector embedding blocked by sovereign rights gate.'
      },
      {
        id: 'src-uk-cpr',
        name: 'Civil Procedure Rules (CPR)',
        jurisdiction: 'UK',
        publisher: 'Ministry of Justice / Civil Procedure Rule Committee',
        officialUrl: 'https://www.justice.gov.uk/courts/procedure-rules/civil',
        description: 'The procedural rules and practice directions governing County Court, High Court, and Court of Appeal civil litigation in England & Wales.',
        capabilities: {
          search: true,
          fetchById: true,
          localImport: true,
          incrementalUpdates: true,
          requiresCredentials: false
        },
        rightsDecisions: {
          fetch: 'allowed',
          store: 'allowed',
          index: 'allowed',
          embed: 'allowed',
          redistribute: 'allowed',
          train: 'allowed'
        },
        rightsRationale: 'Crown Copyright covered by Open Government Licence (OGL) v3.0.',
        lastCheckedDate: '2026-09-23',
        installedLocally: true,
        recordCount: 840,
        coverageCaveat: 'Includes CPR 1998, Practice Direction (Pre-Action Conduct), Part 7, Part 8, Part 31, and Part 36.'
      },
      {
        id: 'src-us-courtlistener',
        name: 'CourtListener (Free Law Project)',
        jurisdiction: 'US',
        publisher: 'Free Law Project 501(c)(3)',
        officialUrl: 'https://www.courtlistener.com',
        description: 'US Federal and State case law, dockets, and judicial profiles via RECAP and public domain court records.',
        capabilities: {
          search: true,
          fetchById: true,
          localImport: true,
          incrementalUpdates: true,
          requiresCredentials: true // optional API token for high volume
        },
        rightsDecisions: {
          fetch: 'allowed',
          store: 'allowed',
          index: 'allowed',
          embed: 'allowed',
          redistribute: 'allowed',
          train: 'allowed'
        },
        rightsRationale: 'US government judicial works are public domain (17 U.S.C. § 105); Free Law Project provides API under open terms with rate-limiting.',
        lastCheckedDate: '2026-09-23',
        installedLocally: false,
        recordCount: 8900000,
        coverageCaveat: 'Requires network mode set to public_research or connected_imports; respects rate limits.'
      },
      {
        id: 'src-eu-eurlex',
        name: 'EUR-Lex (European Union Law)',
        jurisdiction: 'EU',
        publisher: 'Publications Office of the European Union',
        officialUrl: 'https://eur-lex.europa.eu',
        description: 'Official EU law: Treaties, Regulations, Directives, Decisions, and Case-law of the Court of Justice of the European Union.',
        capabilities: {
          search: true,
          fetchById: true,
          localImport: true,
          incrementalUpdates: true,
          requiresCredentials: false
        },
        rightsDecisions: {
          fetch: 'allowed',
          store: 'allowed',
          index: 'allowed',
          embed: 'allowed',
          redistribute: 'allowed',
          train: 'allowed'
        },
        rightsRationale: 'Re-use of Commission documents authorised under Decision 2011/833/EU subject to source acknowledgment.',
        lastCheckedDate: '2026-09-23',
        installedLocally: false,
        recordCount: 1150000,
        coverageCaveat: 'SPARQL and Cellar REST API support; multi-language parallel texts available.'
      },
      {
        id: 'src-in-indiacode',
        name: 'India Code / eCourts Services',
        jurisdiction: 'IN',
        publisher: 'Legislative Department, Ministry of Law and Justice, Government of India',
        officialUrl: 'https://www.indiacode.nic.in',
        description: 'Digital repository of all Central and State Acts, Ordinances, and subordinate legislation in India.',
        capabilities: {
          search: true,
          fetchById: true,
          localImport: true,
          incrementalUpdates: false,
          requiresCredentials: false
        },
        rightsDecisions: {
          fetch: 'allowed',
          store: 'allowed',
          index: 'allowed',
          embed: 'allowed',
          redistribute: 'allowed',
          train: 'allowed'
        },
        rightsRationale: 'National Data Sharing and Accessibility Policy (NDSAP) / Open Government Data License India.',
        lastCheckedDate: '2026-09-23',
        installedLocally: false,
        recordCount: 125000,
        coverageCaveat: 'Central Acts comprehensive from 1836 to present; State amendments updated per notification gazettes.'
      }
    ];

    for (const p of packs) {
      this.sources.set(p.id, p);
    }
  }

  public getAllSources(): LegalSourcePack[] {
    return Array.from(this.sources.values());
  }

  public getSourceById(id: string): LegalSourcePack | undefined {
    return this.sources.get(id);
  }

  public getSourcesByJurisdiction(jurisdiction: Jurisdiction): LegalSourcePack[] {
    return Array.from(this.sources.values()).filter(s => s.jurisdiction === jurisdiction);
  }

  /**
   * Sovereign Rights Gate evaluator:
   * Prevents legal exposure by rejecting unauthorized computational operations (indexing/embedding/training).
   */
  public evaluateRights(sourceId: string, operation: RightsOperation): {
    decision: RightsDecision;
    isPermitted: boolean;
    rationale: string;
  } {
    const pack = this.sources.get(sourceId);
    if (!pack) {
      return {
        decision: 'unknown',
        isPermitted: false,
        rationale: `Source ID "${sourceId}" is not registered in the ATKIN catalog.`
      };
    }

    const decision = pack.rightsDecisions[operation] || 'unknown';
    const isPermitted = decision === 'allowed';

    let rationale = pack.rightsRationale;
    if (decision === 'requires_permission') {
      rationale = `[PERMISSION REQUIRED] ${pack.name} restricts '${operation}' under ${pack.rightsRationale}. Obtain license before proceeding.`;
    } else if (decision === 'not_allowed') {
      rationale = `[PROHIBITED] ${pack.name} explicitly forbids '${operation}'. Operation halted to maintain sovereign compliance.`;
    }

    return {
      decision,
      isPermitted,
      rationale
    };
  }
}
