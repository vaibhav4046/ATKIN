/**
 * ATKIN Platform - Storage Architecture
 * Dual-tier storage: In-browser IndexedDB (Dexie) + Desktop Native SQLite Bridge
 */

export { db, AtkinDatabase, getMattersFromDB, saveMatterToDB, loadMatterEntitiesFromDB } from '../../db/index.ts';
export { 
  mirrorToNativeStorage, 
  hydrateFromNativeStorageIfEmpty, 
  type NativeStorageStatus, 
  isTauriEnvironment 
} from '../../db/nativeStorageBridge.ts';
