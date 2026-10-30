/** Per-day completion counts for the Template screen. */
import type { Day } from '../data/types'
import { tmplDoneKey } from './keys'

export interface DayProgress {
  done: number
  total: number
  complete: boolean
}

/** A day is its exercises; progress counts the checked ones against that total. */
export function dayProgress(
  day: Day,
  week: number,
  done: Record<string, boolean>,
): DayProgress {
  const total = day.ex.length
  let count = 0
  for (const e of day.ex) {
    if (done[tmplDoneKey(week, e.id)]) count++
  }
  return { done: count, total, complete: count === total }
}

/** Completion across a whole week — every day's exercises. */
export function weekProgress(
  days: Day[],
  week: number,
  done: Record<string, boolean>,
): DayProgress {
  let count = 0
  let total = 0
  for (const d of days) {
    const p = dayProgress(d, week, done)
    count += p.done
    total += p.total
  }
  return { done: count, total, complete: total > 0 && count === total }
}
