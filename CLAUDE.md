# Hybrid Engine — Change Contract

Authoritative guide for this project — self-contained, and it wins over any
broader/inherited convention. Read this **before** editing any file here.

---

## 0. What you are touching

A **live, single-user app**. Rishav runs the 8-week program off it on his iPhone, from
the Home Screen PWA at <https://rishav30194.github.io/hybrid-engine/>. Every push to
`main` auto-deploys to that phone within minutes (`.github/workflows/deploy.yml`).

Three consequences that shape every change:

1. **There is real training data in the field.** Check-offs, logged accessory weights and
   his 1RMs live in `localStorage` (and optionally Supabase). A careless key or shape
   change silently orphans weeks of logged work. There is no undo and no export
   (JSON backup is intentionally out — see `docs/IMPLEMENTATION_PHASES.md`).
2. **It is used one-handed, in a gym, mid-set.** Small screen, portrait, sweaty thumbs,
   possibly offline. Desktop-looking-fine is not the bar.
3. **The numbers are not decoration.** Percentages in `src/data/program.ts` decide what he
   actually loads on the bar. Changing one is a training decision, not a code change.

---

## 1. Read before you edit

| Question | File |
|---|---|
| What is the program? | `src/data/program.ts`, `src/data/types.ts` |
| How is a load computed? | `src/engine/loads.ts` |
| How is progress keyed? | `src/engine/keys.ts` |
| What is state? | `src/state/types.ts`, `src/state/reducer.ts` |
| What survives a reload? | `src/state/persistence.ts` |
| How does cloud sync work? | `src/sync/SyncManager.tsx`, `docs/CLOUD_SYNC.md` |
| Why is it built this way? | `docs/IMPLEMENTATION_PHASES.md` |
| Why is the *program* shaped this way? | `docs/PROGRAM_SOURCE.md` |

Read only what the task needs. Do not scan the whole repo.

---

## 2. Classify the change first

State the class in your plan. It determines what the change costs.

| Class | Examples | Required |
|---|---|---|
| **A — Cosmetic** | spacing, colour, copy, a token value | Tests + build pass; check at 390px wide |
| **B — Behaviour** | new interaction, screen layout, timer tweak | Plan approved first; add/extend a test |
| **C — Program data** | a `pct`, `sr`, `rpe`, exercise, week, note | **Explicit approval every time** — this changes his training. Update `loads.test.ts` expectations |
| **D — Persisted shape** | new field in `PersistedState`, key format, `STORAGE_KEY` | Plan + migration + approval. See §3.1 |
| **E — Infra** | `package.json`, `vite.config.ts`, workflow, Supabase schema | Explicit approval — see §8 |

When a request spans classes, the highest class governs.

---

## 3. Invariants

These are the things that break the app *quietly* — no error, no failing test, just wrong
data or a lost log. Treat each as a hard stop unless the task is explicitly about changing it.

### 3.1 Persistence & sync

- **`STORAGE_KEY = 'hybridEngine.v1'`** (`persistence.ts:5`). Changing or bumping it
  abandons every device's data. Never touch it casually.
- **Key formats in `engine/keys.ts` are a storage contract**, not an implementation detail.
  `w{week}:m:{lift}`, `w{week}:c:{cond}`, `w{week}:t:{exId}`, `w{week}:tc:{cond}`. Change a
  format and existing check-offs/logs orphan. The header comment says this; believe it.
- **Exercise `id`s in `program.ts` are storage keys.** Renaming an exercise is free;
  reusing an existing `id` for a *different* movement is the dangerous case — a logged
  weight resurfaces on the wrong lift. Always issue a fresh id rather than recycling one.
- **`PersistedState` is also the cloud wire format.** `RemoteBlob` extends it
  (`syncClient.ts`). A new field must be optional-safe: old blobs and old devices won't
  have it, so `mergePersisted` must default it and `hydrateRemote` must tolerate its absence.
- **There are two paths into state**: localStorage hydrate (`mergePersisted`) *and* cloud pull
  (reducer `hydrateRemote`). If you ever add a migration or cleanup, it must run on **both** —
  applying it to only one leaves the other as a re-infection vector.
- **Never add volatile state to the persisted slice.** `persistedSnapshot()` is the
  dependency that drives both the localStorage write and the 800ms-debounced Supabase
  push. Put `tab`, `timer`, an accordion or scroll flag in there and every tick or tap
  becomes a network write. The split is deliberate: `pickPersisted` keeps
  `week, rounding, rm, done, log` and nothing else.
