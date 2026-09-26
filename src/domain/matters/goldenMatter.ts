/**
 * ATKIN Golden Matter Definition
 * Sections 72 & 73: The Golden Fictional Commercial Matter
 *
 * Alder Peak Systems Ltd v Highfield Logistics Group Ltd
 * Comprehensive multi-document dispute used for sovereign offline verification and demo.
 */

import type { Matter, Document, Span, Claim, ReviewItem, Authority } from '../../types/index.ts';
import { COMMERCIAL_CONTRACT_AUTHORITIES } from '../../db/fixtures/authorities.ts';

export const GOLDEN_MATTER_ID = 'matter-golden-alder-peak';

export const GOLDEN_MATTER: Matter = {
  id: GOLDEN_MATTER_ID,
  title: 'Alder Peak Systems Ltd v Highfield Logistics Group Ltd',
  jurisdiction: 'England and Wales',
  clientAlias: 'Highfield Logistics Group Ltd',
  matterType: 'contract',
  status: 'active',
  workspaceType: 'demo',
  isDemo: true,
  createdAt: '2026-04-12T09:00:00Z',
  updatedAt: '2026-04-29T14:30:00Z',
  notes: 'Commercial software implementation dispute concerning Clause 3.2 termination notice, Deed of Variation fee increase, and disputed Milestone 2 invoice.'
};

// Document 1: Master Services Agreement
export const GOLDEN_DOC_MSA_TEXT = `MASTER SERVICES AGREEMENT (LOGISTICS PLATFORM)
Date of Agreement: 12 March 2026
PARTIES:
(1) HIGHFIELD LOGISTICS GROUP LTD, a company incorporated in England and Wales under company number 08912344, whose registered office is at Highfield House, 14 St John Street, Leeds, LS1 2ED ("Customer"); and
(2) ALDER PEAK SYSTEMS LTD, a company incorporated in England and Wales, having its principal place of business at Unit 4B, St Ann's Enterprise Park, Newcastle upon Tyne, NE1 2PZ ("Supplier").

BACKGROUND:
(A) The Customer operates freight forwarding and cold-chain logistics operations in the United Kingdom.
(B) The Supplier specializes in automated warehouse inventory routing and telematics software.
(C) The Customer wishes to engage the Supplier to license, customize, and maintain an enterprise logistics routing platform.

OPERATIVE PROVISIONS:
1. DEFINITIONS AND INTERPRETATION
1.1 "Services" means the software configuration, cloud deployment, and API integration described in Schedule 1.
1.2 "Effective Date" means 12 March 2026.

2. FEES AND PAYMENT
2.1 In consideration of the provision of the Services, the Customer shall pay to the Supplier a total fixed implementation price of £14,500 (excluding Value Added Tax).
2.2 Payment shall be staged across Milestone 1 (£7,000 upon contract execution) and Milestone 2 (£7,500 upon platform user acceptance testing).
2.3 Invoices shall be payable within thirty (30) calendar days from receipt of a valid VAT invoice.

3. TERM AND TERMINATION
3.1 This Agreement shall commence on the Effective Date and continue until completed in accordance with Schedule 1 unless terminated earlier in accordance with this Clause 3.
3.2 Either party may terminate this Agreement without cause upon giving not less than 37 days' prior written notice to the other party.
3.3 Either party may terminate immediately by written notice if the other party commits a material breach which is irremediable or fails to remedy within 14 days.

4. LIMITATION OF LIABILITY
4.1 Neither party excludes or limits liability for death or personal injury caused by negligence or fraud.
4.2 Subject to Clause 4.1, the aggregate liability of either party shall not exceed 100% of the total fees paid or payable under this Agreement.

5. GOVERNING LAW AND JURISDICTION
5.1 This Agreement and any dispute or claim arising out of or in connection with it shall be governed by and construed in accordance with the law of England and Wales.
5.2 The courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim.`;

