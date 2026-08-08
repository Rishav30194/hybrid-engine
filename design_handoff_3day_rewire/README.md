# Handoff: Hybrid Engine — 3-day rewire

## Overview

The app currently runs a fixed 8-week, **5-day** hybrid program. The athlete can only train
**3 days a week, ≤45 minutes a session**. This handoff rewires the program content to three
days (Mon / Wed / Fri) while keeping the app's architecture, engine, screens and UI intact.

**Nothing structural changes.** The recalculation engine, the three tabs, the rest timer, the
check-off state, persistence and Supabase sync all keep working as-is. This is a data rewrite
in `src/data/program.ts`, a two-line type change, and one copy change in the header.

## About the design files

`Hybrid Engine — 3-Day App.dc.html` in this bundle is a **design reference created in HTML** —
a working prototype of the rewired app (all three tabs, the rest timer, the mobile shell). It is
not production code to copy. The target codebase already exists (React + Vite + TypeScript at
`Rishav30194/hybrid-engine`), so implement the change there, in its established patterns.

`3-Day Rewire Plan.dc.html` is the reasoning document: what the athlete loses at 3 days, the
evidence behind the structure, and the volume comparison. Reference only — nothing to build.

## Fidelity

**High fidelity.** The prototype reuses the app's own tokens (`src/styles/tokens.css`) verbatim —
`#ff7a1a` accent, `#0c0d0f` ground, Oswald headings over Barlow body, the same radii and phase
colors. No new visual design is being introduced. If the recreated screens differ visually from
the current app, the current app wins.

---

## The program

Three sessions, each anchored by one main lift and closed with one kind of conditioning.

| Day | Anchor | Conditioning | Budget |
| --- | --- | --- | --- |
| Monday | Back Squat | Sled push + farmer's carry | 43 min (55 with the optional extension) |
| Wednesday | Bench Press (OHP in weeks 3 & 6) | Bike/row intervals | 45 min |
| Friday | Trap-Bar Deadlift | Zone 2 tail, 15 min, every week | 44 min |

Weekly volume goes from ~85 hard sets to ~38 (45%). That sits above the one-third maintenance
threshold and above the growth floor for every major muscle group except arms and calves, which
move to maintenance. Zone 2 drops from ~40 structured min/week to 15, backstopped by daily brisk
walking on off days.

The 8-week periodisation, the %1RM ladder and every percentage value are **unchanged from the
current program** — that is deliberate, so the engine and the athlete's 1RMs carry over.

---

## Code changes

### 1. `src/data/types.ts` — one line

```ts
// before
export type CondKey = 'd1' | 'd2' | 'd3' | 'd4' | 'd5'
// after
export type CondKey = 'mon' | 'wed' | 'fri'
```

Everything else in the file is unchanged. `Day`, `Exercise`, `Week`, `MainPrescription`, `Lift`,
`Phase` and `ConditioningDay` all keep their current shape.

### 2. `src/data/program.ts` — full replacement of `COND`, `CONDINFO`, the `cond` block of every
week in `WEEKS`, `DAYS`, and `NOTES`. `LIFTS` and `PHASES` are unchanged; the `main` block of every
week (the %1RM ladder) is unchanged.

```ts
export const COND: ConditioningDay[] = [
  { key: 'mon', label: 'MON — Sled Push + Carry', short: 'Sled' },
  { key: 'wed', label: 'WED — Bike / Row Intervals', short: 'Intervals' },
  { key: 'fri', label: 'FRI — Zone 2 Tail', short: 'Zone 2' },
]

export const CONDINFO: Record<string, string> = {
  mon: "Sled push: hard but unbroken ~20 m lengths, walk back = rest. Long aggressive steps, drive through the balls of your feet. Then heavy farmer's carries — grip, core and traps in one.",
  wed: 'Hard = RPE 8–9: breathing heavily, not an all-out sprint. Keep pedalling / pulling easy through the rest — don\'t fully stop. Pick an output you can repeat on the last round.',
  fri: 'Conversational, nose-breathing — it should feel too easy. This is the whole aerobic base now, so it does not get cut when the session runs long.',
}
```

Per-week `cond` values (drop the existing `d1`–`d5` objects, use these):

