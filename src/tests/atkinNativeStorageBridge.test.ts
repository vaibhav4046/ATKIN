import { describe, it, expect, vi } from 'vitest';
import { 
  isTauriEnvironment, 
  mirrorToNativeStorage, 
  loadFromNativeStorage, 
  getNativeStorageStatus, 
  hydrateFromNativeStorageIfEmpty 
} from '../db/nativeStorageBridge.ts';

describe('ATKIN Native Storage Bridge', () => {
  it('detects browser vs Tauri native execution environment accurately', () => {
    // In node/test runner without window.__TAURI_INTERNALS__, returns false
    expect(isTauriEnvironment()).toBe(false);
  });

  it('gracefully no-ops in web environment without errors', async () => {
    const mirrorResult = await mirrorToNativeStorage('matters', 'm-1', { title: 'Test Matter' });
    expect(mirrorResult).toBe(false);

    const loaded = await loadFromNativeStorage('matters');
    expect(loaded).toEqual([]);

    const status = await getNativeStorageStatus();
    expect(status).toBeNull();
  });

  it('hydrates empty local DB when records exist in native storage mock', async () => {
    // Mock Tauri window object
    const originalWindow = globalThis.window;
    (globalThis as any).window = {
      __TAURI_INTERNALS__: {}
    };

    // Mock @tauri-apps/api/core invoke
    vi.mock('@tauri-apps/api/core', () => ({
      invoke: vi.fn(async (cmd: string, args?: any) => {
        if (cmd === 'native_storage_save') return true;
        if (cmd === 'native_storage_load_all') {
          if (args?.table === 'matters') {
            return [
              JSON.stringify({
                id: 'matter-sqlite-101',
                title: 'Highfield Logistics Sovereign Matter',
                jurisdiction: 'England and Wales',
                isDemo: false
              })
            ];
          }
          if (args?.table === 'user_profiles') {
            return [
              JSON.stringify({
                id: 'user-001',
                name: 'Jane Doe',
                role: 'partner',
                onboardingCompleted: true
              })
            ];
          }
          return [];
        }
        if (cmd === 'native_storage_get_status') {
          return {
            database_path: 'C:\\Users\\User\\AppData\\Local\\Atkin\\atkin_store.db',
            matters_count: 1,
            documents_count: 5,
            drafts_count: 2,
            memories_count: 10,
            is_operational: true
          };
        }
        return null;
      })
    }));

    expect(isTauriEnvironment()).toBe(true);

    const mockMattersTable = {
      count: vi.fn(async () => 0),
      bulkPut: vi.fn(async (_items: any[]) => {})
    };

    const mockProfileTable = {
      count: vi.fn(async () => 0),
      put: vi.fn(async (_item: any) => {})
    };

    const hydrated = await hydrateFromNativeStorageIfEmpty(mockMattersTable as any, mockProfileTable as any);
    expect(hydrated).toBe(true);
    expect(mockMattersTable.bulkPut).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'matter-sqlite-101', title: 'Highfield Logistics Sovereign Matter' })
    ]);
    expect(mockProfileTable.put).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-001', name: 'Jane Doe' })
    );

    const status = await getNativeStorageStatus();
    expect(status).toBeDefined();
    expect(status?.is_operational).toBe(true);
    expect(status?.matters_count).toBe(1);

    // Cleanup
    (globalThis as any).window = originalWindow;
    vi.restoreAllMocks();
  });
});
