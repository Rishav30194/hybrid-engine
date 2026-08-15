import { describe, expect, it } from 'vitest'
import { planNewBlock } from './newBlock'
import { testRepsId, testRpeId } from './e1rm'
import { tmplDoneKey } from './keys'
import { DAYS } from '../data/program'
import { INITIAL_STATE } from '../state/reducer'

const rm = INITIAL_STATE.rm
const at8 = (id: string) => tmplDoneKey(8, id)

describe('planNewBlock', () => {
  it('turns a week-8 test set into the next block’s 1RM', () => {
    const log = {
      [at8('mon-e0')]: '180', // Back Squat
      [at8(testRepsId('mon-e0'))]: '3',
      [at8(testRpeId('mon-e0'))]: '8',
    }
    const plan = planNewBlock(DAYS, 8, rm, log)
    expect(plan.rm.squat).toBe(210) // 3 @ RPE 8 → 5 to failure → 86.3% → 208.6 → 210
    expect(plan.estimated.squat).toBe(210)
  })

  it('leaves a lift alone when week 8 has no set for it', () => {
    const plan = planNewBlock(DAYS, 8, rm, {})
    expect(plan.rm).toEqual(rm)
    expect(plan.estimated).toEqual({})
  })

  it('carries accessory and conditioning weights into week 1', () => {
    const log = {
      [at8('mon-e1')]: '120', // chest-supported row
      [at8('mon-sled')]: '90',
      [at8('mon-carry')]: '70',
    }
    const { carry } = planNewBlock(DAYS, 8, rm, log)
    expect(carry[tmplDoneKey(1, 'mon-e1')]).toBe('120')
    expect(carry[tmplDoneKey(1, 'mon-sled')]).toBe('90')
    expect(carry[tmplDoneKey(1, 'mon-carry')]).toBe('70')
  })

  it('does not carry a main lift’s test weight — it became the 1RM', () => {
    const log = {
      [at8('mon-e0')]: '180',
      [at8(testRepsId('mon-e0'))]: '3',
      [at8(testRpeId('mon-e0'))]: '8',
    }
    const { carry } = planNewBlock(DAYS, 8, rm, log)
    expect(carry[tmplDoneKey(1, 'mon-e0')]).toBeUndefined()
  })

  it('resolves Wednesday to the lift week 8 actually programs', () => {
    // wed-e0 is authored as bench and runs as bench in week 8 (OHP only in 3/6).
    const log = {
      [at8('wed-e0')]: '200',
      [at8(testRepsId('wed-e0'))]: '4',
      [at8(testRpeId('wed-e0'))]: '9',
    }
    const plan = planNewBlock(DAYS, 8, rm, log)
    expect(plan.estimated.bench).toBeDefined()
    expect(plan.estimated.ohp).toBeUndefined()
  })
})

describe('planNewBlock edge cases', () => {
  it('ignores a partial test set — weight but no reps or RPE', () => {
    const plan = planNewBlock(DAYS, 8, rm, { [at8('mon-e0')]: '180' })
    expect(plan.rm.squat).toBe(rm.squat)
    expect(plan.estimated.squat).toBeUndefined()
    // and the orphan weight is not carried: it was a test, not an accessory
    expect(plan.carry[tmplDoneKey(1, 'mon-e0')]).toBeUndefined()
  })

  it('ignores unparsable entries rather than producing a garbage 1RM', () => {
    const log = {
      [at8('mon-e0')]: 'heavy',
      [at8(testRepsId('mon-e0'))]: 'three',
      [at8(testRpeId('mon-e0'))]: 'hard',
    }
    const plan = planNewBlock(DAYS, 8, rm, log)
    expect(plan.rm.squat).toBe(rm.squat)
  })

  it('ignores an out-of-range RPE', () => {
    const log = {
      [at8('mon-e0')]: '180',
      [at8(testRepsId('mon-e0'))]: '3',
      [at8(testRpeId('mon-e0'))]: '80', // fat-fingered
    }
    expect(planNewBlock(DAYS, 8, rm, log).rm.squat).toBe(rm.squat)
  })

  it('never carries the :reps and :rpe detail keys forward', () => {
    const log = {
      [at8('mon-e0')]: '180',
      [at8(testRepsId('mon-e0'))]: '3',
      [at8(testRpeId('mon-e0'))]: '8',
    }
    const { carry } = planNewBlock(DAYS, 8, rm, log)
    expect(Object.keys(carry).some((k) => k.includes(':reps'))).toBe(false)
    expect(Object.keys(carry).some((k) => k.includes(':rpe'))).toBe(false)
  })

  it('produces an empty plan from an empty log without throwing', () => {
    const plan = planNewBlock(DAYS, 8, rm, {})
    expect(plan.carry).toEqual({})
    expect(plan.rm).toEqual(rm)
  })

  it('only reads the week it is given', () => {
    const log = {
      [tmplDoneKey(7, 'mon-e1')]: '999', // last week's row — not week 8
      [at8('mon-e1')]: '120',
    }
    const { carry } = planNewBlock(DAYS, 8, rm, log)
    expect(carry[tmplDoneKey(1, 'mon-e1')]).toBe('120')
  })
})
