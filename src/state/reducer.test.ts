import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, reducer } from './reducer'

describe('reducer', () => {
  it('sets the active week', () => {
    expect(reducer(INITIAL_STATE, { type: 'setWeek', week: 5 }).week).toBe(5)
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
})
