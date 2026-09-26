/**
 * ATKIN Sovereign Legal OS — RFC 8785 Canonical Hash-Chained Audit Ledger
 * 
 * Provides tamper-evident, cryptographically chained audit logging for legal actions.
 * - JSON Canonicalization Scheme (JCS per RFC 8785)
 * - SHA-256 cryptographic digests
 * - Hash-chained receipts with previousReceiptHash
 * - Deterministic chain verification and tamper detection
 */

export type ApprovalTier = 
  | 'tier_1_autonomous_read_only'     // Parse, hash, detect contradiction
  | 'tier_2_solicitor_review_required' // Edit draft, approve review item
  | 'tier_3_partner_signoff_required'; // Court filing, formal notice letter, client file purge

export interface AuditReceipt {
  receiptId: string;
  sequenceNumber: number;
  actionType: string;
  tier: ApprovalTier;
  userId: string;
  deviceId: string;
  authorizedPolicy: string;
  authenticatedAt: string;
  decision: 'approved' | 'rejected' | 'autonomous_executed' | 'pending_approval';
  timestamp: string;
  details: Record<string, unknown>;
  previousReceiptHash: string;
  receiptHash: string;
  // Compatibility & human-readable accessors
  isConfirmed?: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  auditTrailHash?: string;
}

export type AuditReceiptData = Omit<AuditReceipt, 'receiptHash' | 'isConfirmed' | 'confirmedBy' | 'confirmedAt' | 'auditTrailHash'>;

/**
 * RFC 8785 JSON Canonicalization Scheme (JCS)
 * Canonicalizes data structures by sorting object keys lexicographically (UTF-16 code units),
 * omitting undefined values, and eliminating whitespace.
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJson(item)).join(',') + ']';
  }

  // Object key sorting per RFC 8785 (UTF-16 code units)
  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter(k => record[k] !== undefined)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const entries = keys.map(k => `${JSON.stringify(k)}:${canonicalizeJson(record[k])}`);
  return '{' + entries.join(',') + '}';
}

/**
 * Standard SHA-256 implementation (FIPS 180-4)
 * Synchronous and platform-independent (works in Node.js, Browser, Web Workers, Tauri)
 */
export function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Encode UTF-8 characters to byte array
  const bytes: number[] = [];
  for (let idx = 0; idx < ascii.length; idx++) {
    let c = ascii.charCodeAt(idx);
    if (c < 128) {
      bytes.push(c);
    } else if (c < 2048) {
      bytes.push((c >> 6) | 192);
      bytes.push((c & 63) | 128);
    } else if (((c & 0xFC00) === 0xD800) && (idx + 1 < ascii.length) && ((ascii.charCodeAt(idx + 1) & 0xFC00) === 0xDC00)) {
      c = 0x10000 + ((c & 0x03FF) << 10) + (ascii.charCodeAt(++idx) & 0x03FF);
      bytes.push((c >> 18) | 240);
      bytes.push(((c >> 12) & 63) | 128);
      bytes.push(((c >> 6) & 63) | 128);
      bytes.push((c & 63) | 128);
    } else {
      bytes.push((c >> 12) | 224);
      bytes.push(((c >> 6) & 63) | 128);
      bytes.push((c & 63) | 128);
    }
  }

  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }

  // Append 64-bit big-endian length
  bytes.push(0, 0, 0, 0);
  bytes.push((bitLength >>> 24) & 255);
  bytes.push((bitLength >>> 16) & 255);
  bytes.push((bitLength >>> 8) & 255);
  bytes.push(bitLength & 255);

  for (i = 0; i < bytes.length; i += 4) {
    words.push((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]);
  }

  const w: number[] = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    for (j = 0; j < 16; j++) {
      w[j] = words[i + j];
    }
    for (j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (j = 0; j < 64; j++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }

  return result;
}

export const GENESIS_PREVIOUS_HASH = '0'.repeat(64);

export function extractCanonicalReceiptData(receipt: Partial<AuditReceipt>): AuditReceiptData {
  return {
    receiptId: receipt.receiptId!,
    sequenceNumber: receipt.sequenceNumber!,
    actionType: receipt.actionType!,
    tier: receipt.tier!,
    userId: receipt.userId!,
    deviceId: receipt.deviceId!,
    authorizedPolicy: receipt.authorizedPolicy!,
    authenticatedAt: receipt.authenticatedAt!,
    decision: receipt.decision!,
    timestamp: receipt.timestamp!,
    details: receipt.details || {},
    previousReceiptHash: receipt.previousReceiptHash!
  };
}

