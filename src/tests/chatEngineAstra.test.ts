import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { ChatEngine } from '../engine/chat/chatEngine.ts';
import { MemoryEngine } from '../engine/memory/memoryEngine.ts';
import { LocalModelManager } from '../engine/model/localModelManager.ts';
import { NetworkBroker } from '../engine/network/networkBroker.ts';
import { sha256Hex } from '../engine/protocol/auditLedger.ts';
import type { Span, Document } from '../types/index.ts';

describe('ChatEngine — End-to-End ASTRA Integration', () => {
  const memoryEngine = new MemoryEngine();
  const modelManager = new LocalModelManager();
  const networkBroker = new NetworkBroker('offline');

  const matterId = 'matter-chat-astra-01';
  const spanText = 'Clause 3.2: Notice of termination without cause shall be 37 calendar days in writing.';
  const docText = `MASTER SERVICES AGREEMENT\n${spanText}\nGoverning Law: England and Wales.`;

  const documents: Document[] = [
    {
      id: 'doc-msa-01',
      matterId,
      filename: 'Master_Services_Agreement.txt',
      mime: 'text/plain',
      sha256: sha256Hex(docText),
      importedAt: new Date().toISOString(),
      sourceDate: '2026-03-12',
      extractionStatus: 'success',
      pageCount: 1,
      text: docText,
      privacyLabel: 'Confidential'
    }
  ];

  const spans: Span[] = [
    {
      id: 'span-notice-37',
      documentId: 'doc-msa-01',
      startOffset: docText.indexOf(spanText),
      endOffset: docText.indexOf(spanText) + spanText.length,
      exactText: spanText,
      checksum: sha256Hex(spanText),
      lineStart: 2
    }
  ];

  it('processes user query through full 12-stage ASTRA pipeline and CitationGate', async () => {
    const engine = new ChatEngine();

    const assistantMsg = await engine.processUserQuery(
      {
        matterId,
        matterTitle: 'Highfield v Alder Peak',
        matterJurisdiction: 'England and Wales',
        documents,
        spans,
        memoryEngine,
        modelManager,
        networkBroker
      },
      'What notice period is required for termination without cause?'
    );

    expect(assistantMsg).toBeDefined();
    expect(assistantMsg.role).toBe('assistant');
    expect(assistantMsg.content).toContain('37 calendar days');

    // ASTRA 12-Stage Pipeline verification
    expect(assistantMsg.astraStages).toBeDefined();
    expect(assistantMsg.astraStages?.length).toBe(12);
    expect(assistantMsg.astraStages).toContain('1.request_validation');
    expect(assistantMsg.astraStages).toContain('8.citation_gate_verification');
    expect(assistantMsg.astraStages).toContain('11.audit_ledger_chaining');

    // CitationGate status
    expect(assistantMsg.claimSupportStatus).toBe('FULLY_SUPPORTED');

    // RFC 8785 Canonical Audit Receipt Hash
    expect(assistantMsg.auditReceiptHash).toBeDefined();
    expect(assistantMsg.auditReceiptHash).toMatch(/^[a-f0-9]{64}$/);

    // Citation verifications
    expect(assistantMsg.verifications).toBeDefined();
    expect(assistantMsg.verifications?.length).toBeGreaterThan(0);
    expect(assistantMsg.verifications?.[0].status).toBe('VERIFIED');
  });

  it('truthfully abstains when queried about unrecorded facts and marks EVIDENTIALLY_ABSTAINED', async () => {
    const engine = new ChatEngine();

    const assistantMsg = await engine.processUserQuery(
      {
        matterId,
        matterTitle: 'Highfield v Alder Peak',
        matterJurisdiction: 'England and Wales',
        documents,
        spans,
        memoryEngine,
        modelManager,
        networkBroker
      },
      'What is the supplier incorporation date?'
    );

    expect(assistantMsg).toBeDefined();
    expect(assistantMsg.content).toMatch(/incorporation date is unrecorded|evidential abstention/i);
    expect(assistantMsg.claimSupportStatus).toBe('EVIDENTIALLY_ABSTAINED');
    expect(assistantMsg.auditReceiptHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
