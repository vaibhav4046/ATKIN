import type { Matter, Document, Span, Claim, Draft, DraftBlock, DraftType } from '../types/index.ts';

export function generateDeterministicDraft(
  matter: Matter,
  documents: Document[],
  spans: Span[],
  claims: Claim[],
  type: DraftType = 'matter_brief'
): Draft {
  const spansById = new Map(spans.map(s => [s.id, s]));
  const docsById = new Map(documents.map(d => [d.id, d]));

  const purchaseClaim = claims.find(c => c.id === 'claim-purchase-delivery');
  const failureClaim = claims.find(c => c.id === 'claim-client-failure-date');
  const intakeClaim = claims.find(c => c.id === 'claim-intake-earlier-date');
  const defectClaim = claims.find(c => c.id === 'claim-inherent-defect');
  const craClaim = claims.find(c => c.id === 'claim-cra-presumption');
  const merchantClaim = claims.find(c => c.id === 'claim-merchant-unlawful-terms');

  const hasContradiction = failureClaim?.status === 'contested' || intakeClaim?.status === 'contested';

  if (type === 'client_letter') {
    const blocks: DraftBlock[] = [
      {
        id: 'blk-ltr-1',
        heading: 'RE: Defective ZenithBook Pro 15 — Statutory Rights under Consumer Rights Act 2015',
        text: `Dear Ms Vance,\n\nThank you for instructing Proofline Legal Clinic regarding the ZenithBook Pro 15 laptop purchased from ZenithTech Retail Ltd on 15 January 2026 for £1,499.00. We have completed our preliminary evidential audit of your file.`,
        claimIds: purchaseClaim ? [purchaseClaim.id] : [],
        spanIds: purchaseClaim ? purchaseClaim.provenanceEdges.map(e => e.spanId) : [],
        reviewStatus: 'verified'
      },
      {
        id: 'blk-ltr-2',
        heading: '1. Essential Factual Discrepancy Requiring Your Confirmation',
        text: `In your chronology statement, you recalled that the laptop functioned normally until 12 April 2026. However, contemporary telephony support records from ZenithTech log a call on 8 April 2026 reporting intermittent freezes. While both dates are well within your statutory 6-month protection window (delivered 18 January 2026), we must clarify this date discrepancy with you before issuing our formal Letter Before Claim to avoid giving the merchant grounds to contest your credibility.`,
        claimIds: [
          ...(failureClaim ? [failureClaim.id] : []),
          ...(intakeClaim ? [intakeClaim.id] : [])
        ],
        spanIds: [
          ...(failureClaim ? failureClaim.provenanceEdges.map(e => e.spanId) : []),
          ...(intakeClaim ? intakeClaim.provenanceEdges.map(e => e.spanId) : [])
        ],
        reviewStatus: hasContradiction ? 'needs_review' : 'verified',
        reviewReason: hasContradiction ? 'Adverse date conflict: 8 April (intake) vs 12 April (witness note).' : undefined
      },
      {
        id: 'blk-ltr-3',
        heading: '2. Your Legal Remedies under the Consumer Rights Act 2015',
        text: `Under section 9 of the Consumer Rights Act 2015, goods supplied must be of satisfactory quality. Because the motherboard failure manifested within 6 months of delivery, section 19(14) establishes a legal presumption that the defect was present at the date of delivery. ZenithTech\'s refusal based on a purported "30-day policy" is legally ineffective under section 31, and their demand for an inspection fee is improper. Apex Diagnostic Services\' report confirms this was an inherent manufacturing flaw.`,
        claimIds: [
          ...(defectClaim ? [defectClaim.id] : []),
          ...(craClaim ? [craClaim.id] : []),
          ...(merchantClaim ? [merchantClaim.id] : [])
        ],
        spanIds: [
          ...(defectClaim ? defectClaim.provenanceEdges.map(e => e.spanId) : []),
          ...(merchantClaim ? merchantClaim.provenanceEdges.map(e => e.spanId) : [])
        ],
        reviewStatus: 'verified'
      },
      {
        id: 'blk-ltr-4',
        heading: '3. Next Steps',
        text: `Once you confirm the chronology surrounding the 8 April phone call, we will serve a 14-day Letter Before Claim on ZenithTech demanding either a full refund of £1,499.00 or a brand new replacement, alongside recovery of your independent diagnostic fee.`,
        claimIds: [],
        spanIds: [],
        reviewStatus: 'verified'
      }
    ];

    return {
      id: `draft-letter-${Date.now()}`,
      matterId: matter.id,
      type: 'client_letter',
      title: 'Formal Client Advice Letter (Eleanor Vance)',
      blocks,
      generatedBy: 'deterministic_offline',
      reviewStatus: hasContradiction ? 'needs_review' : 'ready_for_review',
      updatedAt: new Date().toISOString()
    };
  }

  // Default: matter_brief
  const blocks: DraftBlock[] = [
    {
      id: 'blk-brf-1',
      heading: '1. Matter Overview & Jurisdiction',
      text: `Civil consumer dispute proceeding under the jurisdiction of England and Wales. The Claimant, Eleanor Vance, purchased a ZenithBook Pro 15 from ZenithTech Retail Ltd on 15 January 2026 for £1,499.00, delivered on 18 January 2026. The device suffered catastrophic motherboard failure within 3 months.`,
      claimIds: purchaseClaim ? [purchaseClaim.id] : [],
      spanIds: purchaseClaim ? purchaseClaim.provenanceEdges.map(e => e.spanId) : [],
      reviewStatus: 'verified'
    },
    {
      id: 'blk-brf-2',
      heading: '2. Chronology & Contested Defect Onset',
      text: `Delivery occurred on 18 January 2026. Claimant witness statement recounts complete power loss on 12 April 2026. Conversely, Defendant internal CRM logs record an incoming telephony enquiry on 8 April 2026 reporting power anomalies. This date contradiction does not compromise Claimant's statutory protection under the 6-month presumption, but requires factual alignment before formal pleading.`,
      claimIds: [
        ...(purchaseClaim ? [purchaseClaim.id] : []),
        ...(failureClaim ? [failureClaim.id] : []),
        ...(intakeClaim ? [intakeClaim.id] : [])
      ],
      spanIds: [
        ...(purchaseClaim ? purchaseClaim.provenanceEdges.map(e => e.spanId) : []),
        ...(failureClaim ? failureClaim.provenanceEdges.map(e => e.spanId) : []),
        ...(intakeClaim ? intakeClaim.provenanceEdges.map(e => e.spanId) : [])
      ],
      reviewStatus: hasContradiction ? 'needs_review' : 'verified',
      reviewReason: hasContradiction ? 'Contested onset date (8 Apr vs 12 Apr). Solicitor review required.' : undefined
    },
    {
      id: 'blk-brf-3',
      heading: '3. Forensics & Manufacturing Defect',
      text: `Independent examination by Apex Diagnostic Services Ltd confirmed VRM controller solder fatigue micro-fractures with zero user damage or liquid intrusion. The defect was latent at the date of delivery.`,
      claimIds: defectClaim ? [defectClaim.id] : [],
      spanIds: defectClaim ? defectClaim.provenanceEdges.map(e => e.spanId) : [],
      reviewStatus: 'verified'
    },
    {
      id: 'blk-brf-4',
      heading: '4. Applicable Law: Consumer Rights Act 2015',
      text: `Under CRA 2015 s.9, goods must be of satisfactory quality. Section 19(14) creates a rebuttable statutory presumption that the defect existed at delivery because it manifested within 6 months. Defendant's purported 30-day limitation and demand for a £120 fee are contrary to s.23(2) and rendered void by s.31.`,
      claimIds: [
        ...(craClaim ? [craClaim.id] : []),
        ...(merchantClaim ? [merchantClaim.id] : [])
      ],
      spanIds: merchantClaim ? merchantClaim.provenanceEdges.map(e => e.spanId) : [],
      reviewStatus: 'verified'
    },
    {
      id: 'blk-brf-5',
      heading: '5. Litigation Strategy & Pre-Action Protocol',
      text: `Dispatch formal Letter Before Claim offering 14 days for full refund or replacement plus diagnostic fee reimbursement. In default, issue County Court proceedings via Money Claims Online.`,
      claimIds: [],
      spanIds: [],
      reviewStatus: 'verified'
    }
  ];

  return {
    id: `draft-brief-${Date.now()}`,
    matterId: matter.id,
    type: 'matter_brief',
    title: 'Matter Assessment & Pre-Action Brief (England & Wales)',
    blocks,
    generatedBy: 'deterministic_offline',
    reviewStatus: hasContradiction ? 'needs_review' : 'ready_for_review',
    updatedAt: new Date().toISOString()
  };
}

