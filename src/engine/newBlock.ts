/**
 * Turning the end of a block into the start of the next one.
 *
 * Every logged weight carries straight across — each exercise repeats next
 * block, so last block's number is exactly where the new one should start.
 * Reps don't: week 1 is for finding weights, not beating last block's reps.
 */
import type { Day } from '../data/types'
import { backoffId, tmplDoneKey } from './keys'

/** The `log` the next block starts with — week 1 seeded from `fromWeek`. */
export function planNewBlock(
  days: Day[],
  fromWeek: number,
  log: Record<string, string>,
): Record<string, string> {
  const carry: Record<string, string> = {}
  const ids = days.flatMap((d) =>
    d.ex.flatMap((e) => (e.backoff ? [e.id, backoffId(e.id)] : [e.id])),
  )

  for (const id of ids) {
    const weight = log[tmplDoneKey(fromWeek, id)]
    if (weight) carry[tmplDoneKey(1, id)] = weight
  }

  return carry
}