export class AuditLedger {
  private chain: AuditReceipt[] = [];

  constructor(initialChain: AuditReceipt[] = []) {
    this.chain = [...initialChain];
  }

  /**
   * Computes the authentic SHA-256 digest of an audit receipt payload using RFC 8785 canonical JSON
   */
  public static computeReceiptHash(receipt: AuditReceiptData | AuditReceipt): string {
    const data = extractCanonicalReceiptData(receipt);
    const canonical = canonicalizeJson(data);
    return sha256Hex(canonical);
  }

  /**
   * Appends an audit entry with hash-chaining to the preceding receipt
   */
  public append(params: {
    actionType: string;
    tier: ApprovalTier;
    userId: string;
    deviceId: string;
    authorizedPolicy: string;
    decision: 'approved' | 'rejected' | 'autonomous_executed' | 'pending_approval';
    details?: Record<string, unknown>;
    timestamp?: string;
  }): AuditReceipt {
    const sequenceNumber = this.chain.length;
    const previousReceiptHash = sequenceNumber === 0 
      ? GENESIS_PREVIOUS_HASH 
      : this.chain[sequenceNumber - 1].receiptHash;

    const timestamp = params.timestamp || new Date().toISOString();
    const receiptData: AuditReceiptData = {
      receiptId: `rcpt-${sequenceNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sequenceNumber,
      actionType: params.actionType,
      tier: params.tier,
      userId: params.userId,
      deviceId: params.deviceId,
      authorizedPolicy: params.authorizedPolicy,
      authenticatedAt: timestamp,
      decision: params.decision,
      timestamp,
      details: params.details || {},
      previousReceiptHash
    };

    const receiptHash = AuditLedger.computeReceiptHash(receiptData);
    const isAuto = params.tier === 'tier_1_autonomous_read_only';
    const isConfirmed = params.decision === 'approved' || params.decision === 'autonomous_executed';
    const confirmedBy = isConfirmed ? (isAuto ? 'system:autonomous_read_only' : params.userId) : undefined;

    const receipt: AuditReceipt = {
      ...receiptData,
      receiptHash,
      isConfirmed,
      confirmedBy,
      confirmedAt: isConfirmed ? timestamp : undefined,
      auditTrailHash: receiptHash
    };

    this.chain.push(receipt);
    return receipt;
  }

  public getReceipts(): AuditReceipt[] {
    return [...this.chain];
  }

  /**
   * Validates the cryptographic integrity of the entire audit chain.
   * Fails if any receipt content is altered, any link is broken, or receipts are reordered.
   */
  public static verifyChain(receipts: AuditReceipt[]): {
    valid: boolean;
    verifiedCount: number;
    error?: string;
    tamperedIndex?: number;
  } {
    if (receipts.length === 0) {
      return { valid: true, verifiedCount: 0 };
    }

    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i];

      // 1. Check sequence number continuity
      if (receipt.sequenceNumber !== i) {
        return {
          valid: false,
          verifiedCount: i,
          error: `Sequence discontinuity at index ${i}: expected sequenceNumber ${i}, found ${receipt.sequenceNumber}`,
          tamperedIndex: i
        };
      }

      // 2. Check previousReceiptHash chaining
      const expectedPrev = i === 0 ? GENESIS_PREVIOUS_HASH : receipts[i - 1].receiptHash;
      if (receipt.previousReceiptHash !== expectedPrev) {
        return {
          valid: false,
          verifiedCount: i,
          error: `Chain broken at index ${i}: previousReceiptHash mismatch. Expected ${expectedPrev}, found ${receipt.previousReceiptHash}`,
          tamperedIndex: i
        };
      }

      // 3. Recompute canonical digest
      const recomputedHash = AuditLedger.computeReceiptHash(receipt);
      if (recomputedHash !== receipt.receiptHash) {
        return {
          valid: false,
          verifiedCount: i,
          error: `Tampering detected at index ${i}: stored hash ${receipt.receiptHash} does not match canonical recomputed hash ${recomputedHash}`,
          tamperedIndex: i
        };
      }
    }

    return {
      valid: true,
      verifiedCount: receipts.length
    };
  }
}
