import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, reducer } from './reducer'
import type { AppState } from './types'

describe('reducer', () => {
  it('sets the active week', () => {
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 5 }).week).toBe(5)
  })

  it('clamps out-of-range weeks so WEEKS[week-1] is always valid', () => {
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 99 }).week).toBe(8)
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 0 }).week).toBe(1)
    expect(reducer(INITIAL_STATE, { type: 'hydrateRemote', data: { week: 42 } }).week).toBe(8)
  })

  it('coerces rounding and defaults falsy to 1', () => {
    expect(reducer(INITIAL_STATE, { type: 'setRounding', rounding: '2.5' }).rounding).toBe(2.5)
    expect(reducer(INITIAL_STATE, { type: 'setRounding', rounding: 0 }).rounding).toBe(1)
    expect(reducer(INITIAL_STATE, { type: 'setRounding', rounding: '' }).rounding).toBe(1)
  })

  it('parses 1RM edits but keeps an empty string blank', () => {
    expect(reducer(INITIAL_STATE, { type: 'setRm', lift: 'squat', value: '250' }).rm.squat).toBe(250)
    expect(reducer(INITIAL_STATE, { type: 'setRm', lift: 'squat', value: '' }).rm.squat).toBe('')
  })

  it('toggles a done flag on and off', () => {
    const on = reducer(INITIAL_STATE, { type: 'toggleDone', id: 'w1:m:squat' })
    expect(on.done['w1:m:squat']).toBe(true)
    const off = reducer(on, { type: 'toggleDone', id: 'w1:m:squat' })
    expect(off.done['w1:m:squat']).toBe(false)
  })

  it('opens one 8-Week card at a time', () => {
    const open3 = reducer(INITIAL_STATE, { type: 'toggleWeek', week: 3 })
    expect(open3.openWeek).toBe(3)
    expect(reducer(open3, { type: 'toggleWeek', week: 5 }).openWeek).toBe(5) // switch
    expect(reducer(open3, { type: 'toggleWeek', week: 3 }).openWeek).toBe(0) // close
  })

  it('toggles template days independently', () => {
    expect(reducer(INITIAL_STATE, { type: 'toggleDay', day: 1 }).openDay).toBe(0) // Day 1 open by default → closes
    expect(reducer(INITIAL_STATE, { type: 'toggleDay', day: 3 }).openDay).toBe(3)
  })

  describe('per-week 1RM', () => {
    const atWeek = (week: number): AppState => ({ ...INITIAL_STATE, week })

    it('freezes every earlier week when a 1RM changes', () => {
      // His case: week 1 trained at 145, week 2 goes up. Week 1 must not move.
      const s = reducer(atWeek(2), { type: 'setRm', lift: 'squat', value: 190 })
      expect(s.rm.squat).toBe(190)
      expect(s.rmAt[1]?.squat).toBe(INITIAL_STATE.rm.squat)
      expect(s.rmAt[2]).toBeUndefined() // the active week still follows rm
    })

    it('leaves an already-frozen week at its original value', () => {
      const first = reducer(atWeek(2), { type: 'setRm', lift: 'squat', value: 190 })
      const later = reducer({ ...first, week: 3 }, {
        type: 'setRm',
        lift: 'squat',
        value: 205,
      })
      expect(later.rmAt[1]?.squat).toBe(INITIAL_STATE.rm.squat) // untouched
      expect(later.rmAt[2]?.squat).toBe(190) // frozen at what week 2 ran on
      expect(later.rm.squat).toBe(205)
    })

    it('freezes nothing while week 1 is active', () => {
      const s = reducer(INITIAL_STATE, { type: 'setRm', lift: 'squat', value: 190 })
      expect(s.rmAt).toEqual({})
    })

    it('edits one past week without touching the live 1RM or its siblings', () => {
      const frozen = reducer(atWeek(3), { type: 'setRm', lift: 'squat', value: 205 })
      const s = reducer(frozen, { type: 'setRmAt', week: 1, lift: 'squat', value: 145 })
      expect(s.rmAt[1]?.squat).toBe(145)
      expect(s.rmAt[1]?.bench).toBe(INITIAL_STATE.rm.bench) // seeded, not blanked
      expect(s.rmAt[2]?.squat).toBe(INITIAL_STATE.rm.squat) // sibling untouched
      expect(s.rm.squat).toBe(205) // live 1RM untouched
    })

    it('seeds an unfrozen week from the live 1RM before editing it', () => {
      const s = reducer(atWeek(3), { type: 'setRmAt', week: 2, lift: 'squat', value: 160 })
      expect(s.rmAt[2]?.squat).toBe(160)
      expect(s.rmAt[2]?.tbdl).toBe(INITIAL_STATE.rm.tbdl)
    })

    it('keeps a blank edit blank so the field can be cleared', () => {
      const s = reducer(atWeek(2), { type: 'setRmAt', week: 1, lift: 'squat', value: '' })
      expect(s.rmAt[1]?.squat).toBe('')
    })

    it('clears the frozen weeks when a new block starts', () => {
      const frozen = reducer(atWeek(8), { type: 'setRm', lift: 'squat', value: 205 })
      const s = reducer(frozen, { type: 'startNewBlock', rm: INITIAL_STATE.rm, carry: {} })
      expect(s.rmAt).toEqual({})
    })
  })

  it('stores logged accessory weights', () => {
    const s = reducer(INITIAL_STATE, { type: 'setLog', id: 'w1:t:mon-e1', value: '95' })
    expect(s.log['w1:t:mon-e1']).toBe('95')
  })

  it('hydrates the persisted slice from a remote blob', () => {
    const local = reducer(INITIAL_STATE, { type: 'setRm', lift: 'squat', value: '999' })
    const s = reducer(local, {
      type: 'hydrateRemote',
      data: {
        week: 6,
        rounding: 10,
        rm: { squat: 300, bench: 240, tbdl: 400, ohp: 150 },
        rmAt: { 1: { squat: 145, bench: 135, tbdl: 205, ohp: 95 } },
        done: { 'w6:m:squat': true },
        log: { 'w6:t:mon-e1': '135' },
      },
    })
    expect(s.rmAt[1]?.squat).toBe(145)
    expect(s.week).toBe(6)
    expect(s.rounding).toBe(10)
    expect(s.rm.squat).toBe(300) // remote overwrites local edit
    expect(s.done['w6:m:squat']).toBe(true)
    expect(s.log['w6:t:mon-e1']).toBe('135')
  })

  it('hydrateRemote leaves non-persisted UI state alone', () => {
    const withTab = reducer(INITIAL_STATE, { type: 'setTab', tab: 'template' })
    const s = reducer(withTab, { type: 'hydrateRemote', data: { week: 3 } })
    expect(s.tab).toBe('template')
    expect(s.week).toBe(3)
  })
})

describe('startNewBlock', () => {
  it('resets to week 1, sets the new 1RMs, keeps only the carried weights', () => {
    const started: AppState = {
      ...INITIAL_STATE,
      week: 8,
      openWeek: 8,
      openDay: 3,
      done: { 'w8:t:mon-e0': true, 'w1:tc:mon': true },
      log: { 'w8:t:mon-e1': '120', 'w3:t:mon-e1': '110' },
    }
    const s = reducer(started, {
      type: 'startNewBlock',
      rm: { squat: 209, bench: 230, tbdl: 380, ohp: 140 },
      carry: { 'w1:t:mon-e1': '120' },
    })

    expect(s.week).toBe(1)
    expect(s.rm.squat).toBe(209)
    expect(s.done).toEqual({})
    expect(s.log).toEqual({ 'w1:t:mon-e1': '120' })
    expect(s.openDay).toBe(1)
  })

  it('leaves the timer and tab alone', () => {
    const s = reducer(
      { ...INITIAL_STATE, tab: 'template' },
      { type: 'startNewBlock', rm: INITIAL_STATE.rm, carry: {} },
    )
    expect(s.tab).toBe('template')
    expect(s.timer).toEqual(INITIAL_STATE.timer)
  })
})
