import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadState,
  mergePersisted,
  persistedSnapshot,
  pickPersisted,
  writeSnapshot,
} from './persistence'
import { INITIAL_STATE } from './reducer'
import type { AppState } from './types'

/** Minimal in-memory localStorage stub so we can test the round-trip in Node. */
function makeStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeStorage())
})

describe('pickPersisted', () => {
  it('keeps only the persisted slice', () => {
    const picked = pickPersisted(INITIAL_STATE)
    expect(Object.keys(picked).sort()).toEqual(['done', 'log', 'rm', 'rounding', 'week'])
  })
})

describe('mergePersisted', () => {
  it('returns defaults for a null blob', () => {
    expect(mergePersisted(null)).toEqual(INITIAL_STATE)
  })
  it('carries check-offs and logged weights through untouched', () => {
    const merged = mergePersisted({
      done: { 'w1:c:mon': true, 'w1:m:squat': true, 'w1:t:mon-e1': true },
      log: { 'w1:t:mon-e1': '95' },
    })
    expect(Object.keys(merged.done).sort()).toEqual([
      'w1:c:mon',
      'w1:m:squat',
      'w1:t:mon-e1',
    ])
    expect(merged.log).toEqual({ 'w1:t:mon-e1': '95' })
  })
  it('merges saved rm over defaults and keeps non-persisted defaults', () => {
    const merged = mergePersisted({ week: 6, rm: { squat: 300 } as AppState['rm'] })
    expect(merged.week).toBe(6)
    expect(merged.rm.squat).toBe(300)
    expect(merged.rm.bench).toBe(INITIAL_STATE.rm.bench) // untouched default
    expect(merged.tab).toBe('week') // never persisted
    expect(merged.openDay).toBe(1) // never persisted
  })
})

describe('round-trip', () => {
  it('reproduces the persisted slice across a reload', () => {
    const state: AppState = {
      ...INITIAL_STATE,
      tab: 'template',
      week: 4,
      rounding: 10,
      rm: { ...INITIAL_STATE.rm, squat: 275 },
      done: { 'w4:m:squat': true },
      log: { 'w4:t:mon-e1': '95' },
    }
    // Mirrors what StoreProvider does on every persisted change.
    writeSnapshot(persistedSnapshot(state), Date.now())
    const reloaded = loadState()

    expect(reloaded.week).toBe(4)
    expect(reloaded.rounding).toBe(10)
    expect(reloaded.rm.squat).toBe(275)
    expect(reloaded.done['w4:m:squat']).toBe(true)
    expect(reloaded.log['w4:t:mon-e1']).toBe('95')
    // transient fields are NOT restored
    expect(reloaded.tab).toBe('week')
  })
})
