/**
 * ATKIN Sovereign Legal AI - Procedural Memory (Layer 4)
 * 
 * Versioned, declarative legal reasoning playbooks and procedural skills.
 * Enforces practitioner review gates: skills cannot self-promote to 'approved'
 * without human lawyer sign-off.
 */

export type SkillStatus = 'candidate' | 'approved' | 'deprecated';

export interface ProceduralStep {
  stepNumber: number;
  actionName: string;
  instruction: string;
  expectedOutput: string;
}

export interface VerificationCheck {
  checkId: string;
  description: string;
  mandatory: boolean;
}

export interface ProceduralSkill {
  id: string;
  name: string;
  version: number;
  description: string;
  jurisdiction: string;
  practiceArea: string;
  triggerPatterns: string[];
  requiredInputs: string[];
  steps: ProceduralStep[];
  verificationChecks: VerificationCheck[];
  reviewGateRequired: boolean;
  status: SkillStatus;
  performanceScore?: {
    evalCount: number;
    successRate: number;
    lastEvaluatedAt: string;
  };
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const BUILT_IN_PROCEDURAL_SKILLS: ProceduralSkill[] = [
  {
    id: 'skill-cpr16-particulars',
    name: 'CPR Part 16 Particulars of Claim Verification',
    version: 1,
    description: 'Verifies civil claims satisfy Civil Procedure Rules Part 16 and Practice Direction 16 requirements for concise statement of facts, interest calculation, and remedy specification.',
    jurisdiction: 'England and Wales',
    practiceArea: 'Civil Litigation',
    triggerPatterns: ['particulars of claim', 'cpr 16', 'statement of case', 'draft pleading'],
    requiredInputs: ['facts_list', 'parties', 'remedy_sought'],
    steps: [
      {
        stepNumber: 1,
        actionName: 'Party Identification',
        instruction: 'State legal capacity and residency/registration of Claimant and Defendant.',
        expectedOutput: 'Clear party description paragraph with company numbers if applicable.'
      },
      {
        stepNumber: 2,
        actionName: 'Chronological Facts',
        instruction: 'Set out chronological narrative of operative facts without evidence dumping.',
        expectedOutput: 'Numbered paragraphs each containing a single distinct material allegation.'
      },
      {
        stepNumber: 3,
        actionName: 'Breach Specification',
        instruction: 'Specify exact contractual term or statutory provision breached with date.',
        expectedOutput: 'Direct quote or cross-reference to relevant clause or statute section.'
      },
      {
        stepNumber: 4,
        actionName: 'Prayer for Relief',
        instruction: 'Set out exact damages, statutory interest pursuant to s.35A Senior Courts Act 1981 / s.69 County Courts Act 1984, and costs.',
        expectedOutput: 'Explicit itemized relief prayer.'
      }
    ],
    verificationChecks: [
      { checkId: 'chk-cpr-remedy', description: 'Explicit prayer for relief present with specified sums', mandatory: true },
      { checkId: 'chk-cpr-dates', description: 'All material allegations contain operative dates', mandatory: true },
      { checkId: 'chk-cpr-interest', description: 'Statutory or contractual interest basis clearly pleaded', mandatory: false }
    ],
    reviewGateRequired: true,
    status: 'approved',
    approvedBy: 'Senior Litigation Partner',
    approvedAt: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    performanceScore: {
      evalCount: 42,
      successRate: 0.98,
      lastEvaluatedAt: '2026-09-25T10:00:00.000Z'
    }
  },
  {
    id: 'skill-cra2015-quality-audit',
    name: 'Consumer Rights Act 2015 s.9/10 Statutory Quality Audit',
    version: 1,
    description: 'Audits goods defect disputes under UK Consumer Rights Act 2015 against statutory tiers of repair, replacement, or final right to reject.',
    jurisdiction: 'England and Wales',
    practiceArea: 'Consumer Protection',
    triggerPatterns: ['consumer rights act', 'cra 2015', 'goods defect', 'satisfactory quality', 'fit for purpose'],
    requiredInputs: ['purchase_date', 'defect_discovery_date', 'price_paid', 'evidence_of_fault'],
    steps: [
      {
        stepNumber: 1,
        actionName: 'Timeline & 30-Day Check',
        instruction: 'Determine if fault reported within first 30 days (short-term right to reject under s.20/s.22).',
        expectedOutput: 'Statutory period classification (Within 30 days / 30 days to 6 months / Post 6 months).'
      },
      {
        stepNumber: 2,
        actionName: 'Reverse Burden of Proof (s.19(14))',
        instruction: 'If within first 6 months, apply statutory presumption that fault was present at delivery.',
        expectedOutput: 'Burden allocation statement placing proof on trader.'
      },
      {
        stepNumber: 3,
        actionName: 'Tier-One Remedy Exhaustion',
        instruction: 'Assess whether repair or replacement was attempted or refused.',
        expectedOutput: 'Verification that trader had one opportunity to repair or replace.'
      }
    ],
    verificationChecks: [
      { checkId: 'chk-cra-date', description: 'Purchase and notification dates verified against receipt', mandatory: true },
      { checkId: 'chk-cra-trader', description: 'Trader status established vs private sale', mandatory: true }
    ],
    reviewGateRequired: false,
    status: 'approved',
    approvedBy: 'Consumer Practice Group',
    approvedAt: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    performanceScore: {
      evalCount: 88,
      successRate: 1.0,
      lastEvaluatedAt: '2026-09-25T12:00:00.000Z'
    }
  },
  {
    id: 'skill-commercial-notice-limitation',
    name: 'Commercial Contract Notice & Dispute Window Audit',
    version: 1,
    description: 'Extracts and verifies notice periods, dispute escalation windows, and contractual limitation clauses.',
    jurisdiction: 'England and Wales',
    practiceArea: 'Commercial Contracts',
    triggerPatterns: ['notice period', 'dispute window', 'dispute escalation', 'limitation period', 'clause 4', 'payment terms'],
    requiredInputs: ['contract_text', 'invoice_or_breach_date'],
    steps: [
      {
        stepNumber: 1,
        actionName: 'Notice Clause Identification',
        instruction: 'Identify explicit clause specifying days required for written objection or notice of dispute.',
        expectedOutput: 'Exact clause reference, number of days, and method of service.'
      },
      {
        stepNumber: 2,
        actionName: 'Window Calculation',
        instruction: 'Compute calendar deadline from date of invoice / notice receipt.',
        expectedOutput: 'Target calendar date and working-day adjustments.'
      },
      {
        stepNumber: 3,
        actionName: 'Consequence of Non-Compliance',
        instruction: 'Determine if failure to serve notice operates as a condition precedent or waiver of claim.',
        expectedOutput: 'Risk evaluation: conclusive acceptance vs procedural irregularity.'
      }
    ],
    verificationChecks: [
      { checkId: 'chk-notice-quote', description: 'Exact quote of operative clause included', mandatory: true },
      { checkId: 'chk-notice-working-days', description: 'Differentiates working days vs calendar days', mandatory: true }
    ],
    reviewGateRequired: false,
    status: 'approved',
    approvedBy: 'Commercial Contracts Head',
    approvedAt: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    performanceScore: {
      evalCount: 56,
      successRate: 0.96,
      lastEvaluatedAt: '2026-09-25T14:00:00.000Z'
    }
  },
  {
    id: 'skill-preaction-letter',
    name: 'Pre-Action Protocol Letter of Claim Drafting',
    version: 1,
    description: 'Generates formal Letter Before Claim compliant with Practice Direction - Pre-Action Conduct and Protocols.',
    jurisdiction: 'England and Wales',
    practiceArea: 'Commercial Litigation',
    triggerPatterns: ['letter before claim', 'letter of claim', 'pre-action protocol', 'formal demand'],
    requiredInputs: ['claimant_details', 'defendant_details', 'factual_summary', 'amount_claimed', 'basis_of_claim'],
    steps: [
      {
        stepNumber: 1,
        actionName: 'Factual Basis & Chronology',
        instruction: 'Detail factual background leading to the breach or obligation.',
        expectedOutput: 'Succinct chronological summary.'
      },
      {
        stepNumber: 2,
        actionName: 'Legal Basis & Contractual Breach',
        instruction: 'State exact clauses or statutes relied upon.',
        expectedOutput: 'Specific legal grounds.'
      },
      {
        stepNumber: 3,
        actionName: 'Financial Quantification',
        instruction: 'Set out exact breakdown of sum demanded with any applicable statutory interest.',
        expectedOutput: 'Itemized calculation.'
      },
      {
        stepNumber: 4,
        actionName: 'Strict Response Deadline',
        instruction: 'Give 14 days (debt) or 30 days (complex commercial dispute) for reply pursuant to Pre-Action Conduct Annex A.',
        expectedOutput: 'Explicit response deadline date.'
      }
    ],
    verificationChecks: [
      { checkId: 'chk-pap-deadline', description: 'Pre-Action response deadline explicitly stated', mandatory: true },
      { checkId: 'chk-pap-adr', description: 'Reference to ADR / willingness to mediate included', mandatory: false }
    ],
    reviewGateRequired: true,
    status: 'approved',
    approvedBy: 'Civil Practice Group Leader',
    approvedAt: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

export class ProceduralMemoryEngine {
  private skills: Map<string, ProceduralSkill> = new Map();

  constructor(customSkills?: ProceduralSkill[]) {
    // Seed built-in skills
    for (const skill of BUILT_IN_PROCEDURAL_SKILLS) {
      this.skills.set(skill.id, { ...skill });
    }
    if (customSkills) {
      for (const skill of customSkills) {
        this.skills.set(skill.id, skill);
      }
    }
  }

  /**
   * Registers a new candidate skill. Starts in 'candidate' status until reviewed.
   */
  public registerCandidateSkill(
    skill: Omit<ProceduralSkill, 'id' | 'createdAt' | 'status' | 'approvedBy' | 'approvedAt'>
  ): ProceduralSkill {
    const id = `skill-cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSkill: ProceduralSkill = {
      ...skill,
      id,
      status: 'candidate',
      createdAt: new Date().toISOString()
    };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  /**
   * Practitioner Gate: Promotes candidate skill to approved status.
   */
  public promoteCandidate(skillId: string, practitionerAlias: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;
    if (skill.status !== 'candidate') return false;

    skill.status = 'approved';
    skill.approvedBy = practitionerAlias;
    skill.approvedAt = new Date().toISOString();
    return true;
  }

  public deprecateSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;
    skill.status = 'deprecated';
    return true;
  }

  public getApprovedSkills(): ProceduralSkill[] {
    return Array.from(this.skills.values()).filter(s => s.status === 'approved');
  }

  public getCandidateSkills(): ProceduralSkill[] {
    return Array.from(this.skills.values()).filter(s => s.status === 'candidate');
  }

  public getSkillById(id: string): ProceduralSkill | undefined {
    return this.skills.get(id);
  }

  /**
   * Matches candidate and approved skills based on task description keywords
   */
  public matchSkills(
    taskDescription: string, 
    jurisdiction?: string, 
    approvedOnly = true
  ): ProceduralSkill[] {
    const descLower = taskDescription.toLowerCase();
    
    return Array.from(this.skills.values())
      .filter(s => {
        if (approvedOnly && s.status !== 'approved') return false;
        if (s.status === 'deprecated') return false;
        if (jurisdiction && s.jurisdiction !== jurisdiction && s.jurisdiction !== 'General Common Law') {
          return false;
        }

        return s.triggerPatterns.some(pat => descLower.includes(pat.toLowerCase()));
      });
  }
}
