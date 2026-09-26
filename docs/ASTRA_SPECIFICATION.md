# ASTRA Protocol Specification
**Document ID**: SPEC-ASTRA-001  
**Version**: 1.0.0  
**Status**: APPROVED ARCHITECTURE CONTRACT  
**Author**: Atkin Core Architecture Group  
**Target Systems**: ATKIN Legal OS, Desktop Tauri Native, Android Companion, Hosted Workbenches  

---

## 1. Architectural Foundation & Positioning

### 1.1 The Problem with "Legal Chatbots" and Unbounded RAG
Traditional LLM wrappers and standard RAG pipelines suffer from fatal defects when applied to legal practice:
1. **Unranked Authority Flattening**: Treating a marketing email, an unratified draft, a statutory instrument, and a Supreme Court judgment with identical evidential weight.
2. **Jurisdictional Drift**: Silently importing US principles (e.g. "parol evidence rule", "punitive damages") into an England and Wales commercial matter.
3. **Temporal Inversion**: Applying post-amendment terms to historic breaches, or citing repealed legislation.
4. **Evidential Hallucination & Citation Forgery**: Inventing case citations, plausible year numbers, or unverified quotes when documents are silent.
5. **Ungated Autonomous Action**: Allowing models to propose or dispatch consequential legal advice without mandatory professional sign-off.

