/**
 * Per-week state keys. Check-off (`done`) and logged weights (`log`) are keyed
 * per week so each week tracks its own completion and loads. Format mirrors the
 * authored source exactly — do not change without a persistence migration.
 */
import type { CondKey, LiftKey } from '../data/types'

/** Main-lift check-off: `w{week}:m:{lift}` */
export const mainDoneKey = (week: number, lift: LiftKey) => `w${week}:m:${lift}`

/** This-Week conditioning check-off: `w{week}:c:{cond}` */
export const condDoneKey = (week: number, cond: CondKey) => `w${week}:c:${cond}`

/** Template exercise check-off: `w{week}:t:{exId}` (also the log key) */
export const tmplDoneKey = (week: number, exId: string) => `w${week}:t:${exId}`

/** Template conditioning check-off: `w{week}:tc:{cond}` */
export const tmplCondDoneKey = (week: number, cond: CondKey) =>
  `w${week}:tc:${cond}`

/** Logged accessory weight, keyed the same as the template exercise check-off. */
export const logKey = tmplDoneKey
