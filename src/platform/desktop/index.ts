/**
 * ATKIN Platform - Desktop Runtime Integration
 * Local native bridge for SQLite, offline Ollama inference, and file attachments
 */

export { 
  mirrorToNativeStorage, 
  hydrateFromNativeStorageIfEmpty, 
  type NativeStorageStatus, 
  isTauriEnvironment 
} from '../../db/nativeStorageBridge.ts';

export function isDesktopEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).__ATKIN_DESKTOP__ || (window as any).electron || ('__TAURI__' in window));
}