### 1.2 The Conceptual Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 ATKIN: The Sovereign Legal OS               │
├─────────────────────────────────────────────────────────────┤
│  ASTRA: Sovereign Legal Execution Protocol                  │
│  ├── Authority    (Normative hierarchy & evidence ranking)  │
│  ├── Scope        (Jurisdiction, temporal, matter locks)    │
│  ├── Tools        (Deterministic engines, parsers, diffs)   │
│  ├── Retrieval    (Byte-anchored provenance & IRAC)         │
│  └── Approval     (Gated action tiers & human review)       │
├─────────────────────────────────────────────────────────────┤
│  Legal Harness: Agent Runtime & Control Plane               │
│  ├── Context Planner & Task Decomposition                   │
│  ├── 5-Layer Sovereign Memory (Working, Episodic, Semantic, │
│  │   Procedural, Meta)                                      │
│  ├── Specialized Job Roles (Vendor Reviewer, Tracer, etc.)  │
│  └── Hook System & Permission Boundaries                    │
├─────────────────────────────────────────────────────────────┤
│  Integration & Extensibility: Model Context Protocol (MCP)  │
│  ├── Matter DMS & Drive Connectors (Local, iManage, S3)     │
│  ├── Primary Law Repositories (legislation.gov.uk, TNA FCL) │
│  └── Practice Management & Calendar Gateways                │
├─────────────────────────────────────────────────────────────┤
│  Interchangeable Legal Model Abstraction (`LegalModel`)     │
│  ├── Cloud: Claude 3.7/Opus, Gemini 2.5 Pro, GPT-4o        │
│  └── Local Air-Gapped: Gemma 2/4, Qwen 2.5, DeepSeek R1    │
└─────────────────────────────────────────────────────────────┘
```

**Key Axiom**: *The model is merely the interchangeable reasoning engine; the legal harness and ASTRA protocol form the proprietary, auditable legal operating system.*

---

## 2. The Five Pillars of ASTRA

### 2.1 Pillar A — Authority (Normative Hierarchy & Weighting)
Before analyzing any proposition, ASTRA establishes the authoritative hierarchy of all relevant sources. In English and Welsh law, sources are strictly tiered:

| Level | Source Category | Description & Binding Character | Invalidation / Override Rule |
| :---: | :--- | :--- | :--- |
| **Tier 1** | **Primary Legislation** | Acts of Parliament (e.g. CRA 2015, UCTA 1977, Senior Courts Act 1981). | Overrides all inferior tiers unless repealed or amended. |
| **Tier 2** | **Secondary Legislation** | Statutory Instruments, Civil Procedure Rules (CPR), Practice Directions. | Subordinate to enabling statutes; overrides common law. |
| **Tier 3** | **Binding Precedent** | Decisions of UK Supreme Court, House of Lords, Court of Appeal (Civil Div). | Strictly binding on High Court and County Court. |
| **Tier 4** | **Persuasive Authority** | High Court first-instance, Scottish Court of Session, Privy Council. | Persuasive; subject to doctrine of stare decisis. |
| **Tier 5** | **Operative Contracts** | Fully executed Master Services Agreements, Deeds of Variation. | Binding between parties subject to mandatory statutory limits. |
| **Tier 6** | **Extrinsic / Factual Matrix** | Invoices, witness statements, contemporary emails, telephony logs. | Evidential only; cannot rewrite unambiguous contractual terms. |

**ASTRA Rule A1 (Conflict Resolution)**: When Tier 5 (Contract) conflicts with Tier 1 (Statute, e.g. UCTA s.2(1) death/personal injury negligence exclusion), Tier 1 invalidates the clause as void as a matter of law.

---

### 2.2 Pillar S — Scope (Boundary Locking)
ASTRA strictly bounds the execution boundary before invoking any model or analytical tool:

1. **Jurisdiction Lock**: Explicitly locked to `England and Wales`, `Scotland`, or `Northern Ireland`. Cross-border concepts are prohibited unless conflict-of-laws analysis is explicitly engaged.
2. **Temporal Freeze**:
   - *Contractual Date*: The date of contract execution determines the substantive terms in force.
   - *Breach Date*: The date of alleged breach determines the operative statutory regime (e.g., Sale of Goods Act 1979 vs Consumer Rights Act 2015).
   - *Current Date*: Limits validity of ongoing procedural deadlines under CPR.
3. **Matter Boundary Isolation**: Complete zero-leakage guarantee. In-memory entities, vector embeddings, and semantic cache for *Matter A* are completely isolated from *Matter B*.
4. **Source Selection Policy**: Restricts retrieval to explicitly imported and verified matter sources (`selected_sources_only`). Prohibits broad web-scraped open retrieval from infecting evidentiary matters.

---

### 2.3 Pillar T — Tools (Deterministic Local Engines)
ASTRA mandates that arithmetic, date calculation, textual comparison, and cryptographic verification **must never be delegated to probabilistic LLM generation**.

The ASTRA Tool Registry includes:
- **`clause_retriever`**: Exact byte-sliced span extraction with SHA-256 fingerprinting.
- **`amendment_tracer`**: Graph-based dependency resolver that links Deeds of Variation to parent clauses.
- **`deadline_calculator`**: Deterministic CPR court deadline calculator (accounting for court working days, bank holidays, and CPR 2.8 counting rules).
- **`contradiction_detector`**: Pairwise contradiction engine comparing extracted factual claims.
- **`citation_gate`**: Positional verifier asserting that every generated citation matches exact text and character offsets in the primary record.
- **`mcp_gateway`**: Model Context Protocol bridge connecting to external DMS, CourtListener, or legal repositories.

---

### 2.4 Pillar R — Retrieval + Reasoning (Evidence-First IRAC)
ASTRA enforces an **Evidence-First** execution pipeline:

```
[User Legal Query]
       │
       ▼
[Deterministic Span Retrieval]  (Fetch exact byte spans from matter record)
       │
       ▼
[Evidential Silence Check] ────► [Unrecorded?] ──► ABSTAIN (Zero hallucination)
       │
       ▼ (Spans present)
[IRAC Reasoning Tree]
   ├── Issue: Precise legal question under governing law
   ├── Rule: Applicable Tier 1-5 authority
   ├── Application: Factual matrix mapped to rule elements
   └── Conclusion: Defensible legal finding with confidence metric
       │
       ▼
