import { describe, it, expect, beforeEach } from 'vitest';
import {
  createWorkProduct,
  appendProductVersion,
  detectSourceDrift,
  type WorkProduct
} from '../domain/workProducts/workProduct.ts';
import { ApprovalEngine } from '../runtime/approvals/approvalEngine.ts';
import { EventBus } from '../runtime/events/eventBus.ts';

describe('ATKIN Work Products & Consequential Approvals (Sections 19–22, 49–50)', () => {
  let approvalEngine: ApprovalEngine;
  let bus: EventBus;

  beforeEach(() => {
    bus = EventBus.getInstance();
    bus.clear();
    approvalEngine = new ApprovalEngine();
  });

  describe('Work Products & Source Drift Detection', () => {
    it('creates versioned WorkProduct and appends revisions without overwriting history', () => {
      const initial = createWorkProduct({
        matterId: 'matter-alder-peak',
        workspaceId: 'demo',
        type: 'advice_note',
        title: 'Preliminary Advice: Highfield v Alder Peak',
        body: 'Initial AI drafted legal assessment.',
        createdBy: 'ai',
        sourceRefs: ['doc-msa-001']
      });

      expect(initial.versions).toHaveLength(1);
      expect(initial.versions[0].version).toBe(1);
      expect(initial.versions[0].createdBy).toBe('ai');

      // User edits into Version 2
      const v2 = appendProductVersion(initial, {
        blocks: [
          {
            id: 'blk-02',
            productVersionId: '',
            heading: 'Operative Clauses',
            text: 'User corrected: Clause 3.2 specifies 37 days notice.',
            sourceSpanIds: ['span-msa-clause-3-2'],
            sourceDocumentIds: ['doc-msa-001'],
            generatedAt: new Date().toISOString(),
            status: 'active'
          }
        ],
        createdBy: 'user'
      });

      expect(v2.versions).toHaveLength(2);
      expect(v2.currentVersionId).toBe(v2.versions[1].id);
      expect(v2.versions[1].createdBy).toBe('user');
      expect(v2.versions[0].body).toBe('Initial AI drafted legal assessment.'); // History preserved

      // Partner / Lawyer signs off Version 3
      const v3 = appendProductVersion(v2, {
        blocks: v2.versions[1].blocks.map(b => ({ ...b, status: 'verified' as const })),
        createdBy: 'lawyer_approved'
      });

      expect(v3.versions).toHaveLength(3);
      expect(v3.versions[2].createdBy).toBe('lawyer_approved');
    });

    it('detects source document variation and marks dependent blocks as SOURCE_CHANGED', () => {
      const product = createWorkProduct({
        matterId: 'matter-alder-peak',
        workspaceId: 'demo',
        type: 'contract_review',
        title: 'Fee Structure Review',
        blocks: [
          {
            id: 'blk-fee',
            productVersionId: 'v1',
            heading: 'Clause 2.1 Fee',
            text: 'The agreed contract price is £14,500 under the original agreement.',
            sourceSpanIds: ['span-msa-clause-2-1'],
            sourceDocumentIds: ['doc-msa-001'],
            generatedAt: new Date().toISOString(),
            status: 'active'
          },
          {
            id: 'blk-general',
            productVersionId: 'v1',
            heading: 'General Law',
            text: 'English law applies.',
            sourceSpanIds: [],
            sourceDocumentIds: ['doc-general'],
            generatedAt: new Date().toISOString(),
            status: 'active'
          }
        ],
        createdBy: 'ai'
      });

      const currentVer = product.versions[0];

      // Simulate a Deed of Variation superseding doc-msa-001
      const driftResult = detectSourceDrift(currentVer, ['doc-msa-001']);

      expect(driftResult.hasDrift).toBe(true);
      expect(driftResult.driftedBlockIds).toEqual(['blk-fee']);

      const updatedFeeBlock = driftResult.updatedVersion.blocks.find(b => b.id === 'blk-fee');
      expect(updatedFeeBlock?.status).toBe('SOURCE_CHANGED');
      expect(updatedFeeBlock?.statusNote).toContain('superseded');

      // The unreferenced block remains active
      const updatedGenBlock = driftResult.updatedVersion.blocks.find(b => b.id === 'blk-general');
      expect(updatedGenBlock?.status).toBe('active');
    });
  });

  describe('Approval Engine & Action Ledger', () => {
    it('auto-approves low-risk internal reads and writes', async () => {
      const submission = await approvalEngine.submitAction({
        matterId: 'matter-alder-peak',
        workspaceId: 'demo',
        actionType: 'local_notes_save',
        description: 'Save user notebook annotation locally',
        permissionTier: 'WRITE_LOCAL',
        targetResource: 'matter-notes',
        proposedChanges: { text: 'Review variation tomorrow.' },
        requestedBy: { type: 'user', id: 'usr-lawyer-1' }
      });

      expect(submission.status).toBe('auto_approved');
      expect(submission.requiresModal).toBe(false);

      const ledger = approvalEngine.getActionLedger('matter-alder-peak');
      expect(ledger.length).toBe(1);
      expect(ledger[0].executionStatus).toBe('success');
    });

    it('gates consequential external actions and records lawyer approval in ledger', async () => {
      const submission = await approvalEngine.submitAction({
        matterId: 'matter-alder-peak',
        workspaceId: 'demo',
        actionType: 'send_client_advice',
        description: 'Send formal advice letter via external email connector',
        permissionTier: 'WRITE_EXTERNAL',
        targetResource: 'connector-outlook-api',
        proposedChanges: { recipient: 'client@highfield.co.uk', subject: 'Notice advice' },
        requestedBy: { type: 'ai', id: 'atkin-agent' }
      });

      expect(submission.status).toBe('pending');
      expect(submission.requiresModal).toBe(true);

      const pending = approvalEngine.getPendingRequests('matter-alder-peak');
      expect(pending.length).toBe(1);
      expect(pending[0].id).toBe(submission.requestId);

      // Lawyer confirms and approves
      const decided = await approvalEngine.decideAction(
        submission.requestId,
        true,
        'usr-partner-sarah',
        'Verified against Deed of Variation'
      );

      expect(decided.status).toBe('approved');
      expect(decided.decision?.approvedBy).toBe('usr-partner-sarah');

      // Verify ActionApproved event was dispatched onto EventBus
      const history = bus.getHistory({ type: 'ActionApproved' });
      expect(history.length).toBe(1);
      expect((history[0] as any).payload.approverId).toBe('usr-partner-sarah');
    });
  });
});
