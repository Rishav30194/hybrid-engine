/**
 * Per-week state keys. Check-off (`done`) and logged weights (`log`) are keyed
 * per week so each week tracks its own completion and loads. These formats are a
 * storage contract — do not change one without a persistence migration.
 *
 * Template is the only screen that checks work off, so there are two formats.
 * A third and fourth (`w{n}:m:{lift}`, `w{n}:c:{cond}`) were written by the old
 * This Week lift and conditioning rows; those rows are gone, and any such keys
 * still in storage are inert — nothing reads or writes them.
 */
import type { CondKey } from '../data/types'

/** Template exercise check-off: `w{week}:t:{exId}` (also the logged-weight key) */
export const tmplDoneKey = (week: number, exId: string) => `w${week}:t:${exId}`

/** Template conditioning check-off: `w{week}:tc:{cond}` */
export const tmplCondDoneKey = (week: number, cond: CondKey) =>
  `w${week}:tc:${cond}`
