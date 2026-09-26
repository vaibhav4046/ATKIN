# ATKIN ASTRA v1.2.0 — Test Results & Evidence Log

**Test Framework**: Vitest v3.2.7  
**Execution Date**: 26 September 2026  
**Total Test Files**: 38 passed (38 total)  
**Total Tests**: 214 passed (214 total)  
**Failures**: 0  
**Skipped**: 0  

---

## 1. Test Suite Summary Table

| Test Suite File | Test Count | Status | Key Capabilities Tested |
| :--- | :--- | :--- | :--- |
| `src/tests/chatEngineAstra.test.ts` | 2 | **PASS** | 12-Stage ASTRA pipeline, CitationGate status, RFC 8785 audit hash, evidential abstention. |
| `src/tests/astraRandomizedEval.test.ts` | 15 | **PASS** | Dynamic notice extraction (13-63 days), payment terms (14-60 days), incorporation abstention. |
| `src/tests/astraRuntime.test.ts` | 5 | **PASS** | Master 12-stage pipeline execution, approval tiers, audit chaining, memory write gate. |
| `src/tests/citationGate.test.ts` | 8 | **PASS** | All 7 provenance statuses: VERIFIED, MISSING_SOURCE, WRONG_MATTER, TEXT_MISMATCH, etc. |
| `src/tests/timeRuleEngine.test.ts` | 7 | **PASS** | CPR 2.8 clear days calculation, weekend/holiday exclusion, court office rollover. |
| `src/tests/auditLedger.test.ts` | 8 | **PASS** | RFC 8785 JSON canonicalization, FIPS 180-4 SHA-256 test vectors, tamper detection. |
| `src/tests/legalAuthority.test.ts` | 6 | **PASS** | 8-tier UK legal hierarchy, ContractVersionResolver, EvidenceWeightResolver (Gestmin). |
| `src/tests/toolRegistry.test.ts` | 5 | **PASS** | Deterministic tools, SHA-256 execution records, capability permission gates. |
| `src/tests/pairingRemoteInference.test.ts` | 5 | **PASS** | Ed25519 pairing, 6-digit SAS verification, authenticated remote desktop inference. |
| `src/tests/atkinAcceptanceJourneys.test.ts` | 20 | **PASS** | Core acceptance journeys A through T (integration verified via fake-indexeddb). |
| `src/tests/atkinMemoryLayers.test.ts` | 14 | **PASS** | 5 memory layers: Working, Episodic, Semantic, Procedural, Governance. |
| `src/tests/memoryIsolation.test.ts` | 4 | **PASS** | Cross-matter leakage protection; foreign matter memory access blocked. |
| `src/tests/vault.test.ts` | 4 | **PASS** | PBKDF2 key derivation (100k rounds), AES-GCM-256, auto-lock, incorrect passphrase rejection. |
| `src/tests/atkinRealSourceIngestion.test.ts` | 5 | **PASS** | Document byte-hash computation, span slicing, evidential abstention, deed of variation drift. |
| `src/tests/atkinNativeStorageBridge.test.ts` | 3 | **PASS** | SQLite hydration bridge, matter hydration, user profile persistence. |
| `src/tests/atkinWorkspaceProfile.test.ts` | 2 | **PASS** | Personal vs Demo workspace separation, UserProfile persistence. |
| `src/tests/bundleAndExport.test.ts` | 5 | **PASS** | Encrypted `.proofline` bundle roundtrip, DOCX export, ICS calendar generation. |
| `src/tests/contractReview.test.ts` | 7 | **PASS** | Contract playbook audit, uncapped indemnity redlines, liability limits. |
| `src/tests/contradiction.test.ts` | 1 | **PASS** | Temporal and numerical discrepancy detection between claims. |
| `src/tests/injection.test.ts` | 3 | **PASS** | Indirect prompt injection quarantine; instructions treated strictly as inert text. |
| `src/tests/jobQueue.test.ts` | 4 | **PASS** | Persistent background job queue, retry policies, cancellation. |
| `src/tests/legalReasoningEngine.test.ts` | 4 | **PASS** | IRAC formal structuring, satisfaction of statutory requirements. |
| `src/tests/legalSearchEngine.test.ts` | 5 | **PASS** | Hybrid lexical and entity search across legal sources. |
| `src/tests/matterAnalyzer.test.ts` | 3 | **PASS** | Raw text to structured spans, entities, and preliminary claims. |
| `src/tests/networkBroker.test.ts` | 3 | **PASS** | Network egress interception; `EgressBlockedError` in offline mode. |
| `src/tests/notebookExport.test.ts` | 1 | **PASS** | Obsidian Markdown vault export with wikilinks. |
| `src/tests/notebookStudio.test.ts` | 6 | **PASS** | Multi-speaker judicial synthesis, context token packing. |
| `src/tests/persistence.test.ts` | 6 | **PASS** | Dexie IndexedDB entity persistence and schema validation. |
| `src/tests/productionSlices.test.ts` | 13 | **PASS** | 6 quality contracts, benchmark suite, corpus collection. |
| `src/tests/realityVerification.test.ts` | 3 | **PASS** | Local Ollama connectivity probing and offline fallback. |
| `src/tests/regressionIntegrity.test.ts` | 9 | **PASS** | Regression prevention across all previous issue patches. |
| `src/tests/rightsGate.test.ts` | 3 | **PASS** | Copyright and fair-dealing rights assessment for research sources. |
| `src/tests/verification.test.ts` | 4 | **PASS** | Evidential verification checks for client draft briefs. |
| `src/tests/generateSampleExports.test.ts` | 1 | **PASS** | Export artifact generation (Obsidian note, ICS calendar, encrypted bundle). |
| `src/tests/atkinFactualReasoning.test.ts` | 2 | **PASS** | Factual grounding and refusal of unrecorded facts. |
| `src/tests/atkinDevicePairing.test.ts` | 5 | **PASS** | QR code pairing handshake, session material derivation. |
| `src/tests/astraProtocol.test.ts` | 10 | **PASS** | ASTRA protocol state transitions and scope locking. |

---

## 2. Test Execution Command

To reproduce 100% of these test results locally:

```bash
npx vitest run
```

Machine-readable JSON output: `release/test-results/test-results.json`.