// Document 2: Deed of Variation and Amendment
export const GOLDEN_DOC_VARIATION_TEXT = `DEED OF VARIATION AND AMENDMENT (LOGISTICS PLATFORM)
Date of Deed: 28 April 2026
PARTIES:
(1) HIGHFIELD LOGISTICS GROUP LTD ("Customer"); and
(2) ALDER PEAK SYSTEMS LTD ("Supplier").

RECITALS:
(A) The parties entered into a Master Services Agreement dated 12 March 2026 ("Original Agreement").
(B) The parties have agreed to vary the agreed price for Milestone 2 software deliverables as set out herein.

NOW THIS DEED WITNESSETH AS FOLLOWS:
1. VARIATION OF CLAUSE 2.1 (FEES)
1.1 Clause 2.1 of the Original Agreement is hereby deleted in its entirety and replaced with the following:
"2.1 In consideration of the provision of the Services, the Customer shall pay to the Supplier a revised total fixed implementation price of £17,900 (excluding Value Added Tax)."

2. CONTINUANCE OF REMAINING TERMS
2.1 Save as varied by Clause 1 of this Deed, the Original Agreement (including all termination provisions and Clause 3.2 notice requirements) shall continue in full force and effect.

IN WITNESS WHEREOF the parties have executed this Deed.
Signed for and on behalf of Highfield Logistics Group Ltd: [Signature]
Signed for and on behalf of Alder Peak Systems Ltd: [Signature]`;

// Document 3: Disputed Invoice
export const GOLDEN_DOC_INVOICE_TEXT = `INVOICE: INV-2026-8921
ISSUER: Alder Peak Systems Ltd, Unit 4B, St Ann's Enterprise Park, Newcastle upon Tyne, NE1 2PZ
BILLED TO: Highfield Logistics Group Ltd, Highfield House, 14 St John Street, Leeds, LS1 2ED
DATE: 29 April 2026
DUE DATE: 13 May 2026 (14 Days)

ITEM: Milestone 2 Platform Delivery & Variation Uplift
AMOUNT: £10,900.00 + VAT (£2,180.00) = £13,080.00
REMARKS: Balance of revised total fee £17,900.00 pursuant to Deed of Variation dated 28 April 2026.
Payment terms requested: 14 days.`;

// Document 4: Witness Statement of Marcus Vance
export const GOLDEN_DOC_WITNESS_TEXT = `IN THE HIGH COURT OF JUSTICE
BUSINESS AND PROPERTY COURTS OF ENGLAND AND WALES
COMMERCIAL COURT (KBD)
CLAIM NO: CL-2026-004412

BETWEEN:
ALDER PEAK SYSTEMS LTD (Claimant)
- and -
HIGHFIELD LOGISTICS GROUP LTD (Defendant)

FIRST WITNESS STATEMENT OF MARCUS VANCE
I, MARCUS VANCE, of Highfield Logistics Group Ltd, Highfield House, 14 St John Street, Leeds, LS1 2ED, state as follows:

1. I am the Operations Director of Highfield Logistics Group Ltd. I make this statement in support of the Defendant's application and defence.
2. On 12 March 2026, Highfield entered into the Master Services Agreement with Alder Peak Systems Ltd.
3. Crucially, Clause 3.2 of the agreement provided that either party could terminate without cause upon giving 37 days' written notice. We specifically negotiated 37 days rather than the standard 30 days to protect our quarterly dispatch planning.
4. On 28 April 2026, we signed a Deed of Variation regarding Milestone 2 pricing, but that Deed expressly reaffirmed all other provisions including Clause 3.2.
5. On 29 April 2026, Alder Peak issued Invoice INV-2026-8921 demanding payment within 14 days, contrary to Clause 2.3 of the Master Agreement which stipulates 30 calendar days.
6. The Claimant's claim that we breached the contract is wholly denied.

STATEMENT OF TRUTH:
I believe that the facts stated in this witness statement are true.
Signed: Marcus Vance
Dated: 15 May 2026`;