| Week | mon | wed | fri |
| --- | --- | --- | --- |
| 1 | Sled push 6 × 20 m · Carry 3 × 30 m | 6 × 1:30 hard / 1:00 easy | Zone 2 · 15 min easy |
| 2 | Sled push 7 × 20 m · Carry 3 × 35 m | 5 × 2:00 / 1:00 | Zone 2 · 15 min easy |
| 3 | Sled push 8 × 20 m · Carry 4 × 35 m | 4 × 2:30 / 1:00 | Zone 2 · 15 min easy |
| 4 | Light walk only | 12 min easy spin | Zone 2 · 20 min easy |
| 5 | Sled push 6 × 20 m heavier · Carry 4 × 40 m | 4 × 3:00 / 1:00 | Zone 2 · 15 min easy |
| 6 | Sled push 7 × 20 m · Carry 4 × 40 m | 3 × 4:00 / 1:30 | Zone 2 · 15 min easy |
| 7 | Sled push 8 × 20 m heaviest · Carry 4 × 45 m | 3 × 4:00 / 1:00 | Zone 2 · 15 min easy |
| 8 | Sled 20 m for time · max-distance carry | 2 km row for time | Zone 2 · 15 min easy |

Also update the `tag` on weeks 3 and 6 to flag the press swap:
`wk 3 → 'BLOCK 1 · PEAK · OHP'`, `wk 6 → 'BLOCK 2 · BUILD · OHP'`.

New `DAYS` (three entries, replacing five):

```ts
export const DAYS: Day[] = [
  { n: 1, title: 'MONDAY — SQUAT + PULL', sub: 'Strength + Sled Push & Carry',
    condLabel: "Sled Push + Farmer's Carry", condKey: 'mon', ex: [
      { id: 'd1e0', name: 'Back Squat', main: 'squat', sr: '4×5→4×4', rpe: '7→8', rest: '2 min', note: 'Strength anchor — do it fresh. Brace, knees out.' },
      { id: 'd1e1', name: 'A1 · Chest-Supported Row', sr: '3×10', rpe: '8', rest: '—', load: 'RPE-based', note: 'Squeeze blades, control down.' },
      { id: 'd1e2', name: 'A2 · Standing DB Overhead Press', sr: '3×8', rpe: '8', rest: '60s', load: 'RPE-based', note: 'Glutes tight, press up and back.' },
      { id: 'd1e3', name: 'A3 · Hanging Leg Raise', sr: '3×12', rpe: '7', rest: '—', load: 'bodyweight', note: "Fills the A rest. Roll hips up, don't swing." },
    ] },
  { n: 2, title: 'WEDNESDAY — PRESS + INTERVALS', sub: 'Push / Pull + Hard Intervals',
    condLabel: 'Bike / Row Intervals', condKey: 'wed', ex: [
      { id: 'd2e0', name: 'Bench Press', main: 'bench', sr: '4×6→4×5', rpe: '7→8', rest: '2 min', note: 'Strength anchor. OHP takes this slot in weeks 3 and 6.' },
      { id: 'd2e1', name: 'A1 · Weighted Pull-up / Pulldown', sr: '3×8', rpe: '8', rest: '—', load: 'RPE-based', note: 'Full hang to chest, elbows down and in.' },
      { id: 'd2e2', name: 'A2 · Romanian Deadlift', sr: '3×8', rpe: '7', rest: '75s', load: 'RPE-based', note: 'Hinge, soft knees, hamstring stretch.' },
      { id: 'd2e3', name: 'B1 · DB Lateral Raise', sr: '3×15', rpe: '8', rest: '—', load: 'RPE-based', note: 'Side delts. Raise out, not up.' },
      { id: 'd2e4', name: 'B2 · EZ-Bar Curl', sr: '2×12', rpe: '8', rest: '45s', load: 'RPE-based', note: 'Your only direct arm work. Squeeze the top.' },
    ] },
  { n: 3, title: 'FRIDAY — HINGE + ZONE 2', sub: 'Strength + easy aerobic tail',
    condLabel: 'Zone 2 Tail', condKey: 'fri', ex: [
      { id: 'd3e0', name: 'Trap-Bar Deadlift', main: 'tbdl', sr: '4×5→4×4', rpe: '7→8', rest: '2 min', note: 'Posterior-chain anchor. Chest tall, push the floor away.' },
      { id: 'd3e1', name: 'A1 · Bulgarian Split Squat', sr: '3×8/leg', rpe: '7', rest: '—', load: 'RPE-based', note: 'Drop straight down, drive the front heel.' },
      { id: 'd3e2', name: 'A2 · Incline DB Press', sr: '3×10', rpe: '8', rest: '75s', load: 'RPE-based', note: 'Stretch at the bottom, squeeze the upper chest.' },
      { id: 'd3e3', name: 'Standing Calf Raise', sr: '2×15', rpe: '8', rest: '—', load: 'RPE-based', note: 'During cooldown. Full stretch, one-second squeeze.' },
    ] },
]
```

New `NOTES`:

