import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Draft, 
  ReviewItem 
} from '../../types/index.ts';

export const CONTRACT_MATTER_ID = 'matter-novacorp-meridian-2026';

export const CONTRACT_MATTER: Matter = {
  id: CONTRACT_MATTER_ID,
  title: 'NovaCorp Solutions v Meridian Cloud Technologies Ltd',
  jurisdiction: 'England and Wales',
  clientAlias: 'NovaCorp Solutions Inc',
  matterType: 'contract',
  status: 'active',
  createdAt: '2026-09-24T00:00:00Z',
  updatedAt: '2026-09-24T00:00:00Z',
  isDemo: false,
  notes: 'B2B SaaS Master Services Agreement audit highlighting uncapped customer indemnity and conflicting payment terms.'
};

// 1. Master Services Agreement (MSA) text
const DOC_MSA_RAW = `MASTER CLOUD SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is entered into as of 10 February 2026 by and between Meridian Cloud Technologies Ltd ("Provider"), a private limited company registered in England and Wales, and NovaCorp Solutions Inc ("Customer").

RECITALS
WHEREAS, Provider provides enterprise database orchestration and cloud infrastructure services;
WHEREAS, Customer desires to procure said cloud services subject to the terms and conditions herein.

NOW, THEREFORE, the parties agree as follows:

Section 1: Definitions and Provision of Services
Provider shall make available the Cloud Infrastructure Services described in each executed Order Form in accordance with standard availability SLAs.

Section 4: Fees and Payment Terms
4.1 Fees. Customer shall pay all subscription fees specified in applicable Order Forms.
4.2 Invoicing Cadence. All undisputed invoices shall be due and payable within thirty (30) days from the invoice date. Late payments shall accrue interest at 4% above Barclays Bank base rate.

Section 6: Confidentiality
Each party agrees to hold the other party's Confidential Information in confidence using the same degree of care it uses for its own confidential information, for a period of five (5) years following disclosure.

Section 8: Indemnification
8.1 Customer Indemnity. Customer shall defend, indemnify, and hold harmless Provider, its officers, directors, and affiliates against any and all claims, liabilities, damages, losses, and legal costs arising out of or related to third-party claims concerning Customer data, intellectual property infringement allegations, or breaches of acceptable use. This indemnity obligation shall be primary and uncapped by any monetary limitation.

Section 9: Limitation of Liability
9.1 General Cap. Except for obligations arising under Section 8 (Indemnification) and gross negligence, each party's aggregate liability under this Agreement shall not exceed the total fees paid by Customer in the twelve (12) months preceding the incident.

Section 11: Term and Termination
This Agreement commences on the Effective Date for an initial term of twelve (12) months and will automatically renew for successive 12-month periods unless either party delivers written notice of non-renewal at least thirty (30) days prior to the expiration of the then-current term.

Section 13: Governing Law and Jurisdiction
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.

Exhibit B: Order Form & Payment Schedule
Service Tier: Enterprise Multi-Region Cluster
Annual Recurring Revenue: £180,000.00 GBP
Billing Frequency: Quarterly in advance
Payment Terms: Net 60 days from invoice receipt upon verification of service availability.`.replace(/\r\n/g, '\n');

// Build Document record
export const CONTRACT_DOCUMENTS: Document[] = [
  {
    id: 'doc-msa-meridian-001',
    matterId: CONTRACT_MATTER_ID,
    filename: 'Meridian_Master_Cloud_Agreement_2026.pdf',
    mime: 'application/pdf',
    sha256: '9f83a42d87b3294c6d02951f28b3a726645281e05d8f619b049fae5e6e32d881',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2026-02-10',
    extractionStatus: 'success',
    pageCount: 6,
    text: DOC_MSA_RAW,
    privacyLabel: 'Confidential B2B Commercial'
  }
];

// Helper for exact offset derivation
function getOffsets(rawText: string, exactSnippet: string) {
  const start = rawText.indexOf(exactSnippet);
  if (start === -1) {
    throw new Error(`Snippet not found in text: "${exactSnippet.slice(0, 30)}..."`);
  }
  return {
    startOffset: start,
    endOffset: start + exactSnippet.length,
    exactText: exactSnippet
  };
}

