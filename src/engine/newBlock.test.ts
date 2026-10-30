import { describe, expect, it } from 'vitest'
import { planNewBlock } from './newBlock'
import { lsrpeId, tmplDoneKey } from './keys'
import { DAYS } from '../data/program'

const at8 = (id: string) => tmplDoneKey(8, id)

describe('planNewBlock', () => {
  it('carries accessory and conditioning weights into week 1', () => {
    const log = {
      [at8('mon-row-cable')]: '120',
      [at8('mon-carry-suitcase')]: '70',
      [at8('mon-climber')]: '6',
    }
    const carry = planNewBlock(DAYS, 8, log)
    expect(carry[tmplDoneKey(1, 'mon-row-cable')]).toBe('120')
    expect(carry[tmplDoneKey(1, 'mon-carry-suitcase')]).toBe('70')
    expect(carry[tmplDoneKey(1, 'mon-climber')]).toBe('6')
  })

  it('carries a main lift’s weight like any other exercise', () => {
    const carry = planNewBlock(DAYS, 8, { [at8('mon-e0')]: '180' })
    expect(carry[tmplDoneKey(1, 'mon-e0')]).toBe('180')
  })

  // Felt RPE and the old week-8 test entries are about that one set, not a
  // starting point for the next block.
  it('never carries suffixed detail keys forward', () => {
    const log = {
      [at8('mon-e0')]: '180',
      [at8(lsrpeId('mon-e0'))]: '8',
      [at8('mon-e0:reps')]: '3',
      [at8('mon-e0:rpe')]: '8',
    }
    expect(Object.keys(planNewBlock(DAYS, 8, log))).toEqual([
      tmplDoneKey(1, 'mon-e0'),
    ])
  })

  it('produces an empty carry from an empty log without throwing', () => {
    expect(planNewBlock(DAYS, 8, {})).toEqual({})
  })

  it('only reads the week it is given', () => {
    const log = {
      [tmplDoneKey(7, 'mon-row-cable')]: '999', // last week's row — not week 8
      [at8('mon-row-cable')]: '120',
    }
    const carry = planNewBlock(DAYS, 8, log)
    expect(carry[tmplDoneKey(1, 'mon-row-cable')]).toBe('120')
  })
})
