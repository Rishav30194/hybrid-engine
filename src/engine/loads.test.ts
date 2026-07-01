import { describe, expect, it } from 'vitest'
import {
  computeLoad,
  exerciseMeta,
  mainLiftMeta,
  roundLoad,
  toNum,
} from './loads'
import { DAYS, WEEKS } from '../data/program'

const DEFAULT_RM = { squat: 245, bench: 225, tbdl: 375, ohp: 135 } as const

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

describe('roundLoad', () => {
  it('rounds to the given increment', () => {
    // 245 × 0.785 = 192.325
    expect(roundLoad(245, 0.785, 1)).toBe(192)
    expect(roundLoad(245, 0.785, 2.5)).toBe(192.5)
    expect(roundLoad(245, 0.785, 5)).toBe(190)
    expect(roundLoad(245, 0.785, 10)).toBe(190)
  })
  it('defaults a falsy increment to 1', () => {
    expect(roundLoad(245, 0.785, 0)).toBe(192)
    expect(roundLoad(245, 0.785, '')).toBe(192)
  })
  it('returns 0 for a blank 1RM', () => {
    expect(roundLoad('', 0.785, 5)).toBe(0)
  })
})

describe('computeLoad (week 1, rounding 5)', () => {
  it('matches the hand-computed working loads', () => {
    expect(computeLoad(DEFAULT_RM.squat, 1, 'squat', 5)).toBe(190)
    expect(computeLoad(DEFAULT_RM.bench, 1, 'bench', 5)).toBe(170)
    expect(computeLoad(DEFAULT_RM.tbdl, 1, 'tbdl', 5)).toBe(295)
    expect(computeLoad(DEFAULT_RM.ohp, 1, 'ohp', 5)).toBe(95)
  })
  it('recalculates when the week changes', () => {
    // week 4 deload squat pct 0.68 → 245 × 0.68 = 166.6 → 165
    expect(computeLoad(DEFAULT_RM.squat, 4, 'squat', 5)).toBe(165)
  })
  it('recalculates when the 1RM changes', () => {
    expect(computeLoad(300, 1, 'squat', 5)).toBe(235) // 300 × 0.785 = 235.5 → 235
  })
})

describe('mainLiftMeta', () => {
  it('includes the percent by default', () => {
    expect(mainLiftMeta(1, 'squat')).toBe('4×5 · RPE 7 · 79%')
  })
  it('omits the percent when showPercents is false', () => {
    expect(mainLiftMeta(1, 'squat', false)).toBe('4×5 · RPE 7')
  })
})

describe('exerciseMeta', () => {
  it('appends rest when present', () => {
    const main = DAYS[0].ex[0] // Back Squat, rest "2–3 min"
    expect(exerciseMeta(main)).toBe('4×5→4×4 · RPE 7→8 · rest 2–3 min')
  })
  it('omits rest when it is an em dash', () => {
    const accessory = DAYS[0].ex[1] // RDL, rest "—"
    expect(exerciseMeta(accessory)).toBe('3×8 · RPE 7')
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
  it('has 5 template days', () => {
    expect(DAYS).toHaveLength(5)
  })
})