// Spans for key clauses
const SNIPPET_PAYMENT_30 = 'All undisputed invoices shall be due and payable within thirty (30) days from the invoice date.';
const SNIPPET_PAYMENT_60 = 'Payment Terms: Net 60 days from invoice receipt upon verification of service availability.';
const SNIPPET_UNCAPPED_INDEMNITY = 'Customer shall defend, indemnify, and hold harmless Provider, its officers, directors, and affiliates against any and all claims, liabilities, damages, losses, and legal costs arising out of or related to third-party claims concerning Customer data, intellectual property infringement allegations, or breaches of acceptable use. This indemnity obligation shall be primary and uncapped by any monetary limitation.';
const SNIPPET_LIABILITY_CARVEOUT = 'Except for obligations arising under Section 8 (Indemnification) and gross negligence, each party\'s aggregate liability under this Agreement shall not exceed the total fees paid by Customer in the twelve (12) months preceding the incident.';
const SNIPPET_DELAWARE_LAW = 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.';

const offPayment30 = getOffsets(DOC_MSA_RAW, SNIPPET_PAYMENT_30);
const offPayment60 = getOffsets(DOC_MSA_RAW, SNIPPET_PAYMENT_60);
const offIndemnity = getOffsets(DOC_MSA_RAW, SNIPPET_UNCAPPED_INDEMNITY);
const offLiabilityCap = getOffsets(DOC_MSA_RAW, SNIPPET_LIABILITY_CARVEOUT);
const offDelaware = getOffsets(DOC_MSA_RAW, SNIPPET_DELAWARE_LAW);

export const CONTRACT_SPANS: Span[] = [
  {
    id: 'span-msa-pay30',
    documentId: 'doc-msa-meridian-001',
    startOffset: offPayment30.startOffset,
    endOffset: offPayment30.endOffset,
    exactText: offPayment30.exactText,
    checksum: 'sha256-pay30-simulated',
    text: offPayment30.exactText
  },
  {
    id: 'span-msa-pay60',
    documentId: 'doc-msa-meridian-001',
    startOffset: offPayment60.startOffset,
    endOffset: offPayment60.endOffset,
    exactText: offPayment60.exactText,
    checksum: 'sha256-pay60-simulated',
    text: offPayment60.exactText
  },
  {
    id: 'span-msa-indemnity',
    documentId: 'doc-msa-meridian-001',
    startOffset: offIndemnity.startOffset,
    endOffset: offIndemnity.endOffset,
    exactText: offIndemnity.exactText,
    checksum: 'sha256-indemnity-simulated',
    text: offIndemnity.exactText
  },
  {
    id: 'span-msa-liability',
    documentId: 'doc-msa-meridian-001',
    startOffset: offLiabilityCap.startOffset,
    endOffset: offLiabilityCap.endOffset,
    exactText: offLiabilityCap.exactText,
    checksum: 'sha256-liability-simulated',
    text: offLiabilityCap.exactText
  },
  {
    id: 'span-msa-delaware',
    documentId: 'doc-msa-meridian-001',
    startOffset: offDelaware.startOffset,
    endOffset: offDelaware.endOffset,
    exactText: offDelaware.exactText,
    checksum: 'sha256-delaware-simulated',
    text: offDelaware.exactText
  }
];

