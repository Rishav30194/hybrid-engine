import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, reducer } from './reducer'

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

  it('stores logged accessory weights', () => {
    const s = reducer(INITIAL_STATE, { type: 'setLog', id: 'w1:t:d1e1', value: '95' })
    expect(s.log['w1:t:d1e1']).toBe('95')
  })

  it('hydrates the persisted slice from a remote blob', () => {
    const local = reducer(INITIAL_STATE, { type: 'setRm', lift: 'squat', value: '999' })
    const s = reducer(local, {
      type: 'hydrateRemote',
      data: {
        week: 6,
        rounding: 10,
        rm: { squat: 300, bench: 240, tbdl: 400, ohp: 150 },
        done: { 'w6:m:squat': true },
        log: { 'w6:t:d1e1': '135' },
      },
    })
    expect(s.week).toBe(6)
    expect(s.rounding).toBe(10)
    expect(s.rm.squat).toBe(300) // remote overwrites local edit
    expect(s.done['w6:m:squat']).toBe(true)
    expect(s.log['w6:t:d1e1']).toBe('135')
  })

  it('hydrateRemote leaves non-persisted UI state alone', () => {
    const withTab = reducer(INITIAL_STATE, { type: 'setTab', tab: 'template' })
    const s = reducer(withTab, { type: 'hydrateRemote', data: { week: 3 } })
    expect(s.tab).toBe('template')
    expect(s.week).toBe(3)
  })
})
