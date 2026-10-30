/**
 * What a Template row shows besides its inputs: the prescription line and the
 * numbers to beat. Every weight is logged, not computed — see
 * docs/ARCHITECTURE.md → "Logged weights".
 */
import { weekAt } from '../data/program'
import type { Exercise } from '../data/types'
import { repsId, tmplDoneKey } from './keys'

/** Parse a possibly-empty/edited numeric value; non-numbers become 0. */
export function toNum(v: number | string | null | undefined): number {
  const n = parseFloat(String(v))
  return Number.isNaN(n) ? 0 : n
}

/**
 * Meta line for a template exercise: `sets×reps · RPE x[ · rest …]`. The easy
 * week's RPE replaces the exercise's own, so week 1 never reads as a call to
 * go to failure.
 */
export function exerciseMeta(e: Exercise, week: number): string {
  let meta = `${e.sr} · RPE ${weekAt(week).rpeOverride ?? e.rpe}`
  if (e.rest && e.rest !== '—') meta += ` · rest ${e.rest}`
  return meta
}

/**
 * The most recent week before `week` that logged a weight or reps under
 * `logId`, as the numbers to beat. Looks past the week before because the
 * program says to skip a missed session rather than double up — a skipped
 * week must not wipe out the target. Both numbers come from the same week, so
 * a weight is never paired with reps it wasn't lifted for.
 */
export function lastLogged(
  log: Record<string, string>,
  logId: string,
  week: number,
): { weight: string | undefined; reps: string | undefined } | null {
  for (let w = week - 1; w >= 1; w--) {
    const weight = log[tmplDoneKey(w, logId)]
    const reps = log[tmplDoneKey(w, repsId(logId))]
    if (weight || reps) return { weight: weight || undefined, reps: reps || undefined }
  }
  return null
}
