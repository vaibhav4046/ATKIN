/**
 * ATKIN App Providers
 * Encapsulates global context for Workspace, Model Routing, and Domain Events.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WorkspaceType, ModelStatus, UserProfile } from '../types/index.ts';
import { workspaceManager } from '../domain/workspaces/workspaceManager.ts';
import { eventBus, EventBus } from '../runtime/events/eventBus.ts';
import { checkOllamaConnection } from '../engine/modelBridge.ts';
import { getUserProfileFromDB, saveUserProfileToDB } from '../db/index.ts';

interface AppContextValue {
  workspace: WorkspaceType;
  setWorkspace: (ws: WorkspaceType) => void;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  modelStatus: ModelStatus;
  refreshModelStatus: () => Promise<void>;
  eventBus: EventBus;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspaceState] = useState<WorkspaceType>('personal');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    state: 'offline',
    endpoint: '/api/local-model',
    modelTag: 'None (Offline)',
    detectedTags: []
  });

  const refreshModelStatus = async () => {
    try {
      const status = await checkOllamaConnection();
      setModelStatus(status);
    } catch {
      setModelStatus({
        state: 'offline',
        endpoint: '/api/local-model',
        modelTag: 'None (Offline)',
        detectedTags: []
      });
    }
  };

  useEffect(() => {
    refreshModelStatus();

    async function loadProfile() {
      const p = await getUserProfileFromDB();
      if (p) {
        setUserProfile(p);
        if (p.activeWorkspace) {
          setWorkspaceState(p.activeWorkspace);
          workspaceManager.setWorkspace(p.activeWorkspace);
        }
      }
    }
    loadProfile();
  }, []);

  const setWorkspace = (ws: WorkspaceType) => {
    setWorkspaceState(ws);
    workspaceManager.setWorkspace(ws);
    if (userProfile) {
      const updated: UserProfile = { ...userProfile, activeWorkspace: ws, updatedAt: new Date().toISOString() };
      setUserProfile(updated);
      saveUserProfileToDB(updated);
    }
  };

  return (
    <AppContext.Provider
      value={{
        workspace,
        setWorkspace,
        userProfile,
        setUserProfile,
        modelStatus,
        refreshModelStatus,
        eventBus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProviders');
  }
  return ctx;
}
