/**
 * The program's real prescription data — copied verbatim from
 * design_handoff_3day_rewire. Do not edit values here; this is the athlete's
 * actual 8-week plan, three sessions a week (Mon / Wed / Fri, ≤45 min each).
 */
import type {
  ConditioningDay,
  Day,
  Lift,
  Phase,
  PhaseKey,
  Week,
} from './types'

export const LIFTS: Lift[] = [
  { key: 'squat', name: 'Back Squat', abbr: 'SQ', note: 'Fresh — strength anchor.' },
  { key: 'bench', name: 'Bench Press', abbr: 'BN', note: 'Alternate with OHP every 3rd wk.' },
  { key: 'tbdl', name: 'Trap-Bar Deadlift', abbr: 'DL', note: 'Posterior-chain anchor.' },
  { key: 'ohp', name: 'Overhead Press', abbr: 'OHP', note: 'Swap option for bench.' },
]

export const PHASES: Record<PhaseKey, Phase> = {
  base: { color: '#2DD4BF', bg: 'rgba(45,212,191,0.13)', border: 'rgba(45,212,191,0.40)' },
  peak: { color: '#FB923C', bg: 'rgba(251,146,60,0.13)', border: 'rgba(251,146,60,0.40)' },
  build: { color: '#38BDF8', bg: 'rgba(56,189,248,0.13)', border: 'rgba(56,189,248,0.40)' },
  deload: { color: '#A78BFA', bg: 'rgba(167,139,250,0.13)', border: 'rgba(167,139,250,0.40)' },
  test: { color: '#FB7185', bg: 'rgba(251,113,133,0.13)', border: 'rgba(251,113,133,0.40)' },
}

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

/** Off-day copy for This Week — the walking that backstops the thin Zone 2 base. */
export const OFF_DAYS =
  "Walk briskly, 20 min or more, most days. Friday's Zone 2 tail is a thin base on its own — the walking holds it up."

export const WEEKS: Week[] = [
  { wk: 1, phase: 'base', tag: 'BLOCK 1 · BASE', rpe: '7',
    main: { squat: { sr: '4×5', rpe: '7', pct: 0.785 }, bench: { sr: '4×6', rpe: '7', pct: 0.76 }, tbdl: { sr: '4×5', rpe: '7', pct: 0.785 }, ohp: { sr: '4×6', rpe: '7', pct: 0.72 } },
    cond: { mon: 'Sled push 6 × 20 m · Carry 3 × 30 m', wed: '6 × 1:30 hard / 1:00 easy', fri: 'Zone 2 · 15 min easy' } },
  { wk: 2, phase: 'base', tag: 'BLOCK 1 · BASE', rpe: '7–8',
    main: { squat: { sr: '4×5', rpe: '7.5', pct: 0.80 }, bench: { sr: '4×6', rpe: '7.5', pct: 0.775 }, tbdl: { sr: '4×5', rpe: '7.5', pct: 0.80 }, ohp: { sr: '4×6', rpe: '7.5', pct: 0.735 } },
    cond: { mon: 'Sled push 7 × 20 m · Carry 3 × 35 m', wed: '5 × 2:00 / 1:00', fri: 'Zone 2 · 15 min easy' } },
  { wk: 3, phase: 'peak', tag: 'BLOCK 1 · PEAK · OHP', rpe: '8',
    main: { squat: { sr: '4×5', rpe: '8', pct: 0.81 }, bench: { sr: '4×6', rpe: '8', pct: 0.785 }, tbdl: { sr: '4×5', rpe: '8', pct: 0.81 }, ohp: { sr: '4×6', rpe: '8', pct: 0.745 } },
    cond: { mon: 'Sled push 8 × 20 m · Carry 4 × 35 m', wed: '4 × 2:30 / 1:00', fri: 'Zone 2 · 15 min easy' } },
  { wk: 4, phase: 'deload', tag: 'DELOAD WEEK', rpe: '5–6',
    main: { squat: { sr: '3×5', rpe: '5', pct: 0.68 }, bench: { sr: '3×6', rpe: '5', pct: 0.66 }, tbdl: { sr: '3×5', rpe: '5', pct: 0.68 }, ohp: { sr: '3×6', rpe: '5', pct: 0.62 } },
    cond: { mon: 'Light walk only', wed: '12 min easy spin', fri: 'Zone 2 · 20 min easy' } },
  { wk: 5, phase: 'build', tag: 'BLOCK 2 · BUILD', rpe: '7–8',
    main: { squat: { sr: '4×4', rpe: '7.5', pct: 0.825 }, bench: { sr: '4×5', rpe: '7.5', pct: 0.795 }, tbdl: { sr: '4×4', rpe: '7.5', pct: 0.825 }, ohp: { sr: '4×5', rpe: '7.5', pct: 0.755 } },
    cond: { mon: 'Sled push 6 × 20 m heavier · Carry 4 × 40 m', wed: '4 × 3:00 / 1:00', fri: 'Zone 2 · 15 min easy' } },
  { wk: 6, phase: 'build', tag: 'BLOCK 2 · BUILD · OHP', rpe: '8',
    main: { squat: { sr: '4×4', rpe: '8', pct: 0.835 }, bench: { sr: '4×5', rpe: '8', pct: 0.81 }, tbdl: { sr: '4×4', rpe: '8', pct: 0.835 }, ohp: { sr: '4×5', rpe: '8', pct: 0.77 } },
    cond: { mon: 'Sled push 7 × 20 m · Carry 4 × 40 m', wed: '3 × 4:00 / 1:30', fri: 'Zone 2 · 15 min easy' } },
  { wk: 7, phase: 'peak', tag: 'BLOCK 2 · PEAK', rpe: '8–9',
    main: { squat: { sr: '4×4', rpe: '8 hold', pct: 0.835 }, bench: { sr: '4×5', rpe: '8 hold', pct: 0.81 }, tbdl: { sr: '4×4', rpe: '8 hold', pct: 0.835 }, ohp: { sr: '4×5', rpe: '8 hold', pct: 0.77 } },
    cond: { mon: 'Sled push 8 × 20 m heaviest · Carry 4 × 45 m', wed: '3 × 4:00 / 1:00', fri: 'Zone 2 · 15 min easy' } },
  { wk: 8, phase: 'test', tag: 'TEST WEEK', rpe: 'test',
    main: { squat: { sr: '3×3 / test', rpe: '6', pct: 0.72 }, bench: { sr: '3×4 / test', rpe: '6', pct: 0.72 }, tbdl: { sr: '3×3 / test', rpe: '6', pct: 0.72 }, ohp: { sr: '3×4 / test', rpe: '6', pct: 0.68 } },
    cond: { mon: 'Sled 20 m for time · max-distance carry', wed: '2 km row for time', fri: 'Zone 2 · 15 min easy' } },
]

