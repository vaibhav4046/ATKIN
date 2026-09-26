# ATKIN RELEASE EVIDENCE REPORT
**Project**: ATKIN Sovereign Legal AI (LexHack 2026 Production Reality Release)  
**Date**: 2026-09-26  
**Git Branch**: `main` (commit `5c04371`)  
**Remote**: `https://github.com/vaibhav4046/proofline.git`  
**Status**: AUDITED & CALIBRATED

---

## 1. Verified Release Installers & Checksums

| Platform | Target Architecture | Installer Type | File Path | Size (Bytes) | SHA-256 Checksum | Binary Build Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows Desktop** | `x86_64` | WiX MSI | `release/windows/Atkin_1.0.0_x64_en-US.msi` | 5,357,568 | `c8a88ed96491b53ab13ac39d9c461fda1ece1262ca7aabc7dde9011fab6ee4d4` | **BUILT & HASH VERIFIED** |
| **Windows Desktop** | `x86_64` | NSIS Setup | `release/windows/Atkin_1.0.0_x64-setup.exe` | 3,801,921 | `b659768689b4c742da92b49f5beef007ee05cbad499cdb1fc2d4e64d009f0586` | **BUILT & HASH VERIFIED** |
| **Android Mobile** | `aarch64` / universal | Signed APK | `release/android/Atkin-1.0.0-universal.apk` | 17,188,290 | `50eb140618639a05162eedc4c5d23b8b1d3d9b4e72e9ad455bc496793a63619d` | **BUILT & SIGNED** |

*Manifests verified on disk:*
- `release/windows/SHA256SUMS.txt`
- `release/android/SHA256SUMS.txt`

---

## 2. Host Build & Hardware Environment

- **Host Operating System**: Windows 11 Home (Build 26200.7623, `x86_64`)
- **Processor**: 16 Logical Cores (x86_64 Architecture)
- **Host RAM**: 16,384 MB (16.0 GB Total Physical Memory)
- **Host GPU**: NVIDIA GeForce RTX 3050 6GB Laptop GPU (CUDA 8.6, 5.0 GiB available VRAM)
- **Local Model Daemon**: Ollama Daemon listening on `http://127.0.0.1:11434`
- **Installed Local Models**:
  1. `gemma2:2b` (1,629,518,495 bytes, digest `8ccf136fdd52...`)
  2. `qwen2.5-coder:3b` (1,929,912,626 bytes, digest `f72c60cabf62...`)
  3. `gemma4:e2b-it-qat` (4,336,358,185 bytes, digest `07ea59a47401...`)
- **Rust Toolchain**: `rustc 1.98.1` / `cargo 1.98.1`
- **Node.js**: `v24.12.0`
- **Java / Android Toolchain**: OpenJDK 21.0.6, Android SDK API 34 / 36, Android NDK 27.1.12297006

---

## 3. Separate Out-of-Suite Environmental & Harness Verification
*(Reported separately as standalone environment runs — not inferred from Vitest in-memory tests)*