- **`updatedAt` lives outside `AppState` on purpose** — last-write-wins needs a remote pull
  to stamp the *remote* time (`setNextUpdatedAt`), or the pulled data looks newer than its
  source and ping-pongs. Don't move it into the reducer.

### 3.2 Program data

- **`program.ts` is the source of truth** for `WEEKS`, `DAYS`, `COND`, `CONDINFO`, `NOTES`,
  `PHASES`, `LIFTS`. `docs/PROGRAM_SOURCE.md` carries the reasoning behind them — the per-day
  time budgets and the volume trade-offs, neither of which is encoded in the data.
- **8 weeks, 4 lifts, 3 days.** `loads.test.ts` → `describe('program data integrity')`
  asserts the shape. If a change makes those fail, the change is wrong until proven otherwise.
- **All four 1RMs stay editable**, even in a week that only programs three lifts.
- **The week 3 / 6 press swap is real.** `pressForWeek()` → `anchorLifts()` → `resolveExercise()`.
  Any edit to the Wednesday press row must keep the overhead swap working in both the name
  and the computed load. Covered by `loads.test.ts` and `screens.test.tsx`.

### 3.3 State & reducer

- **The reducer is pure.** Time enters via `now` on the action (`timerStart`, `timerTick`,
  `timerAdd`, `timerStartPause`). Never call `Date.now()` inside it — the timer suite
  depends on this.
- **`week` is clamped 1..8** (`clampWeek`). `WEEKS[week - 1]` is dereferenced unguarded in
  several places; the clamp is the only thing standing between corrupt data and a white screen.
- **A 1RM may legitimately be `''`** while the input is being cleared. Parse with `toNum`,
  never bare `Number()`/`parseFloat` — and never coerce the blank back to a number in the
  reducer, or the field can't be emptied.
- **The rest timer is `endAt`-anchored, not tick-counted.** It stays correct when iOS
  suspends the tab. Don't rewrite it as a decrementing counter.

---

## 4. Mobile rules

Target: **iPhone Safari + standalone Home Screen PWA, portrait**. Verify at **390 × 844**
(iPhone 14/15) at minimum. The layout is a centred column capped at
`--app-max-width: 560px`; anything wider is a bonus, not the target.

- **Form controls need `font-size: 16px` or larger.** Below that, iOS zooms the page on
  focus and does not zoom back. See §9 — there is a live instance of this bug.
- **One scroll container: `.app__main`.** `.app` is `overflow: hidden; height: 100dvh`.
  Don't add nested scrollers, and don't add `position: fixed` children — the rest timer is
  `position: absolute` inside `.app` precisely so it rides the column, not the viewport.
- **Safe-area insets are load-bearing and stacked.** Header pads
  `calc(14px + env(safe-area-inset-top))`; bottom nav pads `env(safe-area-inset-bottom)`;
  the rest pill sits at `calc(74px + env(safe-area-inset-bottom))` and its panel at `130px`,
  both hand-tuned to clear the nav. **Change the nav's height and you must retune both**,
  or the timer overlaps the tabs on notched phones.
- **`100dvh`, never `100vh`** — mobile Safari's toolbar makes `vh` lie.
- **Touch, not hover.** No hover-only affordances, no tooltips, no right-click.
- **No `alert` / `confirm` / `prompt`.** They're hostile in a standalone PWA.
- **Keep the first paint offline.** `supabase-js` is dynamically imported (`lib/supabase.ts`)
  so it lands in its own chunk; the app paints from localStorage without it. **Never convert
  that to a static import.** Cloud sync stays fully optional — with the env vars absent the
  app must behave exactly as a localStorage-only app.
- **PWA scope**: `base` in `vite.config.ts` and the manifest `start_url`/`scope` must stay
  identical (`/hybrid-engine/`). `registerType: 'autoUpdate'`, so a bad deploy reaches the
  phone on its own.
- **Scrollbars are hidden globally** and `overscroll-behavior-y: none` kills rubber-band
  bleed. Both are intentional.
- Numeric fields set `inputMode` (`numeric` for 1RM, `decimal` for logged weights) so the
  right keypad opens. Keep that on any new numeric input.

