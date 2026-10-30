import { describe, expect, it } from 'vitest'
import { DAYS, LAST_WEEK, WEEKS } from './program'

describe('program data integrity', () => {
  it('has 12 weeks numbered 1..12, the last of them LAST_WEEK', () => {
    expect(WEEKS).toHaveLength(12)
    WEEKS.forEach((w, i) => expect(w.wk).toBe(i + 1))
    expect(LAST_WEEK).toBe(12)
  })
  it('makes week 1 the only easy week', () => {
    expect(WEEKS.filter((w) => w.phase === 'easy').map((w) => w.wk)).toEqual([1])
    expect(WEEKS.filter((w) => w.rpeOverride).map((w) => w.wk)).toEqual([1])
  })
  // Other suites index fixtures literally (DAYS[0].ex[0]); this is what makes
  // that safe — if the program data loses a day's exercises, it fails here
  // with a clear message rather than as a confusing undefined downstream.
  it('has 3 days of 6, 7 and 8 exercises', () => {
    expect(DAYS.map((d) => d.ex.length)).toEqual([6, 7, 8])
  })
  // Exercise ids are storage keys. Every id from the old program could still
  // hold logged weights on the phone, so a reused one would resurface them on
  // the wrong movement.
  it('gives every exercise a unique, fresh bb- id', () => {
    const ids = DAYS.flatMap((d) => d.ex.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^bb-(mon|wed|fri)-[a-z]+$/)
  })
  it('logs back-off sets on exactly squat, flat DB press and deadlift', () => {
    const backoff = DAYS.flatMap((d) => d.ex.filter((e) => e.backoff).map((e) => e.name))
    expect(backoff).toEqual(['Back Squat', 'Flat DB Press', 'Conventional Deadlift'])
  })
})
