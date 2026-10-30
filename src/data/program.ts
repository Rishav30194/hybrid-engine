/**
 * The program's real prescription data — this file is the source of truth.
 * Do not edit values casually; this is the athlete's actual 12-week hypertrophy
 * block, three sessions a week (Mon / Wed / Fri, ~55 min each). The reasoning
 * behind the shape (time budgets, exercise choices, volume) is in
 * docs/PROGRAM_SOURCE.md.
 */
import type { Day, Phase, PhaseKey, Week } from './types'

export const PHASES: Record<PhaseKey, Phase> = {
  easy: { color: '#A78BFA', bg: 'rgba(167,139,250,0.13)', border: 'rgba(167,139,250,0.40)' },
  build: { color: '#38BDF8', bg: 'rgba(56,189,248,0.13)', border: 'rgba(56,189,248,0.40)' },
}

/** Off-day copy for This Week. */
export const OFF_DAYS = 'Walk briskly, 20 min or more, most days.'

const fullEffort = (wk: number): Week => ({ wk, phase: 'build', tag: 'FULL EFFORT', rpe: '8–10' })

/** Typed non-empty so `WEEKS[0]` is a `Week`, which makes `weekAt` total. */
export const WEEKS: [Week, ...Week[]] = [
  { wk: 1, phase: 'easy', tag: 'EASY WEEK', rpe: '~8', rpeOverride: '~8' },
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(fullEffort),
]

const WARM_UP = 'Warm up: 5 min easy climber, arm and leg swings'

