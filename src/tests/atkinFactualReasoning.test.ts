import { describe, it, expect, beforeAll } from 'vitest';
import { LegalReasoningEngine } from '../engine/reasoning/legalReasoningEngine.ts';
import { MatterAnalyzer } from '../engine/ingestion/matterAnalyzer.ts';
import type { Document, Span } from '../types/index.ts';

const SYNTHETIC_QA_DOCUMENT_TEXT = `SYNTHETIC QA DOCUMENT. Not a real client or real transaction.
Agreement dated 20 September 2026.
Buyer: Elmbridge Studio. Supplier: Riverglass Services.
Clause 4: Elmbridge Studio must pay Riverglass Services GBP 2375 within 17 calendar days after receiving invoice RG-427.
Clause 5: A disputed invoice must be notified in writing within 6 calendar days of receipt. Undisputed amounts remain payable.
Clause 6: English law governs this agreement.
No bank account or client date of birth is recorded.`;

describe('Atkin Factual Reasoning Engine: Real Document Q&A without Boilerplate', () => {
  const engine = new LegalReasoningEngine();
  const analyzer = new MatterAnalyzer();

  let doc: Document;
  let spans: Span[];

  beforeAll(async () => {
    const ingestionResult = await analyzer.analyzeDocument({
      matterId: 'matter-qa-synth-001',
      filename: 'atkin_qa_agreement.txt',
      text: SYNTHETIC_QA_DOCUMENT_TEXT
    });
    doc = ingestionResult.document;
    spans = ingestionResult.spans;
  });

  it('answers specific payment and days question directly without irrelevant UCTA or indemnity boilerplate', () => {
    const output = engine.reason({
      query: 'How much must Elmbridge pay Riverglass and within how many days? Quote clause 4.',
      matterId: 'matter-qa-synth-001',
      matterTitle: 'Atkin QA 26 September Synthetic',
      matterJurisdiction: 'England and Wales',
      documents: [doc],
      spans,
      claims: [],
      authorities: [],
      reviewItems: [],
      memories: []
    });

    const text = output.formattedResponse;

    // Must answer the factual question accurately
    expect(text).toMatch(/Elmbridge/i);
    expect(text).toMatch(/Riverglass/i);
    expect(text).toMatch(/2375|2,375/);
    expect(text).toMatch(/17\s+calendar\s+days|17\s+days/i);

    // Must quote Clause 4
    expect(text).toContain('Clause 4: Elmbridge Studio must pay Riverglass Services GBP 2375 within 17 calendar days after receiving invoice RG-427.');

    // MUST NOT contain irrelevant templates
    expect(text).not.toContain('Uncapped / One-Sided Liabilities');
    expect(text).not.toContain('software defects, telemetry timeouts');
    expect(text).not.toContain('UCTA 1977 s.3');
    expect(text).not.toContain('unilateral indemnification with mutual indemnity');
  });

  it('answers multi-part question on who pays whom and disputed invoices, explicitly stating missing facts', () => {
    const output = engine.reason({
      query: 'Who must pay whom, and what happens if an invoice is disputed? Cite the relevant clauses; state when something is missing.',
      matterId: 'matter-qa-synth-001',
      matterTitle: 'Atkin QA 26 September Synthetic',
      matterJurisdiction: 'England and Wales',
      documents: [doc],
      spans,
      claims: [],
      authorities: [],
      reviewItems: [],
      memories: []
    });

    const text = output.formattedResponse;

    // Verifies parties
    expect(text).toMatch(/Elmbridge/i);
    expect(text).toMatch(/Riverglass/i);

    // Verifies dispute notification window
    expect(text).toMatch(/6\s+calendar\s+days|6\s+days/i);
    expect(text).toMatch(/in\s+writing/i);

    // Explicitly states missing facts as requested
    expect(text.toLowerCase()).toMatch(/missing|not recorded|not specified|cannot be (?:determined|computed)/);

    // MUST NOT contain irrelevant templates
    expect(text).not.toContain('software defects, telemetry timeouts');
    expect(text).not.toContain('UCTA 1977 s.3');
  });
});
