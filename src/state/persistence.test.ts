import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadState,
  mergePersisted,
  persistedSnapshot,
  pickPersisted,
  writeSnapshot,
} from './persistence'
import { INITIAL_STATE } from './reducer'
import { getStorageState, setStorageState } from './storageStatus'
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
  setStorageState('ok')
})

describe('storage failure is reported, not swallowed', () => {
  it('flags a failed write so the UI can warn', () => {
    vi.stubGlobal('localStorage', {
      ...makeStorage(),
      setItem: () => {
        throw new DOMException('QuotaExceededError')
      },
    })
    writeSnapshot(persistedSnapshot(INITIAL_STATE), Date.now())
    expect(getStorageState()).toBe('failed')
  })

  it('does not throw when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      ...makeStorage(),
      setItem: () => {
        throw new Error('storage blocked')
      },
    })
    expect(() => writeSnapshot(persistedSnapshot(INITIAL_STATE), Date.now())).not.toThrow()
  })

  it('clears the flag once a write succeeds again', () => {
    setStorageState('failed')
    writeSnapshot(persistedSnapshot(INITIAL_STATE), Date.now())
    expect(getStorageState()).toBe('ok')
  })
})

describe('pickPersisted', () => {
  it('keeps only the persisted slice', () => {
    const picked = pickPersisted(INITIAL_STATE)
    expect(Object.keys(picked).sort()).toEqual([
      'done',
      'log',
      'rm',
      'rmAt',
      'rounding',
      'week',
    ])
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
  it('defaults rmAt to empty, so an old blob behaves exactly as before', () => {
    // Pre-feature blobs have no rmAt; every week must fall back to the live rm.
    expect(mergePersisted({ week: 3 }).rmAt).toEqual({})
  })
  it('carries frozen per-week 1RMs through', () => {
    const merged = mergePersisted({
      rmAt: { 1: { squat: 145, bench: 135, tbdl: 205, ohp: 95 } },
    })
    expect(merged.rmAt[1]?.squat).toBe(145)
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
      rmAt: { 1: { ...INITIAL_STATE.rm, squat: 145 } },
      done: { 'w4:m:squat': true },
      log: { 'w4:t:mon-e1': '95' },
    }
    // Mirrors what StoreProvider does on every persisted change.
    writeSnapshot(persistedSnapshot(state), Date.now())
    const reloaded = loadState()

    expect(reloaded.week).toBe(4)
    expect(reloaded.rounding).toBe(10)
    expect(reloaded.rm.squat).toBe(275)
    expect(reloaded.rmAt[1]?.squat).toBe(145)
    expect(reloaded.done['w4:m:squat']).toBe(true)
    expect(reloaded.log['w4:t:mon-e1']).toBe('95')
    // transient fields are NOT restored
    expect(reloaded.tab).toBe('week')
  })
})
