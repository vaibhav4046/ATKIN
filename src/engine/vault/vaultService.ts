import { 
  generateSalt, 
  deriveKey, 
  encryptText, 
  decryptText, 
  type EncryptedPayload 
} from './crypto.ts';
import type { VaultMetadata, VaultLockState, EncryptedBlobRecord } from '../../types/index.ts';

const TEST_SENTINEL = 'PROOFLINE_VAULT_KEY_VERIFICATION_SENTINEL_2026';

export class VaultService {
  private activeKey: CryptoKey | null = null;
  private metadata: VaultMetadata | null = null;
  private verificationBlob: EncryptedPayload | null = null;
  private encryptedRecords: Map<string, EncryptedBlobRecord> = new Map();
  private autoLockTimeoutId: any = null;
  private lastActivityTimestamp = Date.now();

  constructor() {
    this.resetToDefault();
  }

  private resetToDefault() {
    this.activeKey = null;
    this.metadata = null;
    this.verificationBlob = null;
    this.encryptedRecords.clear();
    if (this.autoLockTimeoutId) {
      clearTimeout(this.autoLockTimeoutId);
      this.autoLockTimeoutId = null;
    }
  }

  public async initVault(
    vaultName = 'Primary Sovereign Vault', 
    passphrase = 'demo-sovereign-vault-2026',
    autoLockMinutes = 30
  ): Promise<VaultMetadata> {
    const saltBase64 = generateSalt(16);
    const key = await deriveKey(passphrase, saltBase64, 100000);
    const sentinelPayload = await encryptText(TEST_SENTINEL, key);

    this.activeKey = key;
    this.verificationBlob = sentinelPayload;
    this.metadata = {
      vaultId: `vault-${Date.now()}`,
      vaultName,
      storagePath: 'Local Application Data (Encrypted)',
      createdAt: new Date().toISOString(),
      lastUnlockedAt: new Date().toISOString(),
      isEncrypted: true,
      kdfRounds: 100000,
      saltBase64,
      autoLockMinutes
    };

    this.resetAutoLockTimer();
    return this.metadata;
  }

  public async unlock(passphrase: string): Promise<boolean> {
    if (!this.metadata || !this.verificationBlob) {
      // Auto-initialize demo vault if none exists
      await this.initVault('Primary Sovereign Vault', passphrase);
      return true;
    }

    try {
      const candidateKey = await deriveKey(passphrase, this.metadata.saltBase64, this.metadata.kdfRounds);
      const decryptedSentinel = await decryptText(this.verificationBlob, candidateKey);

      if (decryptedSentinel !== TEST_SENTINEL) {
        throw new Error('WRONG_PASSPHRASE: Sentinel verification failed.');
      }

      this.activeKey = candidateKey;
      this.metadata.lastUnlockedAt = new Date().toISOString();
      this.resetAutoLockTimer();
      return true;
    } catch (err) {
      this.activeKey = null;
      throw new Error('WRONG_PASSPHRASE: Invalid vault password provided.');
    }
  }

  public lock(): void {
    // Memory wiping of key reference
    this.activeKey = null;
    if (this.autoLockTimeoutId) {
      clearTimeout(this.autoLockTimeoutId);
      this.autoLockTimeoutId = null;
    }
  }

  public isLocked(): boolean {
    return this.activeKey === null;
  }

  public recordActivity(): void {
    this.lastActivityTimestamp = Date.now();
    this.resetAutoLockTimer();
  }

  private resetAutoLockTimer(): void {
    if (this.autoLockTimeoutId) {
      clearTimeout(this.autoLockTimeoutId);
    }
    const minutes = this.metadata?.autoLockMinutes || 30;
    this.autoLockTimeoutId = setTimeout(() => {
      this.lock();
    }, minutes * 60 * 1000);
  }

  public async encryptAndStore(
    entityType: EncryptedBlobRecord['entityType'],
    entityId: string,
    plaintext: string
  ): Promise<EncryptedBlobRecord> {
    if (this.isLocked() || !this.activeKey || !this.metadata) {
      throw new Error('VAULT_LOCKED: Cannot encrypt record while vault is locked.');
    }

    const payload = await encryptText(plaintext, this.activeKey);
    const record: EncryptedBlobRecord = {
      id: `blob-${entityType}-${entityId}`,
      vaultId: this.metadata.vaultId,
      entityType,
      entityId,
      ivBase64: payload.ivBase64,
      cipherTextBase64: payload.cipherTextBase64,
      authTagBase64: '', // Included in AES-GCM buffer
      updatedAt: new Date().toISOString()
    };

    this.encryptedRecords.set(`${entityType}:${entityId}`, record);
    return record;
  }