export const DAYS: Day[] = [
  { n: 1, title: 'MONDAY — LOWER', sub: WARM_UP,
    ex: [
      { id: 'bb-mon-squat', name: 'Back Squat', sr: '1×5–6 top, 2×8–10 back-off', rpe: '8', rest: '2–3 min', backoff: true, note: 'Brace, knees out. Back-off sets run 10–15% lighter than the top set.' },
      { id: 'bb-mon-legpress', name: 'Leg Press', sr: '3×10–12', rpe: '9', rest: '2 min', note: 'Feet mid-platform. Lower until your hips start to tuck, no bouncing.' },
      { id: 'bb-mon-legcurl', name: 'Seated Leg Curl', sr: '3×10–12', rpe: '9–10', rest: '90s', note: 'Lean forward for a deeper hamstring stretch, control the way back.' },
      { id: 'bb-mon-fly', name: 'B1 · Cable Fly', sr: '2×12–15', rpe: '10', rest: '60s', note: 'Soft elbows, big stretch when open, squeeze the chest together.' },
      { id: 'bb-mon-crunch', name: 'B2 · Cable Crunch', sr: '2×12–15', rpe: '10', rest: '60s', note: 'Round your back as you crunch, hips stay still.' },
      { id: 'bb-mon-calf', name: 'Standing Calf Raise', sr: '3×10–12', rpe: '10', rest: '90s', note: 'Pause a full second in the bottom stretch, then all the way up. No bouncing.' },
    ] },
  { n: 2, title: 'WEDNESDAY — UPPER', sub: WARM_UP,
    ex: [
      { id: 'bb-wed-dbpress', name: 'Flat DB Press', sr: '1×6–8 top, 2×8–10 back-off', rpe: '8–9', rest: '2–3 min', backoff: true, note: 'Sit with the dumbbells on your knees, kick them up as you lie back. Sink them low for the stretch.' },
      { id: 'bb-wed-ohp', name: 'A1 · Seated DB Shoulder Press', sr: '2×8–10', rpe: '9', rest: '60s', note: 'Bring the dumbbells all the way down, torso upright.' },
      { id: 'bb-wed-row', name: 'A2 · Chest-Supported DB Row', sr: '3×10–12', rpe: '9–10', rest: '60s', note: 'Chest on the incline bench. Drive the elbows back, let the shoulders reach forward at the bottom.' },
      { id: 'bb-wed-pullup', name: 'Weighted Pull-up', sr: '3×6–10', rpe: '9–10', rest: '2 min', note: 'Full hang to chest up. Add weight once you clear 10 reps.' },
      { id: 'bb-wed-lateral', name: 'B1 · Cable Lateral Raise', sr: '3×12–15', rpe: '10', rest: '60s', note: 'Raise out, not up. Control the lowering.' },
      { id: 'bb-wed-triceps', name: 'B2 · Overhead Cable Triceps Extension', sr: '3×10–12', rpe: '10', rest: '60s', note: 'Elbows in, full stretch behind the head.' },
      { id: 'bb-wed-curl', name: 'EZ-Bar Curl', sr: '2×10–12', rpe: '10', rest: '90s', note: 'Last set is a drop set: cut the weight by about half and keep going. Squeeze the top.' },
    ] },
  { n: 3, title: 'FRIDAY — FULL BODY', sub: WARM_UP,
    ex: [
      { id: 'bb-fri-deadlift', name: 'Conventional Deadlift', sr: '1×4–6 top, 2×6–8 back-off', rpe: '8', rest: '2–3 min', backoff: true, note: 'Bar over mid-foot, push the floor away. Back-off reps stay at 6–8 because grip and lower back give out first.' },
      { id: 'bb-fri-incline', name: 'A1 · Incline DB Press', sr: '3×8–10', rpe: '9', rest: '60s', note: 'Low incline. Sink the dumbbells as low as you comfortably can.' },
      { id: 'bb-fri-bss', name: 'A2 · Bulgarian Split Squat', sr: '2×8–10/leg', rpe: '8', rest: '60s', note: 'Drop straight down, drive through the front heel.' },
      { id: 'bb-fri-pulldown', name: 'B1 · Lat Pulldown', sr: '3×10–12', rpe: '9–10', rest: '60s', note: 'Full stretch at the top, elbows down and in.' },
      { id: 'bb-fri-lateral', name: 'B2 · DB Lateral Raise', sr: '2×12–15', rpe: '10', rest: '60s', note: 'Raise out, not up. The last rep should be a real struggle.' },
      { id: 'bb-fri-curl', name: 'C1 · Bayesian Cable Curl', sr: '2×12–15', rpe: '10', rest: '60s', note: 'Face away from the cable with the arm behind you for the stretch.' },
      { id: 'bb-fri-pressdown', name: 'C2 · Triceps Pressdown', sr: '2×12–15', rpe: '10', rest: '60s', note: 'Elbows pinned to your sides, full lockout.' },
      { id: 'bb-fri-legcurl', name: 'Seated Leg Curl', sr: '2×10–12', rpe: '9–10', rest: '90s', note: 'Same machine as Monday. Lean forward for the stretch.' },
    ] },
]

/**
 * The prescription for a 1-based week. `clampWeek` should already keep `week`
 * in 1..WEEKS.length, so the fallback is a second line of defence, not the
 * normal path — a corrupt value shows week 1 instead of white-screening the app
 * mid-session.
 */
export const weekAt = (week: number): Week => WEEKS[week - 1] ?? WEEKS[0]

/** The block's last week — the one that offers Start new block. */
export const LAST_WEEK = WEEKS.length

export const NOTES: string[] = [
  'When the last set reaches the top of the range at the target RPE, add the smallest jump (5 lb per dumbbell, 5–10 lb on a barbell) and drop back to the bottom of the range.',
  'On top-set exercises, add weight to the top set first. Back-off sets run 10–15% lighter.',
  'RPE 10 is the last rep you can complete with good form.',
  "Drop set: reach the target reps, cut the weight by about half, and keep going until you can't do another rep.",
  'On paired exercises (A1/A2), alternate between the two, resting about 1 minute after each set.',
  'Week 1 is easy: RPE ~8 on everything, no sets to failure, no drop sets. Use it to find your weights.',
  'If weights or reps drop on two or more lifts for two sessions in a row, start the next block early.',
  'Missed a day? Skip it rather than doubling up.',
  'In week 12, tap Start new block on This Week. Your weights carry into week 1.',
]
