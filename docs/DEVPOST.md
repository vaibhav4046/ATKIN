# Proofline — Devpost Submission Text

**Project Name**: Proofline  
**Tagline**: Sovereign legal copilot & evidential workbench running 100% locally with encrypted vault, scoped memory, and zero cloud leakage.  
**Track / Category**: Open Source / Sovereign Legal Tech / Access to Justice  
**Builder**: Vaibhav Lalwani (Solo Builder, MSc Student at University of Liverpool)  
**Submission URL**: https://github.com/vaibhav-lalwani/proofline *(or active repo)*  
**Demo Video**: 3-minute sovereign walkthrough (see `docs/DEMO_SCRIPT.md`)  

---

## 1. Inspiration

Modern lawyers and legal clinics face an unacceptable dilemma when considering AI:
1. **Confidentiality vs. Capability**: Cloud legal copilots require uploading privileged client communications, trade secrets, and witness statements to third-party data centers, creating significant regulatory exposure under SRA (Solicitors Regulation Authority) rules, GDPR, and professional privilege doctrines.
2. **The "Hallucinated Authority" Trap**: General-purpose LLMs generate fluent, authoritative-sounding legal propositions supported by fictitious case citations and non-existent statutory subsections.
3. **Black-Box Drift & Memory Leakage**: When models retain conversational memory across sessions, confidential details from Matter A can bleed into drafts for Matter B.

We built **Proofline** to prove that legal AI does not need to compromise professional ethics or sovereign control. Proofline is an open-source, local-first legal copilot and evidentiary workbench designed from the ground up to operate completely on the lawyer’s machine with mathematical guarantees of isolation, verifiable evidence provenance, and zero external telemetry.

---

## 2. What Proofline Does

Proofline turns disorderly case materials into a structured, source-linked evidential map that a lawyer can audit sentence by sentence.

### Key Capabilities:
- **100% Sovereign & Air-Gapped Network Broker**: Features a 3-mode network broker (`offline`, `public_research`, `connected_imports`). In `offline` mode, all outbound network requests are intercepted and blocked at the browser level, logging every event to an immutable audit trail.
- **Cryptographic Vault at Rest**: Zero-knowledge local storage using WebCrypto PBKDF2 (100,000 rounds of SHA-256) and AES-GCM-256. Memory keys are explicitly wiped from RAM upon lock or session timeout.
- **Evidentiary Span Tracing & Claim Ledger**: Ingests case documents (`.txt`, `.md`, `.eml`) with SHA-256 integrity hashes. Extracts text spans with exact character offsets (`[start, end]`) and categorizes claims as `fact`, `legal_proposition`, or `inference`.
- **Automated Contradiction Discovery**: Identifies adverse factual discrepancies between opposing disclosures (e.g., claimant alleging laptop defect onset on 8 April vs. retailer asserting initial contact on 12 April).
- **Scoped, Attributable Memory with Canary Isolation**: 4-level memory hierarchy (`firm`, `lawyer`, `matter`, `session`). A strict isolation engine ensures facts from Matter A cannot leak into Matter B. Verified via canary token injection tests (`CANARY_SECRET_TENANCY_TOKEN_XYZ991`).
- **Contract Review & Playbook Auditor**: Parses B2B contracts, extracts key obligations and liabilities, flags uncapped indemnities, highlights conflicting payment schedules (e.g., Net 30 in text vs. Net 60 in Exhibit B), and generates negotiation counter-clauses.
- **Rights-Gated Research Catalog**: Integrated statutory packs (e.g., UK Consumer Rights Act 2015). Enforces licensing boundaries—specifically flagging that The National Archives Open Justice Licence v2.0 requires bespoke licensing for computational training.
- **Audit-Ready Work Product & Bundle Exchange**:
  - Generates Word XML (.doc) and Markdown briefs preserving anchor-linked footnote citations.
  - Automatically compiles court deadlines into RFC 5545 `.ics` calendar files.
  - Parses voice dictation transcripts into SRA file-audit ready Attendance Notes.
  - Exports encrypted `.proofline` portable matter bundles with SHA-256 manifest verification.
