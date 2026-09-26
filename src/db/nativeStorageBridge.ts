/**
 * Native Desktop SQLite Storage Bridge for ATKIN
 * 
 * Provides transparent, dual-tier persistence:
 * 1. Web/Local: Dexie IndexedDB for high-speed reactive UI updates
 * 2. Native Desktop: Local SQLite database mirroring via Tauri IPC commands,
 *    ensuring enterprise-grade persistence across browser cache clears and application upgrades.
 */

import type { Matter, Document, Draft, UserProfile } from '../types/index.ts';

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

export interface NativeStorageStatus {
  database_path: string;
  matters_count: number;
  documents_count: number;
  drafts_count: number;
  memories_count: number;
  is_operational: boolean;
}

/**
 * Mirror save operation to native SQLite if operating inside Tauri
 */
export async function mirrorToNativeStorage(
  table: 'user_profiles' | 'matters' | 'documents' | 'drafts' | 'memories',
  id: string,
  data: unknown,
  parentId?: string
): Promise<boolean> {
  if (!isTauriEnvironment()) return false;

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('native_storage_save', {
      table,
      id,
      parentId: parentId || null,
      jsonData: JSON.stringify(data)
    });
    return true;
  } catch (err) {
    console.warn(`[ATKIN Native Storage] Mirror failed for table ${table}, id ${id}:`, err);
    return false;
  }
}

/**
 * Load all records of a specific entity type from native SQLite
 */
export async function loadFromNativeStorage<T>(
  table: 'user_profiles' | 'matters' | 'documents' | 'drafts' | 'memories',
  parentId?: string
): Promise<T[]> {
  if (!isTauriEnvironment()) return [];

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const rawJsonList: string[] = await invoke('native_storage_load_all', {
      table,
      parentId: parentId || null
    });
    return rawJsonList.map(json => JSON.parse(json) as T);
  } catch (err) {
    console.warn(`[ATKIN Native Storage] Load failed for table ${table}:`, err);
    return [];
  }
}

/**
 * Retrieve SQLite storage diagnostics
 */
export async function getNativeStorageStatus(): Promise<NativeStorageStatus | null> {
  if (!isTauriEnvironment()) return null;

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<NativeStorageStatus>('native_storage_get_status');
  } catch (err) {
    console.warn('[ATKIN Native Storage] Status query failed:', err);
    return null;
  }
}

/**
 * Synchronize local Dexie database from native SQLite on startup if IndexedDB is empty
 */
export async function hydrateFromNativeStorageIfEmpty(
  mattersTable: { count: () => Promise<number>; bulkPut: (items: Matter[]) => Promise<unknown> },
  userProfileTable: { count: () => Promise<number>; put: (item: UserProfile) => Promise<unknown> }
): Promise<boolean> {
  if (!isTauriEnvironment()) return false;

  try {
    const localMatterCount = await mattersTable.count();
    if (localMatterCount === 0) {
      const nativeMatters = await loadFromNativeStorage<Matter>('matters');
      if (nativeMatters.length > 0) {
        await mattersTable.bulkPut(nativeMatters);
        console.info(`[ATKIN Native Storage] Hydrated ${nativeMatters.length} matters from SQLite.`);
      }
    }

    const localProfileCount = await userProfileTable.count();
    if (localProfileCount === 0) {
      const profiles = await loadFromNativeStorage<UserProfile>('user_profiles');
      if (profiles.length > 0) {
        await userProfileTable.put(profiles[0]);
        console.info('[ATKIN Native Storage] Hydrated user profile from SQLite.');
      }
    }

    return true;
  } catch (err) {
    console.warn('[ATKIN Native Storage] Startup hydration check failed:', err);
    return false;
  }
}
