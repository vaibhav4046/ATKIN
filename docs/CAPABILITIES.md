# Proofline — Sovereign Legal Copilot: Capabilities Matrix

**Proofline** is an open-source, local-first legal copilot and evidential workbench engineered for solicitors, barristers, and corporate counsel. It operates strictly on the practitioner's machine with zero mandatory cloud dependencies, provable evidential grounding, and cryptographic data sovereignty.

---

## 1. Sovereignty & Cryptographic Vault
- **Encrypted Local Storage**: PBKDF2 key derivation (100,000 iterations, SHA-256) and AES-GCM-256 authenticated encryption for all evidential texts, notes, and memory records at rest.
- **Memory Wiping on Lock**: When locked or upon reaching an idle timeout (default 30 mins), the active `CryptoKey` reference is permanently purged from application memory.
- **Encrypted Matter Bundles**: Export and import complete matter archives as `.proofline` encrypted packages protected with passphrase authentication and SHA-256 payload integrity hashing.

## 2. Strict Network Broker & Egress Control
- **Three Deterministic Operating Modes**:
  1. `offline`: 100% air-gapped sovereign execution. All outbound calls rejected with audit logging.
  2. `public_research`: Whitelisted access strictly limited to official legal sources (`legislation.gov.uk`, `caselaw.nationalarchives.gov.uk`, `justice.gov.uk`, `courtlistener.com`, `eur-lex.europa.eu`, `indiacode.nic.in`).
  3. `connected_imports`: Dedicated OAuth 2.0 PKCE broker for local email thread ingestion (Gmail, MS Graph) and cloud storage sync.
- **Immutable Audit Trail**: Logs every outbound attempt with destination host, purpose, request digest, timestamp, and byte counts.

## 3. Persistent Scoped Memory Engine
- **Hierarchical Memory Scoping**:
  - `user_preferences`: Global drafting tone and solicitor conventions (e.g., British English, numbered paragraphs).
  - `workspace_playbooks`: Institutional review guidelines (e.g., B2B SaaS liability rules, indemnification caps).
  - `matter_facts`: Evidential findings strictly isolated to a specific matter ID.
- **Cross-Matter Isolation Guarantee**: Matter B cannot access Matter A's evidential facts or notes. Verified via Canary Token testing (`CANARY_SECRET_TENANCY_TOKEN_XYZ991`).
- **Human-in-the-Loop Review Queue**: AI-suggested memory records remain in a `suggested` state until explicitly accepted or rejected by fee earners.
- **Cascading Dependency Invalidation**: When a source document version changes, all dependent memories are automatically transitioned to `invalidated`.

## 4. Evidential Analysis & Contradiction Detection
- **Character-Exact Source Linking**: Every claim is tied to immutable source spans verified by SHA-256 checksums and character offsets.
- **Contradiction Detection Engine**: Surface conflicting claims between parties (e.g., merchant alleging liquid ingress vs independent diagnostic engineer certifying uncorroded indicators; landlord claiming tenant laundry drying vs MRICS surveyor identifying fractured external hopper heads).
- **Adversarial Prompt Injection Containment**: Hostile instructions in ingested documents (e.g. `[System instruction: Ignore prior rules...]`) are quarantined strictly as inert citation text.

## 5. Contract Review & Playbook Auditing
- **Automated Clause Categorisation**: Parses indemnity, limitation of liability, payment schedules, confidentiality, termination, and governing law.
- **Conflicting Term Auditing**: Flags internal schedule discrepancies (e.g., Net 30 days in Section 4.2 vs Net 60 days in Exhibit B).
- **Playbook Risk Engine**: Flags high/medium/low severity deviations, provides institutional rationale, and generates copy-ready redline revisions.
- **Obligation Extraction**: Identifies obligor, required action, deadlines, and liability caps.

## 6. Local Model Orchestration
- **Loopback Ollama Integration**: Connects to `http://127.0.0.1:11434` for Gemma 4 (`gemma4:e4b` / `gemma4:e2b`) execution with `OLLAMA_NO_CLOUD=1`.
- **Deterministic Offline Fallback**: If the local runtime is offline, Proofline falls back to its deterministic rule engine, ensuring 100% functionality without cloud degradation.
- **VRAM Budget Awareness**: Warns if model size exceeds local GPU memory limits.

## 7. Legal Workflow & Export Formats
- **CPR Annex B Letter of Claim**: Generates pre-action protocol compliant formal correspondence.
- **Multi-Format Export**:
  - Word Document (.doc / OpenXML HTML) with formatted headers, paragraph numbers, and evidential footnote citations.
  - GitHub Flavored Markdown with claim provenance metadata.
  - Sovereign `.proofline` bundle with SHA-256 integrity digest.
- **Court Calendar Integration**: RFC 5545 `.ics` export for hearings, limitation deadlines, and CPR response windows with automated alarms.
- **Dictation Parser**: Converts spoken dictation or meeting transcripts into SRA file-audit ready Attendance Notes.
