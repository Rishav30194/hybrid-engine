import { describe, expect, it } from 'vitest'
import { dayProgress } from './progress'
import { tmplCondDoneKey, tmplDoneKey } from './keys'
import { DAYS } from '../data/program'

describe('dayProgress', () => {
  const day = DAYS[0] // 4 exercises + 1 conditioning = 5

  it('counts nothing done for an empty state', () => {
    expect(dayProgress(day, 1, {})).toEqual({ done: 0, total: 5, complete: false })
  })

  it('counts checked exercises and the conditioning block', () => {
    const done = {
      [tmplDoneKey(1, day.ex[0].id)]: true,
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
    const done = { [tmplDoneKey(1, day.ex[0].id)]: true }
    expect(dayProgress(day, 2, done).done).toBe(0)
  })
})

describe('key format', () => {
  it('matches the persisted key scheme', () => {
    expect(tmplDoneKey(3, 'd1e0')).toBe('w3:t:d1e0')
    expect(tmplCondDoneKey(3, 'd1')).toBe('w3:tc:d1')
  })
})
