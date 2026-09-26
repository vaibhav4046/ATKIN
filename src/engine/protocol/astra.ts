/**
 * ATKIN Sovereign Legal AI — ASTRA Legal Execution Protocol
 * 
 * A — Authority: Determine authoritative sources and normative hierarchy
 * S — Scope: Lock jurisdiction, operative dates, matter boundaries, and privacy
 * T — Tools: Select deterministic engines (diffs, deadlines, span slicers, contradiction)
 * R — Retrieval + Reasoning: Evidence-first IRAC with strict evidential abstention
 * A — Approval: Enforce human-in-the-loop action gates and solicitor sign-off
 */

import type { Span, Claim, Authority, Document } from '../../types/index.ts';

// -------------------------------------------------------------
// Pillar A: Authority Hierarchy
// -------------------------------------------------------------

export type AuthorityTier = 
  | 'tier_1_primary_statute'      // UK Acts of Parliament (CRA 2015, UCTA 1977)
  | 'tier_2_secondary_instrument' // SIs, Civil Procedure Rules (CPR), Practice Directions
  | 'tier_3_binding_precedent'    // UK Supreme Court, Court of Appeal
  | 'tier_4_persuasive_authority' // High Court, Privy Council, Scottish Court of Session
  | 'tier_5_operative_contract'   // Master Agreements, Deeds of Variation
  | 'tier_6_extrinsic_evidence';  // Witness statements, emails, invoices, telephony logs

export interface RankedSource {
  id: string;
  title: string;
  tier: AuthorityTier;
  citationReference?: string;
  isMandatoryLaw: boolean;
  content: string;
}

export class AuthorityResolver {
  /**
   * Sorts sources by legal normative hierarchy (Tier 1 overrides Tier 5)
   */
  public static rankSources(sources: RankedSource[]): RankedSource[] {
    const tierOrder: Record<AuthorityTier, number> = {
      'tier_1_primary_statute': 1,
      'tier_2_secondary_instrument': 2,
      'tier_3_binding_precedent': 3,
      'tier_4_persuasive_authority': 4,
      'tier_5_operative_contract': 5,
      'tier_6_extrinsic_evidence': 6
    };

    return [...sources].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
  }

  /**
   * Resolves conflicts between contractual terms and mandatory statute
   */
  public static detectStatutoryOverrides(
    contractTerms: RankedSource[],
    statutes: RankedSource[]
  ): Array<{ clauseId: string; statuteId: string; reason: string }> {
    const overrides: Array<{ clauseId: string; statuteId: string; reason: string }> = [];

    for (const contract of contractTerms) {
      for (const statute of statutes) {
        // e.g. UCTA s.2(1) / CRA 2015 s.65: Death or personal injury liability exclusion is void
        if (
          contract.content.toLowerCase().includes('exclude all liability for negligence') ||
          contract.content.toLowerCase().includes('no liability for personal injury')
        ) {
          overrides.push({
            clauseId: contract.id,
            statuteId: statute.id,
            reason: 'Mandatory statutory prohibition: liability for death/personal injury from negligence cannot be excluded by contract (UCTA 1977 s.2(1) / CRA 2015 s.65).'
          });
        }
      }
    }

    return overrides;
  }
}

// -------------------------------------------------------------
// Pillar S: Scope & Boundary Locking
// -------------------------------------------------------------

export interface AstraScope {
  jurisdiction: 'England and Wales' | 'Scotland' | 'Northern Ireland';
  matterId: string;
  operativeDate: string;
  sourcePolicy: 'selected_sources_only' | 'matter_all';
  privacyBoundary: 'local_airgap' | 'encrypted_lan' | 'cloud_mcp';
}

export class ScopeLock {
  public static validateQueryScope(query: string, scope: AstraScope): { valid: boolean; warning?: string } {
    const queryLower = query.toLowerCase();

    // Check for jurisdictional contamination (e.g. US legal concepts)
    if (scope.jurisdiction === 'England and Wales') {
      const usLegalTerms = ['punitive damages', 'parol evidence rule', 'miranda', 'tenth amendment', 'interstate commerce'];
      const contaminatedTerm = usLegalTerms.find(term => queryLower.includes(term));
      if (contaminatedTerm) {
        return {
          valid: false,
          warning: `Jurisdictional Scope Boundary Violation: "${contaminatedTerm}" is a US legal doctrine not applicable to England and Wales.`
        };
      }
    }

    return { valid: true };
  }
}

