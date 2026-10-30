/**
 * Turning the end of a block into the start of the next one.
 *
 * Every logged weight carries straight across — each exercise repeats next
 * block, so last block's number is exactly where the new one should start.
 */
import type { Day } from '../data/types'
import { tmplDoneKey } from './keys'

/** The `log` the next block starts with — week 1 seeded from `fromWeek`. */
export function planNewBlock(
  days: Day[],
  fromWeek: number,
  log: Record<string, string>,
): Record<string, string> {
  const carry: Record<string, string> = {}
  const ids = days.flatMap((d) => [
    ...d.ex.map((e) => e.id),
    ...(d.condLoads ?? []).map((l) => l.id),
  ])

  for (const id of ids) {
    const weight = log[tmplDoneKey(fromWeek, id)]
    if (weight) carry[tmplDoneKey(1, id)] = weight
  }

  return carry
}
