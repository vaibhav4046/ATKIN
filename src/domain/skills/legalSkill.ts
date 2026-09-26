/**
 * ATKIN Legal Skills V2 Subsystem
 * Sections 23, 24, 25, 26: Portable Legal Skill Catalog & Skill Router
 */

export type SkillCategory = 'built_in' | 'practice' | 'user_learned';

export interface LegalSkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  jurisdictionSupport: string[];
  permissions: Array<'READ_LOCAL' | 'READ_EXTERNAL' | 'WRITE_LOCAL' | 'WRITE_EXTERNAL' | 'DESTRUCTIVE'>;
  requiredTools: string[];
  sourcePolicy: 'strict_citation_required' | 'authorities_required' | 'discretionary';
  workflow: string[];
  successCriteria: string[];
  knownFailureModes: string[];
  systemInstructions: string;
}

export const BUILT_IN_LEGAL_SKILLS: LegalSkill[] = [
  {
    id: 'contract-review',
    name: 'Commercial Contract Review',
    description: 'Comprehensive risk, indemnity, limitation of liability, and termination clause analysis.',
    category: 'built_in',
    version: '1.2.0',
    jurisdictionSupport: ['England and Wales', 'Scotland', 'Northern Ireland', 'All'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['CitationGate', 'MatterAnalyzer'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Extract defined terms and obligations',
      'Identify limitation of liability caps and carveouts',
      'Check termination notice triggers',
      'Surface governing law and jurisdiction clauses',
      'Flag high-risk standard deviations'
    ],
    successCriteria: [
      'Every risk statement quotes exact clause text with character offsets',
      'Limitation caps verified against aggregate contract fee',
      'Zero hallucinated clauses'
    ],
    knownFailureModes: [
      'Assuming standard 30-day notice when contract specifies 60 days',
      'Overlooking deeds of variation modifying base terms'
    ],
    systemInstructions: 'Review agreement provisions strictly against uploaded sources. Quote exact clause numbers and text.'
  },
  {
    id: 'nda-review',
    name: 'Non-Disclosure Agreement Review',
    description: 'Review confidentiality agreements for non-solicitation traps, perpetual terms, and jurisdiction.',
    category: 'built_in',
    version: '1.1.0',
    jurisdictionSupport: ['England and Wales', 'International'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['CitationGate'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Verify confidentiality term (e.g. 2, 3, or 5 years)',
      'Detect non-solicit and non-compete clauses',
      'Verify standard carveouts (statutory obligation, court order)'
    ],
    successCriteria: ['Carveouts present', 'Confidentiality term identified'],
    knownFailureModes: ['Confusing mutual NDA with unilateral NDA'],
    systemInstructions: 'Assess confidentiality obligations and redline unstandardized liabilities.'
  },
  {
    id: 'amendment-trace',
    name: 'Amendment & Variation Reconciliation',
    description: 'Trace contract variations, side letters, and deeds against the master agreement to identify superseded clauses.',
    category: 'built_in',
    version: '1.2.0',
    jurisdictionSupport: ['England and Wales'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['MatterAnalyzer', 'CitationGate'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Identify original agreement date and clauses',
      'Match deed of variation clauses to original clause numbers',
      'Flag superseded clauses as STALE / SOURCE_CHANGED',
      'Synthesize prevailing legal obligations'
    ],
    successCriteria: ['Prior clauses marked superseded', 'Prevailing text explicitly cited'],
    knownFailureModes: ['Applying deleted clause without checking deed of variation'],
    systemInstructions: 'Reconcile multi-document amendment histories. Prioritize latter deeds and mark superseded terms.'
  },
  {
    id: 'chronology',
    name: 'Factual Chronology Builder',
    description: 'Extract dated events from contemporaneous emails, letters, and statements into a chronological schedule.',
    category: 'built_in',
    version: '1.0.0',
    jurisdictionSupport: ['All'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['MatterAnalyzer'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Extract date references from contemporaneous sources',
      'Sort events in strict chronological order',
      'Bind each entry to source document and offset',
      'Flag uncertain or missing dates'
    ],
    successCriteria: ['All events have source provenance', 'Chronological order maintained'],
    knownFailureModes: ['Inferring dates not stated in the source document'],
    systemInstructions: 'Build a rigorous factual chronology. Only include events with verified date provenance.'
  },
  {
    id: 'legal-research-memo',
    name: 'Primary Legal Research Memorandum',
    description: 'Grounded legal research citing official legislation, CPR rules, and binding appellate precedents.',
    category: 'built_in',
    version: '2.0.0',
    jurisdictionSupport: ['England and Wales'],
    permissions: ['READ_LOCAL', 'READ_EXTERNAL', 'WRITE_LOCAL'],
    requiredTools: ['LegalAuthorityEngine', 'CitationGate'],
    sourcePolicy: 'authorities_required',
    workflow: [
      'Parse precise legal proposition and jurisdiction',
      'Retrieve relevant UK legislation (legislation.gov.uk)',
      'Search appellate court decisions and binding precedents',
      'Identify contrary and adverse authorities',
      'Synthesize structured legal advice memo'
    ],
    successCriteria: ['Primary authority mapped to every legal rule', 'Adverse authority addressed'],
    knownFailureModes: ['Treating search engine blog snippets as binding legal authority'],
    systemInstructions: 'Conduct objective primary legal research. Cite primary law first and explicitly note contrary authorities.'
  },
  {
    id: 'witness-inconsistency',
    name: 'Witness Inconsistency Workbench',
    description: 'Identify contradictions and discrepancies between witness statements and contemporaneous records.',
    category: 'built_in',
    version: '1.1.0',
    jurisdictionSupport: ['England and Wales', 'All'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['MatterAnalyzer', 'ContradictionEngine'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Extract witness factual claims',
      'Cross-reference against contemporaneous emails and invoices',
      'Identify factual discrepancies with neutral phrasing',
      'Tabulate statement vs document contradiction matrix'
    ],
    successCriteria: ['Neutral, non-prejudicial reporting', 'Exact span comparison'],
    knownFailureModes: ['Making aggressive credibility conclusions without documentary proof'],
    systemInstructions: 'Compare witness statements to documentary evidence objectively using neutral language.'
  },
  {
    id: 'disclosure-analysis',
    name: 'Disclosure & Privilege Assessment',
    description: 'Review documents for legal professional privilege (LPP), without-prejudice status, and disclosure category.',
    category: 'built_in',
    version: '1.0.0',
    jurisdictionSupport: ['England and Wales'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['MatterAnalyzer'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Identify counsel/solicitor correspondence',
      'Evaluate legal advice privilege vs litigation privilege',
      'Inspect for "without prejudice" markings and settlement negotiations',
      'Categorize disclosure relevance under CPR Part 31'
    ],
    successCriteria: ['Privilege flags highlighted with legal justification'],
    knownFailureModes: ['Waiving privilege by misclassifying general internal communications'],
    systemInstructions: 'Assess privilege strictly under UK common law rules.'
  },
  {
    id: 'client-email',
    name: 'Client Advisory Correspondence',
    description: 'Draft plain-English, professional client advice explaining technical legal findings and next steps.',
    category: 'built_in',
    version: '1.0.0',
    jurisdictionSupport: ['All'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['CitationGate'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Summarize issue and background in plain English',
      'Explain legal risks clearly without jargon overload',
      'Set out actionable commercial options and deadlines',
      'Provide clear recommendation'
    ],
    successCriteria: ['Concise summary', 'Clear options', 'Plain English'],
    knownFailureModes: ['Giving unconditional guarantees of court outcomes'],
    systemInstructions: 'Draft clear, professional client correspondence explaining legal risks and commercial recommendations.'
  },
  {
    id: 'hearing-brief',
    name: 'Counsel Hearing Brief',
    description: 'Prepare concise hearing summary for counsel including parties, issues, procedural history, and key orders sought.',
    category: 'built_in',
    version: '1.0.0',
    jurisdictionSupport: ['England and Wales'],
    permissions: ['READ_LOCAL', 'WRITE_LOCAL'],
    requiredTools: ['MatterAnalyzer'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'List procedural details: court, judge, hearing date, time estimate',
      'Set out core legal and factual issues in dispute',
      'Summarize relevant witness and documentary evidence',
      'Detail exact draft orders and remedies requested'
    ],
    successCriteria: ['Court-ready format', 'Clear orders sought with statutory basis'],
    knownFailureModes: ['Omitting critical procedural deadlines or previous directions'],
    systemInstructions: 'Format hearing brief suitable for junior or leading counsel.'
  },
  {
    id: 'citation-audit',
    name: 'Pinpoint Citation Audit',
    description: 'Verify every statement in a draft against primary sources using cryptographic SHA-256 character offsets.',
    category: 'built_in',
    version: '1.3.0',
    jurisdictionSupport: ['All'],
    permissions: ['READ_LOCAL'],
    requiredTools: ['CitationGate'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Extract cited claims and propositions',
      'Validate document SHA-256 hash against vault index',
      'Verify startOffset and endOffset character substring match',
      'Report verified, unverified, or corrupted citations'
    ],
    successCriteria: ['100% cryptographic offset match on verified spans'],
    knownFailureModes: ['Allowing citations where document hash has changed'],
    systemInstructions: 'Audit citation integrity strictly using CitationGate.'
  },
  {
    id: 'deadline-review',
    name: 'Procedural & Statutory Deadline Review',
    description: 'Deterministic computation of CPR court deadlines, limitation periods, and contractual notice periods.',
    category: 'built_in',
    version: '1.2.0',
    jurisdictionSupport: ['England and Wales'],
    permissions: ['READ_LOCAL'],
    requiredTools: ['TimeRuleEngine'],
    sourcePolicy: 'strict_citation_required',
    workflow: [
      'Parse trigger date and procedural event (e.g. service of particulars)',
      'Apply CPR 2.8 clear day rules and court holiday exclusion',
      'Calculate statutory limitation under Limitation Act 1980',
      'Output calculation audit receipt'
    ],
    successCriteria: ['CPR 2.8 rules applied deterministically without LLM math errors'],
    knownFailureModes: ['Failing to roll over weekends and UK bank holidays'],
    systemInstructions: 'Calculate legal deadlines using deterministic CPR rules only.'
  }
];

export class SkillRouter {
  private skills: LegalSkill[];

  constructor(customSkills: LegalSkill[] = []) {
    this.skills = [...BUILT_IN_LEGAL_SKILLS, ...customSkills];
  }

  public getAvailableSkills(): LegalSkill[] {
    return this.skills;
  }

  public routeSkill(query: string, taskType?: string): LegalSkill | null {
    const q = query.toLowerCase();

    if (taskType === 'chronology' || q.includes('chronolog') || q.includes('timeline')) {
      return this.findSkill('chronology');
    }
    if (q.includes('variation') || q.includes('amendment') || q.includes('deed')) {
      return this.findSkill('amendment-trace');
    }
    if (q.includes('nda') || q.includes('confidential')) {
      return this.findSkill('nda-review');
    }
    if (taskType === 'legal_research' || q.includes('research') || q.includes('authority') || q.includes('case law') || q.includes('statute')) {
      return this.findSkill('legal-research-memo');
    }
    if (q.includes('inconsisten') || q.includes('witness') || q.includes('contradict')) {
      return this.findSkill('witness-inconsistency');
    }
    if (q.includes('privilege') || q.includes('disclosure')) {
      return this.findSkill('disclosure-analysis');
    }
    if (q.includes('email') || q.includes('client advice') || q.includes('letter')) {
      return this.findSkill('client-email');
    }
    if (q.includes('hearing') || q.includes('counsel') || q.includes('trial')) {
      return this.findSkill('hearing-brief');
    }
    if (q.includes('citation') || q.includes('audit')) {
      return this.findSkill('citation-audit');
    }
    if (taskType === 'calculation' || q.includes('deadline') || q.includes('limitation') || q.includes('time')) {
      return this.findSkill('deadline-review');
    }
    if (taskType === 'document_review' || q.includes('contract') || q.includes('agreement') || q.includes('clause')) {
      return this.findSkill('contract-review');
    }

    return null;
  }

  private findSkill(id: string): LegalSkill | null {
    return this.skills.find(s => s.id === id) || null;
  }
}

export const skillRouter = new SkillRouter();