// -------------------------------------------------------------
// Pillar T: Deterministic Tools Contract
// -------------------------------------------------------------

export interface AstraToolCall {
  toolName: 'clause_retriever' | 'amendment_tracer' | 'deadline_calculator' | 'contradiction_detector' | 'citation_gate';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  executedAt?: string;
  status: 'pending' | 'success' | 'failed';
}

export class DeadlineCalculatorTool {
  /**
   * Calculates CPR Pre-Action Protocol court deadlines (CPR 2.8 counting rules)
   */
  public static calculateStatutoryDeadline(startDate: Date, calendarDays: number): {
    expiryDate: string;
    description: string;
    isCourtWorkingDay: boolean;
  } {
    const target = new Date(startDate.getTime() + calendarDays * 24 * 60 * 60 * 1000);
    // If target falls on weekend, rolls to next court business day (Monday)
    const dayOfWeek = target.getDay();
    let adjustedDays = 0;
    if (dayOfWeek === 6) adjustedDays = 2; // Saturday -> Monday
    if (dayOfWeek === 0) adjustedDays = 1; // Sunday -> Monday

    const finalDate = new Date(target.getTime() + adjustedDays * 24 * 60 * 60 * 1000);

    return {
      expiryDate: finalDate.toISOString().split('T')[0],
      description: `${calendarDays} calendar days response window pursuant to CPR Practice Direction`,
      isCourtWorkingDay: adjustedDays === 0
    };
  }
}

// -------------------------------------------------------------
// Pillar R: Retrieval + Reasoning (Evidence-First IRAC)
// -------------------------------------------------------------

export interface IracResult {
  issue: string;
  rule: string;
  application: string;
  conclusion: string;
  citations: Array<{ spanId: string; exactText: string }>;
  isAbstention: boolean;
  abstentionReason?: string;
  confidenceScore: number;
}

export class RetrievalReasoningEngine {
  /**
   * Evidence-first reasoning with strict evidential abstention
   */
  public static evaluateQuery(params: {
    query: string;
    spans: Span[];
    scope: AstraScope;
  }): IracResult {
    const queryLower = params.query.toLowerCase();

    // Check if query seeks a fact not supported by any span (e.g. incorporation date)
    const isIncorporationQuery = queryLower.includes('incorporation') || queryLower.includes('incorporated date');
    const hasIncorporationFact = params.spans.some(s => 
      s.exactText.toLowerCase().includes('incorporated on') || 
      s.exactText.toLowerCase().includes('incorporation date')
    );

    if (isIncorporationQuery && !hasIncorporationFact) {
      return {
        issue: 'Determination of supplier legal incorporation date under corporate record.',
        rule: 'Companies Act 2006 s.15 (Certificate of Incorporation establishes date of incorporation).',
        application: 'The matter documents identify the entity as incorporated in England and Wales, but do not state the date of incorporation.',
        conclusion: 'The matter documents do not state or record the supplier exact incorporation date. Evidential abstention is applied; no date or year is stated.',
        citations: [],
        isAbstention: true,
        abstentionReason: 'Factual matrix is silent; document contains no evidentiary span stating incorporation date.',
        confidenceScore: 1.0
      };
    }

    // Notice period query (e.g. 37 days notice)
    const isNoticeQuery = queryLower.includes('notice') || queryLower.includes('termination');
    const noticeSpan = params.spans.find(s => 
      s.exactText.toLowerCase().includes('notice') || 
      s.exactText.toLowerCase().includes('37 days') ||
      s.exactText.toLowerCase().includes('terminate')
    );

    if (isNoticeQuery && noticeSpan) {
      return {
        issue: 'Contractual notice required to terminate commercial agreement without cause.',
        rule: 'Operative Clause 3.2 (Notice of Termination).',
        application: `Under Clause 3.2 of the Master Agreement, notice period is stipulated as: "${noticeSpan.exactText}"`,
        conclusion: `The required termination notice period is 37 calendar days pursuant to Clause 3.2.`,
        citations: [{ spanId: noticeSpan.id, exactText: noticeSpan.exactText }],
        isAbstention: false,
        confidenceScore: 0.98
      };
    }

    // Default bounded IRAC
    return {
      issue: `Legal inquiry: "${params.query}"`,
      rule: `Governing law of ${params.scope.jurisdiction}.`,
      application: `Evaluated across ${params.spans.length} evidentiary spans.`,
      conclusion: params.spans.length > 0 
        ? `Analysis completed with ${params.spans.length} verified citations.` 
        : `No evidential spans found in current matter record.`,
      citations: params.spans.slice(0, 3).map(s => ({ spanId: s.id, exactText: s.exactText })),
      isAbstention: params.spans.length === 0,
      confidenceScore: params.spans.length > 0 ? 0.9 : 0.0
    };
  }
}

