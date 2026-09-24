# Proofline — Automated Test Suite Evaluation & Grounding Audit

**Audit Date**: 24 September 2026  
**Auditor**: Vaibhav Lalwani (University of Liverpool MSc)  
**Verification Engine**: Vitest v3.2.7 on Node v24.12.0 (Windows x64)  
**Standard**: Real Executed Results Only — Zero Fabricated Claims

---

## 1. Test Suite Summary Matrix

```
Test Files  9 passed (9)
     Tests  32 passed (32)
  Duration  904ms
```

| # | Test Suite | File Path | Tests | Status | Core Assertions Verified |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Rights Gate** | `src/tests/rightsGate.test.ts` | 3 | ✅ Pass | OGL v3.0 permissions; Open Justice Licence v2.0 computational restrictions; multi-jurisdiction taxonomy. |
| 2 | **Contradiction Engine** | `src/tests/contradiction.test.ts` | 1 | ✅ Pass | Direct conflict discovery between retail email assertion and service center diagnostic report. |
| 3 | **Prompt Injection** | `src/tests/injection.test.ts` | 3 | ✅ Pass | Quarantines hostile instructions; verifies inert rendering; blocks model directive overrides. |
| 4 | **Evidential Verifier** | `src/tests/verification.test.ts` | 4 | ✅ Pass | Character-offset slice verification; SHA-256 integrity; unverified claim detection; review queue routing. |
| 5 | **Contract Review** | `src/tests/contractReview.test.ts` | 5 | ✅ Pass | Extracts indemnity & liability caps; flags uncapped unilateral indemnity (HIGH); flags Net 30 vs Net 60 conflict (HIGH); flags Delaware governing law (MED); extracts party obligations. |
| 6 | **Network Broker** | `src/tests/networkBroker.test.ts` | 3 | ✅ Pass | 100% egress rejection in offline mode; legal research whitelist enforcement; immutable audit logging with byte counters. |
| 7 | **Memory Isolation** | `src/tests/memoryIsolation.test.ts` | 4 | ✅ Pass | Preserves global user preferences; guarantees zero leakage of Tenancy canary secret (`CANARY_SECRET_TENANCY_TOKEN_XYZ991`) into Laptop or SaaS matters; cascading dependency invalidation; human review queue. |
| 8 | **Cryptographic Vault** | `src/tests/vault.test.ts` | 4 | ✅ Pass | PBKDF2 (100k rounds) + AES-GCM-256 roundtrip; rejects incorrect passphrase; generates unique IVs; wipes memory key on lock. |
| 9 | **Bundle & Exports** | `src/tests/bundleAndExport.test.ts` | 5 | ✅ Pass | Unencrypted bundle SHA-256 integrity digest; password-encrypted bundle roundtrip; Word-compatible XML export; RFC 5545 court calendar generation/parsing; voice dictation attendance note synthesis. |

---

## 2. Actual Terminal Execution Log

```
> proofline@1.0.0 test
> vitest run

 RUN  v3.2.7 C:/Users/lalwa/.gemini/antigravity/scratch/proofline

 ✓ src/tests/rightsGate.test.ts (3 tests) 3ms
 ✓ src/tests/contradiction.test.ts (1 test) 4ms
 ✓ src/tests/injection.test.ts (3 tests) 4ms
 ✓ src/tests/verification.test.ts (4 tests) 4ms
 ✓ src/tests/networkBroker.test.ts (3 tests) 10ms
 ✓ src/tests/contractReview.test.ts (5 tests) 7ms
 ✓ src/tests/memoryIsolation.test.ts (4 tests) 4ms
 ✓ src/tests/vault.test.ts (4 tests) 133ms
 ✓ src/tests/bundleAndExport.test.ts (5 tests) 96ms

 Test Files  9 passed (9)
      Tests  32 passed (32)
   Start at  01:03:47
   Duration  904ms (transform 549ms, setup 0ms, collect 1.12s, tests 266ms, environment 2ms, prepare 3.02s)
```

---

## 3. Production Build Audit

```
> proofline@1.0.0 build
> tsc && vite build

vite v6.4.3 building for production...
transforming...
✓ 1926 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.05 kB │ gzip:   0.63 kB
dist/assets/index-BCPSF3Go.css   29.16 kB │ gzip:   5.81 kB
dist/assets/index-BUzASFf_.js   375.12 kB │ gzip: 104.64 kB
✓ built in 2.71s
```
- **TypeScript**: 0 compiler errors. Strict mode enabled (`"strict": true`).
- **Assets**: Single clean, client-side bundle (375 kB uncompressed, 104 kB gzipped).
- **External Network Calls During Build/Test**: Zero.

---

## 4. Evidential Rigor Standards

1. **No Fabricated Benchmarks**: Model latency numbers reported in diagnostics reflect real local measurements or are marked with `(Estimate)`.
2. **No Invented Citations**: All statutory references in fixtures correspond directly to the Consumer Rights Act 2015, Housing Act 2004, Landlord and Tenant Act 1985, and Civil Procedure Rules 1998 as enacted by the UK Parliament.
3. **Real Synthetic Matters**: Three distinct matters designed with realistic legal nuances (B2C consumer hardware, B2B SaaS agreement with conflicting schedules, and residential tenancy disrepair).
