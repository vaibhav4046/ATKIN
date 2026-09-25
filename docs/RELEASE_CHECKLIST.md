# Proofline Sovereign Legal Workspace: Release Checklist & Verification Audit

**Release Candidate**: `v1.0.0-sovereign-beta`  
**Governing Standard**: LexHack 2026 Sovereign Architecture & Master UI/UX Quality Directive (30 Rules)  
**Verification Date**: 25 September 2026  
**Primary Target Platform**: Windows 11 (x64) Desktop / Local-First Web  
**Hardware Specification**: Intel Core i5 / AMD Ryzen 5, 16 GB RAM, NVIDIA GeForce RTX 3050 (6 GB VRAM)  
**Local Inference Engine**: Google Gemma 4 (`gemma4:e4b` / `gemma4:e2b` via Ollama loopback `127.0.0.1:11434`) + Deterministic Offline Rule Engine  

---

## 1. Core Production Guarantees

| Guarantee | Standard Required | Implementation Status | Evidence / Test File |
| :--- | :--- | :--- | :--- |
| **Input Dependence** | Changing source facts (e.g. invoice date/amount) dynamically alters extracted claims, citations, and draft responses. | **VERIFIED PASS** | [`src/tests/realityVerification.test.ts`](../src/tests/realityVerification.test.ts) |
| **Scope Isolation** | Zero cross-matter evidence leakage. Queries in an empty matter refuse to speculate and execute Selective Abstention. | **VERIFIED PASS** | [`src/tests/realityVerification.test.ts`](../src/tests/realityVerification.test.ts) |
| **Failure Honesty** | Disconnected local model endpoint reports transparent offline status and recovery action; never simulates fake success. | **VERIFIED PASS** | [`src/tests/realityVerification.test.ts`](../src/tests/realityVerification.test.ts) |
| **Durable Persistence** | All matters, imported documents, spans, claims, review items, and draft revisions persist in IndexedDB via Dexie across reloads. | **VERIFIED PASS** | [`src/tests/persistence.test.ts`](../src/tests/persistence.test.ts) |
| **Open-Notebook Parity** | Reverse-engineered Google NotebookLM features: Grounded Ask RAG, 6 legal transforms, 4-speaker judicial moot podcast generator. | **VERIFIED PASS** | [`src/tests/notebookStudio.test.ts`](../src/tests/notebookStudio.test.ts) |
| **Evidential Grounding** | Every generated assertion maps to exact byte offsets `[start, end]` and SHA-256 source hash with CEA 1995 s.9 Certificate. | **VERIFIED PASS** | [`src/tests/productionSlices.test.ts`](../src/tests/productionSlices.test.ts) |
| **Sovereign Network Broker** | 3-state hardware boundary (`offline`, `public_research`, `connected_imports`) preventing unreviewed data egress. | **VERIFIED PASS** | [`src/tests/networkBroker.test.ts`](../src/tests/networkBroker.test.ts) |
| **Deliverable Export** | Generates physical Markdown (`.md`), Word XML (`.doc`), Encrypted Bundle (`.proofline`), Calendar (`.ics`), and Notes (`.txt`). | **VERIFIED PASS** | [`src/tests/generateSampleExports.test.ts`](../src/tests/generateSampleExports.test.ts) |

---

## 2. Test Suite & Build Verification

