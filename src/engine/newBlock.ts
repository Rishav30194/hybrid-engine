/**
 * Turning the end of a block into the start of the next one.
 *
 * Week 8 tests the main lifts, so the sets logged there estimate new 1RMs.
 * Accessory and conditioning weights carry straight across — their
 * prescriptions are identical every week, so last block's number is exactly
 * where the new one should start.
 */
import type { Day, LiftKey } from '../data/types'
import type { Rm } from '../state/types'
import { estimateOneRepMax, testRepsId, testRpeId } from './e1rm'
import { tmplDoneKey } from './keys'
import { resolveExercise, toNum } from './loads'

export interface NewBlockPlan {
  /** 1RMs for the next block: estimated where week 8 has a set, else unchanged. */
  rm: Rm
  /** The `log` the next block starts with — week 1 seeded from week 8. */
  carry: Record<string, string>
  /** Which lifts the estimate actually came from, for the confirmation screen. */
  estimated: Partial<Record<LiftKey, number>>
}

export function planNewBlock(
  days: Day[],
  fromWeek: number,
  rm: Rm,
  log: Record<string, string>,
): NewBlockPlan {
  const next: Rm = { ...rm }
  const estimated: Partial<Record<LiftKey, number>> = {}
  const carry: Record<string, string> = {}

  for (const day of days) {
    for (const ex of day.ex) {
      const weight = log[tmplDoneKey(fromWeek, ex.id)]
      const { main } = resolveExercise(ex, fromWeek)

      if (main) {
        // A main lift: the test set becomes the new 1RM.
        const e1rm = estimateOneRepMax(
          toNum(weight),
          toNum(log[tmplDoneKey(fromWeek, testRepsId(ex.id))]),
          toNum(log[tmplDoneKey(fromWeek, testRpeId(ex.id))]),
        )
        if (e1rm) {
          next[main] = e1rm
          estimated[main] = e1rm
        }
        continue
      }

      // An accessory: same prescription next block, so start where you left off.
      if (weight) carry[tmplDoneKey(1, ex.id)] = weight
    }

    for (const load of day.condLoads ?? []) {
      const weight = log[tmplDoneKey(fromWeek, load.id)]
      if (weight) carry[tmplDoneKey(1, load.id)] = weight
    }
  }

  return { rm: next, carry, estimated }
}
