import { describe, expect, it } from 'vitest'
import { estimateOneRepMax } from './e1rm'

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
