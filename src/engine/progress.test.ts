import { describe, expect, it } from 'vitest'
import { dayProgress, weekProgress } from './progress'
import { backoffId, lsrpeId, repsId, tmplDoneKey } from './keys'
import { DAYS } from '../data/program'

describe('dayProgress', () => {
  const day = DAYS[0]! // Monday: 6 exercises, no conditioning block

  it('counts nothing done for an empty state', () => {
    expect(dayProgress(day, 1, {})).toEqual({ done: 0, total: 6, complete: false })
  })

  it('counts checked exercises', () => {
    const done = {
      [tmplDoneKey(1, day.ex[0]!.id)]: true,
      [tmplDoneKey(1, day.ex[1]!.id)]: true,
    }
    expect(dayProgress(day, 1, done)).toEqual({ done: 2, total: 6, complete: false })
  })

  // An old conditioning check-off is inert — it must not count toward a day.
  it('ignores retired conditioning keys', () => {
    expect(dayProgress(day, 1, { 'w1:tc:mon': true }).done).toBe(0)
  })

  it('is complete only when every exercise is checked', () => {
    const done: Record<string, boolean> = {}
    for (const e of day.ex) done[tmplDoneKey(1, e.id)] = true
    expect(dayProgress(day, 1, done)).toEqual({ done: 6, total: 6, complete: true })
  })

  it('is keyed per week — week 1 checks do not count for week 2', () => {
    const done = { [tmplDoneKey(1, day.ex[0]!.id)]: true }
    expect(dayProgress(day, 2, done).done).toBe(0)
  })
})

describe('key format', () => {
  it('matches the persisted key scheme', () => {
    expect(tmplDoneKey(3, 'mon-e0')).toBe('w3:t:mon-e0')
  })
  // Suffixed ids ride inside tmplDoneKey; their spelling is the storage contract.
  it('spells the suffixed log ids exactly', () => {
    expect(tmplDoneKey(3, lsrpeId('mon-e0'))).toBe('w3:t:mon-e0:lsrpe')
    expect(tmplDoneKey(3, repsId('mon-e0'))).toBe('w3:t:mon-e0:reps')
    expect(tmplDoneKey(3, backoffId('mon-e0'))).toBe('w3:t:mon-e0:bo')
    expect(tmplDoneKey(3, repsId(backoffId('mon-e0')))).toBe('w3:t:mon-e0:bo:reps')
  })
})

describe('weekProgress', () => {
  const mon = DAYS[0]!

  it('sums every day: Mon 6 + Wed 7 + Fri 8', () => {
    expect(weekProgress(DAYS, 1, {}).total).toBe(21)
  })

  it('counts only the week it is asked about', () => {
    const done = {
      [tmplDoneKey(1, mon.ex[0]!.id)]: true,
      [tmplDoneKey(1, mon.ex[1]!.id)]: true,
      [tmplDoneKey(2, mon.ex[0]!.id)]: true,
    }
    expect(weekProgress(DAYS, 1, done).done).toBe(2)
    expect(weekProgress(DAYS, 2, done).done).toBe(1)
    expect(weekProgress(DAYS, 3, done).done).toBe(0)
  })

  it('is complete only when every day is', () => {
    const done: Record<string, boolean> = {}
    for (const d of DAYS) {
      for (const e of d.ex) done[tmplDoneKey(4, e.id)] = true
    }
    expect(weekProgress(DAYS, 4, done)).toEqual({ done: 21, total: 21, complete: true })
    expect(weekProgress(DAYS, 5, done).complete).toBe(false)
  })
})
