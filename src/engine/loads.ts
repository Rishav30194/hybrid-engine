/**
 * The recalculation engine — the heart of the app.
 * Working load = round(1RM × pct / increment) × increment.
 */
import { WEEKS } from '../data/program'
import type { Exercise, LiftKey } from '../data/types'

/** Parse a possibly-empty/edited numeric value; non-numbers become 0. */
export function toNum(v: number | string | null | undefined): number {
  const n = parseFloat(String(v))
  return Number.isNaN(n) ? 0 : n
}

/** round(1RM × pct / increment) × increment, with increment defaulting to 1. */
export function roundLoad(
  oneRepMax: number | string,
  pct: number,
  increment: number | string,
): number {
  const r = toNum(increment) || 1
  return Math.round((toNum(oneRepMax) * pct) / r) * r
}

/** Working load for a lift in a given week (1-based), rounded to `increment`. */
export function computeLoad(
  oneRepMax: number | string,
  week: number,
  lift: LiftKey,
  increment: number | string,
): number {
  return roundLoad(oneRepMax, WEEKS[week - 1].main[lift].pct, increment)
}

/** Meta line for a main lift: `sets×reps · RPE x[ · nn%]`. */
export function mainLiftMeta(
  week: number,
  lift: LiftKey,
  showPercents = true,
): string {
  const m = WEEKS[week - 1].main[lift]
  let meta = `${m.sr} · RPE ${m.rpe}`
  if (showPercents) meta += ` · ${Math.round(m.pct * 100)}%`
  return meta
}

/** Meta line for a template exercise: `sets×reps · RPE x[ · rest …]`. */
export function exerciseMeta(e: Exercise): string {
  let meta = `${e.sr} · RPE ${e.rpe}`
  if (e.rest && e.rest !== '—') meta += ` · rest ${e.rest}`
  return meta
}