### A. Windows Desktop MSI Installation & Process Execution
- **MSI Command**: `msiexec.exe /i release\windows\Atkin_1.0.0_x64_en-US.msi /qn` (Exit Code 0).
- **Windows Registry Confirmation**:
  - `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\{B8779BC2-C1A2-4CF0-B2A8-FA8E5BF142BD}`
  - DisplayName: `Atkin`, DisplayVersion: `1.0.0`, Publisher: `atkin`, InstallLocation: `C:\Program Files\Atkin\`.
- **Installed Binary Verified**:
  - `C:\Program Files\Atkin\atkin.exe` (13,755,904 bytes).
- **Live Process & Dual-Tier Storage**:
  - Process `atkin.exe` spawned Edge WebView2 runtime children (`msedgewebview2.exe`).
  - Created `%LOCALAPPDATA%\Atkin\atkin_store.db` (45,056 bytes).
  - SQLite schema verified with 5 native tables: `user_profiles`, `matters`, `documents`, `drafts`, `memories`.
  - Tested process termination (`taskkill`) and restart: Verified persistent SQLite record retrieval across process lifecycle.
  - Visual Evidence: `release/screenshots/installed-windows-desktop.png`.

### B. Android Emulator Installation & Guided Onboarding
- **Device Target**: Google Pixel 9 Pro profile on Android Emulator `emulator-5554` (API Level 36, Android 14+).
- **Signing**: APK signed via Android SDK `build-tools/34.0.0/apksigner.bat` using Android debug keystore.
- **Installation**: `adb install -r release\android\Atkin-1.0.0-universal.apk` completed in 2,744 ms.
- **Activity Launch**: `com.atkin.legal/.MainActivity` displayed within 2.67s.
- **Automated 7-Step Onboarding Walkthrough**:
  - Step 1 (Welcome): `release/screenshots/android-emulator-launch2.png`
  - Step 2 (Practitioner Profile): `release/screenshots/android-step2.png`
  - Step 3 (Governing Jurisdiction): `release/screenshots/android-step3.png`
  - Step 4 (Workstation Security Posture): `release/screenshots/android-step4.png`
  - Step 5 (Hardware Profile): `release/screenshots/android-step5.png`
  - Step 6 (Drafting Style & OSCOLA Standard): `release/screenshots/android-step6.png`
  - Step 7 (Workstation Initialized): `release/screenshots/android-step7-real.png`
  - Clean Mobile Practice Workspace: `release/screenshots/android-current-state.png`.

### C. Cross-Device Pairing & Remote Desktop Inference
- **Local Transport**: `adb reverse tcp:11434 tcp:11434` established over USB/emulator socket.
- **Desktop Host**: Ollama daemon listening on `127.0.0.1:11434` utilizing **NVIDIA GeForce RTX 3050 6GB Laptop GPU** (CUDA 8.6, 5.0 GiB available VRAM).
- **Available Host Models**: `gemma2:2b`, `qwen2.5-coder:3b`, `gemma4:e2b-it-qat`.
- **Inference Execution**:
  - Request initiated from inside the Android emulator shell (`emulator-5554`) targeting `http://127.0.0.1:11434/api/generate`.
  - Model: `gemma2:2b`.
  - Prompt: `"Say only: ATKIN PAIR TEST SUCCESS"`.
  - Server Log Record: `[GIN] 2026/09/26 - 11:46:25 | 200 | 15.0901184s | 127.0.0.1 | POST "/api/generate"`.
  - Performance: Prompt eval 270.71 ms / 17 tokens, eval 103.98 ms / 8 tokens, total 374.69 ms / 25 tokens (**76.94 tokens/sec**).
  - Result: HTTP 200 OK with generation returned.

### D. Honest Disclosure: Mobile On-Device Offline Inference
- **APK Architecture**: 17.18 MB universal package containing WebView, assets, and Tauri mobile bridge.
- **Status**: **NOT IMPLEMENTED / ROADMAP (v1.1)** for local on-device GGUF execution. The universal APK does not bundle an embedded llama.cpp NDK or ExecuTorch runtime.
- **Operational Reality**: Mobile operates in **Remote Desktop Companion Mode** (LAN / reverse tunnel to desktop GPU) and **Deterministic Offline Evidential Mode** (100% local rule-grounded IRAC reasoning).

---

## 4. Section 36: Acceptance Journeys Audit & Coverage Matrix

20 acceptance scenarios have automated coverage: **7 integration-verified**, **7 unit-verified**, and **6 awaiting end-to-end verification**. Installed Windows, Android emulator, cross-device transport, and physical-device verification are reported separately above and are not inferred from Vitest results.

### Summary Classification Counts

| Classification | Count |
| :--- | :---: |
| **UNIT VERIFIED** | **7** |
| **INTEGRATION VERIFIED** | **7** |
| **UI AUTOMATION VERIFIED** | **0** |
| **DESKTOP DEVICE VERIFIED** | **0** |
| **ANDROID EMULATOR VERIFIED** | **0** |
| **PHYSICAL DEVICE VERIFIED** | **0** |
| **BLOCKED** | **0** |
| **UNVERIFIED** | **6** |
| **Total Scenarios** | **20** |

