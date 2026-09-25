import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Draft, 
  ReviewItem 
} from '../../types/index.ts';

export const TENANCY_MATTER_ID = 'matter-thorne-oakridge-2026';
export const CANARY_SECRET_TENANCY_TOKEN = 'CANARY_SECRET_TENANCY_TOKEN_XYZ991';

export const TENANCY_MATTER: Matter = {
  id: TENANCY_MATTER_ID,
  title: 'Thorne v Oakridge Estates Ltd',
  jurisdiction: 'England and Wales',
  clientAlias: 'Dr Marcus Thorne',
  matterType: 'tenancy',
  status: 'active',
  createdAt: '2026-09-24T00:00:00Z',
  updatedAt: '2026-09-24T00:00:00Z',
  isDemo: false,
  notes: 'Tenancy disrepair (Category 1 mould hazard) and unlawful deposit withholding under Housing Act 2004.'
};

// 1. Tenancy Agreement
const DOC_AST_RAW = `ASSURED SHORTHOLD TENANCY AGREEMENT
Landlord: Oakridge Estates Ltd (Company No. 08912344)
Tenant: Dr Marcus Thorne
Property: Flat 3B, 28 Kensington Gardens Square, London, W2 4BG
Term: 12 months commencing 1 September 2025
Monthly Rent: £2,200.00
Deposit: £2,200.00 held under custodial deposit scheme.

Key Provisions:
Clause 5: Deposit Protection. Landlord covenants to protect the security deposit in an authorised government tenancy deposit scheme within thirty (30) days of receipt in accordance with the Housing Act 2004.
Clause 12: Repair Obligations. The Landlord shall keep in repair the structure and exterior of the dwelling-house, including drains, gutters and external pipes, pursuant to Section 11 of the Landlord and Tenant Act 1985.
Canary Reference: ${CANARY_SECRET_TENANCY_TOKEN}`.replace(/\r\n/g, '\n');

// 2. Independent Surveyor Report
const DOC_SURVEY_RAW = `EXPERT ENVIRONMENTAL HEALTH INSPECTION REPORT
Premises: Flat 3B, 28 Kensington Gardens Square, London, W2 4BG
Inspecting Surveyor: David Gallagher MRICS, Apex Building Surveyors
Inspection Date: 14 March 2026

Summary of Findings:
1. Severe mould growth (Stachybotrys chartarum) and extensive moisture staining detected in the rear master bedroom and adjacent hallway.
2. Electronic moisture meter readings exceeded 99.9% WME along the external wall perimeter.
3. External building inspection identified a fractured cast-iron hopper head and severed rainwater downpipe directly above the bedroom elevation, causing continuous rainwater saturation of external brickwork.
4. HHSRS Rating: Category 1 Hazard (Damp and Mould) under Housing Health and Safety Rating System (Housing Act 2004).
5. Causation: The defect is structural and external, wholly unrelated to tenant lifestyle or domestic condensation.`.replace(/\r\n/g, '\n');

// 3. Landlord refusal email
const DOC_LANDLORD_EMAIL_RAW = `From: management@oakridge-estates.co.uk
To: marcus.thorne@imperial.ac.uk
Date: Mon, 16 Mar 2026 14:10:02 +0000
Subject: Maintenance Notice - Flat 3B Kensington Gardens Square

Dear Dr Thorne,

Following your email, we have reviewed the photographs. It is obvious to our property manager that the black marks on the bedroom wall are the direct result of tenant lifestyle choices, specifically drying wet laundry on radiators without operating window trickle vents.

Oakridge Estates disclaims any responsibility for repainting or mould eradication. Furthermore, should this staining persist at check-out, we intend to deduct the full £2,200.00 deposit to cover re-plastering costs.

Yours sincerely,
Property Management Department
Oakridge Estates Ltd`.replace(/\r\n/g, '\n');

