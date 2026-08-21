/**
 * Estimated 1RM from a set you actually did.
 *
 * RPE says how many reps were left: RPE 8 means 2 in reserve. Add those to the
 * reps performed and you have reps-to-failure, which maps to a percentage of a
 * true max. So `180 × 3 @ RPE 8` is 5 reps-to-failure ≈ 86.3% → e1RM 209.
 *
 * Reliable at low reps, sloppy above ~8 — which is fine, since only the four
 * main lifts feed the program and week 8 tests them at 3–4 reps.
 */

/** % of 1RM you can lift for n reps taken to failure. */
const PCT_AT_REPS = [
  1, 0.955, 0.922, 0.892, 0.863, 0.837, 0.811, 0.786, 0.762, 0.739, 0.717,
  0.694,
]

/** Beyond this the estimate stops meaning much. */
export const MAX_REPS_TO_FAILURE = PCT_AT_REPS.length

/**
 * The estimate is rounded to the nearest 5 lb. It's a training max you'll load
 * plates against, and the raw figure carries more precision than the method
 * deserves — 208.6 is not meaningfully different from 210.
 *
 * Deliberately not tied to the "Round loads to" setting: that governs working
 * loads on the bar, this is the reference number they're computed from.
 */
export const ROUND_TO = 5

export function estimateOneRepMax(
  weight: number,
  reps: number,
  rpe: number,
): number | null {
  // RPE is a 1–10 scale; anything outside it is a typo, not a hard set.
  if (!(weight > 0) || !(reps > 0) || !(rpe > 0) || rpe > 10) return null

  const repsInReserve = 10 - rpe
  const toFailure = Math.round(reps + repsInReserve)
  if (toFailure < 1 || toFailure > MAX_REPS_TO_FAILURE) return null

  const pct = PCT_AT_REPS[toFailure - 1]
  if (!pct) return null
  return Math.round(weight / pct / ROUND_TO) * ROUND_TO
}

/**
 * Log keys for a main lift's test set. These reuse the existing
 * `w{week}:t:{exId}` format with suffixed ids, exactly like `mon-climber` — no new
 * key format, nothing existing can orphan.
 */
export const testRepsId = (exId: string) => `${exId}:reps`
export const testRpeId = (exId: string) => `${exId}:rpe`