*The seven integration-verified journeys are A, B, C, D, E, F, O.*  
*The seven unit-verified journeys are J, K, L, M, P, S, T.*  
*The six journeys that are currently UNVERIFIED are G, H, I, N, Q, R.*

---

### Detailed Scenario-by-Scenario Evidence Matrix

| Journey | Acceptance Journey | Correct Classification | What Is Actually Proven |
| :---: | :--- | :---: | :--- |
| **A** | New Lawyer Onboarding | **INTEGRATION VERIFIED** | Profile creation/persistence and personal-workspace state are exercised through DB functions. The 7-screen onboarding UI itself is not automated or device-tested in this suite. |
| **B** | Matter Persistence | **INTEGRATION VERIFIED** | Matter save/read and personal/demo flags are tested through the persistence layer. It does not prove persistence across a real application process restart. |
| **C** | Document Persistence / Ingestion | **INTEGRATION VERIFIED** | A real fixture file is read, passed through `MatterAnalyzer`, hashed and split into spans. It uses a `.txt` fixture and bypasses the import UI/background-job/native-file journey. |
| **D** | Grounded Ask | **INTEGRATION VERIFIED** | Document analysis feeds the reasoning engine, which returns the expected 37-day answer and at least one source. This is a meaningful engine integration test, but not an Ask-UI/click-to-source E2E test. |
| **E** | Evidential Abstention | **INTEGRATION VERIFIED** | Analyzer + reasoning engine are exercised on an unsupported question and expected to abstain. No UI or live-model path is tested. |
| **F** | Chat History Retention | **INTEGRATION VERIFIED** | Two messages are saved and read back chronologically through DB APIs. No chat UI, application shutdown or process restart occurs. |
| **G** | Practitioner Preferences | **UNVERIFIED** | The test proves `citationFormat` and `draftingStyle` can be stored/read. It does not prove those preferences change generated output, survive a real restart, or affect the drafting pipeline. |
| **H** | Sovereign Memory Control | **UNVERIFIED** | The test inserts and retrieves one semantic entity. It does not exercise the five memory layers, Memory UI, edit/forget/pin controls, audit trail or behavioral effect claimed by the journey. |
| **I** | Contradiction Detection | **UNVERIFIED** | The supposed contradiction is already constructed as a `reviewItem` and handed to the reasoner. The test proves the reasoner can describe supplied conflict data, not that Atkin detects the contradiction itself. |
| **J** | Stale Draft Invalidation | **UNIT VERIFIED** | The test compares strings, decides `isStale`, and manually changes `draftBlock.reviewStatus` to `needs_review`. The staleness rule is proven, but the real source-change → dependency → draft-invalidation pipeline is not. |
| **K** | Procedural Skill Learning | **UNIT VERIFIED** | Directly calling `promoteWorkflowToSkill()` successfully creates a skill. Repetition detection, candidate proposal, practitioner approval, later reuse, versioning and rollback are not exercised. |
| **L** | Strict Matter Isolation | **UNIT VERIFIED** | A semantic entity inserted in Matter A does not appear from `getEntities(Matter B)`. This is a useful memory-isolation unit test, but not full retrieval/context/UI isolation. |
| **M** | Offline Desktop | **UNIT VERIFIED** | A deterministic reasoning function processes an in-memory local document. Network is not disabled or monitored, the Tauri application is not used and no local LLM is invoked. |
| **N** | Model Failure / Fallback | **UNVERIFIED** | The test does not kill Ollama or force a model-provider exception. It simply invokes the deterministic reasoner with no documents and checks its response. That is not a model-failure recovery test. |
| **O** | Desktop Process Restart | **INTEGRATION VERIFIED** | A draft is saved and immediately queried again from the DB. This verifies persistence-layer roundtrip, but no process is terminated, no Tauri app relaunch occurs and no SQLite→Dexie rehydration is actually demonstrated in this suite. |
| **P** | Pair Phone | **UNIT VERIFIED** | `createPairingSession()` generates a session ID, six-digit SAS and `atkin://` QR payload. No second application, network connection, Android runtime or cryptographic peer handshake is exercised. |
| **Q** | Mobile Offline Companion | **UNVERIFIED** | The entire assertion is effectively that a stored device has `trustState === 'trusted'`. There is no Android app, disconnected desktop, mobile model or offline generation in this test. |
| **R** | Cross-Device Delta Sync | **UNVERIFIED** | The test completes an in-process pairing call with the literal name "Lawyer Pixel 9 Pro" and checks the returned object. No note or state is transferred between two applications/devices. |
| **S** | Human Action Gate | **UNIT VERIFIED** | A plain object is created with `requiresExplicitConfirmation: true`, then another object is manually constructed with `confirmed_and_executed`. It proves the intended state invariant, not an actual gated external action. |
| **T** | Vault Backup & Restore | **UNIT VERIFIED** | `VaultService` initializes, exports a backup and restores it into another service instance. Useful crypto/service verification, but not a real full-workspace filesystem backup → reset → application restore journey. |

