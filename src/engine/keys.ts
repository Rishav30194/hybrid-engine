/**
 * Per-week state keys. Check-off (`done`) and logged weights (`log`) are keyed
 * per week so each week tracks its own completion and loads. These formats are a
 * storage contract — do not change one without a persistence migration.
 *
 * Template is the only screen that checks work off, so there is one format.
 * Three more (`w{n}:m:{lift}`, `w{n}:c:{cond}`, `w{n}:tc:{cond}`) were written
 * by the old lift and conditioning rows; those rows are gone, and any such keys
 * still in storage are inert — nothing reads or writes them.
 */

/** Template exercise check-off: `w{week}:t:{exId}` (also the logged-weight key) */
export const tmplDoneKey = (week: number, exId: string) => `w${week}:t:${exId}`

/**
 * Log id for a set's actual felt RPE ("last set RPE"), used inside
 * `tmplDoneKey`. A suffixed id rather than a new key format, so nothing
 * existing can orphan.
 */
export const lsrpeId = (exId: string) => `${exId}:lsrpe`

/** Log id for the reps of an exercise's last set. Same suffixed-id pattern. */
export const repsId = (exId: string) => `${exId}:reps`

/**
 * Log id for a top-set exercise's back-off sets: their weight under
 * `backoffId(exId)`, their last set's reps under `repsId(backoffId(exId))`.
 */
export const backoffId = (exId: string) => `${exId}:bo`
