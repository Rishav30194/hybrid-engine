/**
 * The program's real prescription data — copied verbatim from
 * design_handoff_hybrid_engine/Hybrid Engine.dc.html. Do not edit values here;
 * this is the athlete's actual 8-week plan.
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
  { key: 'd1', label: 'Day 1 — Sled Push + Carry', short: 'Sled+Carry' },
  { key: 'd2', label: 'Day 2 — Intervals', short: 'Intervals' },
  { key: 'd3', label: 'Day 3 — Zone 2', short: 'Zone 2' },
  { key: 'd4', label: 'Day 4 — Sled Drag', short: 'Sled Drag' },
  { key: 'd5', label: 'Day 5 — Finisher', short: 'Finisher' },
]

export const CONDINFO: Record<string, string> = {
  d1: "Sled push: hard but unbroken ~20 m lengths, walk back = rest (45–60s). Long aggressive steps, drive through the balls of your feet. Then heavy farmer's carries — grip, core & traps in one.",
  d2: 'Work : rest intervals. "Hard" = RPE 7–8 (breathing heavily, not an all-out sprint). Keep pedalling / pulling easy through the rest — don\'t fully stop.',
  d3: 'This easy Zone 2 block IS your conditioning. Conversational / nose-breathing pace — it should feel too easy. Chasing intensity here wrecks recovery for Days 4–5.',
  d4: 'Alternate backward drag (faces forward, torches quads, knee-friendly) and forward rope drag (row it in, hits the back). Walk back = rest.',
  d5: 'Pick ONE, controlled — not a wipe-out:  A) 3 rounds — 250 m row + 10 KB swings + 10 step-ups.  B) 10-min EMOM — odd min 12-cal bike, even min 10 goblet squats.  C) 3 rounds — sled push 2×20 m + 200 m row.',
}

export const WEEKS: Week[] = [
  { wk: 1, phase: 'base', tag: 'BLOCK 1 · BASE', rpe: '7',
    main: { squat: { sr: '4×5', rpe: '7', pct: 0.785 }, bench: { sr: '4×6', rpe: '7', pct: 0.76 }, tbdl: { sr: '4×5', rpe: '7', pct: 0.785 }, ohp: { sr: '4×6', rpe: '7', pct: 0.72 } },
    cond: { d1: "Sled push 6 × 20m · Farmer's carry 3 × 30m", d2: '6 rounds · 20s hard / 70s easy (~9 min)', d3: 'Zone 2: 12 min easy + light circuit', d4: 'Sled drag 6 × 20m', d5: 'Optional / short — finisher not in yet' } },
  { wk: 2, phase: 'base', tag: 'BLOCK 1 · BASE', rpe: '7–8',
    main: { squat: { sr: '4×5', rpe: '7.5', pct: 0.80 }, bench: { sr: '4×6', rpe: '7.5', pct: 0.775 }, tbdl: { sr: '4×5', rpe: '7.5', pct: 0.80 }, ohp: { sr: '4×6', rpe: '7.5', pct: 0.735 } },
    cond: { d1: "Sled push 7 × 20m · Farmer's carry 3 × 35m", d2: '7 rounds · 20s hard / 70s easy', d3: 'Zone 2: 13 min easy', d4: 'Sled drag 7 × 20m', d5: 'Optional / short finisher' } },
  { wk: 3, phase: 'peak', tag: 'BLOCK 1 · PEAK', rpe: '8',
    main: { squat: { sr: '4×5', rpe: '8', pct: 0.81 }, bench: { sr: '4×6', rpe: '8', pct: 0.785 }, tbdl: { sr: '4×5', rpe: '8', pct: 0.81 }, ohp: { sr: '4×6', rpe: '8', pct: 0.745 } },
    cond: { d1: "Sled push 8 × 20m · Farmer's carry 4 × 35m", d2: '8 rounds · 20s hard / 70s easy', d3: 'Zone 2: 15 min easy', d4: 'Sled drag 8 × 20m', d5: 'Finisher folds in · 3 rounds' } },
  { wk: 4, phase: 'deload', tag: 'DELOAD WEEK', rpe: '5–6',
    main: { squat: { sr: '3×5', rpe: '5', pct: 0.68 }, bench: { sr: '3×6', rpe: '5', pct: 0.66 }, tbdl: { sr: '3×5', rpe: '5', pct: 0.68 }, ohp: { sr: '3×6', rpe: '5', pct: 0.62 } },
    cond: { d1: 'Light walk only', d2: 'Drop intervals', d3: 'Zone 2 only: 15–20 min easy', d4: 'Drop sled', d5: 'Skip finisher' } },
  { wk: 5, phase: 'build', tag: 'BLOCK 2 · BUILD', rpe: '7–8',
    main: { squat: { sr: '4×4', rpe: '7.5', pct: 0.825 }, bench: { sr: '4×5', rpe: '7.5', pct: 0.795 }, tbdl: { sr: '4×4', rpe: '7.5', pct: 0.825 }, ohp: { sr: '4×5', rpe: '7.5', pct: 0.755 } },
    cond: { d1: 'Sled push 6 heavier · Carry 4 × 40m', d2: '6 rounds · 30s hard / 60s easy', d3: 'Zone 2: 15 min easy', d4: 'Sled drag 6 × 20m', d5: 'Finisher: 10-min EMOM' } },
  { wk: 6, phase: 'build', tag: 'BLOCK 2 · BUILD', rpe: '8',
    main: { squat: { sr: '4×4', rpe: '8', pct: 0.835 }, bench: { sr: '4×5', rpe: '8', pct: 0.81 }, tbdl: { sr: '4×4', rpe: '8', pct: 0.835 }, ohp: { sr: '4×5', rpe: '8', pct: 0.77 } },
    cond: { d1: 'Sled push 7 · Carry 4 × 40m', d2: '8 rounds · 30s hard / 60s easy', d3: 'Zone 2: 15–18 min easy', d4: 'Sled drag 7 × 20m', d5: 'Finisher' } },
  { wk: 7, phase: 'peak', tag: 'BLOCK 2 · PEAK', rpe: '8–9',
    main: { squat: { sr: '4×4', rpe: '8 hold', pct: 0.835 }, bench: { sr: '4×5', rpe: '8 hold', pct: 0.81 }, tbdl: { sr: '4×4', rpe: '8 hold', pct: 0.835 }, ohp: { sr: '4×5', rpe: '8 hold', pct: 0.77 } },
    cond: { d1: 'Sled push 8 heaviest · Carry 4 × 45m', d2: '6 rounds · 30s hard / 45s easy', d3: 'Zone 2: 15 min easy', d4: 'Sled drag 8 × 20m heaviest', d5: 'Finisher — hard' } },
  { wk: 8, phase: 'test', tag: 'TEST WEEK', rpe: 'test',
    main: { squat: { sr: '3×3 / test', rpe: '6', pct: 0.72 }, bench: { sr: '3×4 / test', rpe: '6', pct: 0.72 }, tbdl: { sr: '3×3 / test', rpe: '6', pct: 0.72 }, ohp: { sr: '3×4 / test', rpe: '6', pct: 0.68 } },
    cond: { d1: 'Test: sled 20m for time', d2: 'Test: 2 km row', d3: 'Zone 2: easy', d4: 'Test: max-distance carry', d5: 'Test: max push-ups' } },
]

export const DAYS: Day[] = [
  { n: 1, title: 'DAY 1 — LOWER', sub: 'Strength + Sled Push & Carry', condLabel: "Sled Push + Farmer's Carry", condKey: 'd1',
    ex: [
      { id: 'd1e0', name: 'Back Squat', main: 'squat', sr: '4×5→4×4', rpe: '7→8', rest: '2–3 min', note: 'Strength anchor — do it fresh. Brace, knees out.' },
      { id: 'd1e1', name: 'A1 · Romanian Deadlift', sr: '3×8', rpe: '7', rest: '—', load: 'RPE-based', note: 'Tri-set A1–A3. Hinge, soft knees, hamstring stretch.' },
      { id: 'd1e2', name: 'A2 · DB Walking Lunge', sr: '3×10/leg', rpe: '7', rest: '—', load: 'RPE-based', note: 'Long stride, tall torso, push the front heel.' },
      { id: 'd1e3', name: 'A3 · Standing Calf Raise', sr: '3×12', rpe: '8', rest: '75–90s', load: 'RPE-based', note: 'Full stretch, 1-sec squeeze top. Calves 2×/wk.' },
    ] },
  { n: 2, title: 'DAY 2 — UPPER', sub: 'Push / Pull + Intervals', condLabel: 'Bike / Row Intervals', condKey: 'd2',
    ex: [
      { id: 'd2e0', name: 'Barbell Bench Press', main: 'bench', sr: '4×6→4×5', rpe: '7→8', rest: '2 min', note: 'Strength anchor. Swap to OHP every 3rd week.' },
      { id: 'd2e1', name: 'A1 · Weighted Pull-up / Pulldown', sr: '3×8', rpe: '8', rest: '—', load: 'RPE-based', note: 'Full hang to chest, elbows down & in.' },
      { id: 'd2e2', name: 'A2 · Standing DB Overhead Press', sr: '3×10', rpe: '7', rest: '75s', load: 'RPE-based', note: 'Superset A. Glutes tight, press up & back.' },
      { id: 'd2e3', name: 'B1 · Chest-Supported Row', sr: '3×12', rpe: '7', rest: '—', load: 'RPE-based', note: 'Tri-set B1–B3. Squeeze blades, control down.' },
      { id: 'd2e4', name: 'B2 · Push-up', sr: '3×AMRAP-2', rpe: '8', rest: '—', load: 'bodyweight', note: 'Stop 2 reps short of failure.' },
      { id: 'd2e5', name: 'B3 · Cable / DB Lateral Raise', sr: '3×15', rpe: '8', rest: '60s', load: 'RPE-based', note: 'Side delts. Raise out, not up.' },
    ] },
  { n: 3, title: 'DAY 3 — ENGINE', sub: 'Zone 2 + Circuit · deliberately EASY', condLabel: 'Built into Zone 2', condKey: 'd3',
    ex: [
      { id: 'd3e0', name: 'Zone 2: Row / Bike / Incline Walk', sr: '12–15 min', rpe: '4–5', rest: '—', load: 'easy pace', note: 'Conversational / nose-breathing. The engine base.' },
      { id: 'd3e1', name: 'Goblet Squat', sr: '3×15', rpe: '6', rest: '—', load: 'light', note: 'Circuit: 3 rounds, 60s rest between rounds.' },
      { id: 'd3e2', name: 'Push-up', sr: '3×12', rpe: '6', rest: '—', load: 'bodyweight', note: 'Crisp full reps.' },
      { id: 'd3e3', name: 'DB / Ring Row', sr: '3×15', rpe: '6', rest: '—', load: 'light', note: 'Squeeze the back, no jerk.' },
      { id: 'd3e4', name: 'Kettlebell Swing', sr: '3×20', rpe: '6', rest: '—', load: 'moderate', note: 'Hip snap, glutes drive it.' },
      { id: 'd3e5', name: 'Plank', sr: '3×40s', rpe: '—', rest: '60s', load: 'bodyweight', note: 'Ribs down, glutes tight, breathe.' },
    ] },
  { n: 4, title: 'DAY 4 — LOWER', sub: 'Strength + Sled Drag', condLabel: 'Sled Drag', condKey: 'd4',
    ex: [
      { id: 'd4e0', name: 'Trap-Bar Deadlift', main: 'tbdl', sr: '4×5→4×4', rpe: '7→8', rest: '2–3 min', note: 'Posterior-chain anchor. Chest tall, push floor away.' },
      { id: 'd4e1', name: 'A1 · Bulgarian Split Squat', sr: '3×8/leg', rpe: '7', rest: '—', load: 'RPE-based', note: 'Tri-set A1–A3. Drop straight down, drive front heel.' },
      { id: 'd4e2', name: 'A2 · Seated / Lying Leg Curl', sr: '3×12', rpe: '8', rest: '—', load: 'RPE-based', note: 'Squeeze hams, slow return.' },
      { id: 'd4e3', name: 'A3 · Hanging Leg Raise', sr: '3×12', rpe: '7', rest: '75s', load: 'bodyweight', note: "Direct core. Roll hips up, don't swing." },
    ] },
  { n: 5, title: 'DAY 5 — UPPER PUMP', sub: 'Pump + Mixed-Modal Finisher', condLabel: 'Mixed-Modal Finisher', condKey: 'd5',
    ex: [
      { id: 'd5e0', name: 'A1 · Incline DB Press', sr: '3×12', rpe: '8', rest: '—', load: 'RPE-based', note: 'Stretch at bottom, squeeze upper chest.' },
      { id: 'd5e1', name: 'A2 · Cable / Chest-Supported Row', sr: '3×12', rpe: '8', rest: '60–75s', load: 'RPE-based', note: 'Superset A. Pull to lower ribs.' },
      { id: 'd5e2', name: 'B1 · DB Lateral Raise', sr: '3×15', rpe: '8', rest: '—', load: 'RPE-based', note: 'Tri-set B1–B3. Lead with elbows, out not up.' },
      { id: 'd5e3', name: 'B2 · Lat Pulldown / Pull-up', sr: '3×12', rpe: '8', rest: '—', load: 'RPE-based', note: 'Elbows to back pockets.' },
      { id: 'd5e4', name: 'B3 · Face Pull', sr: '3×15', rpe: '8', rest: '60s', load: 'RPE-based', note: 'Rear delts + external rotators.' },
      { id: 'd5e5', name: 'C1 · EZ-Bar Curl', sr: '3×12–15', rpe: '8', rest: '—', load: 'RPE-based', note: 'Tri-set C1–C3. Squeeze top.' },
      { id: 'd5e6', name: 'C2 · Triceps Rope Pressdown', sr: '3×15', rpe: '8', rest: '—', load: 'RPE-based', note: 'Elbows pinned, full lockout.' },
      { id: 'd5e7', name: 'C3 · Seated Calf Raise', sr: '3×15', rpe: '8', rest: '45s', load: 'RPE-based', note: 'Slow, full range, pause.' },
    ] },
]

export const NOTES: string[] = [
  "Loads auto-update from your 1RM and the week's %1RM. Update a 1RM and the whole plan recalculates.",
  'Strength: when the top set feels easier than the listed RPE, bump that lift\'s 1RM by 5 lb (lower) / 2.5–5 lb (upper).',
  'Conditioning: progress ONE dial at a time — more rounds OR longer work OR heavier sled. Only if last week was repeatable.',
  'Sled load = you can keep moving the whole length unbroken. Stall mid-length → too heavy, strip a plate.',
  'Weeks 4 & 8 are deloads — mandatory. Week 8 can be a test week (log the numbers).',
  'Accessory / superset work is RPE-based by design: pick a load that hits the listed RPE for the reps.',
  'After Week 8: nudge starting 1RMs up ~2.5–5% and repeat the 8-week block.',
]
