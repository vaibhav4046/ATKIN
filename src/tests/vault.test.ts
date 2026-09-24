import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from '../engine/vault/crypto.ts';
import { VaultService } from '../engine/vault/vaultService.ts';

describe('Cryptographic Vault & PBKDF2 / AES-GCM-256 Engine', () => {
  const testPass = 'Sol!d-L3gal-P@ssphr4se-2026';
  const wrongPass = 'Incorrect-Password-999';

  it('encrypts and decrypts plain text correctly (round-trip)', async () => {
    const salt = CryptoService.generateSalt();
    const key = await CryptoService.deriveKeyFromPassphrase(testPass, salt);

    const secretLegalNote = 'Confidential Settlement Offer: Client agrees to accept £1,800 without admission of liability.';
    const encrypted = await CryptoService.encrypt(secretLegalNote, key);

    expect(encrypted.cipherTextBase64).toBeDefined();
    expect(encrypted.ivBase64).toBeDefined();
    expect(encrypted.authTagBase64).toBeDefined();

    const decrypted = await CryptoService.decrypt(encrypted, key);
    expect(decrypted).toBe(secretLegalNote);
  });

  it('rejects decryption when provided an invalid key / wrong passphrase', async () => {
    const salt = CryptoService.generateSalt();
    const realKey = await CryptoService.deriveKeyFromPassphrase(testPass, salt);
    const badKey = await CryptoService.deriveKeyFromPassphrase(wrongPass, salt);

    const sensitiveClaim = 'Client admits water entered the chassis during April rainstorm.';
    const encrypted = await CryptoService.encrypt(sensitiveClaim, realKey);

    await expect(CryptoService.decrypt(encrypted, badKey)).rejects.toThrow();
  });

  it('generates unique initialization vectors (IV) for identical plaintexts', async () => {
    const salt = CryptoService.generateSalt();
    const key = await CryptoService.deriveKeyFromPassphrase(testPass, salt);

    const text = 'Identical repeated legal clause';
    const enc1 = await CryptoService.encrypt(text, key);
    const enc2 = await CryptoService.encrypt(text, key);

    expect(enc1.ivBase64).not.toBe(enc2.ivBase64);
    expect(enc1.cipherTextBase64).not.toBe(enc2.cipherTextBase64);
  });

  it('manages vault lifecycle: initialize, unlock, store encrypted record, and lock memory wiping', async () => {
    const vault = new VaultService();
    const initRes = await vault.initializeVault(testPass);
    expect(initRes.isEncrypted).toBe(true);
    expect(initRes.kdfRounds).toBe(100000);

    // Initial state is unlocked right after creation
    expect(vault.getLockState().isLocked).toBe(false);

    // Store encrypted entity
    const saved = await vault.storeEncryptedEntity({
      entityType: 'claim',
      entityId: 'claim-secret-001',
      plainJson: { statement: 'Sensitive client admission' }
    });
    expect(saved.cipherTextBase64).toBeDefined();

    // Lock vault
    vault.lock();
    expect(vault.getLockState().isLocked).toBe(true);

    // Storing or reading while locked must fail
    await expect(vault.retrieveDecryptedEntity(saved.id)).rejects.toThrow(/Vault is locked/);

    // Unlock with correct password
    const unlockOk = await vault.unlock(testPass);
    expect(unlockOk).toBe(true);
    expect(vault.getLockState().isLocked).toBe(false);

    // Reading after unlock succeeds
    const recovered = await vault.retrieveDecryptedEntity<{ statement: string }>(saved.id);
    expect(recovered.statement).toBe('Sensitive client admission');
  });
});
