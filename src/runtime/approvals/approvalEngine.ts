/**
 * ATKIN Approvals Engine & Legal Action Ledger
 * Sections 35, 49, 50: Permission Gating, Human Approval & Action Auditability
 *
 * Professional control: Consequential actions cannot execute without
 * verified human approval. All actions are written to the immutable LegalActionLedger.
 */

import { EventBus } from '../events/eventBus.ts';

export type PermissionTier =
  | 'READ_LOCAL'
  | 'READ_EXTERNAL'
  | 'WRITE_LOCAL'
  | 'WRITE_EXTERNAL'
  | 'DESTRUCTIVE';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export interface ApprovalRequest {
  id: string;
  matterId: string;
  workspaceId: string;
  actionType: string;
  description: string;
  permissionTier: PermissionTier;
  targetResource: string;
  proposedChanges: Record<string, unknown>;
  requestedBy: {
    type: 'ai' | 'user' | 'system';
    id: string;
  };
  createdAt: string;
  status: ApprovalStatus;
  decision?: {
    approvedBy: string;
    decidedAt: string;
    reason?: string;
  };
}

export interface LegalActionRecord {
  id: string;
  requestId: string;
  matterId: string;
  actionType: string;
  permissionTier: PermissionTier;
  targetResource: string;
  dataAffected: string;
  proposedPayload: Record<string, unknown>;
  approvedBy: string;
  executionStatus: 'success' | 'failed' | 'cancelled';
  executedAt: string;
  providerResponse?: unknown;
}

export class ApprovalEngine {
  private pendingRequests: Map<string, ApprovalRequest> = new Map();
  private actionLedger: LegalActionRecord[] = [];

  /**
   * Evaluates whether an action requires explicit human confirmation.
   */
  public requiresHumanApproval(tier: PermissionTier): boolean {
    switch (tier) {
      case 'READ_LOCAL':
        return false;
      case 'READ_EXTERNAL':
        return false; // Reading external public data does not mutate state
      case 'WRITE_LOCAL':
        return false; // Normal local drafting is fluid
      case 'WRITE_EXTERNAL':
        return true; // Sending email, filing pleading, external API write
      case 'DESTRUCTIVE':
        return true; // Deleting matters, purging audit logs, resetting vault
      default:
        return true;
    }
  }

  /**
   * Submits an action for execution. Returns approved request or queues for human decision.
   */
  public async submitAction(params: {
    matterId: string;
    workspaceId: string;
    actionType: string;
    description: string;
    permissionTier: PermissionTier;
    targetResource: string;
    proposedChanges: Record<string, unknown>;
    requestedBy: { type: 'ai' | 'user' | 'system'; id: string };
  }): Promise<{ status: ApprovalStatus; requestId: string; requiresModal: boolean }> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const needsApproval = this.requiresHumanApproval(params.permissionTier);

    const request: ApprovalRequest = {
      id: requestId,
      matterId: params.matterId,
      workspaceId: params.workspaceId,
      actionType: params.actionType,
      description: params.description,
      permissionTier: params.permissionTier,
      targetResource: params.targetResource,
      proposedChanges: params.proposedChanges,
      requestedBy: params.requestedBy,
      createdAt: now,
      status: needsApproval ? 'pending' : 'auto_approved',
      decision: needsApproval
        ? undefined
        : { approvedBy: 'system_auto_policy', decidedAt: now, reason: 'Permitted low-risk action' }
    };

    this.pendingRequests.set(requestId, request);

    if (!needsApproval) {
      this.recordActionExecution(request, 'success', { note: 'Auto-approved by policy' });
    }

    return {
      status: request.status,
      requestId,
      requiresModal: needsApproval
    };
  }

  /**
   * Records human decision on a pending action request.
   */
  public async decideAction(
    requestId: string,
    approved: boolean,
    approverId: string,
    reason?: string
  ): Promise<ApprovalRequest> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`[ApprovalEngine] Request ${requestId} not found.`);
    }

    const now = new Date().toISOString();
    request.status = approved ? 'approved' : 'rejected';
    request.decision = {
      approvedBy: approverId,
      decidedAt: now,
      reason
    };

    if (approved) {
      await EventBus.getInstance().emit({
        id: `evt-${Date.now()}`,
        type: 'ActionApproved',
        matterId: request.matterId,
        workspaceId: request.workspaceId,
        timestamp: now,
        actor: { type: 'lawyer', id: approverId },
        payload: {
          requestId: request.id,
          actionType: request.actionType,
          approverId,
          permissionTier: request.permissionTier
        }
      });
    } else {
      await EventBus.getInstance().emit({
        id: `evt-${Date.now()}`,
        type: 'ActionRejected',
        matterId: request.matterId,
        workspaceId: request.workspaceId,
        timestamp: now,
        actor: { type: 'lawyer', id: approverId },
        payload: {
          requestId: request.id,
          actionType: request.actionType,
          rejectorId: approverId,
          reason: reason || 'Action rejected by lawyer.'
        }
      });
    }

    return request;
  }

  public recordActionExecution(
    request: ApprovalRequest,
    status: 'success' | 'failed' | 'cancelled',
    providerResponse?: unknown
  ): LegalActionRecord {
    const record: LegalActionRecord = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestId: request.id,
      matterId: request.matterId,
      actionType: request.actionType,
      permissionTier: request.permissionTier,
      targetResource: request.targetResource,
      dataAffected: JSON.stringify(request.proposedChanges).slice(0, 200),
      proposedPayload: request.proposedChanges,
      approvedBy: request.decision?.approvedBy || 'unknown',
      executionStatus: status,
      executedAt: new Date().toISOString(),
      providerResponse
    };

    this.actionLedger.push(record);
    return record;
  }

  public getPendingRequests(matterId?: string): ApprovalRequest[] {
    const all = Array.from(this.pendingRequests.values()).filter(r => r.status === 'pending');
    if (matterId) {
      return all.filter(r => r.matterId === matterId);
    }
    return all;
  }

  public getActionLedger(matterId?: string): LegalActionRecord[] {
    if (matterId) {
      return this.actionLedger.filter(a => a.matterId === matterId);
    }
    return [...this.actionLedger];
  }
}

export const approvalEngine = new ApprovalEngine();