export const DAYS: Day[] = [
  { n: 1, title: 'MONDAY — SQUAT + PULL', sub: 'Strength + Sled Push & Carry', condLabel: "Sled Push + Farmer's Carry", condKey: 'mon',
    extension: 'Extension · +10 min — only on the weeks you have 55 minutes. Base weeks (1–4): two more sled lengths and a fourth carry. Build weeks (5–8): three rounds of 250 m row + 10 kettlebell swings + 10 step-ups.',
    ex: [
      { id: 'd1e0', name: 'Back Squat', main: 'squat', sr: '4×5→4×4', rpe: '7→8', rest: '2 min', note: 'Strength anchor — do it fresh. Brace, knees out.' },
      { id: 'd1e1', name: 'A1 · Chest-Supported Row', sr: '3×10', rpe: '8', rest: '—', load: 'RPE-based', note: 'Squeeze blades, control down.' },
      { id: 'd1e2', name: 'A2 · Standing DB Overhead Press', sr: '3×8', rpe: '8', rest: '60s', load: 'RPE-based', note: 'Glutes tight, press up and back.' },
      { id: 'd1e3', name: 'A3 · Hanging Leg Raise', sr: '3×12', rpe: '7', rest: '—', load: 'bodyweight', note: "Fills the A rest. Roll hips up, don't swing." },
    ] },
  { n: 2, title: 'WEDNESDAY — PRESS + INTERVALS', sub: 'Push / Pull + Hard Intervals', condLabel: 'Bike / Row Intervals', condKey: 'wed',
    ex: [
      { id: 'd2e0', name: 'Bench Press', main: 'bench', sr: '4×6→4×5', rpe: '7→8', rest: '2 min', note: 'Strength anchor. OHP takes this slot in weeks 3 and 6.' },
      { id: 'd2e1', name: 'A1 · Weighted Pull-up / Pulldown', sr: '3×8', rpe: '8', rest: '—', load: 'RPE-based', note: 'Full hang to chest, elbows down and in.' },
      { id: 'd2e2', name: 'A2 · Romanian Deadlift', sr: '3×8', rpe: '7', rest: '75s', load: 'RPE-based', note: 'Hinge, soft knees, hamstring stretch.' },
      { id: 'd2e3', name: 'B1 · DB Lateral Raise', sr: '3×15', rpe: '8', rest: '—', load: 'RPE-based', note: 'Side delts. Raise out, not up.' },
      { id: 'd2e4', name: 'B2 · EZ-Bar Curl', sr: '2×12', rpe: '8', rest: '45s', load: 'RPE-based', note: 'Your only direct arm work. Squeeze the top.' },
    ] },
  { n: 3, title: 'FRIDAY — HINGE + ZONE 2', sub: 'Strength + easy aerobic tail', condLabel: 'Zone 2 Tail', condKey: 'fri',
    ex: [
      { id: 'd3e0', name: 'Trap-Bar Deadlift', main: 'tbdl', sr: '4×5→4×4', rpe: '7→8', rest: '2 min', note: 'Posterior-chain anchor. Chest tall, push the floor away.' },
      { id: 'd3e1', name: 'A1 · Bulgarian Split Squat', sr: '3×8/leg', rpe: '7', rest: '—', load: 'RPE-based', note: 'Drop straight down, drive the front heel.' },
      { id: 'd3e2', name: 'A2 · Incline DB Press', sr: '3×10', rpe: '8', rest: '75s', load: 'RPE-based', note: 'Stretch at the bottom, squeeze the upper chest.' },
      { id: 'd3e3', name: 'Standing Calf Raise', sr: '2×15', rpe: '8', rest: '—', load: 'RPE-based', note: 'During cooldown. Full stretch, one-second squeeze.' },
    ] },
]

export const NOTES: string[] = [
  "Loads auto-update from your 1RM and the week's %1RM. Update a 1RM and the whole plan recalculates.",
  "Strength: when the top set feels easier than the listed RPE, bump that lift's 1RM by 5 lb (lower) / 2.5 lb (upper).",
  'Cut volume, never intensity. Lightening the bar to make a session easier is what causes detraining.',
  'Conditioning: progress ONE dial at a time — more rounds OR longer work OR heavier sled.',
  'Weeks 4 and 8 are mandatory. Week 8 is a test week — log the numbers.',
  "Miss a day? Skip it, don't stack two sessions. Carry the missed anchor into next week.",
  'After Week 8: nudge starting 1RMs up 2.5–5% and repeat the block.',
]
