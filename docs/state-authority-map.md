# ATKIN — State Authority Map

Established 2026-09-27 against commit `1bb6b77`. Every row below was read from the
source, not inferred from documentation.

The purpose of this document is to make one question answerable for any entity:
**if two parts of the app disagree about it, which one is allowed to be right?**

---

## 1. The persistence tiers that actually exist

There are three durable stores, not one. This is the single most important thing
to understand before changing any data code.

| Tier | Technology | Owner | Lifetime |
|---|---|---|---|
| **Reactive UI store** | Dexie / IndexedDB, database `ProoflineLocalDB` | `src/db/index.ts` (`AtkinDatabase`) | Survives reload. Cleared by browser site-data wipe. |
| **Native mirror** | SQLite via Tauri IPC | `src/db/nativeStorageBridge.ts`, `src-tauri/src/vault.rs` | Survives browser cache clears and upgrades. Desktop only. |
| **Device preferences** | `localStorage` | `src/design/theme.ts`, user profile | Survives reload. Not part of the matter record. |

`nativeStorageBridge.ts` is explicit that this is a **dual-tier** design: Dexie
for reactive UI, SQLite as the durable mirror, so an enterprise desktop install
does not lose matters when a browser cache is cleared.

### Consequence that constrains refactors

The IndexedDB database name is still `ProoflineLocalDB` even though the class is
now `AtkinDatabase`. **This is intentional and must not be renamed.** The name is
the on-disk identity of every user's stored matters, sources, drafts and memory.
Renaming it orphans all existing data. It is the first entry in the allowlist in
`src/tests/copyRegression.test.ts` so nobody "cleans it up" by accident.

The same applies to:

- `PROOFLINE_VAULT_KEY_VERIFICATION_SENTINEL_2026` in `src/engine/vault/vaultService.ts`
  — part of vault key derivation. Changing it makes every existing vault
  undecryptable.
- `%LOCALAPPDATA%\Proofline\vault` in `src/components/workbench/SettingsTab.tsx`
  and `src-tauri/src/vault.rs` — the real on-disk path. It is an accurate
  filesystem path, not stale branding.

---

## 2. Authority per entity

**System of record** is the only writer allowed to persist the entity.
**Derived / cache** may be rebuilt from the system of record and must never be
treated as authoritative.

| Entity | System of record | Cache / derived | UI projection |
|---|---|---|---|
| **User profile** | `localStorage['atkin_user_profile']` | React context in `src/app/AppProviders.tsx` | `SettingsTab` (General), `TopRail` |
| **Workspace** (personal / demo) | `AppProviders` workspace value, set by `AppRouter` navigation | — | Sidebar, demo labelling |
| **Matter** | Dexie `matters` store; mirrored to SQLite on desktop | `db/fixtures/*` seed the demo matter only | `Sidebar`, `OverviewTab`, `MattersTab` |
| **Onboarding state** | Dexie `userProfile.onboardingCompleted` | React context in `AppProviders` | `OnboardingModal` |
| **Document / Source** | Dexie `documents` store, keyed `id, matterId, filename, sha256` | `sha256` is an index, not the payload | `SourcesTab`, `SourceInspector` |
| **Span** (character offsets) | Dexie `spans`, keyed `id, documentId, checksum` | recomputed offsets in the engine | Citation highlight in `SourceInspector` |
| **Conversation / chat** | Dexie `messages`, `id, matterId, role, timestamp` | in-session message list in the Ask tab | `ChatTab` |
| **Claim** | Dexie `claims`, `id, matterId, kind, status, polarity` | `edges` join to spans | `FactsTab`, `ReviewTab` |
| **Claim↔Span edge** | Dexie `edges`, `id, claimId, spanId, type, reviewState` | — | Provenance graph (`GraphTab`) |
| **Authority** | Dexie `authorities`, `id, identifier, jurisdiction, verificationLevel` | `engine/research/sourceCatalog.ts` is a static catalogue of known sources, **not** the store | `ResearchTab` |
| **Draft / Work Product** | Dexie `drafts`, `id, matterId, type, reviewStatus, updatedAt` | `engine/draftingEngine.ts` produces candidate text; never authoritative | `DraftTab`, `NotebookStudioTab` |
| **Review item** | Dexie `reviewItems`, `id, matterId, type, severity, status, createdAt` | — | `ReviewTab`, "Needs review" counts |
| **Vault records** | Encrypted blobs via `engine/vault/vaultService.ts` | in-memory `Map` during an unlocked session | `SettingsTab` vault state |
| **Theme** | `localStorage` via `src/design/theme.ts` | `documentElement.classList` | whole app |
| **Active surface** | URL hash (`#/workbench`) | React state in `AppRouter` | `AppRouter` |

---

## 3. The authoritative schema (Dexie v3, read from `src/db/index.ts`)

```
matters      id, title, jurisdiction, clientAlias, status, workspaceType, isDemo,
             createdAt, updatedAt
documents    id, matterId, filename, sha256, sourceDate, importedAt
spans        id, documentId, checksum
claims       id, matterId, kind, status, polarity, updatedAt
edges        id, claimId, spanId, type, reviewState
authorities  id, identifier, jurisdiction, verificationLevel
drafts       id, matterId, type, reviewStatus, updatedAt
reviewItems  id, matterId, type, severity, status, createdAt
messages     id, matterId, role, timestamp
userProfile  id, role, primaryJurisdiction, onboardingCompleted
```

