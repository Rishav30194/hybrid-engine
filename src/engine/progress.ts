/** Per-day completion counts for the Template screen. */
import type { Day } from '../data/types'
import { tmplCondDoneKey, tmplDoneKey } from './keys'

export interface DayProgress {
  done: number
  total: number
  complete: boolean
}

/**
 * A day is its exercises plus one conditioning block. Progress counts checked
 * exercises + the conditioning block against that total.
 */
export function dayProgress(
  day: Day,
  week: number,
  done: Record<string, boolean>,
): DayProgress {
  const total = day.ex.length + 1
  let count = 0
  for (const e of day.ex) {
    if (done[tmplDoneKey(week, e.id)]) count++
  }
  if (done[tmplCondDoneKey(week, day.condKey)]) count++
  return { done: count, total, complete: count === total }
}
