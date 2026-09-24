/**
 * Native Bridge for Proofline
 * Dispatches to native Tauri 2 IPC commands when running in installed desktop mode,
 * or falls back to sovereign in-browser WebCrypto / Dexie / loopback engines when running in browser mode.
 */

export interface NativeRuntimeStatus {
  isDesktop: boolean;
  platform: string;
}

export class NativeBridge {
  public static isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  public static async getRuntimeStatus(): Promise<NativeRuntimeStatus> {
    if (this.isTauri()) {
      return {
        isDesktop: true,
        platform: 'tauri-windows-native'
      };
    }
    return {
      isDesktop: false,
      platform: 'browser-synthetic-demonstration'
    };
  }

  public static async invokeCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
    if (this.isTauri()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<T>(cmd, args);
      } catch (err) {
        console.warn(`[NativeBridge] Failed to invoke native command ${cmd}:`, err);
        return null;
      }
    }
    return null;
  }
}
