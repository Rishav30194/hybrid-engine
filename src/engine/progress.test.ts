import { describe, expect, it } from 'vitest'
import { dayProgress, weekProgress } from './progress'
import { tmplCondDoneKey, tmplDoneKey } from './keys'
import { DAYS } from '../data/program'

describe('dayProgress', () => {
  const day = DAYS[0]! // 4 exercises + 1 conditioning = 5

  it('counts nothing done for an empty state', () => {
    expect(dayProgress(day, 1, {})).toEqual({ done: 0, total: 5, complete: false })
  })

  it('counts checked exercises and the conditioning block', () => {
    const done = {
      [tmplDoneKey(1, day.ex[0]!.id)]: true,
      [tmplCondDoneKey(1, day.condKey)]: true,
    }
    expect(dayProgress(day, 1, done)).toEqual({ done: 2, total: 5, complete: false })
  })

  it('is complete only when every item + conditioning is checked', () => {
    const done: Record<string, boolean> = {
      [tmplCondDoneKey(1, day.condKey)]: true,
    }
    for (const e of day.ex) done[tmplDoneKey(1, e.id)] = true
    expect(dayProgress(day, 1, done)).toEqual({ done: 5, total: 5, complete: true })
  })

  it('is keyed per week — week 1 checks do not count for week 2', () => {
    const done = { [tmplDoneKey(1, day.ex[0]!.id)]: true }
    expect(dayProgress(day, 2, done).done).toBe(0)
  })
})

describe('key format', () => {
  it('matches the persisted key scheme', () => {
    expect(tmplDoneKey(3, 'mon-e0')).toBe('w3:t:mon-e0')
    expect(tmplCondDoneKey(3, 'mon')).toBe('w3:tc:mon')
  })
})

describe('weekProgress', () => {
  const mon = DAYS[0]!

  it('sums every day: Mon 5 + Wed 7 + Fri 5', () => {
    expect(weekProgress(DAYS, 1, {}).total).toBe(17)
  })

  it('counts only the week it is asked about', () => {
    const done = {
      [tmplDoneKey(1, mon.ex[0]!.id)]: true,
      [tmplCondDoneKey(1, mon.condKey)]: true,
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
      done[tmplCondDoneKey(4, d.condKey)] = true
    }
    expect(weekProgress(DAYS, 4, done)).toEqual({ done: 17, total: 17, complete: true })
    expect(weekProgress(DAYS, 5, done).complete).toBe(false)
  })
})
