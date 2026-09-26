# Proofline — Privacy Policy & Sovereign Architecture Disclosure

*Last updated: 24 September 2026*

### 1. Fundamental Privacy Guarantee: Zero Remote Egress
Proofline was engineered from inception to solve the privacy and confidentiality dilemma in legal technology. Unlike cloud-hosted AI legal platforms that transmit client briefs to remote API servers, Proofline guarantees:
- **Zero Document Egress**: Client files, witness statements, contracts, and dispute exhibits never leave the physical memory and local disk of your computer.
- **Zero Third-Party Telemetry**: Proofline contains no Google Analytics, no tracking cookies, no advertising beacons, and no hidden telemetry scripts.
- **Zero Cloud Model Training**: Your proprietary work product and client data are never used to train or fine-tune public or third-party artificial intelligence models.

---

### 2. Local Data Storage & Vault Encryption
- **Storage Technology**: Proofline persists data locally using an encrypted IndexedDB store (via Dexie) and SQLite/SQLCipher when deployed as a native desktop application.
- **Cryptographic Security**: Sensitive memory records, client aliases, and extracted document spans are encrypted using **AES-GCM-256** with encryption keys derived from a user-supplied passphrase using **PBKDF2** (100,000 iterations, SHA-256).
- **Auto-Lock Security**: The local vault features an idle lock timer (default: 15 minutes of inactivity). When locked, in-memory decryption keys are zeroized, and UI views are obscured until the master passphrase is re-entered.

---

### 3. Local Model Inference & Execution
- **Inference Runtime**: AI reasoning is powered by locally hosted inference daemons (such as **Ollama** running Google's `gemma:4b` on `127.0.0.1:11434`) or our in-memory, deterministic rule engine.
- **Host Permission Validation**: The model cannot make unauthorized network calls, modify files outside the matter scope, or self-approve memory records. All tool executions are validated by the host environment.

---

### 4. Airgap Network Broker Modes
Proofline enforces a three-tier network policy:
1. **`offline` (Default)**: Complete airgap. All outbound network sockets are blocked. Even local LAN traffic is prevented except for `127.0.0.1` model endpoints.
2. **`public_research`**: Allows outbound HTTP requests strictly to pre-approved public legal databases (e.g. `legislation.gov.uk`, `bailii.org`, `courtlistener.com`). Client names, case references, and proprietary facts are stripped from search queries.
3. **`connected`**: Explicit user override for external connectors (e.g. court filing portals). Every outgoing request is recorded in the immutable Network Audit Log.

---

### 5. Data Retention & Backups
- **User Ownership**: You own 100% of your data.
- **Portable Backups**: You may export full encrypted matter bundles (`.proofline`), standard Word documents (`.docx`), Obsidian vaults (`.md`), or RFC 5545 court calendars (`.ics`) at any time.
- **Total Deletion**: Deleting a matter from Proofline permanently removes all associated records, spans, claims, and cached embeddings from your local device.