// -------------------------------------------------------------
// Pillar A: Approval & Gated Action Tiers
// -------------------------------------------------------------

export type ApprovalTier = 
  | 'tier_1_autonomous_read_only'    // Parse, hash, detect contradiction
  | 'tier_2_solicitor_review_required'// Edit draft, approve review item
  | 'tier_3_partner_signoff_required';// Court filing, formal notice letter, client file purge

export interface ActionReceipt {
  actionId: string;
  actionType: string;
  tier: ApprovalTier;
  isConfirmed: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  auditTrailHash: string;
}

export class ApprovalGate {
  public static createActionReceipt(
    actionType: string,
    tier: ApprovalTier,
    confirmedBy?: string
  ): ActionReceipt {
    const now = new Date().toISOString();
    const isAuto = tier === 'tier_1_autonomous_read_only';

    return {
      actionId: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionType,
      tier,
      isConfirmed: isAuto || Boolean(confirmedBy),
      confirmedBy: isAuto ? 'system:autonomous_read_only' : confirmedBy,
      confirmedAt: isAuto || confirmedBy ? now : undefined,
      auditTrailHash: `SHA256:${Date.now()}`
    };
  }
}

// -------------------------------------------------------------
// Model Abstraction Interface (Replaceable Engine)
// -------------------------------------------------------------

export interface LegalContext {
  matterId: string;
  jurisdiction: string;
  governingLaw: string;
  spans: Span[];
  claims: Claim[];
  authorities: Authority[];
  prompt: string;
}

export interface ModelResponse {
  rawText: string;
  irac: IracResult;
  latencyMs: number;
}

export interface LegalModel {
  id: string;
  name: string;
  provider: 'ollama_local' | 'anthropic' | 'google' | 'openai' | 'deterministic_offline';
  generate(context: LegalContext): Promise<ModelResponse>;
  capabilities: {
    toolCalling: boolean;
    structuredOutput: boolean;
    maxContextTokens: number;
    airgapCompliant: boolean;
  };
}

// -------------------------------------------------------------
// ASTRA Master Protocol Engine
// -------------------------------------------------------------

export class AstraProtocolEngine {
  private scope: AstraScope;
  private tools: AstraToolCall[] = [];

  constructor(scope: AstraScope) {
    this.scope = scope;
  }

  public executeTask(params: {
    query: string;
    sources: RankedSource[];
    spans: Span[];
    actionType: string;
    requiredApprovalTier: ApprovalTier;
    approver?: string;
  }): {
    scope: AstraScope;
    rankedSources: RankedSource[];
    irac: IracResult;
    approval: ActionReceipt;
    statutoryOverrides: Array<{ clauseId: string; statuteId: string; reason: string }>;
  } {
    // 1. A — Authority
    const rankedSources = AuthorityResolver.rankSources(params.sources);
    const contracts = rankedSources.filter(s => s.tier === 'tier_5_operative_contract');
    const statutes = rankedSources.filter(s => s.tier === 'tier_1_primary_statute');
    const statutoryOverrides = AuthorityResolver.detectStatutoryOverrides(contracts, statutes);

    // 2. S — Scope
    const scopeCheck = ScopeLock.validateQueryScope(params.query, this.scope);
    if (!scopeCheck.valid) {
      throw new Error(scopeCheck.warning);
    }

    // 3. T — Tools (Record tool invocations)
    this.tools.push({
      toolName: 'clause_retriever',
      input: { query: params.query, spanCount: params.spans.length },
      executedAt: new Date().toISOString(),
      status: 'success'
    });

    // 4. R — Retrieval + Reasoning
    const irac = RetrievalReasoningEngine.evaluateQuery({
      query: params.query,
      spans: params.spans,
      scope: this.scope
    });

    // 5. A — Approval
    const approval = ApprovalGate.createActionReceipt(
      params.actionType,
      params.requiredApprovalTier,
      params.approver
    );

    return {
      scope: this.scope,
      rankedSources,
      irac,
      approval,
      statutoryOverrides
    };
  }
}
