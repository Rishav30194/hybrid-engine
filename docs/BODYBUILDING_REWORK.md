# Bodybuilding rework — tracker

Tracks the move from the 8-week strength and conditioning block to a 12-week hypertrophy block,
across sessions. Update the status table and the session log at the end of every session.

Phase 3 has landed on the branch: `src/data/program.ts` now holds the values and
`docs/PROGRAM_SOURCE.md` holds the reasoning. The program and decisions below are the record of
what was agreed; if they ever disagree with those files, the files win.

## Status

| Phase | Class | Status |
|---|---|---|
| 1 — Remove the 1RM load engine | B | Done 2026-10-29 (`dff176e`) |
| 2 — Log reps and show last week | B | Done 2026-10-29 (`434a812`) |
| 3 — Load the new program | C | Built 2026-10-29; waiting on Rishav's read of the three days |
| 4 — Ship and cut over | Push and PR | Not started |

## Ground rules

- **Branch:** All phases go on `feature/bodybuilding-program`. Nothing merges to `main` until
  Phase 4, because every push to `main` deploys to the phone and the phases in between leave the
  app half-converted.
- **Definition of done for every phase:** `npm test`, `npm run build`, and `npm run lint` pass with
  no skipped tests, the phase's own validation list is checked off, and docs for any fact the
  phase changed are updated in the same commit (`CLAUDE.md` §7).
- **Approval:** Each phase starts with a short plan for Rishav's approval (`CLAUDE.md` §4). Deleting
  files, pushing, and opening the PR each need approval at the time.

## Agreed program

Three days a week, Monday, Wednesday, and Friday, about 50–55 minutes each.

**Block:** 12 weeks. Week 1 is easy: RPE ~8 on everything, no sets to failure, no drop sets.
Weeks 2–12 are full effort. Week 1 of the next block is the rest week. If weights or reps drop on
two or more lifts for two sessions in a row, start the next block early.

**Warm-up:** 5 min easy stair climber, then 10 arm swings and 10 leg swings per side. Warm-up
sets: 2–3 before squat, deadlift, and the DB presses; 0–1 before isolation exercises.

**Off days:** Brisk walk, 20 min or more.

### Monday — Lower

| Exercise | Sets × reps | RPE | Rest |
|---|---|---|---|
| Back Squat | 1×5–6 top, 2×8–10 back-off | 8 | 2–3 min |
| Leg Press | 3×10–12 | 9 | 2 min |
| Seated Leg Curl | 3×10–12 | 9–10 | 90 s |
| B1 Cable Fly / B2 Cable Crunch | 2×12–15 / 2×12–15 | 10 | 1 min between |
| Standing Calf Raise | 3×10–12, pause at the bottom | 10 | 90 s |

### Wednesday — Upper

| Exercise | Sets × reps | RPE | Rest |
|---|---|---|---|
| Flat DB Press | 1×6–8 top, 2×8–10 back-off | 8–9 | 2–3 min |
| A1 Seated DB Shoulder Press / A2 Chest-Supported DB Row | 2×8–10 / 3×10–12 | 9 / 9–10 | 1 min between |
| Weighted Pull-up | 3×6–10 | 9–10 | 2 min |
| B1 Cable Lateral Raise / B2 Overhead Cable Triceps Extension | 3×12–15 / 3×10–12 | 10 | 1 min between |
| EZ-Bar Curl | 2×10–12, last set drop set | 10 | 90 s |

### Friday — Full body

| Exercise | Sets × reps | RPE | Rest |
|---|---|---|---|
| Conventional Deadlift | 1×4–6 top, 2×6–8 back-off | 8 | 2–3 min |
| A1 Incline DB Press / A2 Bulgarian Split Squat | 3×8–10 / 2×8–10 per leg | 9 / 8 | 1 min between |
| B1 Lat Pulldown / B2 DB Lateral Raise | 3×10–12 / 2×12–15 | 9–10 / 10 | 1 min between |
| C1 Bayesian Cable Curl / C2 Triceps Pressdown | 2×12–15 / 2×12–15 | 10 | 1 min between |
| Seated Leg Curl | 2×10–12 | 9–10 | 90 s |

### Progression

- **Rep ranges:** When every working set reaches the top of the range at the target RPE, add the
  smallest jump (5 lb per dumbbell, 5–10 lb on a barbell) and drop back to the bottom of the range.
- **Top set and back-off sets:** Progress the top set. Back-off sets run 10–15% lighter.
- **RPE 10:** The last rep you can complete with good form.
- **Drop set:** Reach the target reps, cut the weight by about half, continue to failure.

## Decisions

All agreed with Rishav on 2026-10-29.