  public async retrieveAndDecrypt(
    entityType: EncryptedBlobRecord['entityType'],
    entityId: string
  ): Promise<string | null> {
    if (this.isLocked() || !this.activeKey) {
      throw new Error('VAULT_LOCKED: Cannot decrypt record while vault is locked.');
    }

    const record = this.encryptedRecords.get(`${entityType}:${entityId}`);
    if (!record) return null;

    return decryptText(
      { ivBase64: record.ivBase64, cipherTextBase64: record.cipherTextBase64 },
      this.activeKey
    );
  }

  public exportBackup(): string {
    if (!this.metadata || !this.verificationBlob) {
      throw new Error('NO_VAULT: Vault has not been initialized.');
    }

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      metadata: this.metadata,
      verificationBlob: this.verificationBlob,
      records: Array.from(this.encryptedRecords.values())
    };

    return JSON.stringify(backup, null, 2);
  }

  public async restoreBackup(backupJson: string, passphrase: string): Promise<boolean> {
    const data = JSON.parse(backupJson);
    if (!data.metadata || !data.verificationBlob || !data.records) {
      throw new Error('CORRUPT_BACKUP: Invalid vault backup manifest format.');
    }

    // Verify passphrase against backup sentinel
    const candidateKey = await deriveKey(passphrase, data.metadata.saltBase64, data.metadata.kdfRounds);
    const decryptedSentinel = await decryptText(data.verificationBlob, candidateKey);

    if (decryptedSentinel !== TEST_SENTINEL) {
      throw new Error('WRONG_PASSPHRASE: Backup decryption password mismatch.');
    }

    this.metadata = data.metadata;
    this.verificationBlob = data.verificationBlob;
    this.activeKey = candidateKey;
    this.encryptedRecords.clear();

    for (const record of data.records) {
      this.encryptedRecords.set(`${record.entityType}:${record.entityId}`, record);
    }

    this.resetAutoLockTimer();
    return true;
  }

  public async initializeVault(passphrase: string, vaultName = 'Primary Sovereign Vault', autoLockMinutes = 30): Promise<VaultMetadata> {
    return this.initVault(vaultName, passphrase, autoLockMinutes);
  }

  public getLockState(): VaultLockState {
    return {
      isLocked: this.isLocked(),
      vaultId: this.metadata?.vaultId || '',
      unlockedAt: this.metadata?.lastUnlockedAt || null,
      idleTimerMs: (this.metadata?.autoLockMinutes || 30) * 60 * 1000
    };
  }

  public async storeEncryptedEntity(params: {
    entityType: EncryptedBlobRecord['entityType'];
    entityId: string;
    plainJson: any;
  }): Promise<EncryptedBlobRecord> {
    const text = typeof params.plainJson === 'string' ? params.plainJson : JSON.stringify(params.plainJson);
    return this.encryptAndStore(params.entityType, params.entityId, text);
  }

  public async retrieveDecryptedEntity<T = any>(blobIdOrEntityId: string): Promise<T> {
    if (this.isLocked() || !this.activeKey) {
      throw new Error('Vault is locked. Decryption key wiped from memory.');
    }

    // Try finding by direct id or by key
    let record = Array.from(this.encryptedRecords.values()).find(r => r.id === blobIdOrEntityId || r.entityId === blobIdOrEntityId);
    if (!record) {
      throw new Error(`Record ${blobIdOrEntityId} not found in vault.`);
    }

    const decrypted = await decryptText(
      { ivBase64: record.ivBase64, cipherTextBase64: record.cipherTextBase64 },
      this.activeKey
    );

    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  }

  public getStatus(): {
    isLocked: boolean;
    vaultName: string;
    recordCount: number;
    autoLockMinutes: number;
  } {
    return {
      isLocked: this.isLocked(),
      vaultName: this.metadata?.vaultName || 'Uninitialized Vault',
      recordCount: this.encryptedRecords.size,
      autoLockMinutes: this.metadata?.autoLockMinutes || 30
    };
  }
}

export const vaultService = new VaultService();
