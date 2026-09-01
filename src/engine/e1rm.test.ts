import { describe, expect, it } from 'vitest'
import {
  estimateOneRepMax,
  impliedOneRepMax,
  lsrpeId,
  prescribedReps,
  prescribedRpe,
} from './e1rm'
import { WEEKS } from '../data/program'

describe('estimateOneRepMax', () => {
  it('matches the worked examples', () => {
    // 3 reps @ RPE 8 = 5 to failure = 86.3% → 208.6 → 210
    expect(estimateOneRepMax(180, 3, 8)).toBe(210)
    // 10 reps @ RPE 8 = 12 to failure = 69.4% → 172.9 → 175
    expect(estimateOneRepMax(120, 10, 8)).toBe(175)
  })

  it('a true single at RPE 10 is the max itself', () => {
    expect(estimateOneRepMax(225, 1, 10)).toBe(225)
  })

  it('rounds to the nearest 5', () => {
    // raw 207.x rounds down, 208.x and 209.x round up
    expect(estimateOneRepMax(179, 3, 8)).toBe(205) // 207.4
    expect(estimateOneRepMax(179.5, 3, 8)).toBe(210) // 208.0
    expect(estimateOneRepMax(180.5, 3, 8)).toBe(210) // 209.2
  })

  it('rates the same weight higher the easier it felt', () => {
    const hard = estimateOneRepMax(200, 5, 9)!
    const easy = estimateOneRepMax(200, 5, 7)!
    expect(easy).toBeGreaterThan(hard)
  })

  it('handles half-point RPE', () => {
    expect(estimateOneRepMax(200, 3, 7.5)).toBeGreaterThan(0)
  })

  describe('rejects input it cannot estimate from', () => {
    it('missing or zero fields', () => {
      expect(estimateOneRepMax(0, 3, 8)).toBeNull()
      expect(estimateOneRepMax(180, 0, 8)).toBeNull()
      expect(estimateOneRepMax(180, 3, 0)).toBeNull()
    })

    it('negatives', () => {
      expect(estimateOneRepMax(-180, 3, 8)).toBeNull()
      expect(estimateOneRepMax(180, -3, 8)).toBeNull()
      expect(estimateOneRepMax(180, 3, -8)).toBeNull()
    })

    it('RPE above the 1–10 scale — a typo, not a hard set', () => {
      expect(estimateOneRepMax(180, 3, 11)).toBeNull()
      expect(estimateOneRepMax(180, 3, 80)).toBeNull()
    })

    it('rep counts past where the estimate means anything', () => {
      expect(estimateOneRepMax(100, 15, 6)).toBeNull() // 19 to failure
      expect(estimateOneRepMax(100, 11, 8)).toBeNull() // 13 to failure
      expect(estimateOneRepMax(100, 12, 10)).toBe(145) // 12 — the last usable row
    })

    it('NaN from an unparsable field', () => {
      expect(estimateOneRepMax(NaN, 3, 8)).toBeNull()
      expect(estimateOneRepMax(180, NaN, 8)).toBeNull()
      expect(estimateOneRepMax(180, 3, NaN)).toBeNull()
    })
  })
})

describe('prescribedReps', () => {
  it('reads the reps out of a week\'s sr', () => {
    expect(prescribedReps('4×5')).toBe(5)
    expect(prescribedReps('4×6')).toBe(6)
    expect(prescribedReps('3×5')).toBe(5)
  })

  it('returns null for week 8\'s AMRAP prescription', () => {
    expect(prescribedReps('work up, then AMRAP')).toBeNull()
  })
})

describe('prescribedRpe', () => {
  it("reads the number out of a week's rpe", () => {
    expect(prescribedRpe('7')).toBe(7)
    expect(prescribedRpe('7.5')).toBe(7.5)
    expect(prescribedRpe('8 hold')).toBe(8) // week 7
  })

  it('returns null for week 8, which prescribes a test rather than an RPE', () => {
    expect(prescribedRpe('test')).toBeNull()
  })
})

describe('lsrpeId', () => {
  it('suffixes the exercise id, same pattern as the test-set ids', () => {
    expect(lsrpeId('mon-e0')).toBe('mon-e0:lsrpe')
  })
})

describe('impliedOneRepMax', () => {
  /**
   * The property the whole signal rests on. An absolute e1RM does not have it:
   * it read the week-4 deload 15 lb light on a set that went exactly to plan,
   * because 68% is deliberately easier than the chart's RPE-5 load.
   */
  it('returns the 1RM untouched when every week is taken to its own RPE', () => {
    for (const week of WEEKS) {
      const reps = prescribedReps(week.main.squat.sr)
      const rpe = prescribedRpe(week.main.squat.rpe)
      if (reps == null || rpe == null) continue // week 8 tests instead
      expect(impliedOneRepMax(205, reps, rpe, rpe)).toBe(205)
    }
  })

  it('reads a set that felt harder than prescribed as a lower max', () => {
    // The week-4 case: 5 reps prescribed at RPE 5, taken at RPE 8.
    expect(impliedOneRepMax(205, 5, 5, 8)).toBe(185)
    expect(impliedOneRepMax(205, 5, 7, 9)).toBeLessThan(205)
  })

  it('reads a set that felt easier than prescribed as a higher max', () => {
    expect(impliedOneRepMax(205, 5, 7, 5)).toBeGreaterThan(205)
  })

  it('scales the current max rather than the weight on the bar', () => {
    // Same effort gap, twice the max — twice the movement off it.
    const light = impliedOneRepMax(100, 5, 7, 9)!
    const heavy = impliedOneRepMax(200, 5, 7, 9)!
    expect(heavy).toBe(light * 2)
  })

  it('rejects input it cannot read', () => {
    expect(impliedOneRepMax(0, 5, 7, 9)).toBeNull()
    expect(impliedOneRepMax(205, 5, 7, 0)).toBeNull()
    expect(impliedOneRepMax(205, 5, 7, 11)).toBeNull()
    expect(impliedOneRepMax(205, 5, 7, NaN)).toBeNull()
    expect(impliedOneRepMax(205, 12, 7, 9)).toBeNull() // 15 to failure
  })
})