- **Local Model Execution**: Connects to local Ollama instances (`127.0.0.1:11434`) running Gemma 4 (`gemma4:e4b` / `gemma4:e2b`). If Ollama is offline, Proofline falls back gracefully to a deterministic rules engine—never fabricating responses or hallucinating citations.

---

## 3. How We Built It

Proofline was engineered with an unwavering commitment to simplicity, transparency, and performance:

- **Frontend & UI**: React 18, TypeScript, Tailwind CSS, Lucide icons. Follows an editorial Scandinavian / Apple minimalist aesthetic with 28px card radiuses, crisp typography, and full WCAG 2.2 AA accessibility.
- **Local Storage**: Dexie.js (IndexedDB) for pure client-side persistence without external database servers.
- **Cryptography**: Native WebCrypto API (PBKDF2 key derivation, AES-GCM-256 authenticated encryption, SHA-256 provenance hashing).
- **Testing & Quality Assurance**: Vitest test harness with 32 automated tests covering cryptographic roundtrips, canary memory isolation, network broker interception, contract clause parsing, and prompt injection mitigation.
- **Zero Cloud Footprint**: The entire production build compiles to 375 kB (104 kB gzipped). Zero CDNs, zero third-party font trackers, zero analytics pings.

---

## 4. Challenges We Ran Into

1. **Deterministic Evidentiary Citations**: Formatting generated legal drafts so that every factual proposition links directly back to exact character offsets in underlying evidence was complex. We solved this by implementing an evidential footnote compiler that maps claim IDs directly to document offset anchors in both HTML and exported Word XML.
2. **Zero-Knowledge Memory Key Wiping**: In JavaScript garbage-collected environments, cryptographic keys can linger in heap memory. We implemented manual zeroization (`fill(0)`) across all raw byte buffers and tied the session key lifecycle to automatic lock timers.
3. **Cross-Matter Context Isolation**: Ensuring that local LLM prompts and persistent memory stores never bleed between matters required building an explicit memory filter gate that enforces strict tenancy segregation before context enters any prompt template.
4. **Legal Licensing Nuance**: Researching open legal data revealed that The National Archives (Find Case Law) Open Justice Licence v2.0 forbids automated computational analysis without a separate licence. We built an automated Rights Evaluator to ensure lawyers don't inadvertently breach Crown copyright terms.

---

## 5. Accomplishments That We're Proud Of

- **32/32 Passing Tests**: 100% test pass rate with zero mocked business logic.
- **Canary-Proven Privacy**: Mathematically validated that sensitive client tokens in one matter are unreachable in queries for other matters.
- **Honest AI Architecture**: When local models are unavailable or unequipped with evidence, Proofline displays clear warnings and refuses to invent citations.
- **Ultra-Lean Footprint**: A full-featured legal workstation packaged into ~104 kB of gzipped code that runs instantly in any modern browser.

---

## 6. What We Learned

Building sovereign legal tech requires far more than running an LLM locally. True sovereignty demands an architectural guarantee across the entire stack:
- Network brokering to prevent accidental telemetry leaks.
- Client-side at-rest encryption to protect client privilege on shared or lost laptops.
- Evidential grounding to anchor every AI claim to audited text spans.
- Strict copyright and licensing awareness to maintain legal compliance with public archives.

---

## 7. What's Next for Proofline

- **Native Tauri Wrapper**: Packaging Proofline into a signed desktop binary with SQLCipher native encryption.
- **P2P Encrypted Sync**: Enabling multi-lawyer collaboration over secure peer-to-peer CRDT channels without central servers.
- **Expanded Statutory Modules**: Packaging England & Wales Landlord & Tenant Act 1985 and Employment Rights Act 1996 for rapid community legal clinic triage.

---

## 8. Builder Information

- **Author**: Vaibhav Lalwani
- **Affiliation**: MSc Student, University of Liverpool
- **Role**: Solo product designer, legal tech engineer, and builder for LexHack 2026.
