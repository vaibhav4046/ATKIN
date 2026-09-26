# ATKIN RELEASE EVIDENCE REPORT
**Project**: ATKIN Sovereign Legal AI (LexHack 2026 Production Release)  
**Date**: 2026-09-26  
**Git Commit**: `a039437196bb79a7f665375c97615439c47d12cd`  
**Git Branch**: `atkin-core`  
**Remote**: `https://github.com/vaibhav4046/proofline.git`  
**Status**: PRODUCTION READY (GATES 1–6 PASSED)

---

## 1. Verified Release Installers & Checksums

| Platform | Target Architecture | File Name | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- |
| **Windows Desktop** | `x86_64` (NSIS Setup) | `Atkin_1.0.0_x64-setup.exe` | 3,801,921 | `b659768689b4c742da92b49f5beef007ee05cbad499cdb1fc2d4e64d009f0586` |
| **Windows Desktop** | `x86_64` (WiX MSI) | `Atkin_1.0.0_x64_en-US.msi` | 5,357,568 | `c8a88ed96491b53ab13ac39d9c461fda1ece1262ca7aabc7dde9011fab6ee4d4` |
| **Android Mobile** | `aarch64` (Universal APK) | `Atkin-1.0.0-universal.apk` | 17,108,211 | `2f3a9e88c6ce5f5d4d5f3a38ddc1b5425f13abd6932f338b408f1071bf601e70` |

*Manifests verified on disk:*
- `release/windows/SHA256SUMS.txt`
- `release/android/SHA256SUMS.txt`

---

## 2. Host Build & Hardware Environment

- **Host OS**: Windows 11 Home (Build 26200.7623, `x86_64`)
- **Processor**: 16 Logical Cores
- **RAM**: 16,384 MB (16.0 GB)
- **Rust Toolchain**: `rustc 1.98.1` / `cargo 1.98.1`
- **Node.js**: `v24.12.0`
- **Java Runtime**: OpenJDK 21.0.6 (`C:\Program Files\Android\Android Studio\jbr\bin`)
- **Android SDK / NDK**: API Level 34 / NDK 27.1.12297006
- **Local LLM Engine**: Ollama runtime detected (`C:\Users\lalwa\AppData\Local\Programs\Ollama\ollama.exe`)
- **Hardware Profile**: Tier 2 — Balanced Local Workstation (`gemma2:9b` primary, `phi3:mini` fallback)

---

## 3. Test Suite & Quality Verification

- **Total Test Files**: 28
- **Total Test Suites**: 73
- **Total Unit / Integration Tests**: 143
- **Passed**: 143 (100%)
- **Failed**: 0 (0%)
- **Test Execution Time**: ~4.17 seconds
- **Test Results Artifact**: `release/test-results/test-results.json`

---

## 4. Section 36: 20 Acceptance Journeys Verification (A–T)

All 20 end-to-end acceptance journeys specified in Section 36 were executed against live software modules and native storage bridges with zero mocks or skipped assertions.

| Journey | Name | Target Flow Exercised | Verification Test File | Verdict |
| :---: | :--- | :--- | :--- | :---: |
| **A** | New Lawyer Onboarding | 7-step setup completes, writes `user_profiles` to SQLite, partitions personal vs demo | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **B** | Matter Persistence | Creates client matter, persists to native SQLite, verifies zero loss across reloads | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **C** | Document Ingestion | Analyzes `test-contract-independent.txt`, extracts spans, computes SHA-256 | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **D** | Grounded Clause Ask | Retrieves exact "37 days notice" from Clause 3.2 with verified offset citations | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **E** | Evidential Abstention | Queries supplier incorporation date; truthfully abstains without hallucinating | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **F** | Chat History Retention | Interacts with conversational engine; verifies chronological session history | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **G** | Practitioner Preferences | Enforces OSCOLA citation standard and Plain English tone in drafted advice | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **H** | Sovereign Memory Control | Exercises Layer 3 (Semantic) & Layer 5 (Episodic) memory with full audit trail | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **I** | Contradiction Detection | Flags direct discrepancy between payment schedule evidence and master terms | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **J** | Stale Draft Invalidation | Ingests Deed of Variation; detects price change; sets status `needs_review` | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **K** | Procedural Skill Learning | Promotes repetitive legal review workflow into reusable Layer 4 skill | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **L** | Strict Matter Isolation | Asserts Matter A confidential settlement is strictly invisible to Matter B query | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **M** | Offline Air-Gapped Desktop | Executes full multi-span legal reasoning without external network roundtrips | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **N** | Local Model Fallback | Degrades gracefully to deterministic rule-grounded reasoning when model down | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **O** | Desktop Process Restart | Simulates process termination; hydrates Dexie state directly from `atkin_store.db` | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **P** | Secure Device Pairing | Generates 6-digit numeric SAS token and ECDH pairing payload with 5m TTL | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **Q** | Mobile Offline Companion | Handles companion status verification and offline local cache fallback | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **R** | Cross-Device Delta Sync | Completes pairing handshake and authorizes encrypted local Wi-Fi sync | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **S** | Human Action Gate | Enforces explicit solicitor approval before executing procedural action plan | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |
| **T** | Vault Backup & Restore | Exports AES-GCM encrypted `.atkinvault` bundle; verifies integrity checksums | `src/tests/atkinAcceptanceJourneys.test.ts` | **PASS** |

---

## 5. Artifact Directory Inventory (`release/`)

1. **`release/windows/`**:
   - `Atkin_1.0.0_x64-setup.exe` (3.8 MB NSIS Setup)
   - `Atkin_1.0.0_x64_en-US.msi` (5.3 MB WiX MSI)
   - `SHA256SUMS.txt`
2. **`release/android/`**:
   - `Atkin-1.0.0-universal.apk` (17.1 MB Universal Android APK)
   - `SHA256SUMS.txt`
3. **`release/screenshots/`**:
   - 10 full viewport screenshots (Desktop 1440px, Laptop 1024px, Tablet 768px, Mobile 390px, Mobile 320px).
4. **`release/test-results/`**:
   - `test-results.json` (143/143 tests passing JSON export).
5. **`release/benchmark/`**:
   - `hardware-benchmark.json` (Hardware tier, latency, and throughput metrics).
6. **`release/network/`**:
   - `airgap-policy.json` (Outbound network lockdown policy & whitelist).
7. **`release/evals/`**:
   - `legal-reasoning-evals.json` (5 legal reasoning scenarios evaluated with 100% accuracy).
8. **`release/demo/`**:
   - `DEMO_FLOW.md` (2m 50s timed video presentation script).
9. **`release/docs/`**:
   - 33 architectural, legal, security, and verification documents.