---

## 5. Automated Test Suite Metrics & Release Artifacts

- **Total Test Files**: 37 test suites
- **Total Tests**: 212 passing (100%)
- **Test Runner**: Vitest v3.2.7 (node environment with `fake-indexeddb`)
- **Execution Time**: ~2.9 seconds
- **Added Protocol & Engine Suites**:
  - `src/tests/astraProtocol.test.ts` (10 tests): Full ASTRA 5-pillar orchestration.
  - `src/tests/timeRuleEngine.test.ts` (7 tests): CPR 2.8 clear days, short-period exclusions, bank holidays, court closure rollover.
  - `src/tests/auditLedger.test.ts` (8 tests): RFC 8785 JCS canonicalization, FIPS 180-4 SHA-256 test vectors, previousReceiptHash chaining, tamper detection.
  - `src/tests/astraRandomizedEval.test.ts` (15 tests): Dynamic randomized notice extraction (13, 17, 29, 37, 41, 63), payment terms (14, 30, 45, 60), evidential abstention, and offline/Ollama model adapters.
  - `src/tests/citationGate.test.ts` (8 tests): 7-status byte provenance verification, offset bounds checking, text fidelity, and version mismatch detection.
  - `src/tests/legalAuthority.test.ts` (6 tests): Normative 8-category hierarchy, ContractVersionResolver, EvidenceWeightResolver (Gestmin principles), and RulePackEngine with UCTA 1977 / CRA 2015 applicability predicates.
  - `src/tests/toolRegistry.test.ts` (5 tests): Deterministic tool contract with SHA-256 execution records and permission gates.
  - `src/tests/pairingRemoteInference.test.ts` (5 tests): Ed25519 pairing, SAS verification, and authenticated remote desktop inference.
  - `src/tests/astraRuntime.test.ts` (5 tests): Full 12-stage ASTRA pipeline execution.
- **Release Evidence Artifacts**:
  - Test Artifact: `release/test-results/test-results.json`
  - Audit Chain (JSONL): `release/audit/audit-chain.jsonl`
  - Cryptographic Verification Report: `release/audit/audit-verification.txt`
  - Execution Traces: `release/traces/astra-pipeline-trace.json`
  - Evaluation Matrix: `release/evals/randomized-eval-report.json`

---

## 6. Real Source Ingestion & Evidential Abstention Fixtures

- **Test Fixture**: `fixtures/AlderPeak-Independent-Contract.pdf` (Independent Commercial Contract for Logistics Platform).
- **Verified Parameters**:
  - Supplier: *Alder Peak Systems Ltd*
  - Implementation Sum: *£18,420*
  - Payment Term: *45 calendar days*
  - Termination Notice: *37 calendar days* (Clause 3.2)
  - Governing Jurisdiction: *England and Wales*
- **Reasoning Engine Response Matrix (`src/tests/atkinRealSourceIngestion.test.ts`)**:
  - *Query 1 ("Notice Period")*: Ingested contract text, calculated SHA-256, extracted exact span for Clause 3.2, returned verbatim 37 calendar days with character offset citations.
  - *Query 2 ("Supplier Incorporation Date")*: Truthfully abstained without hallucinating any year or date.
  - *Query 3 ("Deed of Variation v2 Price Drift")*: Ingested Deed of Variation changing price to £17,900; evaluated draft staleness rule and flagged dependent block as `needs_review`.
