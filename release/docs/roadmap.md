# Product Roadmap — Proofline

Proofline distinguishes strictly between **proven, functioning code (P0)**, **near-term additions (P1)**, and **future vision (P2)**. Never represent future roadmap features as completed hackathon functionality.

---

## P0: Delivered & Verified Core (LexHack 2026 Submission)

- [x] **Local-First Matter Store**: Browser IndexedDB database via Dexie.js with zero cloud upload.
- [x] **Multi-Format Ingestion**: Client-side parsing of `.txt`, `.md`, `.eml` (RFC 822 emails), and text files with SHA-256 cryptographic provenance.
- [x] **Deterministic Span Extractor**: Exact character and line offset tracking (`[startOffset, endOffset]`, line numbers, reproducible checksums).
- [x] **Claim & Fact Ledger**: Typed assertions (`fact`, `legal_proposition`, `inference`), polarity tagging, temporal scopes, and evidence confidence states (`supported`, `contested`, `unverified`).
- [x] **Side-by-Side Contradiction Discovery**: Dual-record comparison card isolating adverse discrepancies (demonstrated with the 8 April vs 12 April defect onset conflict).
- [x] **England & Wales CRA 2015 Shelf**: Curated, text-checked provisions of Consumer Rights Act 2015 (s.9, s.19(14), s.23, s.24) and The National Archives Find Case Law appellate coverage notice.
- [x] **Audit-Ready Drafting Studio**: Dual-template synthesis (Matter Assessment Brief & Client Advice Letter) with sentence-by-sentence clickable citation anchors and automatic `⚠️ Needs Review` flags on contested blocks.
- [x] **Evidential Markdown & Manifest Export**: Downloadable Markdown documents with complete source citation tables.
- [x] **Local Gemma 4 Loopback Bridge**: Local Ollama connectivity check, tag detection (`gemma4:e4b`), prompt isolation, and honest offline mode fallback.
- [x] **Scandinavian / Apple Editorial Design**: Accessible, high-restraint interface meeting WCAG 2.2 AA standards with keyboard navigation and reduced-motion support.

---

## P1: Near-Term Enhancements (Post-Submission)

- [ ] **Native PDF Canvas Bounding Boxes**: Visual rectangle overlays on PDF pages rendered via PDF.js.
- [ ] **DOCX Ingestion**: Client-side Microsoft Word parsing with style and table extraction.
- [ ] **Draft Version Diffing**: Word-level redline comparison between successive draft revisions.
- [ ] **Signed Local Companion Agent**: Lightweight background helper to eliminate loopback CORS warnings without requiring manual terminal commands.
- [ ] **Expanded Statutory Modules**: Landlord & Tenant Act 1985 (disrepair claims) and Employment Rights Act 1996.

---

## P2: Long-Term Enterprise Architecture

- [ ] **Tauri Desktop Application**: Cross-platform desktop wrapper with encrypted SQLCipher vault and native filesystem watchers.
- [ ] **Enterprise Connectors**: Scoped OAuth 2.0 connectors for Microsoft 365 (Outlook / SharePoint) and Google Workspace with granular matter segregation.
- [ ] **Multi-Fee-Earner Collaboration**: End-to-end encrypted peer-to-peer sync using CRDTs (Automerge / Yjs).
- [ ] **Formal Legal Evaluation Harness**: Automated scoring against legal-bench civil dispute datasets measuring hallucination rates under adversarial injection.
- [ ] **Scots Law & Northern Ireland Jurisdictions**: Complete devolved statutory frameworks and court procedural rules.
