import { describe, expect, it } from 'vitest'
import { exerciseMeta, lastLogged, toNum } from './rows'
import { backoffId, repsId, tmplDoneKey } from './keys'
import { DAYS } from '../data/program'

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

describe('lastLogged', () => {
  const id = 'bb-mon-squat'

  it('reads the week before', () => {
    const log = { [tmplDoneKey(3, id)]: '185', [tmplDoneKey(3, repsId(id))]: '6' }
    expect(lastLogged(log, id, 4)).toEqual({ weight: '185', reps: '6' })
  })

  // The program says to skip a missed session; the target must survive it.
  it('looks past a skipped week to the latest one logged', () => {
    const log = { [tmplDoneKey(2, id)]: '180', [tmplDoneKey(2, repsId(id))]: '5' }
    expect(lastLogged(log, id, 5)).toEqual({ weight: '180', reps: '5' })
  })

  it('prefers the most recent week over an older one', () => {
    const log = {
      [tmplDoneKey(2, id)]: '180',
      [tmplDoneKey(4, id)]: '190',
      [tmplDoneKey(4, repsId(id))]: '4',
    }
    expect(lastLogged(log, id, 6)).toEqual({ weight: '190', reps: '4' })
  })

  // Pairing week 4's weight with week 2's reps would invent a set nobody did.
  it('takes both numbers from the same week', () => {
    const log = { [tmplDoneKey(2, repsId(id))]: '8', [tmplDoneKey(4, id)]: '190' }
    expect(lastLogged(log, id, 5)).toEqual({ weight: '190', reps: undefined })
  })

  it('ignores the current week and later ones', () => {
    const log = { [tmplDoneKey(5, id)]: '200', [tmplDoneKey(6, id)]: '205' }
    expect(lastLogged(log, id, 5)).toBeNull()
  })

  it('treats a cleared box as nothing logged', () => {
    const log = { [tmplDoneKey(4, id)]: '', [tmplDoneKey(3, id)]: '185' }
    expect(lastLogged(log, id, 5)).toEqual({ weight: '185', reps: undefined })
  })

  it('reads a back-off pair under its own id', () => {
    const bo = backoffId(id)
    const log = { [tmplDoneKey(1, id)]: '185', [tmplDoneKey(1, bo)]: '160' }
    expect(lastLogged(log, bo, 2)).toEqual({ weight: '160', reps: undefined })
  })

  it('returns null in week 1', () => {
    expect(lastLogged({ [tmplDoneKey(12, id)]: '185' }, id, 1)).toBeNull()
  })
})
