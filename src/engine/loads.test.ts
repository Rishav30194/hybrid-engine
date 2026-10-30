import { describe, expect, it } from 'vitest'
import { exerciseMeta, toNum } from './loads'
import { DAYS, LAST_WEEK, WEEKS } from '../data/program'

describe('toNum', () => {
  it('parses numbers and numeric strings', () => {
    expect(toNum(245)).toBe(245)
    expect(toNum('245')).toBe(245)
    expect(toNum('137.5')).toBe(137.5)
  })
  it('treats blank/invalid as 0', () => {
    expect(toNum('')).toBe(0)
    expect(toNum(null)).toBe(0)
    expect(toNum(undefined)).toBe(0)
    expect(toNum('abc')).toBe(0)
  })
})

describe('exerciseMeta', () => {
  const squat = DAYS[0]!.ex[0]! // Back Squat, rest "2–3 min"

  it('reads sets, reps, RPE and rest', () => {
    expect(exerciseMeta(squat, 2)).toBe('1×5–6 top, 2×8–10 back-off · RPE 8 · rest 2–3 min')
  })
  it('omits rest when it is an em dash', () => {
    expect(exerciseMeta({ ...squat, rest: '—' }, 2)).toBe(
      '1×5–6 top, 2×8–10 back-off · RPE 8',
    )
  })
  // The easy week must never read as a call to go to failure.
  it('shows the easy week’s RPE in place of the exercise’s own', () => {
    const calf = DAYS[0]!.ex.find((e) => e.name === 'Standing Calf Raise')!
    expect(exerciseMeta(calf, 1)).toBe('3×10–12 · RPE ~8 · rest 90s')
    expect(exerciseMeta(calf, 2)).toBe('3×10–12 · RPE 10 · rest 90s')
  })
})

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
