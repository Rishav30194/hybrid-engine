# Architecture

How the app is built, and the invariants that must not break. Rules for *writing* code here
live in [`CONVENTIONS.md`](CONVENTIONS.md); why the program is shaped as it is lives in
[`PROGRAM_SOURCE.md`](PROGRAM_SOURCE.md).

---

## Shape

A single-user, offline-first PWA. React + Vite + TypeScript, no router, no UI framework, no
state library. One `useReducer` store, three screens switched by a `tab` field.

```
main.tsx → AuthProvider → StoreProvider → App
                                           ├── SyncManager   (headless; cloud reconcile)
                                           ├── Header        (title, week chips, AccountControl)
                                           ├── main.app__main  ← the only scroll container
                                           │     └── ThisWeek | WeekPlan | Template
                                           ├── RestTimer     (absolute, inside .app)
                                           └── BottomNav
```

| Layer | Location | Role |
|---|---|---|
| Program data | `src/data/` | The prescription: weeks, days, lifts, conditioning |
| Engine | `src/engine/` | Pure functions: prescription meta lines, storage keys, day progress, block carry-forward |
| State | `src/state/` | Reducer, contexts, localStorage persistence |
| Sync | `src/sync/` | Supabase reconcile, push/pull, status |
| Auth | `src/auth/` | Session provider + the header account control |
| Screens | `src/screens/` | This Week (block progress), 8-Week Plan, Template (the session) |
| Components | `src/components/` | Header, BottomNav, RestTimer, CheckButton, PhasePill, SectionLabel |

Everything below the data layer is data-driven. `dayProgress` computes `day.ex.length + 1`, and
the screens map over `DAYS` / `COND` / `WEEKS`, so the program's shape can change without
touching the engine or the UI.

---

## Logged weights

Every weight is **logged, not computed** — main lifts included. A Template row has one weight
field, stored in `log` under `w{week}:t:{exId}` (the same key as the row's check-off, in a
different map), and you read last week's number back and choose this week's yourself. There is
no 1RM, no percentage and no rounding anywhere in the UI.

Main-lift rows still read their sets, reps and RPE from the active week (`mainLiftMeta()` reads
`WEEKS`), so a row shows `4×5 · RPE 7` in week 1 rather than the block range `4×5→4×4` stored on
the exercise. Accessories use their static `sr`/`rpe` via `exerciseMeta()`.

**The week 3 / 6 press swap is real, not copy.** Wednesday's slot is authored as the bench but
runs overhead in weeks 3 and 6; `resolveExercise()` gives the row the name and meta line of the
lift that week programs. Covered by `loads.test.ts` and `screens.test.tsx`.

---

## State

`AppState` (`state/types.ts`) is one flat object. Only six fields are persisted:

| Persisted | Volatile (never persisted) |
|---|---|
| `week`, `rounding`, `rm`, `basisAt`, `done`, `log` | `tab`, `openWeek`, `openDay`, `timer`, `pillHidden` |

### Invariants

- **The reducer is pure.** Time enters via `now` on the action (`timerStart`, `timerTick`,
  `timerAdd`, `timerStartPause`). Never call `Date.now()` inside it — the timer suite depends
  on this.
- **`week` is clamped 1..8** by `clampWeek`, and every read of the week's prescription goes
  through **`weekAt(week)`** (`data/program.ts`), which falls back to week 1 rather than
  white-screening. `WEEKS` is typed as a non-empty tuple so that fallback is total, and
  `noUncheckedIndexedAccess` makes the compiler enforce it — index `WEEKS` directly and it
  won't type-check.
- **`rm`, `rounding` and `basisAt` are unread.** They are what working loads were once computed
  from. They stay in `AppState` and the persisted slice only because dropping them would change
  the stored shape for no gain; nothing reads or writes them, and nothing new should.
- **The rest timer is `endAt`-anchored, not tick-counted** — it stays correct when iOS suspends
  the tab. Don't rewrite it as a decrementing counter.

---

## Persistence

`localStorage`, one key, written as the persisted slice plus an `updatedAt` stamp.

### Invariants

- **`STORAGE_KEY = 'hybridEngine.v1'`** (`state/persistence.ts`). Changing or bumping it abandons
  every device's data.
- **Key formats in `engine/keys.ts` are a storage contract**, not an implementation detail:
  `w{week}:t:{exId}` (exercise check-off *and* logged weight) · `w{week}:tc:{cond}`
  (conditioning check-off). Change a format and existing check-offs and logged weights orphan.
  Template is the only screen that checks work off. Two further formats — `w{week}:m:{lift}` and
  `w{week}:c:{cond}` — were written by the old This Week lift and conditioning rows; those rows
  are gone and any such keys still in storage are inert.
- **Exercise `id`s in `program.ts` are storage keys.** Renaming an exercise is free; reusing an
  existing `id` for a *different* movement is the dangerous case — a logged weight resurfaces on
  the wrong lift. Always issue a fresh id.
- **Never put volatile state in the persisted slice.** `persistedSnapshot()` is the dependency
  driving both the localStorage write and the debounced cloud push. Put `tab`, `timer` or a
  scroll flag in there and every tick becomes a network write. `pickPersisted` keeps
  `week, rounding, rm, done, log` and nothing else.
