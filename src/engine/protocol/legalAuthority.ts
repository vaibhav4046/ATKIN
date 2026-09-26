/**
 * ATKIN Sovereign Legal OS — Multi-Dimensional Legal Authority & Rule Packs
 * 
 * Replaces linear source flattening with structured normative domains:
 * 1. LegalAuthorityResolver: Normative legal supremacy (Statute > SI > Judicial Precedent).
 * 2. ContractVersionResolver: Master Agreement vs Deeds of Variation precedence.
 * 3. EvidenceWeightResolver: Contemporaneous documentary evidence vs witness statements.
 * 4. RulePackEngine: Applicability predicates (UCTA 1977 vs CRA 2015; B2B vs B2C).
 */

export type LegalSourceCategory = 
  | 'legislation'             // Acts of Parliament (CRA 2015, UCTA 1977)
  | 'delegated_legislation'   // Statutory Instruments, CPR rules
  | 'procedural_rule'         // Practice Directions, Court Guides
  | 'judicial_decision'       // UKSC, EWCA, EWHC judgments
  | 'contract'                // Master Services Agreement, Lease, Supply Contract
  | 'amendment'               // Deed of Variation, Side Letter, Addendum
  | 'factual_evidence'        // Telephony logs, contemporaneous emails, delivery notes
  | 'secondary_commentary';   // Chitty on Contracts, White Book commentary

export interface LegalSource {
  id: string;
  title: string;
  category: LegalSourceCategory;
  jurisdiction: 'England and Wales' | 'Scotland' | 'Northern Ireland' | 'UK_Wide';
  court?: string;
  citation?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  bindingStatus: 'strictly_binding' | 'persuasive' | 'contractual_inter_partes' | 'evidential_only';
  currentStatus: 'in_force' | 'repealed' | 'amended' | 'overruled' | 'distinguished';
  content: string;
  versionHash: string;
  retrievedAt: string;
}

export interface ContractClause {
  clauseId: string;
  documentId: string;
  clauseNumber: string; // e.g. "3.2" or "2.1"
  text: string;
  sourceCategory: 'contract' | 'amendment';
  isVariedBy?: string; // ID of amending deed
  effectiveDate: string;
}

export interface StatutoryApplicabilityResult {
  statute: 'UCTA_1977' | 'CRA_2015';
  applicable: boolean;
  status: 'APPLIES' | 'DOES_NOT_APPLY' | 'REQUIRES_REVIEW';
  reason: string;
  overriddenClauses: Array<{
    clauseId: string;
    clauseNumber: string;
    prohibitedTerm: string;
    statutoryRef: string;
  }>;
}

/**
 * LegalAuthorityResolver
 * Enforces constitutional and statutory supremacy over subordinate instruments and private contracts.
 */
export class LegalAuthorityResolver {
  private static categoryPrecedence: Record<LegalSourceCategory, number> = {
    'legislation': 1,
    'delegated_legislation': 2,
    'procedural_rule': 3,
    'judicial_decision': 4,
    'amendment': 5,
    'contract': 6,
    'factual_evidence': 7,
    'secondary_commentary': 8
  };

  public static rankSources(sources: LegalSource[]): LegalSource[] {
    return [...sources].sort((a, b) => {
      const precA = this.categoryPrecedence[a.category];
      const precB = this.categoryPrecedence[b.category];
      if (precA !== precB) return precA - precB;
      // If same category, in_force takes priority over repealed/amended
      if (a.currentStatus === 'in_force' && b.currentStatus !== 'in_force') return -1;
      if (b.currentStatus === 'in_force' && a.currentStatus !== 'in_force') return 1;
      return a.title.localeCompare(b.title);
    });
  }
}

/**
 * ContractVersionResolver
 * Resolves operative contract terms when Deeds of Variation or amendments exist.
 */
export class ContractVersionResolver {
  /**
   * Identifies which clauses are actively operative vs superseded by later Deeds of Variation.
   */
  public static resolveOperativeClauses(
    parentClauses: ContractClause[],
    amendments: ContractClause[]
  ): {
    operativeClauses: ContractClause[];
    supersededClauses: Array<{ original: ContractClause; replacingAmendment: ContractClause }>;
  } {
    const operative: ContractClause[] = [];
    const superseded: Array<{ original: ContractClause; replacingAmendment: ContractClause }> = [];

    // Map amendments by targeted clause number
    const amendmentMap = new Map<string, ContractClause>();
    for (const am of amendments) {
      amendmentMap.set(am.clauseNumber, am);
    }

    for (const parent of parentClauses) {
      const amendingClause = amendmentMap.get(parent.clauseNumber);
      if (amendingClause) {
        superseded.push({
          original: parent,
          replacingAmendment: amendingClause
        });
        operative.push({
          ...amendingClause,
          isVariedBy: amendingClause.documentId
        });
      } else {
        // Unvaried clause continues in full force and effect
        operative.push(parent);
      }
    }

    return { operativeClauses: operative, supersededClauses: superseded };
  }
}

