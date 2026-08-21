/**
 * The recalculation engine — the heart of the app.
 * Working load = round(1RM × pct / increment) × increment.
 */
import { LIFTS, pressForWeek, weekAt } from '../data/program'
import type { Exercise, LiftKey } from '../data/types'
import type { Rm, RmAt } from '../state/types'

/** Parse a possibly-empty/edited numeric value; non-numbers become 0. */
export function toNum(v: number | string | null | undefined): number {
  const n = parseFloat(String(v))
  return Number.isNaN(n) ? 0 : n
}

/**
 * round(1RM × pct / increment) × increment, with increment defaulting to 1.
 * Floored at 0 — `type="number"` accepts a typed minus sign, and a negative
 * working load would otherwise propagate to every screen.
 */
export function roundLoad(
  oneRepMax: number | string,
  pct: number,
  increment: number | string,
): number {
  const r = toNum(increment) || 1
  return Math.max(0, Math.round((toNum(oneRepMax) * pct) / r) * r)
}

/**
 * The 1RMs a week's loads are computed from. A week already trained keeps the
 * values it was trained at; every other week follows the live `rm`, so raising
 * a 1RM moves the current and future weeks only.
 */
export function rmForWeek(rm: Rm, rmAt: RmAt, week: number): Rm {
  return rmAt[week] ?? rm
}

/** Working load for a lift in a given week (1-based), rounded to `increment`. */
export function computeLoad(
  oneRepMax: number | string,
  week: number,
  lift: LiftKey,
  increment: number | string,
): number {
  return roundLoad(oneRepMax, weekAt(week).main[lift].pct, increment)
}

/** Meta line for a main lift: `sets×reps · RPE x[ · nn%]`. */
export function mainLiftMeta(
  week: number,
  lift: LiftKey,
  showPercents = true,
): string {
  const m = weekAt(week).main[lift]
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

/**
 * Wednesday's press slot is authored as the bench but runs overhead in weeks 3
 * and 6, so the row's name and computed load follow the week. Every other
 * exercise resolves to itself.
 */
export function resolveExercise(
  e: Exercise,
  week: number,
): { main: LiftKey | undefined; name: string } {
  if (e.main !== 'bench') return { main: e.main, name: e.name }
  const lift = pressForWeek(week)
  return { main: lift, name: LIFTS.find((l) => l.key === lift)?.name ?? e.name }
}
