# ATKIN ASTRA v1.2.0 — Security Notes & Cryptographic Assurances

**Standard**: FIPS 180-4, RFC 8785 (JCS), SRA Code of Conduct, GDPR Art 32  
**Date**: 26 September 2026  
**Auditor**: Antigravity (Google DeepMind Advanced Agentic Coding)  

---

## 1. Cryptographic Standards Implemented

| Primitive | Standard / Algorithm | Implementation File | Verification Test |
| :--- | :--- | :--- | :--- |
| **Audit Ledger Hashing** | SHA-256 (FIPS 180-4) | `src/engine/protocol/auditLedger.ts` | `src/tests/auditLedger.test.ts` (tested against NIST vectors) |
| **JSON Canonicalization** | RFC 8785 (JCS) | `src/engine/protocol/auditLedger.ts` | Canonical key sorting, integer formatting, escaped unicode |
| **Sovereign Vault Encryption** | AES-GCM-256 | `src/engine/vault/crypto.ts` | `src/tests/vault.test.ts` (12-byte IV, 16-byte auth tag) |
| **Key Derivation Function** | PBKDF2 with SHA-256 | `src/engine/vault/crypto.ts` | 100,000 rounds, 16-byte random salt |
| **Device Identity Keys** | Ed25519 (RFC 8032) | `src/engine/protocol/devicePairingProtocol.ts` | `src/tests/pairingRemoteInference.test.ts` |
| **Ephemeral Key Exchange** | X25519 / Diffie-Hellman | `src/engine/protocol/devicePairingProtocol.ts` | Authenticated session material derivation |
| **Session Key Derivation** | HKDF (RFC 5869) | `src/engine/protocol/devicePairingProtocol.ts` | SHA-256 HKDF extract-and-expand |
| **Out-of-Band SAS** | 6-Digit Numeric SAS | `src/engine/protocol/devicePairingProtocol.ts` | Visual confirmation against shoulder-surfing |

---

## 2. Security Boundaries & Enforcements

1. **Airgap Network Egress**:
   - `NetworkBroker` enforces policy at the application boundary.
   - In `offline` mode, any call to `fetch()` or external sockets throws `EgressBlockedError` and records an audit incident.
   - Tested in `src/tests/networkBroker.test.ts`.

2. **Matter Memory Isolation**:
   - Each matter has an isolated memory partition.
   - Queries in Matter B cannot retrieve documents, spans, claims, or memories from Matter A.
   - Tested in `src/tests/memoryIsolation.test.ts` and `src/tests/injection.test.ts`.

3. **Prompt Injection Containment**:
   - Untrusted documents containing system override directives (e.g. `"SYSTEM OVERRIDE: IGNORE ALL LAWS"`) are parsed strictly as literal text data nodes.
   - Document spans cannot escalate permissions or execute unapproved tools.
   - Tested in `src/tests/injection.test.ts`.

4. **Cryptographic Tamper Detection**:
   - Audit receipts are hash-chained (`previousReceiptHash`).
   - If any past receipt in `release/audit/audit-chain.jsonl` is modified by even a single character, `AuditLedger.verifyChain()` immediately returns `valid: false` with the exact sequence number that failed.
   - Tested in `src/tests/auditLedger.test.ts`.

5. **CitationGate Integrity**:
   - Citations are checked independently from the generation step.
   - Validates that source spans belong to the active matter, match exact character offsets, and match SHA-256 checksums.
   - Tested across all 7 statuses in `src/tests/citationGate.test.ts`.
