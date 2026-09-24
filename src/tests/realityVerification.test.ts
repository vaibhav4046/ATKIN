import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { MatterAnalyzer } from '../engine/ingestion/matterAnalyzer.ts';
import { notebookStudioEngine } from '../engine/notebook/notebookStudioEngine.ts';
import { BATES_MATTER, BATES_DOCUMENTS, BATES_SPANS, BATES_CLAIMS } from '../db/fixtures/batesPostOfficeMatter.ts';
import { checkOllamaConnection, requestGemmaDraftBlock } from '../engine/modelBridge.ts';

describe('Proofline Reality Verification: Input Dependence, Scope & Failure Honesty', () => {
  const analyzer = new MatterAnalyzer();

  it('proves input dependence: modifying invoice amount and date alters extracted claims and grounded chat answers', async () => {
    // 1. Initial Document: Invoice £4,200 due 15 March 2026
    const initialText = 'Tax Invoice INV-8821: Professional legal advisory services. Total amount payable £4,200 due by 15 March 2026.';
    const resultInitial = await analyzer.analyzeDocument({
      matterId: 'matter-dep-test',
      filename: 'Invoice_8821_v1.txt',
      text: initialText,
      sourceDate: '2026-03-01'
    });

    expect(resultInitial.spans.length).toBeGreaterThan(0);
    expect(resultInitial.document.text).toContain('£4,200');
    expect(resultInitial.document.text).toContain('15 March 2026');

    // Query via Notebook Chat on initial doc
    const nb1 = notebookStudioEngine.createNotebook(
      'matter-dep-test',
      'Invoice Test v1',
      'Testing input dependence',
      [resultInitial.document]
    );

    const chat1 = notebookStudioEngine.chatWithNotebook(
      nb1,
      'amount payable £4,200',
      [resultInitial.document],
      resultInitial.spans
    );
    expect(chat1.text).toContain('£4,200');
    expect(chat1.citations[0].quote).toContain('£4,200');

    // 2. Modified Document: Altered to £9,850 due 28 April 2026
    const alteredText = 'Tax Invoice INV-8821: Professional legal advisory services. Total amount payable £9,850 due by 28 April 2026.';
    const resultAltered = await analyzer.analyzeDocument({
      matterId: 'matter-dep-test',
      filename: 'Invoice_8821_v2.txt',
      text: alteredText,
      sourceDate: '2026-04-01'
    });

    // Checksums must differ
    expect(resultAltered.document.sha256).not.toBe(resultInitial.document.sha256);
    expect(resultAltered.document.text).toContain('£9,850');
    expect(resultAltered.document.text).toContain('28 April 2026');

    // Query via Notebook Chat on altered doc
    const nb2 = notebookStudioEngine.createNotebook(
      'matter-dep-test',
      'Invoice Test v2',
      'Testing altered input',
      [resultAltered.document]
    );

    const chat2 = notebookStudioEngine.chatWithNotebook(
      nb2,
      'amount payable £9,850',
      [resultAltered.document],
      resultAltered.spans
    );

    // Verified: Answer dynamically reflects the altered input!
    expect(chat2.text).toContain('£9,850');
    expect(chat2.text).not.toContain('£4,200');
    expect(chat2.citations[0].quote).toContain('£9,850');
  });

  it('proves scope isolation: queries in an empty matter do not return cross-matter sample evidence', () => {
    // Notebook in Matter 1 (Bates Post Office)
    const nbBates = notebookStudioEngine.createNotebook(
      BATES_MATTER.id,
      'Horizon System Audit',
      'Bates matter',
      BATES_DOCUMENTS
    );

    const batesAnswer = notebookStudioEngine.chatWithNotebook(
      nbBates,
      'PIN-188 balance discrepancy defect',
      BATES_DOCUMENTS,
      BATES_SPANS
    );
    expect(batesAnswer.citations.length).toBeGreaterThan(0);
    expect(batesAnswer.text).toContain('PIN-188');

    // Notebook in Matter 2 (Clean Empty Matter with 0 documents)
    const nbEmpty = notebookStudioEngine.createNotebook(
      'matter-empty-101',
      'Clean Commercial Arbitration',
      'Empty matter with no imported files',
      [] // Zero sources
    );

    const emptyAnswer = notebookStudioEngine.chatWithNotebook(
      nbEmpty,
      'PIN-188 balance discrepancy defect',
      [], // No documents in scope
      []
    );

    // Verified: Empty matter refuses to answer and does NOT leak Bates evidence
    expect(emptyAnswer.citations.length).toBe(0);
    expect(emptyAnswer.abstentionNotice).toContain('Context empty');
    expect(emptyAnswer.text).toContain('All sources are currently excluded');
    expect(emptyAnswer.text).not.toContain('PIN-188');
  });

  it('proves failure honesty: offline runtime reports real connection status rather than fake success', async () => {
    // When local Ollama endpoint is not running on 127.0.0.1:11434
    const status = await checkOllamaConnection('http://127.0.0.1:59999/api/tags');
    expect(status.state).toBe('offline');
    expect(status.modelTag).toBe('None detected');

    // Querying unavailable daemon returns transparent fallback disclosure
    const response = await requestGemmaDraftBlock(
      'Audit Horizon balance discrepancy',
      [],
      'gemma4:e4b',
      'http://127.0.0.1:59999'
    );

    expect(response.source).toBe('deterministic_offline');
    expect(response.modelTag).toContain('fallback');
    expect(response.proposedText).toContain('Deterministic Offline');
  });
});
