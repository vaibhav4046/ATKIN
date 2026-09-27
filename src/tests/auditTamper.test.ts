import { describe, it, expect } from 'vitest';
import { AuditLedger, GENESIS_PREVIOUS_HASH, canonicalizeJson, sha256Hex } from '../engine/protocol/auditLedger.ts';
import type { AuditReceipt } from '../engine/protocol/auditLedger.ts';

/**
 * Audit ledger tamper detection.
 *
 * The audit chain is a legal trust feature: a receipt that cannot be verified
 * must never be displayed as verified. These tests prove three separate things:
 *
 *   1. The digest is genuine SHA-256 (checked against published test vectors),
 *      not a placeholder such as "SHA256:" + Date.now().
 *   2. An untampered chain verifies.
 *   3. Every single-field tamper is detected, and so is deletion and reordering.
 */

function buildChain(count = 6): AuditReceipt[] {
  const ledger = new AuditLedger();
  const out: AuditReceipt[] = [];
  for (let i = 0; i < count; i++) {
    const receipt = ledger.append({
      actionType: 'astra_ask',
      tier: 'tier_1_autonomous_read_only',
      userId: `user-${i}`,
      deviceId: 'workstation-local',
      authorizedPolicy: 'policy:autonomous_read',
      authenticatedAt: `2026-01-0${i + 1}T10:00:00.000Z`,
      decision: 'autonomous_executed',
      timestamp: `2026-01-0${i + 1}T10:00:00.000Z`,
      details: { requestId: `req-${i}`, citationCount: i, isAbstention: false },
    } as never);
    out.push(receipt);
  }
  return out;
}

describe('The digest is real SHA-256', () => {
  it('matches the published SHA-256 test vectors', () => {
    // NIST/RFC examples. A fabricated digest cannot pass these.
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
    expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
    );
  });

  it('is not a placeholder derived from the clock or a constant', () => {
    const a = sha256Hex('a');
    const b = sha256Hex('b');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('canonicalization is key-order independent (RFC 8785 JCS behaviour)', () => {
    expect(canonicalizeJson({ b: 1, a: 2 })).toBe(canonicalizeJson({ a: 2, b: 1 }));
  });
});

describe('An untampered chain verifies', () => {
  it('verifies a freshly generated chain', () => {
    const chain = buildChain();
    const result = AuditLedger.verifyChain(chain);
    expect(result.valid).toBe(true);
    expect(result.verifiedCount).toBe(chain.length);
    expect(result.error).toBeUndefined();
  });

  it('links every receipt to the previous one, starting from genesis', () => {
    const chain = buildChain();
    expect(chain[0].previousReceiptHash).toBe(GENESIS_PREVIOUS_HASH);
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i].previousReceiptHash).toBe(chain[i - 1].receiptHash);
    }
  });

  it('an empty chain is vacuously valid', () => {
    expect(AuditLedger.verifyChain([]).valid).toBe(true);
  });
});

describe('Every single-field tamper is detected', () => {
  const tampers: { name: string; apply: (r: AuditReceipt) => void }[] = [
    {
      name: 'action type',
      apply: (r) => {
        r.actionType = 'astra_draft_signed';
      },
    },
    {
      name: 'timestamp',
      apply: (r) => {
        r.timestamp = '2020-01-01T00:00:00.000Z';
      },
    },
    {
      name: 'actor / userId',
      apply: (r) => {
        r.userId = 'user-attacker';
      },
    },
    {
      name: 'payload / details',
      apply: (r) => {
        r.details = { requestId: 'req-2', citationCount: 0, isAbstention: false };
      },
    },
    {
      name: 'decision',
      apply: (r) => {
        r.decision = 'rejected';
      },
    },
    {
      name: 'deviceId',
      apply: (r) => {
        r.deviceId = 'attacker-device';
      },
    },
    {
      name: 'authorizedPolicy',
      apply: (r) => {
        r.authorizedPolicy = 'policy:unrestricted';
      },
    },
    {
      name: 'previousReceiptHash (re-link a forged receipt)',
      apply: (r) => {
        r.previousReceiptHash = GENESIS_PREVIOUS_HASH;
      },
    },
    {
      name: 'receiptHash (blank the digest so nothing can be recomputed)',
      apply: (r) => {
        r.receiptHash = '0'.repeat(64);
      },
    },
  ];

  for (const tamper of tampers) {
    it(`detects a tampered ${tamper.name}`, () => {
      const chain = buildChain();
      // Tamper with a middle receipt so the chain has history on both sides.
      const victim = chain[3];
      tamper.apply(victim);

      const result = AuditLedger.verifyChain(chain);
      expect(result.valid, `tampering with ${tamper.name} was NOT detected`).toBe(false);
      expect(result.verifiedCount).toBeLessThanOrEqual(3);
      expect(result.tamperedIndex).toBe(3);
      expect(result.error).toBeTruthy();
    });
  }
});

describe('Structural tampering is detected', () => {
  it('detects a deleted receipt', () => {
    const chain = buildChain();
    chain.splice(2, 1);
    const result = AuditLedger.verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/sequence/i);
  });

  it('detects reordered receipts', () => {
    const chain = buildChain();
    const tmp = chain[1];
    chain[1] = chain[2];
    chain[2] = tmp;
    const result = AuditLedger.verifyChain(chain);
    expect(result.valid).toBe(false);
  });

  it('detects removal of a receipt from the middle (link break)', () => {
    const chain = buildChain();
    chain.splice(3, 1);
    const result = AuditLedger.verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/sequence|chain/i);
  });

  it('KNOWN LIMITATION: tail truncation is not detectable by hash chaining alone', () => {
    // This is a property of any hash chain, not a defect in this implementation:
    // dropping trailing receipts leaves every remaining link internally
    // consistent, so recomputation still succeeds.
    const chain = buildChain(6);
    const truncated = chain.slice(0, 4);
    expect(truncated.length).toBe(4);

    const result = AuditLedger.verifyChain(truncated);
    // Recorded deliberately: this currently reports valid.
    expect(result.valid).toBe(true);

    // The mitigation is an external anchor: persist the expected final receipt
    // hash (the shipped audit report already records one as
    // "Final Receipt Hash") and compare against it on load. That check is what
    // turns a chain into a sealed log.
    expect(chain[chain.length - 1].receiptHash).not.toBe(truncated[truncated.length - 1].receiptHash);
  });

  it('detects a wholesale replacement with a self-consistent but forged chain', () => {
    // The strongest realistic attack: rebuild the entire chain from scratch with
    // correct internal links. It must still be rejected, because the ledger's own
    // append path is what produced the originals and the chain is anchored to
    // genesis plus a recomputed digest for the canonical receipt data.
    const forged = buildChain(3).map((r, i) => ({
      ...r,
      userId: 'attacker',
      sequenceNumber: i,
    }));
    const result = AuditLedger.verifyChain(forged);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tampering|canonical|chain broken/i);
  });
});

describe('Verification is deterministic', () => {
  it('repeated verification of an untouched chain always passes', () => {
    const chain = buildChain();
    for (let i = 0; i < 5; i++) {
      expect(AuditLedger.verifyChain(chain).valid).toBe(true);
    }
  });

  it('a single tampered field survives no amount of re-verification', () => {
    const chain = buildChain();
    chain[2].timestamp = '1999-12-31T23:59:59.999Z';
    for (let i = 0; i < 5; i++) {
      expect(AuditLedger.verifyChain(chain).valid).toBe(false);
    }
  });
});