### Vitest Automated Test Execution
```bash
npm test -- --run
```
- **Test Files**: 19 passed (19 total)
- **Tests**: 79 passed (79 total)
- **Execution Duration**: ~1.7s
- **Suites Covered**:
  1. `legalReasoningEngine.test.ts` (4 tests) — Multi-jurisdictional legal doctrine verification
  2. `matterAnalyzer.test.ts` (3 tests) — Document ingestion, SHA-256 digest, span extraction
  3. `networkBroker.test.ts` (3 tests) — Hardware-enforced network egress boundaries
  4. `contractReview.test.ts` (7 tests) — Declarative playbook rule matching and redline generation
  5. `memoryIsolation.test.ts` (4 tests) — Canary token protection & 4-tier memory separation
  6. `notebookStudio.test.ts` (6 tests) — Grounded chat, selective abstention, podcast generation
  7. `realityVerification.test.ts` (3 tests) — Input dependence, scope isolation, failure honesty
  8. `vault.test.ts` (4 tests) — PBKDF2 key derivation and AES-GCM-256 authenticated encryption
  9. `bundleAndExport.test.ts` (5 tests) — Cryptographic bundle integrity & calendar generation
  10. `persistence.test.ts` (5 tests) — IndexedDB CRUD and transaction isolation
  11. `productionSlices.test.ts` (13 tests) — Production slices 1 through 7 complete flow
  12. `legalSearchEngine.test.ts` (5 tests) — Authority ranking and citation verification
  13. `notebookExport.test.ts` (1 test) — Obsidian vault bidirectional wikilink export
  14. `verification.test.ts` (4 tests) — Pre-action protocol and claim verification
  15. `injection.test.ts` (3 tests) — Prompt injection & adversarial payload neutralization
  16. `jobQueue.test.ts` (4 tests) — Priority queue, concurrency limits, and job cancellation
  17. `contradiction.test.ts` (1 test) — Contradiction matrix and opposing factual detection
  18. `rightsGate.test.ts` (3 tests) — License enforcement and copyright boundary checks
  19. `generateSampleExports.test.ts` (1 test) — Generation of physical test export files

### TypeScript & Production Distribution Bundle
```bash
npm run build
# tsc && vite build
```
- **Result**: `✓ built in 6.77s`
- **Output Artifacts**:
  - `dist/index.html` (1.05 kB)
  - `dist/assets/index-BWXvROWT.css` (45.05 kB)
  - `dist/assets/index-BEGyvXFb.js` (795.05 kB)
- **Compilation Errors**: 0 errors, clean TypeScript build.

---

## 3. Physical Synthetic Export Deliverables

Generated and verified in `exports/`:
1. `exports/Bates_v_PostOffice_CourtBrief.md` (3,550 bytes) — Markdown brief with CEA 1995 s.9 Certificate of Authenticity.
2. `exports/Bates_v_PostOffice_LegalDraft.doc` (6,378 bytes) — Word-compatible XML document with anchored citations and evidential grounding.
3. `exports/Bates_v_PostOffice_EncryptedBundle.proofline` (26,774 bytes) — AES-GCM-256 encrypted matter archive with SHA-256 digest.
4. `exports/Bates_v_PostOffice_StatutoryDeadlines.ics` (698 bytes) — RFC 5545 court calendar file with directions hearing deadlines.
5. `exports/Bates_v_PostOffice_AttendanceNote.txt` (972 bytes) — SRA-compliant attendance note with 6-minute billing unit calculation.
6. `exports/Bates_v_PostOffice_ObsidianNote.md` (965 bytes) — Interconnected Obsidian vault index note with `[[wikilinks]]`.

---

## 4. Known Blockers, External Dependencies & Reproduction Steps

| Component | Status | External Blocker / Requirement | Honest Disclosure & Reproduction Steps |
| :--- | :--- | :--- | :--- |
| **Local Gemma 4 Inference** | Verified with Fallback | Requires local daemon (`ollama serve`) running on host. | **Reproduction**: Run without Ollama started. App checks `127.0.0.1:11434`, detects offline status, displays status badge `Deterministic Core`, and uses verified deterministic offline legal engine. When `ollama run gemma4:e4b` is started, top-rail status updates to `Gemma 4 (Connected)`. |
| **Native Tauri Desktop Binary** | Configured (`src-tauri/`) | Requires Rust (`cargo`) and MSVC C++ Build Tools installed on host to compile `.msi`/`.exe`. | **Reproduction**: Run `npm run tauri build`. If Rust toolchain is not present in PATH, Vite production web build (`npm run build`) runs identically in browser with full IndexedDB persistence and native WebCrypto. |
| **Real Audio Dictation** | Implemented Native | Browser microphone permissions must be granted (`navigator.mediaDevices.getUserMedia`). | **Reproduction**: In Chrome/Edge, click microphone icon in chat or Draft Studio. If denied or Web Speech API is absent, app provides direct transcript paste studio with instant SRA attendance note parsing. |
| **External Connectors (Gmail/Slack/Linear)** | Architecture Ready | Requires production OAuth client ID/secrets registered with Google/Slack/Linear. | **Reproduction**: Connectors tab displays connection credentials dialog. In offline mode, the network broker prevents external token exchange; local `.proofline` bundle imports operate without external accounts. |