| Decision | Reason |
|---|---|
| Goal changes from hybrid strength and conditioning to hypertrophy | Rishav's call |
| Flat DB press replaces barbell bench | Unracking and setting up under the bar is awkward; DBs also stretch the chest further |
| Conventional deadlift, 1 top set and 2 back-off sets | Works hamstrings and back more than sumo. If sumo was originally chosen for a back or hip reason, swap sumo back in with the same scheme |
| Back-off deadlift sets at 6–8, not 8–10 | Grip and lower back fail before the target muscles on high-rep deadlifts |
| Hard conditioning dropped; easy climber becomes the warm-up; off-day walks stay | Nippard keeps cardio minimal on hypertrophy programs, and the RPE-9 climber cut into leg recovery. Frees about 12 min a session |
| Rep ranges with double progression replace %1RM loads | DB jumps are 5 lb a hand, so % loads round badly; the rep range absorbs the jump |
| 12-week block with one easy week, at the start | Rishav is already training, so he needs no ramp-in; one week finds the new weights. Matches Nippard's Essentials program, which runs 12 weeks without a deload at similar volume |
| No leg extension; leg curl as straight sets on Monday | A leg curl and leg extension superset holds two machines at once, which fails at a busy Crunch |
| Seated leg curl replaces Friday's calf raise | Deadlifts load hamstrings far less than the RDL did |
| Leg press and seated leg curl stay as written | Rishav confirmed Crunch University has both |
| Log reps of the last set only (option C) | Reps fall across sets, so the last set reaching the top of the range means every set did. One number on the number keypad per row; the iOS number keypad has no space key, which ruled out one field holding every set |

Sources: Jeff Nippard's *Essentials Program 3x* (session shape, time budget) and *Pure
Bodybuilding Program* (effort, progression), in Rishav's `Documents/Workout Plans` folder.

## Phase 1 — Remove the 1RM load engine

**Goal:** Every exercise logs a weight the way accessories do today. Nothing is computed from a 1RM.
Runs against the current program, so the app stays usable on the branch.

**Changes**

- `Template.tsx`: Main-lift rows lose the computed load, the percentage, the implied-1RM signal,
  and the week-8 test inputs, and gain the same weight field accessories have.
- `ThisWeek.tsx`: The 1RM editor and the rounding setting go. **Start new block** stays, carrying
  every exercise's weight into week 1, with no 1RM estimate.
- `WeekPlan.tsx`: Per-week loads and `PastWeekRm` go.
- `engine/newBlock.ts`: Reduced to the weight carry. `engine/e1rm.ts` and its test become unused
  and are deleted, with approval.
- `rm`, `rounding`, and `basisAt` stay in `PersistedState`, unread. Removing them changes the
  persisted shape (class D) and buys nothing.

**Validation**

- [x] `npm test`, `npm run build`, and `npm run lint` pass. Tests that asserted %1RM loads are
      removed or rewritten, not skipped. (97 tests.)
- [x] No file in `src/screens/` imports `computeLoad`, `basisForWeek`, or `impliedOneRepMax`.
- [x] A test loads a saved state that still contains `rm` and `basisAt` without error.
- [x] Dev server at 390px: squat, bench, and deadlift rows show a weight field and no computed
      load. Rest timer, bottom nav, and header sit correctly. (Checked in a 390 × 844 iframe,
      because the Chrome window wouldn't shrink below 754px.)
- [x] `docs/ARCHITECTURE.md` sections on the load engine, closing a block, and last set RPE match
      the code. `CONVENTIONS.md` and `README.md` updated too.

## Phase 2 — Log reps and show last week

**Goal:** Each row records reps and shows last week's weight and reps, so the next step (add a
rep or add weight) is visible mid-session.

**Changes**

- Reps go in `log` under the suffixed id `{exId}:reps`, so the key is `w{week}:t:{exId}:reps`.
  This is the pattern the week-8 test entries already use: no new key format and no migration.
- Each row shows the previous week's weight and reps as faint placeholders in the empty boxes,
  so no row grows a line. Week 1 shows plain `weight` and `reps`.
- One reps field per row: the reps on the **last set only**, on the number keypad, beside the felt
  RPE (which already describes the last set). Example: `Seated Leg Curl [90] lb · reps [9] · felt [9]`,
  with `last week: 90 × 8` under it.
- Top-set rows (squat, flat DB press, deadlift) get two weight-and-reps pairs: the top set, and the
  last back-off set. Example: `top [185] lb × [6] · back-off [160] lb × [9]`, with
  `last week: 185 × 5 · 160 × 10`. Back-off ids: `{exId}:bo` (weight) and `{exId}:bo:reps`.

**Validation**

- [x] `npm test`, `npm run build`, and `npm run lint` pass. (105 tests.)
- [x] A test pins the reps key to `w{n}:t:{id}:reps` and confirms the existing key formats are
      unchanged.
- [x] A test confirms reps survive `pickPersisted`, `mergePersisted`, and `hydrateRemote`.
- [x] A screens test shows week 2's weight and reps on a week-3 row, and nothing on a week-1 row.
- [x] Dev server at 390px: the reps entry is usable one-handed and follows the control-placement
      rule in `docs/CONVENTIONS.md`. Rest timer, bottom nav, and header sit correctly. Row heights
      unchanged from Phase 1 (111, 111, 112, 127 px).
