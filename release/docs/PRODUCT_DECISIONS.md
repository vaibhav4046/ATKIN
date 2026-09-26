# Proofline — Product Decisions & Architectural Guarantees

This document records the foundational product and design decisions governing Proofline, answering the core inquiries required for a sovereign legal workspace.

---

### 1. Who is the primary user and which workflow is being validated first?
- **Primary User**: Solicitors, barristers, corporate general counsels, paralegals, and supervised legal professionals handling confidential contentious and non-contentious legal matters (civil litigation, contractual risk review, tenancy disputes, regulatory compliance).
- **First Validated Workflow**: The end-to-end evidence-to-draft lifecycle:
  $$\text{Create Matter} \longrightarrow \text{Import Contemporary Sources} \longrightarrow \text{Query Evidence (Character-Grounded)} \longrightarrow \text{Draft & Redline} \longrightarrow \text{Import Changed Evidence} \longrightarrow \text{Audit Affected Claims} \longrightarrow \text{Export Section 9 Court Bundle}$$
  This workflow tests the real evidential spine of legal practice: establishing factual reality, auditing contradictions, and producing admissible work product without cloud exposure.

---

### 2. What recurring problem does this implementation solve?
- **Evidential Hallucination & Confidentiality Breach**: Commercial legal teams are strictly constrained by legal privilege (SRA Code of Conduct, ABA Model Rule 1.6, GDPR Art. 9) from pasting privileged client files into third-party cloud LLMs. Furthermore, standard RAG systems hallucinate citations and cannot tie assertions to exact character byte-offsets or verify computer log admissibility under the **Civil Evidence Act 1995 s.9**.
- **Solution**: Proofline runs 100% on the user's hardware (local Gemma 4 / Ollama / deterministic rule engine) with an encrypted local SQLCipher/IndexedDB vault, strict cryptographic canary isolation, 4-timestamp temporal provenance, and exact byte-level evidence anchoring.

---

### 3. What primary action does each major screen enable?
1. **Matter Overview (`OverviewTab`)**: Review morning priority queue (stale claims, unverified assertions, scheduled court deadlines) and assess the matter Evidence Coverage Ratio.
2. **Evidential Copilot (`ChatTab`)**: Converse with local inference models strictly bounded by checked discovery sources; every statement includes interactive character span citation chips.
3. **Notebook Studio (`NotebookStudioTab`)**: Scoped research container enabling selective context budgeting, automated RAG synthesis with arXiv:2411.06037 Selective Abstention, 6 studio transformations, and 4-speaker judicial moot court dialectic audio prep.
4. **Primary Evidence (`SourcesTab`)**: Import real files (PDF, DOCX, TXT, OCR scans), inspect cryptographic SHA-256 digests, and manage document privacy scopes.
5. **Fact & Claim Ledger (`FactsTab`)**: Audit individual claims categorized by kind (fact, legal proposition, inference), status (supported, contested, unverified), and polarity.
6. **Chronology & Adverse (`TimelineTab`)**: Chronologically map events using 4-timestamp provenance (`eventDate`, `sourceDate`, `importedAt`, `verifiedAt`) and surface temporal contradictions.
7. **Contract & Playbooks (`ContractTab`)**: Audit contractual agreements against declarative JSON playbooks, compute clause-by-clause risk scores, and generate redlines.
8. **Impact Simulator (`GraphTab`)**: Simulate the cascading downstream consequences when a source document is amended or invalidated.
9. **Statutes & Authorities (`ResearchTab`)**: Execute 10-stage bounded research loops across verified statutory corpora and public authorities with network broker gates.
10. **Drafting & Section 9 (`DraftTab`)**: Compose court-admissible pleadings, skeleton arguments, and client letters with embedded Section 9 admissibility certificates.
11. **Review Queue (`ReviewTab`)**: Resolve flagged contradictions, unsupported assertions, and date ambiguities before court filing.
12. **Cryptographic Memory (`MemoryTab`)**: Manage 4-tier persistent memory (firm, lawyer, matter, session) with canary token containment.
13. **Model Runtime (`SettingsTab`)**: Verify local GPU VRAM allocation, test Ollama/Gemma 4 readiness, manage vault locks, and inspect network egress audit logs.

