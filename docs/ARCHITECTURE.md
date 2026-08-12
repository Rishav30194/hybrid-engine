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
| Engine | `src/engine/` | Pure functions: load maths, storage keys, day progress |
| State | `src/state/` | Reducer, contexts, localStorage persistence |
| Sync | `src/sync/` | Supabase reconcile, push/pull, status |
| Auth | `src/auth/` | Session provider + the header account control |
| Screens | `src/screens/` | This Week, 8-Week Plan, Template |
| Components | `src/components/` | Header, BottomNav, RestTimer, CheckButton, PhasePill, SectionLabel |

Everything below the data layer is data-driven. `dayProgress` computes `day.ex.length + 1`, and
the screens map over `DAYS` / `COND` / `WEEKS`, so the program's shape can change without
touching the engine or the UI.

---

## The load engine

The heart of the app. Every working load is derived, never stored:

```
load = round(1RM × pct / increment) × increment
```

`roundLoad()` in `engine/loads.ts`, with `increment` defaulting to 1. `computeLoad()` looks the
percentage up as `WEEKS[week - 1].main[lift].pct`. Change a 1RM and every screen recalculates —
there is nothing to invalidate.

**The week 3 / 6 press swap is real, not copy.** Wednesday's slot is authored as the bench but
runs overhead in weeks 3 and 6. `pressForWeek()` → `anchorLifts()` → `resolveExercise()` carry
that through: the row's *name* and its *computed load* both follow the week. This Week lists the
three lifts a week actually programs; the 1RM editor still edits all four. Covered by
`loads.test.ts` and `screens.test.tsx`.

---

## State

`AppState` (`state/types.ts`) is one flat object. Only five fields are persisted:

| Persisted | Volatile (never persisted) |
|---|---|
| `week`, `rounding`, `rm`, `done`, `log` | `tab`, `openWeek`, `openDay`, `timer`, `pillHidden` |

### Invariants

- **The reducer is pure.** Time enters via `now` on the action (`timerStart`, `timerTick`,
  `timerAdd`, `timerStartPause`). Never call `Date.now()` inside it — the timer suite depends
  on this.
- **`week` is clamped 1..8** by `clampWeek`. `WEEKS[week - 1]` is dereferenced unguarded in
  several places; that clamp is the only thing between corrupt data and a white screen.
- **A 1RM may legitimately be `''`** while the field is being cleared. Parse with `toNum`, never
  bare `Number()`/`parseFloat`, and never coerce the blank back to a number in the reducer or
  the field can't be emptied.
- **The rest timer is `endAt`-anchored, not tick-counted** — it stays correct when iOS suspends
  the tab. Don't rewrite it as a decrementing counter.

---

## Persistence

`localStorage`, one key, written as the persisted slice plus an `updatedAt` stamp.

### Invariants

- **`STORAGE_KEY = 'hybridEngine.v1'`** (`state/persistence.ts`). Changing or bumping it abandons
  every device's data.
- **Key formats in `engine/keys.ts` are a storage contract**, not an implementation detail:
  `w{week}:m:{lift}` · `w{week}:c:{cond}` · `w{week}:t:{exId}` · `w{week}:tc:{cond}`. Change a
  format and existing check-offs and logged weights orphan.
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
  must default it and `hydrateRemote` must tolerate its absence.
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
- **All four 1RMs stay editable**, even in a week that only programs three lifts.
- The percentages decide what goes on the bar. Changing one is a training decision — see
  `CLAUDE.md` §3.

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
