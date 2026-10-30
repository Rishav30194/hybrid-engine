/**
 * Helpers for reading the prescription. Every weight is logged, not computed —
 * see docs/ARCHITECTURE.md → "Logged weights".
 */
import { LIFTS, pressForWeek, weekAt } from '../data/program'
import type { Exercise, LiftKey } from '../data/types'

/** Parse a possibly-empty/edited numeric value; non-numbers become 0. */
export function toNum(v: number | string | null | undefined): number {
  const n = parseFloat(String(v))
  return Number.isNaN(n) ? 0 : n
}

/** Meta line for a main lift: `sets×reps · RPE x`, from the active week. */
export function mainLiftMeta(week: number, lift: LiftKey): string {
  const m = weekAt(week).main[lift]
  return `${m.sr} · RPE ${m.rpe}`
}

/** Meta line for a template exercise: `sets×reps · RPE x[ · rest …]`. */
export function exerciseMeta(e: Exercise): string {
  let meta = `${e.sr} · RPE ${e.rpe}`
  if (e.rest && e.rest !== '—') meta += ` · rest ${e.rest}`
  return meta
}

/**
 * Wednesday's press slot is authored as the bench but runs overhead in weeks 3
 * and 6, so the row's name and meta line follow the week. Every other exercise
 * resolves to itself.
 */
export function resolveExercise(
  e: Exercise,
  week: number,
): { main: LiftKey | undefined; name: string } {
  if (e.main !== 'bench') return { main: e.main, name: e.name }
  const lift = pressForWeek(week)
  return { main: lift, name: LIFTS.find((l) => l.key === lift)?.name ?? e.name }
}