// Document Records
export const TENANCY_DOCUMENTS: Document[] = [
  {
    id: 'doc-ast-oakridge-001',
    matterId: TENANCY_MATTER_ID,
    filename: 'Assured_Shorthold_Tenancy_Agreement.pdf',
    mime: 'application/pdf',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2025-09-01',
    extractionStatus: 'success',
    pageCount: 8,
    text: DOC_AST_RAW,
    privacyLabel: 'Confidential Tenancy Record'
  },
  {
    id: 'doc-survey-mould-002',
    matterId: TENANCY_MATTER_ID,
    filename: 'Expert_Environmental_Health_Report.pdf',
    mime: 'application/pdf',
    sha256: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef1',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2026-03-14',
    extractionStatus: 'success',
    pageCount: 12,
    text: DOC_SURVEY_RAW,
    privacyLabel: 'Expert Witness Evidence'
  },
  {
    id: 'doc-email-landlord-refusal-003',
    matterId: TENANCY_MATTER_ID,
    filename: 'Landlord_Refusal_Email_16Mar2026.eml',
    mime: 'message/rfc822',
    sha256: 'c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef2',
    importedAt: '2026-09-24T00:00:00Z',
    sourceDate: '2026-03-16',
    extractionStatus: 'success',
    pageCount: 1,
    text: DOC_LANDLORD_EMAIL_RAW,
    privacyLabel: 'Adverse Party Correspondence'
  }
];

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

const SNIPPET_STRUCTURAL_GUTTER = 'External building inspection identified a fractured cast-iron hopper head and severed rainwater downpipe directly above the bedroom elevation, causing continuous rainwater saturation of external brickwork.';
const SNIPPET_SURVEY_UNRELATED = 'Causation: The defect is structural and external, wholly unrelated to tenant lifestyle or domestic condensation.';
const SNIPPET_LANDLORD_LIFESTYLE = 'It is obvious to our property manager that the black marks on the bedroom wall are the direct result of tenant lifestyle choices, specifically drying wet laundry on radiators without operating window trickle vents.';
const SNIPPET_S11_OBLIGATION = 'The Landlord shall keep in repair the structure and exterior of the dwelling-house, including drains, gutters and external pipes, pursuant to Section 11 of the Landlord and Tenant Act 1985.';

const offGutter = getOffsets(DOC_SURVEY_RAW, SNIPPET_STRUCTURAL_GUTTER);
const offSurveyCausation = getOffsets(DOC_SURVEY_RAW, SNIPPET_SURVEY_UNRELATED);
const offLandlordBlame = getOffsets(DOC_LANDLORD_EMAIL_RAW, SNIPPET_LANDLORD_LIFESTYLE);
const offS11 = getOffsets(DOC_AST_RAW, SNIPPET_S11_OBLIGATION);

export const TENANCY_SPANS: Span[] = [
  {
    id: 'span-t-gutter',
    documentId: 'doc-survey-mould-002',
    startOffset: offGutter.startOffset,
    endOffset: offGutter.endOffset,
    exactText: offGutter.exactText,
    checksum: 'c120cd160b00a49eeb7ada175355979ac3917ae063a0ee72c9df5174f4f7a35f',
    text: offGutter.exactText
  },
  {
    id: 'span-t-survey-cause',
    documentId: 'doc-survey-mould-002',
    startOffset: offSurveyCausation.startOffset,
    endOffset: offSurveyCausation.endOffset,
    exactText: offSurveyCausation.exactText,
    checksum: 'b3b6d2507bb44299d507b635b2f2586838e59691314cc6c86940f3dc70d01060',
    text: offSurveyCausation.exactText
  },
  {
    id: 'span-t-landlord-blame',
    documentId: 'doc-email-landlord-refusal-003',
    startOffset: offLandlordBlame.startOffset,
    endOffset: offLandlordBlame.endOffset,
    exactText: offLandlordBlame.exactText,
    checksum: 'e8c4837c75a1e8775d94f088059f408466da39a474b2640d68d4d2f763fa628c',
    text: offLandlordBlame.exactText
  },
  {
    id: 'span-t-s11',
    documentId: 'doc-ast-oakridge-001',
    startOffset: offS11.startOffset,
    endOffset: offS11.endOffset,
    exactText: offS11.exactText,
    checksum: 'ae165869c5291ab7a233a19865e6b1db1103e9bca44cf1ac7ad0a488a3f7d431',
    text: offS11.exactText
  }
];

