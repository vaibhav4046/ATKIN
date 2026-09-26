# ATKIN: CAPABILITY LEDGER

**Audit Date**: 26 September 2026  
**Status Legend**:
- **REAL**: Fully operational, verified against real local storage and actual runtime.
- **PARTIAL**: Basic logic works, but edge cases, UX, or generalization require completion.
- **MOCK**: Simulated or hardcoded response pretending to be functional; must be repaired or quarantined.
- **STATIC**: UI display only without underlying functional persistence or execution.
- **UNVERIFIED**: Implementation exists but requires native hardware, account, or physical device to execute.

---

## Capability Status Matrix

| Feature / Subsystem | Route / Component | UI Exists? | Persisted? | Real Backend? | Offline? | Test? | Status | Audit Finding & Action Required |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Grounded IRAC Engine** | `src/engine/reasoning/legalReasoningEngine.ts` | Yes | Yes (IndexedDB) | Deterministic | Yes | Yes (92 tests) | **PARTIAL** | Hardcoded contract templates trigger on the word "clause" and append irrelevant indemnity advice. Must make answer direct and clause-focused. |
| **Model Bridge Fallback** | `src/engine/modelBridge.ts` | Yes | N/A | Ollama / Fallback | Yes | Yes | **MOCK** | Fixed Consumer Rights Act goods-failure paragraph in catch block. Replace with honest error and truthful offline state. |
| **Workspace Model** | `src/App.tsx`, `src/db/index.ts` | Partial | Yes | Dexie IndexedDB | Yes | Yes | **MOCK** | Demo matters (Bates, NovaCorp, etc.) are seeded into user's default list. Must separate into `Personal Workspace` (empty by default) and `Demo Workspace`. |
| **Onboarding System** | `src/components/onboarding/` | No | No | No | Yes | No | **STATIC / MISSING** | First-time launch drops user straight into prefilled law firm. Must build 7-screen onboarding. |
| **UserProfile & Preferences** | `src/types/user.ts`, `src/db/` | Partial | LocalStorage | Partial | Yes | No | **PARTIAL** | User preferences do not dynamically alter model generation or citation formatting. Must implement full `UserProfile` model in DB. |
| **5-Layer Memory Engine** | `src/engine/memory/memoryEngine.ts` | Partial | In-Memory / Dexie | Partial | Yes | Yes | **PARTIAL** | Basic 4-tier memory exists. Missing Layer 1 Working Memory (ContextPlanner), Layer 2 Episodic Memory (Episodes), Layer 3 Semantic Legal Ontology, Layer 4 Procedural Skills, Layer 5 Governance (TTL/Supersession). |
| **Contradiction Detection** | `src/engine/contradictionEngine.ts` | Yes | Yes | Propositional | Yes | Yes | **REAL** | Detects date/term discrepancies, but needs user review actions: "Use first", "Use second", "Keep disputed", "Add note". |
| **Document Ingestion** | `src/engine/ingestion/matterAnalyzer.ts` | Yes | Yes | WebCrypto SHA-256 | Yes | Yes | **REAL** | Ingests text, md, eml, extracts spans with SHA-256 byte offsets. Holdout test fixture must be passed without boilerplate. |
| **Drafting Studio** | `src/components/workbench/DraftTab.tsx` | Yes | Yes | Local State / DB | Yes | Yes | **REAL** | Editable blocks, Word XML (.doc) and Markdown export. Needs source change staleness warning indicator. |
| **Tauri 2 Windows Binary** | `src-tauri/` | Yes | Yes | Rust Core / MSVC | Yes | Yes | **REAL** | Produces `proofline.exe`, NSIS installer, and MSI installer with verified SHA-256 hashes. Needs rebranding to Atkin. |
| **Device Pairing Protocol** | `src/engine/pairing/` | No | No | No | Yes | No | **UNVERIFIED / MISSING** | Must build QR-based authenticated pairing protocol with device identity keys for phone access. |
| **Android APK** | `src-tauri/` / Mobile | No | No | No | Yes | No | **UNVERIFIED / MISSING** | Mobile architecture and Android manifest/shell required for cross-device support. |
| **Connectors (Mail/Drive)** | `src/engine/connectors/` | Yes | Yes | Offline Parsers | Yes | Yes | **PARTIAL** | Ingests offline RFC 822 `.eml` and JSON. Clearly label as "Offline File Importer", not live OAuth sync. |
