import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, reducer } from './reducer'
import type { AppState } from './types'

const T0 = 1_000_000 // fixed "now" for deterministic endAt math

function withTimer(patch: Partial<AppState['timer']>): AppState {
  return { ...INITIAL_STATE, timer: { ...INITIAL_STATE.timer, ...patch } }
}

describe('rest timer reducer', () => {
  it('starts a preset: sets duration/remaining/running/open and endAt', () => {
    const s = reducer(INITIAL_STATE, { type: 'timerStart', seconds: 120, now: T0 })
    expect(s.timer).toMatchObject({
      duration: 120,
      remaining: 120,
      running: true,
      open: true,
      endAt: T0 + 120_000,
    })
  })

  it('pauses a running timer: clears endAt, freezes remaining', () => {
    const running = withTimer({ running: true, remaining: 90, endAt: T0 + 90_000 })
    const s = reducer(running, { type: 'timerStartPause', now: T0 })
    expect(s.timer.running).toBe(false)
    expect(s.timer.endAt).toBeNull()
    expect(s.timer.remaining).toBe(90)
  })

  it('resumes from paused: recomputes endAt from the frozen remaining', () => {
    const paused = withTimer({ running: false, remaining: 45, duration: 90, endAt: null })
    const s = reducer(paused, { type: 'timerStartPause', now: T0 })
    expect(s.timer.running).toBe(true)
    expect(s.timer.endAt).toBe(T0 + 45_000)
  })

  it('start from a fresh timer uses the full duration', () => {
    const fresh = withTimer({ running: false, remaining: 90, duration: 90, endAt: null })
    const s = reducer(fresh, { type: 'timerStartPause', now: T0 })
    expect(s.timer.remaining).toBe(90)
    expect(s.timer.endAt).toBe(T0 + 90_000)
  })

  it('reset restores the duration and stops', () => {
    const running = withTimer({ running: true, remaining: 12, duration: 90, endAt: T0 })
    const s = reducer(running, { type: 'timerReset' })
    expect(s.timer).toMatchObject({ remaining: 90, running: false, endAt: null })
  })

  it('+15s bumps remaining (capped) and re-anchors endAt only while running', () => {
    const running = withTimer({ running: true, remaining: 30, endAt: T0 })
    const bumped = reducer(running, { type: 'timerAdd', seconds: 15, now: T0 })
    expect(bumped.timer.remaining).toBe(45)
    expect(bumped.timer.endAt).toBe(T0 + 45_000)

    const paused = withTimer({ running: false, remaining: 30, endAt: null })
    const s = reducer(paused, { type: 'timerAdd', seconds: 15, now: T0 })
    expect(s.timer.remaining).toBe(45)
    expect(s.timer.endAt).toBeNull()
  })

  it('caps remaining at 3599', () => {
    const running = withTimer({ running: true, remaining: 3595, endAt: T0 })
    const s = reducer(running, { type: 'timerAdd', seconds: 15, now: T0 })
    expect(s.timer.remaining).toBe(3599)
  })

  describe('tick', () => {
    it('recomputes remaining from endAt', () => {
      const running = withTimer({ running: true, remaining: 90, endAt: T0 + 90_000 })
      const s = reducer(running, { type: 'timerTick', now: T0 + 30_000 })
      expect(s.timer.remaining).toBe(60)
    })

    it('stops at zero when the deadline passes', () => {
      const running = withTimer({ running: true, remaining: 1, endAt: T0 + 500 })
      const s = reducer(running, { type: 'timerTick', now: T0 + 1000 })
      expect(s.timer).toMatchObject({ remaining: 0, running: false, endAt: null })
    })

    it('is a no-op when not running', () => {
      const paused = withTimer({ running: false, remaining: 45, endAt: null })
      expect(reducer(paused, { type: 'timerTick', now: T0 })).toBe(paused)
    })
  })
})