- [x] `docs/ARCHITECTURE.md` documents the reps key next to the other suffixed ids.
- [ ] **Carried to Phase 3:** the back-off line at 390px. No exercise sets `backoff` until Phase
      3, so it is covered only by a test that renders a sample exercise.

## Phase 3 — Load the new program

**Goal:** `program.ts` holds the agreed program, and the app drops everything the old program
needed that the new one doesn't.

**Changes**

- `program.ts`: 12 weeks. Week 1 tagged **Easy week**, weeks 2–12 full effort. The three days
  from this file, with cues in each row's note (for example, the DB press kick-up).
- Fresh ids, prefixed `bb-` (for example `bb-mon-squat`), so none can collide with an old id.
- `types.ts`: `Week` drops `main` and `cond`. `Day` drops `condKey`, `condLabel`, and
  `condLoads`. `LiftKey`, `LIFTS`, `pressForWeek`, `anchorLifts`, and the `main` field on
  `Exercise` go.
- Conditioning goes: `COND`, `CONDINFO`, the conditioning block in `Template.tsx`, and the `+ 1`
  in `dayProgress`. The `w{n}:tc:{cond}` keys become inert, like the older formats in `keys.ts`.
- `clampWeek` allows 1–12. **Start new block** shows in week 12. Screen copy that says
  "8-Week" changes.
- `NOTES` carries the progression rules. `OFF_DAYS` stays.

**Validation**

- [x] `npm test`, `npm run build`, and `npm run lint` pass. (101 tests.)
- [x] The program integrity test asserts 12 weeks, 3 days, unique ids, and that no id from the old
      program is reused (every id must match `bb-(mon|wed|fri)-…`).
- [x] `clampWeek` tests: 12 is allowed, 13 clamps to 12.
- [x] `progress` tests: a day's total equals its exercise count.
- [x] Dev server at 390px: all three days in week 1 and week 12; **Start new block** appears only
      in week 12. The back-off line on squat, flat DB press, and deadlift (carried from Phase 2).
      Rest timer, bottom nav, and header sit correctly. No horizontal scroll; the longest name
      wraps to two lines.
- [x] The `load` field on `Exercise` is unused since Phase 2 (placeholders show last week or
      `weight`). Drop it from the type and the data.
- [ ] Rishav reads all three days in the dev build and confirms they match this file.
- [x] `docs/PROGRAM_SOURCE.md` is rewritten from the Decisions table. `docs/ARCHITECTURE.md`
      (program data, invariants) and `README.md` match.
- [x] A search of `docs/` and `README.md` for `1RM`, `8-week`, `sumo`, `TEST_WEEK`, `condKey`, and
      `climber` turns up nothing stale. (Remaining hits are deliberate history.)

## Phase 4 — Ship and cut over

**Goal:** The new program is live on the phone and survives a real week.

**Steps**

1. Open the PR from `feature/bodybuilding-program` to `main`, with approval. No attribution
   footer.
2. Merge after CI passes, with approval.
3. On the phone, open the Home Screen app and let the update load.
4. Set the week to 1 with the week chips. Old check-offs and weights stay in storage under the old
   ids and show nowhere; nothing is migrated.

**Validation**

- [ ] CI passes on the PR, and the deploy workflow succeeds after merge.
- [ ] On the iPhone: week 1 shows the new Monday. A weight and reps logged on one exercise survive
      closing and reopening the app.
- [ ] If signed in: the same entry appears after a reload from the cloud.
- [ ] Rishav trains one full week (Monday, Wednesday, Friday) on the new program with no app
      problems. The rework is then done; trim this file to its status and log, or delete it with
      approval.

## Open questions

None.

## Session log

- **2026-10-29:** Plan agreed. Branch `feature/bodybuilding-program` created from `main` at
  `f8b98e7`. Tracker written; nothing committed yet. Later the same day: gym machines confirmed,
  reps format decided (last set only). No open questions; next is the Phase 1 plan.
- **2026-10-29:** Phase 1 done on the branch, not committed. Deleted `e1rm.ts` and its test
  (approved). `lsrpeId` moved to `keys.ts`. **Start new block** now carries main-lift weights
  too. `config.ts` kept with no exports, as the documented home for future flags. Unused CSS and
  the `--fs-load` and `--fs-1rm-input` tokens removed. Committed as `dff176e`.
- **2026-10-29:** Phase 2 done and committed. Reps sit beside the weight (`weight × reps`), last
  week's numbers as placeholders, back-off pair behind `Exercise.backoff`. Weight box narrowed
  98 → 72px. Committed as `434a812`.
- **2026-10-29:** Phase 3 built and committed. New program in `program.ts` with `bb-` ids;
  conditioning, lifts, the press swap, and the week-card toggle removed; week 1's RPE override.
  Nav label `8-WEEK` → `PLAN`, header subtitle `3-Day Hypertrophy`. `CLAUDE.md` §1 and §2 wording
  updated (approved). Open: Rishav's read of the three days in the dev build. Noticed, not
  changed: the header chips don't scroll the active week into view, so W12 starts off-screen.
