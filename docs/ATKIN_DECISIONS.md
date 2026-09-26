# ATKIN: ARCHITECTURE DECISION RECORDS (ADR)

## ADR-001: Separation of Personal Workspace and Demo Workspace
- **Context**: The existing application pre-populates `Bates & Others v Post Office Ltd` and three other sample cases directly into the user's main active matter list, creating the impression of a hackathon mockup rather than sovereign professional software.
- **Decision**: Partition workspaces into `Personal Workspace` (the default for genuine legal work, starting completely empty) and `Demo Workspace` (an explicitly isolated sandbox containing labelled sample matters).
- **Consequences**: Zero accidental leakage of synthetic cases into client workflows. Users can switch between Personal and Demo with one click, or reset demo fixtures without touching private client files.

## ADR-002: Five-Layer Memory Architecture Implementation
- **Context**: Generic agent memory is often implemented as a flat embeddings table or a simple string array. Legal work demands strict distinction between current task context, past episodes, verified legal facts, procedural skills, and data retention/governance.
- **Decision**: Implement a 5-layer memory architecture:
  1. **Layer 1 (Working Memory)**: Managed by a `ContextPlanner` with dynamic context budget allocations (system policy, task state, persistent memory, source evidence, conversation turns).
  2. **Layer 2 (Episodic Memory)**: Structured `Episode` objects storing task outcomes, decisions, errors, and user feedback, preventing repetition of failed paths.
  3. **Layer 3 (Semantic Memory)**: A formal legal ontology (Entities, Relations, Provenance) distinguishing user-provided facts, source-extracted facts, model-inferred propositions, and lawyer-approved facts.
  4. **Layer 4 (Procedural Memory)**: Declarative, versioned `Skill` objects with preconditions, steps, and human approval gates before promotion.
  5. **Layer 5 (Memory Governance)**: Explicit forgetting policies (TTL for ephemeral episodes, supersession for outdated preferences, non-expiring lawyer-approved facts, and contradiction review).
- **Consequences**: Enables Atkin to continuously improve across sessions while strictly respecting legal privilege and preventing cross-matter leakage.

## ADR-003: Removal of Fabricated Fallbacks in Model Gateway
- **Context**: `modelBridge.ts` contained a fallback returning a hardcoded paragraph asserting consumer goods failure under Consumer Rights Act 2015 s.19(14) whenever Ollama timed out or was offline.
- **Decision**: Remove all synthetic factual fallbacks. When local models are unreachable or offline, Atkin must report exact runtime status and execute deterministic propositional extraction based exclusively on the active matter's uploaded sources.
- **Consequences**: Total elimination of hallucinated or out-of-context boilerplate in user responses.

## ADR-004: Clean Editorial Design System & Plain English Copy
- **Context**: Hackathon marketing jargon ("Sovereign Knowledge Fabric", "IRAC Analytical Gate", "Zero Hallucination Architecture") diminishes product credibility for serious practitioners.
- **Decision**: Transition to plain, dignified legal terminology ("Your matter memory", "Answer & Sources", "Saved workflows", "Check the source"). Establish clean Apple/editorial design tokens with 15–17px body typography, contrast-tested dark grays, and zero neon AI styling.
- **Consequences**: Elevates Atkin into software a solicitor or barrister can install and trust in practice.