---

### 4. What must be immediately visible on screen?
- **Active Matter & Jurisdiction**: Prominently displayed in the top rail with client reference.
- **Airgap Network State**: Clear badge indicating network mode (`offline` [emerald], `public_research` [amber], `connected` [rose]).
- **Sovereign Vault Status**: Locked / Unlocked state with auto-lock timer.
- **Model Readiness**: Real status of local inference engine (e.g. `Ollama (gemma:4b)` ready or `Deterministic Offline Fallback`).
- **Context Budget**: Live token meter showing active discovery tokens against window capacity.
- **Evidence Verification State**: Explicit tags distinguishing `verified admissible`, `contested`, or `unsupported`.

---

### 5. Which technical details belong in progressive disclosure?
- Document SHA-256 byte hashes and chunk offsets belong in the collapsible `SourceInspector` drawer, not cluttering the reading view.
- 4-timestamp provenance fields (`eventDate`, `sourceDate`, `importedAt`, `verifiedAt`) appear on hover/click of timeline chips.
- Model VRAM allocations, token speeds, and raw prompt templates live in the Model Runtime settings tab.
- Cryptographic canary token hashes remain hidden unless inspecting memory isolation logs.

---

### 6. What observable behaviour builds trust?
- **Exact Document Anchoring**: Clicking any citation immediately opens the original exhibit and highlights the exact sentence span with byte offset verification.
- **Selective Abstention**: When evidence is missing or coverage < 40%, the system refuses to guess, outputs an Evidential Deficit Notice, and specifies required CPR Part 31 discovery.
- **Input Dependence**: Modifying an invoice amount or date in an ingested document immediately updates the extracted fact ledger, triggers contradiction flags if conflicting with earlier testimony, and updates the draft blocks.
- **Failure Honesty**: If the local model daemon is stopped, the UI reports `Connection Refused: Local Inference Daemon Offline` with a concrete terminal command to restart it, rather than silently substituting canned text.

---

### 7. What can we demonstrate with actual output rather than describe?
- An exported `.docx` or `.md` legal brief containing real evidentiary citations, cross-references, and a signed Section 9 Civil Evidence Act certificate.
- A 4-speaker judicial dialectic audio overview with turn-by-turn synchronized playback using offline browser/local speech synthesis.
- A redlined contract clause showing strikethroughs and additions aligned with institutional playbook rules.
- A verifiable `.proofline` encrypted JSON bundle exchange with SHA-256 integrity hash.

---

### 8. What will a new user understand and start within the first 30 seconds?
- A new user sees a dignified, quiet legal workspace with an active matter.
- In 1 click, they can:
  1. Open a pre-loaded landmark case (e.g., *Bates v Post Office*) to immediately explore evidence spans, contradictions, and skeleton drafts.
  2. Or click **"+ New Matter"**, name their case, and drop their own files into the ingestion zone to watch character spans and claims generate in real time.

---

### 9. What differentiates the implemented product from aspirational roadmaps?
- **Zero Cloud Egress**: Actually executes inference on localhost (`127.0.0.1:11434` or browser WebCrypto/in-memory deterministic rule engine).
- **Court-Admissible Evidence Model**: Not a generic vector search; implements true legal provenance, Section 9 compliance, and Civil Procedure Rules (CPR) pre-action standards.
- **Unified Matter Model**: Chat, drafting, chronology, contract review, memory, and notebook studio all read from and write to the same relational evidence tables.

---

### 10. What should NOT exist?
- **NO Fake Analytics**: No animated pie charts of "cases won", "hours saved", or fictitious ROI percentages.
- **NO Invented Testimonials**: No fictional quotes from non-existent law firms or stock photos of lawyers.
- **NO Unsupported Legal Scores**: No algorithmic "87% chance of winning in court" pseudo-metrics.
- **NO Rainbow AI Decor**: No glowing neon purple borders, sparkle emoji buttons, or animated AI floating orbs.
