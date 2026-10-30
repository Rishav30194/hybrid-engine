import { describe, expect, it } from 'vitest'
import { exerciseMeta, mainLiftMeta, resolveExercise, toNum } from './loads'
import { anchorLifts, COND, DAYS, WEEKS } from '../data/program'

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

describe('mainLiftMeta', () => {
  it('reads the active week, with no percentage', () => {
    expect(mainLiftMeta(1, 'squat')).toBe('4×5 · RPE 7')
    expect(mainLiftMeta(5, 'squat')).toBe('4×4 · RPE 7.5')
  })
})

describe('exerciseMeta', () => {
  it('appends rest when present', () => {
    const main = DAYS[0]!.ex[0]! // Back Squat, rest "2 min"
    expect(exerciseMeta(main)).toBe('4×5→4×4 · RPE 7→8 · rest 2 min')
  })
  it('omits rest when it is an em dash', () => {
    const accessory = DAYS[0]!.ex[1]! // Cable Row, rest "—"
    expect(exerciseMeta(accessory)).toBe('3×10 · RPE 8')
  })
})

describe('resolveExercise (Wednesday press swap)', () => {
  const press = DAYS[1]!.ex[0]! // the authored bench anchor
  const squat = DAYS[0]!.ex[0]!

  it('keeps the bench on a normal week', () => {
    expect(resolveExercise(press, 1)).toEqual({ main: 'bench', name: 'Bench Press' })
  })
  it('runs overhead in weeks 3 and 6', () => {
    for (const wk of [3, 6]) {
      expect(resolveExercise(press, wk)).toEqual({
        main: 'ohp',
        name: 'Overhead Press',
      })
    }
  })
  it('leaves every other exercise alone', () => {
    expect(resolveExercise(squat, 3)).toEqual({ main: 'squat', name: squat.name })
  })
})

describe('anchorLifts', () => {
  it('programs three lifts a week, pressing overhead in 3 and 6', () => {
    expect(anchorLifts(1).map((l) => l.key)).toEqual(['squat', 'bench', 'tbdl'])
    expect(anchorLifts(3).map((l) => l.key)).toEqual(['squat', 'ohp', 'tbdl'])
    expect(anchorLifts(6).map((l) => l.key)).toEqual(['squat', 'ohp', 'tbdl'])
    expect(anchorLifts(8).map((l) => l.key)).toEqual(['squat', 'bench', 'tbdl'])
  })
})

describe('program data integrity', () => {
  it('has 8 weeks numbered 1..8', () => {
    expect(WEEKS).toHaveLength(8)
    WEEKS.forEach((w, i) => expect(w.wk).toBe(i + 1))
  })
  it('has all four lifts prescribed every week', () => {
    for (const w of WEEKS) {
      for (const lift of ['squat', 'bench', 'tbdl', 'ohp'] as const) {
        expect(w.main[lift].pct).toBeGreaterThan(0)
      }
    }
  })
  it('has 3 template days', () => {
    expect(DAYS).toHaveLength(3)
  })
  // Other suites index fixtures literally (DAYS[0].ex[0]); this is what makes
  // that safe — if the program data loses a day's exercises, it fails here
  // with a clear message rather than as a confusing undefined downstream.
  it('gives every day at least one exercise, anchored by a main lift', () => {
    for (const d of DAYS) {
      expect(d.ex.length).toBeGreaterThan(0)
      expect(d.ex[0]?.main).toBeTruthy()
    }
  })
  // Arms sit at maintenance on a 3-day plan, so each gets exactly one direct
  // movement. Triceps were missing until they were added deliberately — this
  // stops either slot being dropped again without someone noticing.
  it('gives both arms one direct movement', () => {
    const names = DAYS.flatMap((d) => d.ex.map((e) => e.name))
    expect(names.filter((n) => /Curl/.test(n))).toHaveLength(1)
    expect(names.filter((n) => /Triceps/.test(n))).toHaveLength(1)
  })
  it('prescribes every conditioning day in every week', () => {
    for (const w of WEEKS) {
      for (const c of COND) expect(w.cond[c.key]).toBeTruthy()
    }
  })
})
