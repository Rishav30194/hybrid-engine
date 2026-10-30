import { describe, expect, it } from 'vitest'
import { planNewBlock } from './newBlock'
import { backoffId, lsrpeId, repsId, tmplDoneKey } from './keys'
import { DAYS, LAST_WEEK } from '../data/program'

const atLast = (id: string) => tmplDoneKey(LAST_WEEK, id)
const atOne = (id: string) => tmplDoneKey(1, id)

describe('planNewBlock', () => {
  it('carries every exercise’s weight into week 1', () => {
    const log = {
      [atLast('bb-mon-squat')]: '185',
      [atLast('bb-mon-legcurl')]: '90',
      [atLast('bb-fri-legcurl')]: '80',
    }
    expect(planNewBlock(DAYS, LAST_WEEK, log)).toEqual({
      [atOne('bb-mon-squat')]: '185',
      [atOne('bb-mon-legcurl')]: '90',
      [atOne('bb-fri-legcurl')]: '80',
    })
  })

  it('carries a back-off weight, but no reps', () => {
    const log = {
      [atLast('bb-mon-squat')]: '185',
      [atLast(repsId('bb-mon-squat'))]: '6',
      [atLast(backoffId('bb-mon-squat'))]: '160',
      [atLast(repsId(backoffId('bb-mon-squat')))]: '9',
    }
    expect(planNewBlock(DAYS, LAST_WEEK, log)).toEqual({
      [atOne('bb-mon-squat')]: '185',
      [atOne(backoffId('bb-mon-squat'))]: '160',
    })
  })

  // Felt RPE describes one set, not a starting point for the next block.
  it('never carries felt RPE forward', () => {
    const log = { [atLast(lsrpeId('bb-wed-curl'))]: '10' }
    expect(planNewBlock(DAYS, LAST_WEEK, log)).toEqual({})
  })

  // A back-off id on an exercise without back-off sets is not something the
  // row ever writes; nothing should invent it.
  it('only carries a back-off weight for a top-set exercise', () => {
    const log = { [atLast(backoffId('bb-mon-legpress'))]: '300' }
    expect(planNewBlock(DAYS, LAST_WEEK, log)).toEqual({})
  })

  it('ignores weights logged under the old program’s ids', () => {
    expect(planNewBlock(DAYS, LAST_WEEK, { [atLast('mon-e0')]: '180' })).toEqual({})
  })

  it('produces an empty carry from an empty log without throwing', () => {
    expect(planNewBlock(DAYS, LAST_WEEK, {})).toEqual({})
  })

  it('only reads the week it is given', () => {
    const log = {
      [tmplDoneKey(LAST_WEEK - 1, 'bb-wed-row')]: '999', // the week before — not this one
      [atLast('bb-wed-row')]: '60',
    }
    expect(planNewBlock(DAYS, LAST_WEEK, log)).toEqual({ [atOne('bb-wed-row')]: '60' })
  })
})
