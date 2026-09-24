# ADR-002: Sovereign Local Copilot Architecture & Migration

**Status**: Accepted  
**Date**: 24 September 2026  
**Context**: Expanding Proofline from an evidential web prototype into a sovereign legal copilot operating entirely on a lawyer's machine with persistent memory, encrypted vault storage, local AI runtimes, rights-gated research packs, and customizable workflows.

---

## 1. Architectural Decisions

### A. Vault & Storage Sovereignty
* **Decision**: Replace plaintext/browser-only persistence with an **Encrypted Local Vault Service** using standard **PBKDF2** (100,000 rounds, SHA-256) and **AES-GCM-256** encryption at rest.
* **Scope**: Encrypts document file blobs, extracted text, memory records, audit logs, draft revisions, and user settings.
* **Keys**: Vault passphrase wraps a 256-bit symmetric vault master key. Memory key material is wiped on lock or after an idle timeout.
* **Desktop & Web Coexistence**:
  - The installed application (Tauri / Local Node loopback) operates the private vault on the user's filesystem.
  - The hosted web demo remains accessible for zero-install hackathon evaluation using synthetic matters, with an explicit banner declaring *Synthetic Demonstration Mode*.

### B. Network Broker & Three Explicit Operating Modes
* **Decision**: All application-managed network egress must route through a unified **Network Broker** with strict policy checking and auditable request logging.
* **Modes**:
  1. `offline`: Complete local isolation. Blocks all external network traffic including update checks.
  2. `public_research`: User-approved queries to public legal repositories (legislation.gov.uk, CourtListener, EUR-Lex, etc.). Never sends private matter files or unredacted client facts.
  3. `connected_imports`: Explicit user-authorized downloads from configured source providers.

### C. Persistent Scoped Memory Engine
* **Decision**: Implement a typed, scoped memory engine with human review gates.
* **Scopes**: `user_preferences`, `workspace_playbooks`, `matter_facts`, `legal_research_notes`, `work_progress`, `conversation_memory`.
* **Cross-Matter Isolation Invariant**: Queries in Matter B are filtered *before* retrieval so they can never see or recall Matter A's private documents, memories, or draft revisions.
* **Dependency Invalidation**: Correcting or deleting a source document automatically cascades to invalidate dependent claims, memories, and draft paragraphs.

### D. Legal Source Rights & Licensing Gates
* **Decision**: Every public legal source adapter must declare an explicit **Rights Matrix**:
  - Operations: `fetch`, `store`, `index`, `embed`, `redistribute`, `train`.
  - Decisions: `allowed`, `requires_permission`, `not_allowed`, `unknown`.
* **National Archives Caveat**: The Open Justice Licence excludes computational analysis without permission. Proofline enforces a link-out and manual reading gate, strictly forbidding automated scraping or bulk indexing without a verified licence.

### E. Model Execution & Gateway
* **Decision**: Local generation is driven by **Gemma 4** (`gemma4:e4b` / `gemma4:e2b`) via local Ollama or an OpenAI-compatible local runtime (LM Studio / llama.cpp on loopback `127.0.0.1`).
* **Cloud Route Ban**: In sovereign mode, remote cloud API fallbacks are strictly prohibited (`OLLAMA_NO_CLOUD=1` verified).

---

## 2. Invariants & Guarantees

1. **No External Application Server**: Private matter files are parsed, indexed, and stored exclusively on the user's physical machine.
2. **Inert Data Boundary**: Case documents, contracts, and emails are untrusted inputs. Hostile prompt directives cannot grant permissions or trigger outbound network calls.
3. **No Unsupervised Authority**: Model outputs are proposals requiring human verification; citations must resolve to exact character offsets with matching checksums.
