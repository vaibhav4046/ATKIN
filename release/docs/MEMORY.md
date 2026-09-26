# Proofline — Scoped Memory Engine Architecture

Legal workflows demand persistent memory across work sessions, but commercial LLM systems typically suffer from catastrophic cross-matter leakage: client facts from one matter bleed into prompts, summaries, or suggestions in another matter.

Proofline solves this with a **Cryptographically Scoped, Attributable, and Editable Memory Engine**.

---

## 1. Memory Scopes & Isolation Matrix

| Memory Scope | Lifetime | Shared Across Matters? | Permitted Content | Example |
| :--- | :--- | :---: | :--- | :--- |
| **`user_preferences`** | Permanent | **YES** | Fee earner drafting preferences, style conventions, formatting instructions. Never private facts. | *"Draft all correspondence in concise British English with numbered paragraphs."* |
| **`workspace_playbooks`** | Permanent | **YES** | Firm-wide standard contract guidelines, risk thresholds, preferred statutory authorities. | *"SaaS Playbook Rule 4.1: Indemnities must be bilateral and capped at 12 months fees."* |
| **`matter_facts`** | Matter Lifecycle | ❌ **STRICTLY NO** | Verified evidentiary facts, witness admissions, surveyor findings, delivery dates. | *"Service engineer confirms liquid contact indicators were uncorroded white."* |
| **`legal_research_notes`** | Matter Lifecycle | ❌ **STRICTLY NO** | Solicitor case law analysis, distinguishing points, arguments on statutory interpretation. | *"Distinguish Bramley v Best Buy on basis of s.19(14) CRA 2015 6-month presumption."* |
| **`work_progress`** | Matter Lifecycle | ❌ **STRICTLY NO** | Pending tasks, CPR pre-action deadlines, unreviewed items. | *"14-day CPR response window expires on 8 May 2026."* |
| **`conversation_memory`**| Matter Lifecycle | ❌ **STRICTLY NO** | Structured summaries of prior local chat turns for this matter. | *"User requested redline focusing on payment clause conflict."* |

---

## 2. Cross-Matter Isolation Guarantee (Canary Testing)

To guarantee that Matter B cannot access Matter A's private facts, Proofline executes a strict filter on all retrieval paths:

```typescript
// MemoryEngine.ts
public getMemoriesForMatter(matterId: string): MemoryRecord[] {
  return Array.from(this.memories.values()).filter(m => 
    m.status !== 'deleted' && 
    (m.matterId === matterId || m.scope === 'user_preferences' || m.scope === 'workspace_playbooks')
  );
}
```

### The Canary Test (`src/tests/memoryIsolation.test.ts`)
During automated test runs, a distinct canary token:
```
CANARY_SECRET_TENANCY_TOKEN_XYZ991
```
is planted inside the Tenancy matter (`matter-thorne-oakridge-2026`). The test suite asserts that:
1. Queries for Consumer Laptop (`matter-vance-zenith-2026`) return **zero** occurrences of the canary string.
2. Queries for SaaS Contract (`matter-novacorp-meridian-2026`) return **zero** occurrences of the canary string.
3. Only queries for the Tenancy matter contain the canary fact.

---

## 3. Human-in-the-Loop Review Queue

Models cannot silently commit facts to long-term memory. When an assistant turn suggests a new factual premise, the memory record is created with:
```typescript
{
  reviewState: 'suggested',
  createdBy: 'model'
}
```
In the **Scoped Memory** workbench tab:
- Suggested memories appear in an amber **Pending Approvals** queue.
- The solicitor can inspect the source chat message ID and source document version before clicking **Approve** (commits to active memory) or **Reject** (marks deleted).

---

## 4. Cascading Dependency Invalidation

Evidential facts depend on underlying documents. If a client provides an updated document or a document is rescanned:
1. Fee earner imports `doc-receipt-v2`.
2. `memoryEngine.invalidateDocumentDependencies('doc-receipt-v1')` is triggered.
3. Any memory record linking `doc-receipt-v1` in `sourceDocumentVersions` transitions from `status: 'active'` to `status: 'invalidated'`.
4. The copilot suppresses invalidated memories in prompt generation and displays an invalidation warning.