---

## 5. Workflow for a change request

1. **Classify** (§2) and name the invariants (§3) in blast radius.
2. **Plan** — files to touch, approach, trade-offs. For anything above class A, present it
   and **wait for approval** before writing code.
3. **Branch.** Never commit to `main`. `feature/` · `fix/` · `chore/`.
4. **Implement**, matching the style already in the file. Comments explain *why*, never *what*.
5. **Verify** (§6). All three commands, every time.
6. **Report** honestly — what changed, what you did not test, what you assumed.
7. **Do not push or open a PR unless asked.** When asked: no Claude Code footer in the PR
   body (the commit trailer is fine).

---

## 6. Definition of done

```bash
npm test          # vitest — must be green, no skips
npm run build     # tsc -b && vite build — type errors are failures
npm run lint      # oxlint
```

CI runs `npm test` before it will deploy, so a red test blocks the phone from updating.
That's the safety net — don't route around it with `.skip`.

Then, for anything visual or interactive: run `npm run dev`, view at 390px wide, and
confirm the thing you changed **and** the rest timer, bottom nav and header still sit
correctly. For real-device checks, `npm run preview` is already configured to allow
`*.trycloudflare.com` tunnels.

Test map — extend the file that owns the behaviour:

| Area | Test |
|---|---|
| Load maths, program integrity, press swap | `src/engine/loads.test.ts` |
| Per-week check-off keys, day progress | `src/engine/progress.test.ts` |
| Actions and state transitions | `src/state/reducer.test.ts` |
| Rest timer | `src/state/reducer.timer.test.ts` |
| Persisted slice, merge, round-trip | `src/state/persistence.test.ts` |
| Rendered screens | `src/screens/screens.test.tsx` |

---

## 7. Where things go

- **New exercise** → `DAYS` in `program.ts`, with a **fresh unique `id`**. Day progress
  totals update automatically (`dayProgress` counts `ex.length + 1`).
- **New per-week prescription field** → `MainPrescription`/`Week` in `data/types.ts`, then
  all 8 entries in `WEEKS`. Partial fills will fail type-check — that's the point.
- **New persisted field** → `PersistedState` → `pickPersisted` → `mergePersisted` default →
  `hydrateRemote` → a `persistence.test.ts` case. All five, or it desyncs.
- **New UI-only state** → `AppState` only. Keep it out of `PersistedState`.
- **New colour/size** → `src/styles/tokens.css`. No raw hex in component CSS.
- **New screen** → `src/screens/`, a `Tab` union member, a `BottomNav` entry, an `App.tsx`
  branch. Four places.
- **Feature flag** → `src/config.ts` (that's what `SHOW_PERCENTS` / `BIG_LOAD` are). There is
  deliberately no settings UI.

---

## 8. Needs explicit approval

Deleting or renaming files · `package.json` or any build config · `vite.config.ts` ·
the deploy workflow · Supabase schema or migrations · `STORAGE_KEY` · **any value in
`program.ts`** · pushing to remote or opening a PR.

Secrets: `.env.local` is off-limits — never open, read back, or echo it. If a key is
needed, say so and let Rishav set it.

---

## 9. Known deviations & open issues

Documented so they aren't "fixed" by accident or re-discovered every session.

- **`.ex-row__input` is `font-size: 13px`** (`Template.css:121`). This is the accessory-weight
  field on the Template screen, and at 13px **iOS zooms the page when it's tapped** and
  doesn't zoom back. Real bug, not yet fixed. `.rm-editor__select` (13px) has the same
  exposure. The 1RM input is fine at 22px.
- **Check buttons are 26–30px**, under the 44px touch-target guideline. Deliberate — the
  dense list depends on it. Don't shrink them further; enlarging is a design decision.
- **`INITIAL_STATE.rm` (`squat: 245, bench: 225, tbdl: 375, ohp: 135`) are placeholders**,
  not Rishav's real maxes. They only seed a fresh install; his live values are in
  localStorage on his phone.
- **iOS storage is best-effort.** 7-day eviction cap, eviction under pressure, "Clear
  History and Website Data". Home Screen install helps; `navigator.storage.persist()` is
  ignored on iOS. Signing in (cloud sync) is the only real durability.
  Full note in `docs/IMPLEMENTATION_PHASES.md`.
- **JSON export/import is intentionally out of scope.**
