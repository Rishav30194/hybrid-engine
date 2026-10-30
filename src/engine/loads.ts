/**
 * Helpers for reading the prescription. Every weight is logged, not computed —
 * see docs/ARCHITECTURE.md → "Logged weights".
 */
import { weekAt } from '../data/program'
import type { Exercise } from '../data/types'

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