[Citation Binding] (Every proposition bound to span ID and checksum)
```

**ASTRA Rule R1 (Evidential Abstention)**: If the matter record does not contain facts sufficient to answer a specific factual query, the system MUST emit a formal Evidential Abstention statement. It is strictly prohibited from guessing, estimating, or extrapolating missing dates, sums, or identities.

---

### 2.5 Pillar A — Approval (Human Action Gate)
Consequential legal tasks cannot be executed autonomously. ASTRA categorizes every action into a strict three-tier approval hierarchy:

1. **`tier_1_autonomous_read_only`**:
   - Document hashing, span extraction, contradiction discovery, initial draft synthesis.
   - *Permission*: Executed autonomously without user prompt.
2. **`tier_2_solicitor_review_required`**:
   - Marking draft paragraphs as approved, updating matter notes, promoting procedural skills.
   - *Permission*: Requires active solicitor confirmation click in UI.
3. **`tier_3_partner_signoff_required`**:
   - Dispatching formal letters before claim, issuing court filings, exporting sealed bundles, irrevocably purging client files or memories.
   - *Permission*: Mandatory 2-factor or password-authenticated sign-off with permanent audit log.

---

## 3. Reusable Legal Skills Schema

ASTRA models legal workflows as structured, declarative, versioned **Legal Skills** rather than free-form agent prompts.

### 3.1 Skill Definition Specification
```yaml
id: contract-termination-review
version: 1.0.0
name: Commercial Contract Termination Reviewer
description: Reviews termination for convenience and for cause under England and Wales law.
astra:
  authority:
    primary:
      - agreement_master
      - deeds_of_variation
    statutory:
      - legislation: UK_UCTA_1977
      - legislation: UK_CRA_2015
    jurisdiction: England and Wales

  scope:
    source_policy: selected_sources_only
    temporal_anchor: contract_operative_date
    confidentiality: strict_matter_isolated

  tools:
    deterministic:
      - clause_retriever
      - amendment_tracer
      - deadline_calculator
      - contradiction_detector
    mcp_connectors:
      - legal_precedents_mcp

  steps:
    1. retrieve_operative_clauses:
       target: ["termination", "notice", "cure_period", "default"]
    2. trace_amendments:
       resolve_superseded: true
    3. calculate_statutory_deadlines:
       rule: cpr_calendar_days
    4. cross_examine_extrinsic_facts:
       surface_conflicts: true
    5. construct_irac_brief:
       structure: formal_solicitor_brief

  approval:
    external_action: partner_signoff_required
    draft_generation: solicitor_review_required
```

---

## 4. Interchangeable Model Abstraction Layer (`LegalModel`)

To ensure complete sovereignty and eliminate provider lock-in, all ASTRA reasoning routes through a model-agnostic TypeScript contract:

```typescript
export interface LegalContext {
  matterId: string;
  jurisdiction: string;
  governingLaw: string;
  authorityHierarchy: AuthorityItem[];
  spans: Span[];
  claims: Claim[];
  authorities: Authority[];
  practitionerPreferences: {
    citationFormat: 'oscola' | 'harvard' | 'in_line';
    tone: 'plain_english' | 'formal_advocacy';
  };
  prompt: string;
}

export interface ModelResponse {
  rawText: string;
  irac: {
    issue: string;
    rule: string;
    application: string;
    conclusion: string;
  };
  citationsUsed: Array<{
    spanId: string;
    exactQuote: string;
  }>;
  abstentions: string[];
  uncertaintyScore: number; // 0.0 (certain) to 1.0 (highly uncertain)
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
  };
}

export interface LegalModel {
  id: string;
  name: string;
  provider: 'ollama_local' | 'anthropic' | 'google' | 'openai' | 'deterministic_offline';
  generate(context: LegalContext): Promise<ModelResponse>;
  stream?(context: LegalContext): AsyncIterable<string>;
  capabilities: {
    toolCalling: boolean;
    structuredOutput: boolean;
    maxContextTokens: number;
    airgapCompliant: boolean;
  };
}
```

---

## 5. Auditability, Verifiability, and SRA Compliance

Every ASTRA execution produces an immutable **Proof Receipt**:
1. **Source Hash**: SHA-256 of all input documents.
2. **Span Offsets**: Exact start/end character offsets for all cited propositions.
3. **Execution Trace**: Record of every deterministic tool call and parameters.
4. **Approval Stamp**: Solicitor identity, timestamp, and review status.
5. **Regulatory Alignment**: Fully complies with **Solicitors Regulation Authority (SRA)** Standards & Regulations Rule 6.3 (Client Confidentiality) and SRA AI Guidance (Supervisory Responsibility).