export const CONTRACT_CLAIMS: Claim[] = [
  {
    id: 'claim-contract-pay-conflict',
    matterId: CONTRACT_MATTER_ID,
    statement: 'Agreement contains contradictory payment terms: Section 4.2 stipulates Net 30, whereas Exhibit B stipulates Net 60.',
    kind: 'fact',
    polarity: 'adverse',
    status: 'contested',
    updatedAt: '2026-09-24T00:00:00Z',
    provenanceEdges: [
      {
        id: 'edge-c-pay30',
        claimId: 'claim-contract-pay-conflict',
        spanId: 'span-msa-pay30',
        type: 'contradicts',
        author: 'rule',
        rationale: 'Stipulates 30-day invoice payment cycle.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-c-pay60',
        claimId: 'claim-contract-pay-conflict',
        spanId: 'span-msa-pay60',
        type: 'contradicts',
        author: 'rule',
        rationale: 'Stipulates Net 60 days payment schedule in Exhibit B.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ]
  },
  {
    id: 'claim-contract-indemnity-risk',
    matterId: CONTRACT_MATTER_ID,
    statement: 'Clause 8.1 imposes an uncapped unilateral indemnity on Customer for third-party claims, explicitly carved out from liability caps.',
    kind: 'fact',
    polarity: 'adverse',
    status: 'supported',
    updatedAt: '2026-09-24T00:00:00Z',
    provenanceEdges: [
      {
        id: 'edge-c-indemnity',
        claimId: 'claim-contract-indemnity-risk',
        spanId: 'span-msa-indemnity',
        type: 'supports',
        author: 'model',
        rationale: 'Explicitly designates indemnity obligation as primary and uncapped.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-c-liability',
        claimId: 'claim-contract-indemnity-risk',
        spanId: 'span-msa-liability',
        type: 'supports',
        author: 'rule',
        rationale: 'Excludes Section 8 indemnity from general 12-month fee liability cap.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ]
  }
];

export const CONTRACT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-c-1',
    matterId: CONTRACT_MATTER_ID,
    type: 'contradiction',
    severity: 'high',
    title: 'Payment Terms Conflict: Section 4.2 vs Exhibit B',
    description: 'Section 4.2 requires payment within 30 days, while Exhibit B specifies Net 60 days. Risk of invoice disputes.',
    status: 'pending',
    claimId: 'claim-contract-pay-conflict',
    createdAt: '2026-09-24T00:00:00Z'
  },
  {
    id: 'rev-c-2',
    matterId: CONTRACT_MATTER_ID,
    type: 'contract_risk',
    severity: 'high',
    title: 'Uncapped Unilateral Customer Indemnity in Section 8.1',
    description: 'Customer is exposed to unlimited third-party damages without reciprocal protection from Provider.',
    status: 'pending',
    claimId: 'claim-contract-indemnity-risk',
    createdAt: '2026-09-24T00:00:00Z'
  }
];

export const CONTRACT_DRAFT: Draft = {
  id: 'draft-contract-redline-001',
  matterId: CONTRACT_MATTER_ID,
  title: 'Executive Legal Review & Markup — Meridian Cloud MSA',
  type: 'contract_redline',
  status: 'ready_for_review',
  reviewStatus: 'ready_for_review',
  generatedBy: 'deterministic_offline',
  version: 1,
  blocks: [
    {
      id: 'cb-1',
      heading: '1. Executive Summary',
      text: 'This review assesses the Meridian Cloud Master Services Agreement (dated 10 February 2026) for NovaCorp Solutions Inc. The agreement contains two critical risk areas requiring redline markup before execution: an uncapped unilateral indemnity and a direct contradiction between payment schedules.',
      claimIds: ['claim-contract-pay-conflict', 'claim-contract-indemnity-risk'],
      spanIds: [],
      reviewStatus: 'verified'
    },
    {
      id: 'cb-2',
      heading: '2. Payment Terms Harmonisation',
      text: 'Section 4.2 stipulates a 30-day payment cycle, whereas Exhibit B (Order Form) specifies Net 60 days. We recommend amending Section 4.2 to specify Net 60 days or clarifying that Exhibit B takes legal precedence in the event of conflict.',
      claimIds: ['claim-contract-pay-conflict'],
      spanIds: [],
      reviewStatus: 'needs_review'
    },
    {
      id: 'cb-3',
      heading: '3. Indemnity & Liability Cap Alignment',
      text: 'Clause 8.1 currently exposes NovaCorp to uncapped third-party liability without reciprocal protection. Section 9 explicitly carves out Clause 8.1 from the 12-month liability cap. Redline must cap Section 8 at 12 months fees paid or make indemnities strictly mutual with mutual caps.',
      claimIds: ['claim-contract-indemnity-risk'],
      spanIds: [],
      reviewStatus: 'needs_review'
    }
  ],
  createdAt: '2026-09-24T00:00:00Z',
  updatedAt: '2026-09-24T00:00:00Z'
};
