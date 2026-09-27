import type { 
  Matter, 
  Document, 
  Span, 
  Claim, 
  Draft, 
  ReviewItem, 
  MemoryRecord 
} from '../../types/index.ts';
import { CryptoService } from '../vault/crypto.ts';

export interface MatterBundle {
  manifestVersion: '1.0.0';
  exportTimestamp: string;
  sourceVaultId: string;
  integritySha256: string;
  matter: Matter;
  documents: Document[];
  spans: Span[];
  claims: Claim[];
  drafts: Draft[];
  reviews: ReviewItem[];
  memories: MemoryRecord[];
}

export interface EncryptedMatterPackage {
  /**
   * Written as `atkin-encrypted-bundle-v1`. The legacy `proofline-encrypted-bundle-v1`
   * value is still accepted on import so bundles exported by earlier builds keep
   * opening; nothing is validated against this field, it is descriptive only.
   */
  format: 'atkin-encrypted-bundle-v1' | 'proofline-encrypted-bundle-v1';
  saltBase64: string;
  ivBase64: string;
  cipherTextBase64: string;
  authTagBase64: string;
  exportedAt: string;
}

export class BundleExchange {
  /**
   * Serializes a matter into a structured JSON bundle with SHA-256 integrity digest.
   */
  public static async createPlainBundle(data: {
    matter: Matter;
    documents: Document[];
    spans: Span[];
    claims: Claim[];
    drafts: Draft[];
    reviews: ReviewItem[];
    memories: MemoryRecord[];
    vaultId?: string;
  }): Promise<MatterBundle> {
    const rawPayload = JSON.stringify({
      matter: data.matter,
      documents: data.documents,
      spans: data.spans,
      claims: data.claims,
      drafts: data.drafts,
      reviews: data.reviews,
      memories: data.memories
    });

    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawPayload));
    const integritySha256 = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      manifestVersion: '1.0.0',
      exportTimestamp: new Date().toISOString(),
      sourceVaultId: data.vaultId || 'default-vault',
      integritySha256,
      matter: data.matter,
      documents: data.documents,
      spans: data.spans,
      claims: data.claims,
      drafts: data.drafts,
      reviews: data.reviews,
      memories: data.memories
    };
  }

  /**
   * Exports an encrypted matter bundle protected by a client password using AES-GCM-256.
   */
  public static async exportEncryptedPackage(
    bundle: MatterBundle,
    passphrase: string
  ): Promise<EncryptedMatterPackage> {
    const jsonStr = JSON.stringify(bundle);
    const saltBase64 = CryptoService.generateSalt();
    const key = await CryptoService.deriveKeyFromPassphrase(passphrase, saltBase64);
    const encrypted = await CryptoService.encrypt(jsonStr, key);

    return {
      format: 'atkin-encrypted-bundle-v1',
      saltBase64,
      ivBase64: encrypted.ivBase64,
      cipherTextBase64: encrypted.cipherTextBase64,
      authTagBase64: encrypted.authTagBase64,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Decrypts an encrypted matter package using the client password.
   */
  public static async importEncryptedPackage(
    pkg: EncryptedMatterPackage,
    passphrase: string
  ): Promise<MatterBundle> {
    const key = await CryptoService.deriveKeyFromPassphrase(passphrase, pkg.saltBase64);
    const decryptedJson = await CryptoService.decrypt(
      {
        ivBase64: pkg.ivBase64,
        cipherTextBase64: pkg.cipherTextBase64,
        authTagBase64: pkg.authTagBase64
      },
      key
    );

    const bundle: MatterBundle = JSON.parse(decryptedJson);
    await this.verifyBundleIntegrity(bundle);
    return bundle;
  }

  /**
   * Verifies the SHA-256 digest of an imported bundle.
   */
  public static async verifyBundleIntegrity(bundle: MatterBundle): Promise<boolean> {
    const rawPayload = JSON.stringify({
      matter: bundle.matter,
      documents: bundle.documents,
      spans: bundle.spans,
      claims: bundle.claims,
      drafts: bundle.drafts,
      reviews: bundle.reviews,
      memories: bundle.memories
    });

    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawPayload));
    const calculatedHash = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (calculatedHash !== bundle.integritySha256) {
      throw new Error(`Bundle integrity verification failed! Expected ${bundle.integritySha256}, got ${calculatedHash}`);
    }

    return true;
  }
}