/**
 * EvidenceWeightResolver
 * Evaluates evidential hierarchy under English civil evidence principles:
 * - Contemporaneous documents carry higher probative weight than subsequent witness statements.
 * - Extrinsic evidence cannot contradict unambiguous contractual terms.
 */
export class EvidenceWeightResolver {
  public static evaluateProbativeWeight(evidence: {
    type: 'contemporaneous_log' | 'contemporaneous_email' | 'witness_statement' | 'oral_recollection';
    recordedDate: string;
    eventDate: string;
    hasCryptographicIntegrity: boolean;
  }): { weightScore: number; justification: string } {
    if (evidence.type === 'contemporaneous_log' && evidence.hasCryptographicIntegrity) {
      return {
        weightScore: 0.95,
        justification: 'Contemporaneous automated system record with verifiable cryptographic integrity (Gestmin v Credit Suisse [2013] EWHC 3560 principles).'
      };
    }

    if (evidence.type === 'contemporaneous_email') {
      return {
        weightScore: 0.85,
        justification: 'Contemporaneous written communication created proximate to event.'
      };
    }

    if (evidence.type === 'witness_statement') {
      return {
        weightScore: 0.65,
        justification: 'Post-event witness recollection prepared for litigation; subject to fallibility of human memory.'
      };
    }

    return {
      weightScore: 0.40,
      justification: 'Oral recollection unsupported by contemporaneous documentary proof.'
    };
  }
}

/**
 * Versioned Rule Pack Engine with Applicability Predicates
 */
export class RulePackEngine {
  /**
   * Applies UCTA 1977 and CRA 2015 liability rules using strict transaction classification predicates.
   */
  public static evaluateLiabilityRules(params: {
    contractType: 'B2B_COMMERCIAL' | 'B2C_CONSUMER' | 'UNKNOWN';
    clauses: ContractClause[];
  }): StatutoryApplicabilityResult {
    // 1. Ambiguous Contract Type -> Must flag for practitioner review
    if (params.contractType === 'UNKNOWN') {
      return {
        statute: 'UCTA_1977',
        applicable: false,
        status: 'REQUIRES_REVIEW',
        reason: 'Contracting parties relationship (B2B vs B2C) is undetermined. Cannot definitively select UCTA 1977 or Consumer Rights Act 2015 without factual characterisation.',
        overriddenClauses: []
      };
    }

    // 2. Consumer Contract -> CRA 2015 s.65 applies
    if (params.contractType === 'B2C_CONSUMER') {
      const overrides: StatutoryApplicabilityResult['overriddenClauses'] = [];
      for (const cl of params.clauses) {
        const lower = cl.text.toLowerCase();
        if (lower.includes('no liability for personal injury') || lower.includes('exclude all liability for negligence')) {
          overrides.push({
            clauseId: cl.clauseId,
            clauseNumber: cl.clauseNumber,
            prohibitedTerm: cl.text,
            statutoryRef: 'Consumer Rights Act 2015 s.65(1)'
          });
        }
      }

      return {
        statute: 'CRA_2015',
        applicable: true,
        status: 'APPLIES',
        reason: 'Consumer contract under CRA 2015. Trader cannot exclude or restrict liability for death or personal injury resulting from negligence (s.65).',
        overriddenClauses: overrides
      };
    }

    // 3. Commercial B2B Contract -> UCTA 1977 s.2(1) applies (CRA 2015 does NOT apply to pure B2B)
    const overrides: StatutoryApplicabilityResult['overriddenClauses'] = [];
    for (const cl of params.clauses) {
      const lower = cl.text.toLowerCase();
      if (lower.includes('no liability for personal injury') || lower.includes('exclude all liability for negligence')) {
        overrides.push({
          clauseId: cl.clauseId,
          clauseNumber: cl.clauseNumber,
          prohibitedTerm: cl.text,
          statutoryRef: 'Unfair Contract Terms Act 1977 s.2(1)'
        });
      }
    }

    return {
      statute: 'UCTA_1977',
      applicable: true,
      status: 'APPLIES',
      reason: 'B2B commercial agreement. Under UCTA 1977 s.2(1), a person cannot exclude or restrict liability for death or personal injury resulting from negligence.',
      overriddenClauses: overrides
    };
  }
}