- **There is no migration layer.** A key-format or exercise-`id` change would orphan data
  silently — no error, no failing test. Adding one means running it on **both** paths in
  (see below), or the untreated path becomes a re-infection vector.

---

## Cloud sync

Entirely optional. With `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` absent the app
behaves exactly as a localStorage-only app. Setup: [`CLOUD_SYNC.md`](CLOUD_SYNC.md).

`SyncManager` is headless and does four things:

1. **On sign-in, reconcile by `updatedAt`** — pull the cloud row if it's newer, otherwise push
   local up. Last-write-wins.
2. **Push local changes**, debounced 800ms off `persistedSnapshot`.
3. **Subscribe to realtime** `postgres_changes` on the user's `user_state` row, so other devices
   stream in.
4. **On visibility/focus change**, pull when the tab becomes visible and flush a push when it
   hides — so a change isn't lost if the app closes before the debounce fires.

### Invariants

- **`PersistedState` is also the cloud wire format.** `RemoteBlob` extends it (`syncClient.ts`).
  A new field must be optional-safe: old blobs and old devices won't have it, so `mergePersisted`
  must default it and `hydrateRemote` must tolerate its absence. The cost of that tolerance is
  real: a push from a device running an older build carries none of the field, and
  last-write-wins then clears it — the same way it already clears `done` and `log`.
- **There are two paths into state**: localStorage hydrate (`mergePersisted`) and cloud pull
  (reducer `hydrateRemote`). Anything that cleans or migrates data must run on both.
- **`updatedAt` lives outside `AppState` on purpose.** Last-write-wins needs a remote pull to
  stamp the *remote* time (`setNextUpdatedAt`), or pulled data looks newer than its source and
  ping-pongs. Don't move it into the reducer.
- **`supabase-js` is dynamically imported** (`lib/supabase.ts`) so it lands in its own chunk and
  the app paints from localStorage without it. Never convert that to a static import.

---

## Program data

`src/data/program.ts` is the source of truth for `WEEKS`, `DAYS`, `COND`, `CONDINFO`, `NOTES`,
`PHASES` and `LIFTS`. The reasoning behind those values — time budgets, volume trade-offs — is
in [`PROGRAM_SOURCE.md`](PROGRAM_SOURCE.md).

- **8 weeks, 4 lifts, 3 days.** `loads.test.ts` → `describe('program data integrity')` asserts
  the shape. If a change makes those fail, the change is wrong until proven otherwise.
- Sets, reps and RPE are training decisions — see `CLAUDE.md` §3. The `pct` values in `WEEKS`
  are no longer read by any screen.
- **`TEST_WEEK` is the last week**, and only that week shows the new-block button.

---

## Closing a block

**`engine/newBlock.ts`** turns the last week's log into the next block's starting point: every
logged weight — main lifts, accessories and loaded conditioning — is copied from the last week to
week 1, because each exercise repeats next block and last block's number is where the new one
starts. Suffixed detail keys (felt RPE, and the old week-8 test entries) are not carried; they
describe one set, not a starting point.

The reducer's `startNewBlock` applies it: `week` back to 1, `done` emptied, `log` replaced by the
carry.

---

## Last set RPE

Every Template row logs the actual felt RPE of its last set under the suffixed id
`{exId}:lsrpe` (`lsrpeId` in `engine/keys.ts`), inside the usual `w{week}:t:{exId}` format — no
new key format, no migration. The field rides the `.ex-row__meta` line rather than taking one of
its own, so it reads directly against the RPE prescribed a few words to its left and the row
keeps the height it had before the field existed — see the control-placement rule in
[`CONVENTIONS.md`](CONVENTIONS.md). It is a record only; nothing is computed from it.

**Retired suffixes.** Week 8 once logged a test set as `{exId}:reps` and `{exId}:rpe` beside the
weight. Nothing writes them now; any still in storage are inert.

---

## Build & deploy

- **Vite + `vite-plugin-pwa`**, `registerType: 'autoUpdate'` — a deploy reaches the phone on its
  own, which also means a bad deploy does.
- **`base` in `vite.config.ts` and the manifest `start_url`/`scope` must stay identical**
  (`/hybrid-engine/`), or the installed PWA breaks its scope.
- **GitHub Actions** (`.github/workflows/deploy.yml`) runs `npm ci` → `npm test` →
  `npm run build` → Pages deploy on every push to `main`. `deploy` needs `build`, so a red test
  blocks the phone from updating. Don't route around it.
- Supabase env vars come from repo secrets; unset simply means the deployed build is
  localStorage-only.

---

## Durability

iOS storage is best-effort, and this is the app's weakest point.

localStorage survives a normal shutdown (it's on disk, not RAM). The real risks are Apple's
rules: a **7-day eviction cap** for script-writable storage if the app isn't opened for a week,
eviction under storage pressure, and "Clear History and Website Data". **Add to Home Screen**
improves durability considerably — a separate storage container, not subject to the 7-day
Safari cap the same way — but is still best-effort. `navigator.storage.persist()` is effectively
ignored on iOS.

**Signing in is the only real durability.** Cloud sync backs the state to Supabase. JSON
export/import is intentionally out of scope.
