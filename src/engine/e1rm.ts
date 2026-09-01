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

/** What fraction of a max `reps` at `rpe` represents, or null if off the chart. */
function pctForSet(reps: number, rpe: number): number | null {
  // RPE is a 1–10 scale; anything outside it is a typo, not a hard set.
  if (!(reps > 0) || !(rpe > 0) || rpe > 10) return null

  const repsInReserve = 10 - rpe
  const toFailure = Math.round(reps + repsInReserve)
  if (toFailure < 1 || toFailure > MAX_REPS_TO_FAILURE) return null

  return PCT_AT_REPS[toFailure - 1] ?? null
}

export function estimateOneRepMax(
  weight: number,
  reps: number,
  rpe: number,
): number | null {
  if (!(weight > 0)) return null
  const pct = pctForSet(reps, rpe)
  if (pct == null) return null
  return Math.round(weight / pct / ROUND_TO) * ROUND_TO
}

/**
 * The 1RM a working set implies, measured against the RPE it was *prescribed*
 * at rather than in absolute terms.
 *
 * `estimateOneRepMax` alone disagrees with the program's own percentages. Week 4
 * loads the deload at 68% and calls it RPE 5, but the chart above puts 5 reps at
 * RPE 5 at 73.9% — so a deload that went exactly to plan would "imply" a 1RM
 * 15 lb below the real one, and following that number would walk the max down
 * every block. The working weeks mostly agree with the chart, which is why this
 * only shows up badly on the deload.
 *
 * Scaling by the ratio of the two percentages cancels the weight out entirely:
 * hitting the prescribed RPE returns the current 1RM exactly, on every week, and
 * what's left is the only thing the signal is for — how far off the prescribed
 * effort the set actually landed. It assumes the bar carried the prescribed
 * load, which is what the row displays and has no field to contradict.
 */
export function impliedOneRepMax(
  oneRepMax: number,
  reps: number,
  prescribed: number,
  felt: number,
): number | null {
  if (!(oneRepMax > 0)) return null
  const target = pctForSet(reps, prescribed)
  const actual = pctForSet(reps, felt)
  if (target == null || actual == null) return null
  return Math.round((oneRepMax * target) / actual / ROUND_TO) * ROUND_TO
}

/** The same 5 lb grid `impliedOneRepMax` lands on, for comparing against it. */
export const toReference = (oneRepMax: number) =>
  Math.round(oneRepMax / ROUND_TO) * ROUND_TO

/**
 * Log keys for a main lift's test set. These reuse the existing
 * `w{week}:t:{exId}` format with suffixed ids, exactly like `mon-climber` — no new
 * key format, nothing existing can orphan.
 */
export const testRepsId = (exId: string) => `${exId}:reps`
export const testRpeId = (exId: string) => `${exId}:rpe`

/**
 * Reps per set from a main lift's own prescription for the week, e.g. `4×5` →
 * 5. Week 8 prescribes `work up, then AMRAP` instead of a fixed scheme, so this
 * returns null there — a working-set LSRPE estimate only applies to weeks 1–7,
 * week 8 already has its own reps+RPE test-set flow.
 */
export function prescribedReps(sr: string): number | null {
  const n = Number(sr.split('×')[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

/** The RPE a week prescribes for a main lift, e.g. week 7's `8 hold` → 8. */
export function prescribedRpe(rpe: string): number | null {
  const n = parseFloat(rpe)
  return Number.isFinite(n) && n > 0 && n <= 10 ? n : null
}

/**
 * Log key for a set's actual felt RPE ("last set RPE"). Same suffixed-id
 * pattern as the test-set fields above — no new key format.
 */
export const lsrpeId = (exId: string) => `${exId}:lsrpe`