export function exportDraftAsMarkdown(
  draft: Draft,
  matter: Matter,
  spansById: Map<string, Span>,
  docsById: Map<string, Document>
): string {
  const lines: string[] = [];
  lines.push(`# ${draft.title}`);
  lines.push(`**Matter**: ${matter.title} (${matter.jurisdiction})`);
  lines.push(`**Client**: ${matter.clientAlias}`);
  lines.push(`**Generated By**: ${draft.generatedBy}`);
  lines.push(`**Review State**: ${draft.reviewStatus === 'needs_review' ? '⚠️ NEEDS SOLICITOR REVIEW' : '✅ APPROVED'}`);
  lines.push(`**Date**: ${new Date(draft.updatedAt).toLocaleDateString('en-GB')}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  const referencedSpanIds = new Set<string>();

  for (const block of draft.blocks) {
    if (block.heading) {
      lines.push(`## ${block.heading}`);
    }
    if (block.reviewStatus === 'needs_review') {
      lines.push(`> [!WARNING]`);
      lines.push(`> **Evidential Review Flag**: ${block.reviewReason || 'Contradictory evidence identified.'}`);
      lines.push('');
    }
    lines.push(block.text);
    if (block.spanIds.length > 0) {
      lines.push('');
      const badgeList = block.spanIds.map(sid => {
        referencedSpanIds.add(sid);
        const span = spansById.get(sid);
        const doc = span ? docsById.get(span.documentId) : undefined;
        return `[\`${doc?.filename || sid} #L${span?.lineStart || 1}\`](#source-${sid})`;
      }).join(' ');
      lines.push(`*Source Citations*: ${badgeList}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('## Evidential Source Citation Index & Manifest');
  lines.push('| Source Document | Line Range | SHA-256 Checksum | Verified Text Excerpt |');
  lines.push('|---|---|---|---|');

  for (const sid of referencedSpanIds) {
    const span = spansById.get(sid);
    const doc = span ? docsById.get(span.documentId) : undefined;
    if (span && doc) {
      const excerpt = span.exactText.replace(/\r?\n/g, ' ').slice(0, 80);
      lines.push(`| <a id="source-${sid}"></a>\`${doc.filename}\` | L${span.lineStart ?? 1}–L${span.lineEnd ?? 1} | \`${doc.sha256.slice(0, 12)}...\` | "${excerpt}..." |`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('*Generated by Proofline Legal Workbench. For professional solicitor review only; not legal advice.*');

  return lines.join('\n');
}
