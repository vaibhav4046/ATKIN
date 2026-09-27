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

## 4. What is *not* in the schema, and therefore not durable

These have no store. Anything in the UI implying otherwise is a defect.

- **Memory records** — `engine/memory/memoryEngine.ts` holds `MemoryRecord[]` in
  memory with `getAllMemories` / `getMemoriesForMatter` / `recallScopedMemories`.
  No Dexie store, no `localStorage` key. **Memory does not survive a reload.**
  It does travel in exported matter bundles (`bundleExchange` carries
  `memories: MemoryRecord[]`), so it is durable only once exported.
- **Tasks** — no store. Task planning exists
  (`atkinTaskClassifierAndPlanner.test.ts` passes) but there is no task table.
- **Research jobs** — in-memory job state under `runtime/jobs`; survives
  navigation within a session, not a reload.
- **Skills** — no store.

By contrast, these *are* durable and have tests:

- **Chat history** — `messages` store with `saveChatMessageToDB`,
  `loadChatMessagesFromDB`, `clearChatMessagesFromDB`.
- **Onboarding completion** — `userProfile.onboardingCompleted`, covered by
  `atkinWorkspaceProfile.test.ts` and `atkinAcceptanceJourneys.test.ts`.
- **Demo / personal separation** — `workspaceType` and `isDemo` on matters, with
  seeding and filtering asserted in `atkinWorkspaceProfile.test.ts`,
  `persistence.test.ts` and `atkinAcceptanceJourneys.test.ts`.

**Model health is deliberately not persisted.** It is recomputed by a live probe
(`engine/modelBridge.checkOllamaConnection`, 2.5 s timeout against `/tags`).
Never cached, never assumed — so "Ready" means a check actually ran.

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