```ts
export const NOTES: string[] = [
  "Loads auto-update from your 1RM and the week's %1RM. Update a 1RM and the whole plan recalculates.",
  "Strength: when the top set feels easier than the listed RPE, bump that lift's 1RM by 5 lb (lower) / 2.5 lb (upper).",
  'Cut volume, never intensity. Lightening the bar to make a session easier is what causes detraining.',
  'Conditioning: progress ONE dial at a time — more rounds OR longer work OR heavier sled.',
  'Weeks 4 and 8 are mandatory. Week 8 is a test week — log the numbers.',
  "Miss a day? Skip it, don't stack two sessions. Carry the missed anchor into next week.",
  'After Week 8: nudge starting 1RMs up 2.5–5% and repeat the block.',
]
```

### 3. `src/components/Header.tsx` — one string

```tsx
<div className="header__subtitle">3-Day Strength · Endurance</div>
```

### 4. Optional — the Monday extension block

Monday is the only session that can stretch to 55 minutes. In the prototype this is a dashed
callout under the Monday day card:

> **Extension · +10 min** — only on the weeks you have 55 minutes. Base weeks (1–4): two more
> sled lengths and a fourth carry. Build weeks (5–8): three rounds of 250 m row + 10 kettlebell
> swings + 10 step-ups.

Cheapest implementation: add an optional `extension?: string` to `Day` and render it in
`Template.tsx`'s `DayAccordion` body under `ConditioningBlock`, styled like `.ex-cond` with
`border-style: dashed` and muted text. Skip it if you'd rather not touch the type.

### 5. Off-day walking note

On **This Week**, below the conditioning rows, the prototype shows a dashed card:

> **OFF DAYS** — Walk briskly, 20 min or more, most days. Friday's Zone 2 tail is a thin base on
> its own — the walking holds it up.

Static copy, no state. Same dashed-border treatment as `.ex-cond`.

---

## What does NOT change

- `src/engine/loads.ts`, `keys.ts`, `progress.ts` — the engine is data-driven and needs no edits.
  `dayProgress` already computes `day.ex.length + 1`, so 3 days works untouched.
- `src/screens/ThisWeek.tsx`, `WeekPlan.tsx`, `Template.tsx` — they map over `DAYS`, `COND` and
  `WEEKS`, so they render 3 days automatically.
- `src/state/*`, `src/sync/*`, `src/auth/*` — untouched.
- All CSS files — untouched.
- The `main` percentages in `WEEKS` — untouched. The athlete's existing 1RMs carry over.

## Migration note

Done-state keys embed the conditioning key (`condDoneKey`, `tmplCondDoneKey`), so old `d1`–`d5`
entries in localStorage become orphans. They're harmless — nothing reads them — but a one-time
cleanup that drops any persisted `done` key containing `:d1`…`:d5` would keep storage tidy.
Do **not** clear the whole `done` map; the athlete's main-lift check-offs share it.

## Design tokens

All from `src/styles/tokens.css`, unchanged:

- Accent `#ff7a1a` on `--on-accent` `#0c0d0f`
- Ground `#0c0d0f`; surfaces `#101216` / `#121419` / `#15171b` / `#16181c`; input well `#0e1014`
- Text `#f2f3f5` / `#c7ccd2` / `#9aa0a8` / `#8a9097` / `#6c727a`
- Borders `rgba(255,255,255,0.06 / 0.08 / 0.12 / 0.16)`
- Phase colors — base `#2DD4BF`, peak `#FB923C`, build `#38BDF8`, deload `#A78BFA`, test `#FB7185`
- Radii 10 / 14 / 16 / 999px · Fonts Oswald (headings) over Barlow (body)

## Files in this bundle

- `Hybrid Engine — 3-Day App.dc.html` — the working prototype: three tabs, week chips, 1RM editor,
  main-lift rows with live loads, conditioning rows, 8-week cards, day accordions with accessory
  logging, and the floating rest timer with presets, pause/resume, +15s, vibrate and chime.
- `3-Day Rewire Plan.dc.html` — the rationale: losses, evidence, volume comparison, session budgets.
- `Hybrid Engine — 3-Day Program.dc.html` — an editable plan sheet where every number (1RM, %1RM,
  sets, reps, load, rest, conditioning) is a live input. Useful for tuning the numbers before
  committing them to `program.ts`.

## Verification

After the change: `npm test` (the Vitest suite covers loads, progress, reducer and persistence —
none of it is day-count dependent), then `npm run build`. In the app, check that Template shows
three day cards with `0/5`, `0/6`, `0/5` progress counts, that 8-Week shows three conditioning
rows per expanded card, and that This Week lists three conditioning rows.