export const TENANCY_CLAIMS: Claim[] = [
  {
    id: 'claim-t-causation-dispute',
    matterId: TENANCY_MATTER_ID,
    statement: 'Landlord asserts mould is caused by tenant drying laundry, whereas independent surveyor establishes external rainwater downpipe failure.',
    kind: 'fact',
    polarity: 'favourable',
    status: 'contested',
    updatedAt: '2026-09-24T00:00:00Z',
    provenanceEdges: [
      {
        id: 'edge-t-survey',
        claimId: 'claim-t-causation-dispute',
        spanId: 'span-t-survey-cause',
        type: 'supports',
        author: 'model',
        rationale: 'Surveyor directly excludes lifestyle causation.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-t-landlord',
        claimId: 'claim-t-causation-dispute',
        spanId: 'span-t-landlord-blame',
        type: 'contradicts',
        author: 'rule',
        rationale: 'Landlord alleges tenant lifestyle causes damage.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ]
  },
  {
    id: 'claim-t-statutory-breach',
    matterId: TENANCY_MATTER_ID,
    statement: 'Oakridge Estates Ltd is in continuing breach of statutory repairing obligations under s.11 Landlord and Tenant Act 1985.',
    kind: 'legal_proposition',
    polarity: 'favourable',
    status: 'supported',
    updatedAt: '2026-09-24T00:00:00Z',
    provenanceEdges: [
      {
        id: 'edge-t-s11',
        claimId: 'claim-t-statutory-breach',
        spanId: 'span-t-s11',
        type: 'supports',
        author: 'rule',
        rationale: 'Clause 12 covenants to repair structure and exterior pursuant to s.11.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      },
      {
        id: 'edge-t-gutter',
        claimId: 'claim-t-statutory-breach',
        spanId: 'span-t-gutter',
        type: 'supports',
        author: 'human',
        rationale: 'Survey proves defective gutters and downpipes caused saturation.',
        reviewState: 'approved',
        createdAt: '2026-09-24T00:00:00Z'
      }
    ]
  }
];

export const TENANCY_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-t-1',
    matterId: TENANCY_MATTER_ID,
    type: 'contradiction',
    severity: 'high',
    title: 'Disrepair Causation Contradiction (Surveyor vs Landlord)',
    description: 'Landlord blames laundry drying, while MRICS surveyor proves external cast-iron downpipe failure.',
    status: 'pending',
    claimId: 'claim-t-causation-dispute',
    createdAt: '2026-09-24T00:00:00Z'
  }
];

export const TENANCY_DRAFT: Draft = {
  id: 'draft-tenancy-claim-001',
  matterId: TENANCY_MATTER_ID,
  title: 'Letter Before Claim (Disrepair & Deposit Withholding) — Thorne v Oakridge',
  type: 'client_letter',
  status: 'ready_for_review',
  reviewStatus: 'ready_for_review',
  generatedBy: 'deterministic_offline',
  version: 1,
  blocks: [
    {
      id: 'tb-1',
      heading: '1. The Parties and Tenancy',
      text: 'We represent Dr Marcus Thorne in respect of his tenancy of Flat 3B, 28 Kensington Gardens Square, London, W2 4BG pursuant to the tenancy agreement dated 1 September 2025.',
      claimIds: [],
      spanIds: [],
      reviewStatus: 'verified'
    },
    {
      id: 'tb-2',
      heading: '2. The Disrepair and Breach of Statutory Duty',
      text: 'An expert inspection by David Gallagher MRICS on 14 March 2026 confirmed a Category 1 HHSRS Damp and Mould hazard caused by a fractured external rainwater downpipe. This constitutes an ongoing breach of Section 11 of the Landlord and Tenant Act 1985.',
      claimIds: ['claim-t-causation-dispute', 'claim-t-statutory-breach'],
      spanIds: ['span-t-survey-cause', 'span-t-gutter'],
      reviewStatus: 'verified'
    },
    {
      id: 'tb-3',
      heading: '3. Remedies and Required Action',
      text: 'Our client requires: (1) immediate commencement of external remedial works within 14 days, (2) unconditional confirmation that the £2,200.00 deposit remains protected and will not be deducted, and (3) reasonable general damages for loss of amenity.',
      claimIds: ['claim-t-statutory-breach'],
      spanIds: ['span-t-s11'],
      reviewStatus: 'verified'
    }
  ],
  createdAt: '2026-09-24T00:00:00Z',
  updatedAt: '2026-09-24T00:00:00Z'
};
