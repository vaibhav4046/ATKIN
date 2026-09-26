import { describe, it, expect } from 'vitest';
import { AstraRuntime, type AstraRequest } from '../engine/protocol/astraRuntime.ts';
import { AuditLedger, sha256Hex } from '../engine/protocol/auditLedger.ts';
import type { Span } from '../types/index.ts';
import type { DocumentRecord } from '../engine/protocol/citationGate.ts';

describe('AstraRuntime — Full 12-Stage Legal Execution Pipeline', () => {
  const matterId = 'matter-alder-peak';
  const spanText = 'Clause 3.2: Notice of termination without cause shall be 37 calendar days in writing.';
  const docSha = sha256Hex(spanText);

  const testSpans: Span[] = [
    {
      id: 'span-term-37',
      documentId: 'doc-001',
      startOffset: 0,
      endOffset: spanText.length,
      exactText: spanText,
      checksum: sha256Hex(spanText)
    }
  ];

  const testDocuments = new Map<string, DocumentRecord>([
    [
      'doc-001',
      {
        id: 'doc-001',
        matterId,
        currentVersionId: 'v1',
        sha256: docSha,
        content: spanText
      }
    ]
  ]);

  it('executes full 12-stage pipeline on legal inquiry and verifies citations', async () => {
    const runtime = new AstraRuntime();
    const request: AstraRequest = {
      id: 'req-001',
      userId: 'user-solicitor',
      workspaceId: 'ws-main',
      matterId,
      mode: 'ask',
      message: 'What is the required notice period for termination?',
      jurisdiction: 'England and Wales',
      privacyMode: 'local_only'
    };

    const response = await runtime.execute(request, {
      spans: testSpans,
      documents: testDocuments
    });

    expect(response.claimSupportStatus).toBe('FULLY_SUPPORTED');
    expect(response.answer).toContain('37 calendar days');
    expect(response.verifications.length).toBe(1);
    expect(response.verifications[0].status).toBe('VERIFIED');
    expect(response.approvalDecision.status).toBe('autonomous_executed');
    expect(response.executionTrace.stages.length).toBe(12);
    expect(response.auditReceiptHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('correctly tags unrecorded factual questions as EVIDENTIALLY_ABSTAINED', async () => {
    const runtime = new AstraRuntime();
    const request: AstraRequest = {
      id: 'req-002',
      userId: 'user-solicitor',
      workspaceId: 'ws-main',
      matterId,
      mode: 'ask',
      message: 'What is the exact supplier incorporation date?',
      jurisdiction: 'England and Wales',
      privacyMode: 'local_only'
    };

    const response = await runtime.execute(request, {
      spans: testSpans,
      documents: testDocuments
    });

    expect(response.claimSupportStatus).toBe('EVIDENTIALLY_ABSTAINED');
    expect(response.irac.isAbstention).toBe(true);
    expect(response.memoryUpdate.semanticWriteApproved).toBe(false);
  });

  it('enforces tier 3 partner signoff for consequential legal actions', async () => {
    const runtime = new AstraRuntime();
    const request: AstraRequest = {
      id: 'req-003',
      userId: 'user-solicitor',
      workspaceId: 'ws-main',
      matterId,
      mode: 'act',
      message: 'Issue formal Letter Before Claim pursuant to Pre-Action Protocol',
      jurisdiction: 'England and Wales',
      privacyMode: 'local_only',
      approver: 'partner:arthur_pendleton'
    };

    const response = await runtime.execute(request, {
      spans: testSpans,
      documents: testDocuments
    });

    expect(response.approvalDecision.tier).toBe('tier_3_partner_signoff_required');
    expect(response.approvalDecision.status).toBe('partner_signoff_required');
    expect(response.approvalDecision.receipt.isConfirmed).toBe(true);
    expect(response.approvalDecision.receipt.confirmedBy).toBe('partner:arthur_pendleton');
  });

  it('maintains continuous tamper-evident audit chain across multiple pipeline requests', async () => {
    const runtime = new AstraRuntime();

    for (let i = 1; i <= 3; i++) {
      await runtime.execute(
        {
          id: `req-chain-${i}`,
          userId: 'user-solicitor',
          workspaceId: 'ws-main',
          matterId,
          mode: 'ask',
          message: `Inquiry turn ${i} regarding contractual obligations`,
          jurisdiction: 'England and Wales',
          privacyMode: 'local_only'
        },
        { spans: testSpans, documents: testDocuments }
      );
    }

    const receipts = runtime.getLedger().getReceipts();
    expect(receipts.length).toBe(3);

    const verification = AuditLedger.verifyChain(receipts);
    expect(verification.valid).toBe(true);
    expect(verification.verifiedCount).toBe(3);
  });

  it('rejects foreign legal doctrine contamination under England and Wales scope', async () => {
    const runtime = new AstraRuntime();
    const contaminatedRequest: AstraRequest = {
      id: 'req-bad-scope',
      userId: 'user-solicitor',
      workspaceId: 'ws-main',
      matterId,
      mode: 'ask',
      message: 'Can we claim punitive damages under the parol evidence rule?',
      jurisdiction: 'England and Wales',
      privacyMode: 'local_only'
    };

    await expect(
      runtime.execute(contaminatedRequest, { spans: testSpans, documents: testDocuments })
    ).rejects.toThrow('Jurisdictional Scope Boundary Violation');
  });
});