export const GOLDEN_DOCUMENTS: Document[] = [
  {
    id: 'doc-golden-msa',
    matterId: GOLDEN_MATTER_ID,
    filename: 'Alder_Peak_Master_Services_Agreement_2026.txt',
    mime: 'text/plain',
    sha256: '7c6f05e49c71a396225b68904e2865913bc5486faec4811a0da115ec6287c699',
    importedAt: '2026-04-12T09:00:00Z',
    sourceDate: '2026-03-12',
    extractionStatus: 'success',
    pageCount: 3,
    text: GOLDEN_DOC_MSA_TEXT,
    privacyLabel: 'Confidential Commercial Contract'
  },
  {
    id: 'doc-golden-variation',
    matterId: GOLDEN_MATTER_ID,
    filename: 'Alder_Peak_Deed_of_Variation_2026.txt',
    mime: 'text/plain',
    sha256: 'c86c1ddba046ef92be14ae508930438cfef285701fae2cb3298c991c015b3e24',
    importedAt: '2026-04-28T16:00:00Z',
    sourceDate: '2026-04-28',
    extractionStatus: 'success',
    pageCount: 1,
    text: GOLDEN_DOC_VARIATION_TEXT,
    privacyLabel: 'Deed of Amendment'
  },
  {
    id: 'doc-golden-invoice',
    matterId: GOLDEN_MATTER_ID,
    filename: 'Highfield_Invoice_INV-8921.txt',
    mime: 'text/plain',
    sha256: '2f0b9fbc7dc6ef8292839a8cbe073c683838dafe52136018ba2ef9cb02882194',
    importedAt: '2026-04-29T10:00:00Z',
    sourceDate: '2026-04-29',
    extractionStatus: 'success',
    pageCount: 1,
    text: GOLDEN_DOC_INVOICE_TEXT,
    privacyLabel: 'Disputed Commercial Invoice'
  },
  {
    id: 'doc-golden-witness',
    matterId: GOLDEN_MATTER_ID,
    filename: 'Witness_Statement_Marcus_Vance.txt',
    mime: 'text/plain',
    sha256: '8b7d41f0bce427a134d1937ceea91ff53457a44f509e5dc643d9eb7ca2dbb9e1',
    importedAt: '2026-05-15T11:00:00Z',
    sourceDate: '2026-05-15',
    extractionStatus: 'success',
    pageCount: 2,
    text: GOLDEN_DOC_WITNESS_TEXT,
    privacyLabel: 'Court Witness Statement'
  }
];

export const GOLDEN_CLAIMS: Claim[] = [
  {
    id: 'claim-notice-37-days',
    matterId: GOLDEN_MATTER_ID,
    kind: 'fact',
    statement: 'Either party may terminate the Master Services Agreement without cause upon giving not less than 37 days prior written notice (Clause 3.2).',
    status: 'supported',
    polarity: 'neutral',
    provenanceEdges: [],
    updatedAt: '2026-04-12T09:05:00Z'
  },
  {
    id: 'claim-fee-original',
    matterId: GOLDEN_MATTER_ID,
    kind: 'fact',
    statement: 'Original implementation fee agreed at £14,500 under Clause 2.1.',
    status: 'supported',
    polarity: 'neutral',
    provenanceEdges: [],
    updatedAt: '2026-04-12T09:05:00Z'
  },
  {
    id: 'claim-fee-varied',
    matterId: GOLDEN_MATTER_ID,
    kind: 'fact',
    statement: 'Implementation fee varied to £17,900 by Deed of Variation dated 28 April 2026.',
    status: 'supported',
    polarity: 'neutral',
    provenanceEdges: [],
    updatedAt: '2026-04-28T16:10:00Z'
  }
];

export const GOLDEN_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-conflict-fee',
    matterId: GOLDEN_MATTER_ID,
    type: 'contradiction',
    title: 'Payment Obligation Conflict: Original £14,500 vs Varied £17,900',
    description: 'Deed of Variation dated 28 April 2026 deleted and replaced Clause 2.1. Any draft pleadings or advice referencing the original £14,500 figure are stale.',
    severity: 'high',
    status: 'pending',
    resolutionNote: 'Update draft advice to reflect the varied price of £17,900 under the Deed of Variation.',
    createdAt: '2026-04-28T16:15:00Z'
  },
  {
    id: 'rev-invoice-terms',
    matterId: GOLDEN_MATTER_ID,
    type: 'contract_risk',
    title: 'Invoice Payment Terms Discrepancy (14 Days vs 30 Days)',
    description: 'Invoice INV-2026-8921 specifies payment due within 14 days, whereas Clause 2.3 of the Master Services Agreement prescribes 30 calendar days.',
    severity: 'medium',
    status: 'pending',
    resolutionNote: 'Advise client that 30-day payment term under Clause 2.3 prevails over invoice terms.',
    createdAt: '2026-04-29T10:15:00Z'
  }
];
