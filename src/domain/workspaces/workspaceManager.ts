/**
 * ATKIN Workspace Manager
 * Section 3: Strict Workspace Isolation (Personal vs Demo)
 *
 * Enforces zero fixture leakage into personal mode.
 * Personal mode starts empty.
 * Demo mode contains disposable, resettable demo fixtures tagged DEMO.
 */

import type { WorkspaceType, Matter } from '../../types/index.ts';
import { db, getMattersFromDB, saveMatterToDB } from '../../db/index.ts';
import { eventBus } from '../../runtime/events/eventBus.ts';

export interface WorkspaceConfig {
  type: WorkspaceType;
  name: string;
  isDemo: boolean;
  allowsCloudEscalation: boolean;
  storageIsolationKey: string;
}

export const PERSONAL_WORKSPACE_CONFIG: WorkspaceConfig = {
  type: 'personal',
  name: 'Personal Practice Workspace',
  isDemo: false,
  allowsCloudEscalation: false,
  storageIsolationKey: 'ws_personal'
};

export const DEMO_WORKSPACE_CONFIG: WorkspaceConfig = {
  type: 'demo',
  name: 'Demonstration Workspace',
  isDemo: true,
  allowsCloudEscalation: true,
  storageIsolationKey: 'ws_demo'
};

export class WorkspaceManager {
  private activeWorkspaceType: WorkspaceType = 'personal';

  public getActiveWorkspace(): WorkspaceType {
    return this.activeWorkspaceType;
  }

  public getWorkspaceConfig(ws: WorkspaceType): WorkspaceConfig {
    return ws === 'personal' ? PERSONAL_WORKSPACE_CONFIG : DEMO_WORKSPACE_CONFIG;
  }

  public setWorkspace(ws: WorkspaceType): WorkspaceConfig {
    this.activeWorkspaceType = ws;
    return this.getWorkspaceConfig(ws);
  }

  /**
   * Loads matters strictly isolated to the active workspace.
   * Personal workspace will NEVER return demo fixtures.
   */
  public async getMattersForActiveWorkspace(): Promise<Matter[]> {
    const all = await getMattersFromDB(this.activeWorkspaceType);
    if (this.activeWorkspaceType === 'personal') {
      // Hard guard: filter out any matter with isDemo: true or belonging to demo workspace
      return all.filter(m => !m.isDemo && m.workspaceType === 'personal');
    }
    return all.filter(m => m.isDemo || m.workspaceType === 'demo');
  }

  /**
   * Resets the demo workspace without touching personal practice data.
   */
  public async resetDemoWorkspace(): Promise<void> {
    const demoMatters = await db.matters.where('workspaceType').equals('demo').toArray();
    const demoIds = demoMatters.map(m => m.id);

    await db.transaction('rw', [
      db.matters,
      db.documents,
      db.spans,
      db.claims,
      db.authorities,
      db.drafts,
      db.reviewItems
    ], async () => {
      for (const id of demoIds) {
        await db.matters.delete(id);
        await db.documents.where('matterId').equals(id).delete();
        await db.claims.where('matterId').equals(id).delete();
        await db.drafts.where('matterId').equals(id).delete();
        await db.reviewItems.where('matterId').equals(id).delete();
      }
    });

    await eventBus.emit({
      id: `evt-${Date.now()}`,
      type: 'MatterUpdated',
      workspaceId: 'demo',
      timestamp: new Date().toISOString(),
      actor: { type: 'system', id: 'workspace-manager' },
      payload: {
        matterId: 'all-demo',
        changes: { action: 'reset_demo_workspace' }
      }
    });
  }
}

export const workspaceManager = new WorkspaceManager();
