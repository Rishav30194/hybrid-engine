# Conventions

Rules for changing this app. How it's built is in [`ARCHITECTURE.md`](ARCHITECTURE.md); the
process for proposing and approving a change is in `CLAUDE.md`.

---

## Mobile first, and mobile only

Target: **iPhone Safari and the standalone Home Screen PWA, portrait.** Verify at **390 × 844**
(iPhone 14/15) at minimum. The layout is a centred column capped at `--app-max-width: 560px`;
anything wider is a bonus, not the target. It is used one-handed, in a gym, mid-set, possibly
offline. Desktop-looking-fine is not the bar.

- **Every form control uses `font-size: var(--fs-control)`** (16px). Below 16px, iOS zooms the
  page on focus and does not zoom back. Use the token rather than a literal — and never set a
  smaller size on an `input`, `select` or `textarea`, however dense the row. A larger size is
  fine (the 1RM field is 22px). `src/styles/controls.test.ts` enforces this across every control
  in the app; it fails with the file and size named, so you'll hear about it before the phone does.
- **One scroll container: `.app__main`.** `.app` is `overflow: hidden; height: 100dvh`. Don't add
  nested scrollers, and don't add `position: fixed` children — the rest timer is
  `position: absolute` inside `.app` precisely so it rides the column, not the viewport.
- **`100dvh`, never `100vh`** — mobile Safari's toolbar makes `vh` lie.
- **Touch, not hover.** No hover-only affordances, no tooltips, no right-click.
- **No `alert` / `confirm` / `prompt`.** They're hostile in a standalone PWA.
- **Numeric fields set `inputMode`** — `numeric` for 1RMs, `decimal` for logged weights — so the
  right keypad opens. Keep that on any new numeric input.
- **Keep the first paint offline.** The app must paint from localStorage with no network. See
  the dynamic-import rule in [`ARCHITECTURE.md`](ARCHITECTURE.md#cloud-sync).

### Safe-area insets are load-bearing and stacked

Hand-tuned to clear each other on notched phones:

| Element    | Rule                                                         |
| ---------- | ------------------------------------------------------------ |
| Header     | `padding: calc(14px + env(safe-area-inset-top)) 16px 11px` |
| Bottom nav | `padding-bottom: env(safe-area-inset-bottom)`              |
| Rest pill  | `bottom: calc(74px + env(safe-area-inset-bottom))`         |
| Rest panel | `bottom: calc(130px + env(safe-area-inset-bottom))`        |

**Change the nav's height and you must retune the pill and the panel**, or the timer overlaps
the tabs.

Scrollbars are hidden globally and `overscroll-behavior-y: none` kills rubber-band bleed. Both
are intentional.

---

## CSS

- **No raw hex in component CSS.** Every colour, radius and type size is a token in
  `src/styles/tokens.css`. Add a token there rather than a literal in a component file.
- **One stylesheet per component**, imported by that component (`Header.tsx` imports
  `Header.css`). No global styles outside `global.css` and `tokens.css`.
- **BEM-ish naming** matching what's already there: `.ex-row`, `.ex-row__input`,
  `.phase-pill--card`. Modifiers are frequently composed from props
  (`` `check-btn check-btn--${size}` ``) — grep for the stem before assuming a class is unused.
- Match the density and idiom of the file you're editing.

---

## Where things go

| Adding                        | Goes                                                                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An exercise                   | `DAYS` in `program.ts`, with a **fresh unique `id`**. Day progress totals update automatically                                                      |
| A loggable conditioning load  | `condLoads` on that `Day` (`{ id, label }`). Stored in `log` under the existing `w{week}:t:{id}` key, so no new key format and no migration. The `id` is a storage key — never reuse one |
| A per-week prescription field | `MainPrescription`/`Week` in `data/types.ts`, then all 8 entries in `WEEKS`. Partial fills fail type-check — that's the point                          |
| A persisted field             | `PersistedState` → `pickPersisted` → `mergePersisted` default → `hydrateRemote` → a `persistence.test.ts` case. **All five, or it desyncs** |
| UI-only state                 | `AppState` only. Keep it out of `PersistedState`                                                                                                            |
| A colour or size              | `src/styles/tokens.css`                                                                                                                                       |
| A screen                      | `src/screens/`, a `Tab` union member, a `BottomNav` entry, an `App.tsx` branch. Four places                                                             |
| A feature flag                | `src/config.ts` (that's what `SHOW_PERCENTS` is). There is deliberately no settings UI                                                                      |

---

## Type safety

`tsconfig.app.json` runs `strict` plus `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes`. `strict` is TypeScript 7's default but is declared explicitly so
it can't lapse silently.

- **Indexing an array or a `Record<string, …>` yields `T | undefined`.** Handle it — don't reach
  for `!` in production code. For the week's prescription use `weekAt(week)`; for a lookup table,
  type the key as a finite union (`Record<SyncState, string>`) so the keys are known.
- **`!` is acceptable in tests** for literal indices into program-data fixtures (`DAYS[0]!.ex[0]!`),
  because `loads.test.ts` → `program data integrity` asserts that shape and fails first with a
  clear message. It is not acceptable in `src/`.

Linting runs oxlint's `correctness`, `suspicious` and `perf` categories as errors.

## Testing

Extend the file that owns the behaviour:

| Area                                      | Test                                |
| ----------------------------------------- | ----------------------------------- |
| Load maths, program integrity, press swap | `src/engine/loads.test.ts`        |
| Per-week check-off keys, day progress     | `src/engine/progress.test.ts`     |
| Actions and state transitions             | `src/state/reducer.test.ts`       |
| Rest timer                                | `src/state/reducer.timer.test.ts` |
| Persisted slice, merge, round-trip        | `src/state/persistence.test.ts`   |
| Rendered screens                          | `src/screens/screens.test.tsx`    |
| Form-control font-size floor (iOS zoom)   | `src/styles/controls.test.ts`     |
| Estimated 1RM from a logged set           | `src/engine/e1rm.test.ts`         |
| Closing a block: new 1RMs + carry-forward  | `src/engine/newBlock.test.ts`     |
| Username ↔ account identifier              | `src/auth/username.test.ts`       |

Vitest + Testing Library, jsdom. No real network in tests. CI runs `npm test` before it will
deploy — don't route around a red test with `.skip`.

---

## Known deviations

Documented so they aren't "fixed" by accident or re-discovered every session.

- **The rest timer can't sound while the app is backgrounded.** iOS suspends
  `setInterval`, so the chime and vibration only fire when you return to the app — phone in a
  pocket between sets means no cue at all. The *countdown* stays correct regardless (it's
  anchored to `endAt`, not tick-counted). Fixing it properly needs the Notifications API or a
  background audio track; both are out of scope for a localStorage-only PWA.
- **Check buttons are 26–30px**, under the 44px touch-target guideline. Deliberate — the dense
  list depends on it. Don't shrink them further; enlarging is a design decision.
- **`INITIAL_STATE.rm` (`squat: 245, bench: 225, tbdl: 375, ohp: 135`) are placeholders**, not
  real maxes. They only seed a fresh install.
- **There is no migration layer**, so a key-format or exercise-`id` change orphans data with no
  error and no failing test. See [`ARCHITECTURE.md`](ARCHITECTURE.md#persistence).
- **JSON export/import is intentionally out of scope.** Durability comes from signing in.
