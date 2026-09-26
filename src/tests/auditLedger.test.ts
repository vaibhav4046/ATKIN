import { describe, it, expect } from 'vitest';
import { 
  AuditLedger, 
  canonicalizeJson, 
  sha256Hex, 
  GENESIS_PREVIOUS_HASH,
  type AuditReceipt 
} from '../engine/protocol/auditLedger.ts';

describe('AuditLedger — RFC 8785 Canonical Hash-Chained Audit Ledger', () => {
  describe('Standard SHA-256 Digest Verification', () => {
    it('matches official FIPS 180-4 SHA-256 test vectors', () => {
      // Empty string
      expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      // 'abc'
      expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
      // Longer message
      expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))
        .toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
    });
  });

  describe('RFC 8785 JSON Canonicalization Scheme (JCS)', () => {
    it('produces identical canonical strings regardless of property insertion order', () => {
      const obj1 = { z: 1, a: 'test', m: { b: 2, a: 1 } };
      const obj2 = { a: 'test', m: { a: 1, b: 2 }, z: 1 };

      const canon1 = canonicalizeJson(obj1);
      const canon2 = canonicalizeJson(obj2);

      expect(canon1).toBe(canon2);
      expect(canon1).toBe('{"a":"test","m":{"a":1,"b":2},"z":1}');
      expect(sha256Hex(canon1)).toBe(sha256Hex(canon2));
    });

    it('eliminates all extraneous whitespace and ignores undefined values', () => {
      const obj = {
        name: 'Atkin Legal OS',
        version: 1,
        optionalField: undefined,
        items: [1, 2, 'three']
      };

      const canon = canonicalizeJson(obj);
      expect(canon).toBe('{"items":[1,2,"three"],"name":"Atkin Legal OS","version":1}');
      expect(canon).not.toContain(': ');
      expect(canon).not.toContain(', ');
    });
  });

  describe('Cryptographic Hash-Chaining & Receipt Generation', () => {
    it('creates genesis receipt with 64 zero-hex previousReceiptHash', () => {
      const ledger = new AuditLedger();
      const receipt = ledger.append({
        actionType: 'matter_ingestion',
        tier: 'tier_1_autonomous_read_only',
        userId: 'system:autonomous_read_only',
        deviceId: 'workstation-dev-01',
        authorizedPolicy: 'policy:read_only_parse',
        decision: 'autonomous_executed',
        details: { filename: 'master-services-agreement.pdf' }
      });

      expect(receipt.sequenceNumber).toBe(0);
      expect(receipt.previousReceiptHash).toBe(GENESIS_PREVIOUS_HASH);
      expect(receipt.receiptHash).toMatch(/^[a-f0-9]{64}$/);
      expect(receipt.isConfirmed).toBe(true);
    });

    it('chains subsequent receipts to previous receiptHash', () => {
      const ledger = new AuditLedger();
      const r0 = ledger.append({
        actionType: 'clause_review',
        tier: 'tier_1_autonomous_read_only',
        userId: 'system:autonomous_read_only',
        deviceId: 'workstation-dev-01',
        authorizedPolicy: 'policy:read_only_parse',
        decision: 'autonomous_executed'
      });

      const r1 = ledger.append({
        actionType: 'draft_clause_amendment',
        tier: 'tier_2_solicitor_review_required',
        userId: 'solicitor:eleanor_vance',
        deviceId: 'workstation-dev-01',
        authorizedPolicy: 'policy:solicitor_review',
        decision: 'approved'
      });

      const r2 = ledger.append({
        actionType: 'issue_statutory_letter_before_claim',
        tier: 'tier_3_partner_signoff_required',
        userId: 'partner:arthur_pendleton',
        deviceId: 'workstation-dev-01',
        authorizedPolicy: 'policy:partner_signoff',
        decision: 'approved'
      });

      expect(r1.sequenceNumber).toBe(1);
      expect(r1.previousReceiptHash).toBe(r0.receiptHash);

      expect(r2.sequenceNumber).toBe(2);
      expect(r2.previousReceiptHash).toBe(r1.receiptHash);

      const verifyResult = AuditLedger.verifyChain(ledger.getReceipts());
      expect(verifyResult.valid).toBe(true);
      expect(verifyResult.verifiedCount).toBe(3);
    });
  });

  describe('Adversarial Tamper Detection', () => {
    it('detects modification of receipt content at any position', () => {
      const ledger = new AuditLedger();
      ledger.append({
        actionType: 'action_0',
        tier: 'tier_1_autonomous_read_only',
        userId: 'system',
        deviceId: 'dev-01',
        authorizedPolicy: 'policy:auto',
        decision: 'autonomous_executed'
      });
      ledger.append({
        actionType: 'action_1',
        tier: 'tier_2_solicitor_review_required',
        userId: 'solicitor:vance',
        deviceId: 'dev-01',
        authorizedPolicy: 'policy:solicitor',
        decision: 'approved'
      });
      ledger.append({
        actionType: 'action_2',
        tier: 'tier_3_partner_signoff_required',
        userId: 'partner:pendleton',
        deviceId: 'dev-01',
        authorizedPolicy: 'policy:partner',
        decision: 'approved'
      });

      const chain = ledger.getReceipts();

      // Tamper with middle receipt content: change decision from 'approved' to 'rejected'
      const tamperedChain: AuditReceipt[] = JSON.parse(JSON.stringify(chain));
      tamperedChain[1].decision = 'rejected';

      const result = AuditLedger.verifyChain(tamperedChain);
      expect(result.valid).toBe(false);
      expect(result.tamperedIndex).toBe(1);
      expect(result.error).toContain('Tampering detected at index 1');
    });

    it('detects broken previousReceiptHash links', () => {
      const ledger = new AuditLedger();
      ledger.append({
        actionType: 'action_0',
        tier: 'tier_1_autonomous_read_only',
        userId: 'system',
        deviceId: 'dev-01',
        authorizedPolicy: 'policy:auto',
        decision: 'autonomous_executed'
      });
      ledger.append({
        actionType: 'action_1',
        tier: 'tier_2_solicitor_review_required',
        userId: 'solicitor:vance',
        deviceId: 'dev-01',
        authorizedPolicy: 'policy:solicitor',
        decision: 'approved'
      });

      const chain = ledger.getReceipts();
      const tamperedChain: AuditReceipt[] = JSON.parse(JSON.stringify(chain));
      tamperedChain[1].previousReceiptHash = 'f'.repeat(64); // corrupted link

      const result = AuditLedger.verifyChain(tamperedChain);
      expect(result.valid).toBe(false);
      expect(result.tamperedIndex).toBe(1);
      expect(result.error).toContain('Chain broken at index 1');
    });

    it('detects deleted or inserted receipts via sequence discontinuity', () => {
      const ledger = new AuditLedger();
      ledger.append({ actionType: 'a0', tier: 'tier_1_autonomous_read_only', userId: 'u0', deviceId: 'd0', authorizedPolicy: 'p0', decision: 'autonomous_executed' });
      ledger.append({ actionType: 'a1', tier: 'tier_1_autonomous_read_only', userId: 'u1', deviceId: 'd1', authorizedPolicy: 'p1', decision: 'autonomous_executed' });
      ledger.append({ actionType: 'a2', tier: 'tier_1_autonomous_read_only', userId: 'u2', deviceId: 'd2', authorizedPolicy: 'p2', decision: 'autonomous_executed' });

      const chain = ledger.getReceipts();
      // Drop index 1
      const droppedChain = [chain[0], chain[2]];

      const result = AuditLedger.verifyChain(droppedChain);
      expect(result.valid).toBe(false);
      expect(result.tamperedIndex).toBe(1);
      expect(result.error).toContain('Sequence discontinuity at index 1');
    });
  });
});