Schema history: v1 had the first eight stores; **v2 added `messages`**; **v3 added
`workspaceType` / `isDemo` to matters and the `userProfile` store**.

---

## 4. Durability, after the v4 migration

**Corrected.** An earlier revision of this document recorded memory, tasks,
research jobs and skills as memory-only. That was true when written and is no
longer. Schema v4 gave all of them a real store, and
`src/tests/auditTamper`-style verification plus a genuine process-restart
harness now prove it.

| Entity | Store | Restart evidence |
|---|---|---|
| **Memory** | `memories` | `PROCESS RESTART VERIFIED` — written, browser killed, relaunched, record present with scope and provenance |
| **Task** | `tasks` | `PROCESS RESTART VERIFIED` — status and priority intact |
| **Work / research job** | `jobs` | `PROCESS RESTART VERIFIED` — restored as `paused` with checkpoint and an explicit interrupted step, never `completed` |
| **Research session** | `researchSessions` | `PROCESS RESTART VERIFIED` — restored as `idle` with fetched sources and logs intact |
| **Saved skill** | `skills` | `PROCESS RESTART VERIFIED` — version, triggers, workflow, permissions, provenance and success/failure counters intact |
| **Chat history** | `messages` (v2) | `PROCESS RESTART VERIFIED` |
| **Onboarding** | `userProfile.onboardingCompleted` (v3) | covered by unit tests; not separately exercised across a process kill |
| **Profile, matters, sources, drafts, review items** | v1 stores | `PROCESS RESTART VERIFIED` |

Still **not** durable, and nothing in the UI should imply otherwise:

- Nothing else. Every entity the product surfaces is now in the schema.
  `durableCounts()` in `src/db/repositories.ts` reports the live totals for all
  five v4 stores plus the legacy ones, and is asserted by test.

### Interruption semantics

A job recorded as `running` at startup cannot still be running, because the
process that was running it has exited. `reconcileOnStartup()` therefore
downgrades it to `paused` with the original `progressPercent` preserved and the
step set to "Interrupted when the application closed. Ready to resume."
Research sessions left `executing` return as `idle` with their collected sources
and logs. Neither is ever reported as complete.

This is verified three times over: the unit test asserts the repair, the restart
harness asserts it across a real process boundary, and a third process confirms
the repair is stable rather than repeated on every boot.

### What is deliberately not persisted

- **Model health.** Recomputed by a live probe on every boot
  (`engine/modelBridge.checkOllamaConnection`, 2.5 s timeout against `/tags`).
  Caching it would let the UI claim a model is ready when it is not.
- **Session UI state** such as which tab was open. The active *surface* is in
  the URL hash; tab selection is intentionally not durable.

---

## 4. Integrity fields are computed, never asserted

`Document.sha256` and the export bundles carry real digests, and this is now
enforced rather than assumed:

- `src/tests/assetDigestIntegrity.test.ts` recomputes SHA-256 from disk for the
  canonical mark and the demo contract, and asserts the committed constants match.
  A stale digest fails the build.
- The same suite pins every `db/fixtures` document digest to that document's own
  text. These were already correct; the test exists so they cannot drift.
- `SpeechTranscriptionResult.audioSha256` is `string | null`. It is the real
  digest of the audio, or `null` for "could not be computed". It previously fell
  back to a hardcoded digest belonging to an unrelated document.
- `bundleExchange.verifyBundleIntegrity` recomputes the payload digest on import
  and throws on mismatch.

---

## 5. Duplicate-truth risks found and resolved

| Risk | Resolution |
|---|---|
| The same 64-hex digest string appeared as the canonical mark digest, the demo contract digest, a Bates document digest, and an audio fallback | Digests are now generated per artifact (`scripts/gen-asset-digests.mjs`), pinned by tests, and the audio path fails closed |
| 241 Tailwind colour usages named `--proofline-*` while resolving to ATKIN tokens, so a rename could silently repaint the whole workbench | Consolidated onto the real `atkin-*` tokens; the duplicate colour family was deleted from `tailwind.config.js` |
| The active surface existed only in React state, so a reload reset the app to the marketing page | Surface is reflected in the URL hash and rehydrated on load |
| `engine/research/sourceCatalog.ts` could be mistaken for the authority store | Documented above as a static catalogue; Dexie `authorities` is the store |

---

## 6. Rules for future changes

1. One writer per entity. If a second writer is needed, add a migration, not a
   second store.
2. Never rename `ProoflineLocalDB`, the vault sentinel, or the vault path. These
   are data identity, not branding.
3. Any digest shown to a user must be recomputable from a shipped file, and a
   test must prove it.
4. Any status shown as Ready / Connected / Paired / Verified must come from a
   check that actually ran in that session.
5. If an entity is not in the Dexie schema, it does not survive a reload. Do not
   imply otherwise in the UI.
