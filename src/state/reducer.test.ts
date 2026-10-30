import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, reducer } from './reducer'
import type { AppState } from './types'

describe('reducer', () => {
  it('sets the active week', () => {
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 5 }).week).toBe(5)
  })

  it('clamps out-of-range weeks so WEEKS[week-1] is always valid', () => {
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 12 }).week).toBe(12)
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 13 }).week).toBe(12)
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 99 }).week).toBe(12)
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 0 }).week).toBe(1)
    expect(reducer(INITIAL_STATE, { type: 'hydrateRemote', data: { week: 42 } }).week).toBe(12)
  })

  it('toggles a done flag on and off', () => {
    const on = reducer(INITIAL_STATE, { type: 'toggleDone', id: 'w1:m:squat' })
    expect(on.done['w1:m:squat']).toBe(true)
    const off = reducer(on, { type: 'toggleDone', id: 'w1:m:squat' })
    expect(off.done['w1:m:squat']).toBe(false)
  })

  it('toggles template days independently', () => {
    expect(reducer(INITIAL_STATE, { type: 'toggleDay', day: 1 }).openDay).toBe(0) // Day 1 open by default → closes
    expect(reducer(INITIAL_STATE, { type: 'toggleDay', day: 3 }).openDay).toBe(3)
  })

  it('stores logged accessory weights', () => {
    const s = reducer(INITIAL_STATE, { type: 'setLog', id: 'w1:t:mon-e1', value: '95' })
    expect(s.log['w1:t:mon-e1']).toBe('95')
  })

  it('hydrates the persisted slice from a remote blob', () => {
    const local: AppState = { ...INITIAL_STATE, rm: { ...INITIAL_STATE.rm, squat: 999 } }
    const s = reducer(local, {
      type: 'hydrateRemote',
      data: {
        week: 6,
        rounding: 10,
        rm: { squat: 300, bench: 240, tbdl: 400, ohp: 150 },
        basisAt: { 1: { rm: { squat: 145, bench: 135, tbdl: 205, ohp: 95 }, rounding: 5 } },
        done: { 'w6:m:squat': true },
        log: { 'w6:t:mon-e1': '135', 'w6:t:mon-e1:reps': '10' },
      },
    })
    expect(s.basisAt[1]?.rm.squat).toBe(145)
    expect(s.week).toBe(6)
    expect(s.rounding).toBe(10)
    expect(s.rm.squat).toBe(300) // remote overwrites local edit
    expect(s.done['w6:m:squat']).toBe(true)
    expect(s.log['w6:t:mon-e1']).toBe('135')
    expect(s.log['w6:t:mon-e1:reps']).toBe('10')
  })

  it('hydrateRemote leaves non-persisted UI state alone', () => {
    const withTab = reducer(INITIAL_STATE, { type: 'setTab', tab: 'template' })
    const s = reducer(withTab, { type: 'hydrateRemote', data: { week: 3 } })
    expect(s.tab).toBe('template')
    expect(s.week).toBe(3)
  })
})

describe('startNewBlock', () => {
  it('resets to week 1 and keeps only the carried weights', () => {
    const started: AppState = {
      ...INITIAL_STATE,
      week: 8,
      openDay: 3,
      done: { 'w8:t:mon-e0': true, 'w1:tc:mon': true },
      log: { 'w8:t:mon-e1': '120', 'w3:t:mon-e1': '110' },
    }
    const s = reducer(started, {
      type: 'startNewBlock',
      carry: { 'w1:t:mon-e1': '120' },
    })

    expect(s.week).toBe(1)
    expect(s.rm).toEqual(INITIAL_STATE.rm) // unread, so left as it was
    expect(s.done).toEqual({})
    expect(s.log).toEqual({ 'w1:t:mon-e1': '120' })
    expect(s.openDay).toBe(1)
  })

  it('leaves the timer and tab alone', () => {
    const s = reducer(
      { ...INITIAL_STATE, tab: 'template' },
      { type: 'startNewBlock', carry: {} },
    )
    expect(s.tab).toBe('template')
    expect(s.timer).toEqual(INITIAL_STATE.timer)
  })
})
