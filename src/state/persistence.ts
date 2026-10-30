import { clampWeek, INITIAL_STATE } from './reducer'
import { setStorageState } from './storageStatus'
import type { AppState, PersistedState } from './types'

const STORAGE_KEY = 'hybridEngine.v1'

/** The persisted slice of state — never includes tab/timer/accordions/pillHidden. */
export function pickPersisted(state: AppState): PersistedState {
  const { week, rounding, rm, basisAt, done, log } = state
  return { week, rounding, rm, basisAt, done, log }
}

/** Merge a (possibly partial/untrusted) persisted blob onto the defaults. */
export function mergePersisted(saved: Partial<PersistedState> | null): AppState {
  if (!saved) return INITIAL_STATE
  return {
    ...INITIAL_STATE,
    week: clampWeek(saved.week || INITIAL_STATE.week),
    rounding: saved.rounding || INITIAL_STATE.rounding,
    rm: { ...INITIAL_STATE.rm, ...(saved.rm ?? {}) },
    basisAt: saved.basisAt ?? {},
    done: saved.done ?? {},
    log: saved.log ?? {},
  }
}

/** Serialized persisted content (no updatedAt) — used as a stable effect dependency. */
export function persistedSnapshot(state: AppState): string {
  return JSON.stringify(pickPersisted(state))
}

/**
 * `updatedAt` (ms) is stored alongside the persisted content for last-write-wins
 * sync, but lives outside AppState/the reducer. Normal local writes stamp
 * Date.now(); a remote hydrate stamps the remote time via setNextUpdatedAt so the
 * pulled data doesn't look "newer" than its source.
 */
let overrideUpdatedAt: number | null = null

export function setNextUpdatedAt(ts: number): void {
  overrideUpdatedAt = ts
}

export function consumeUpdatedAt(): number {
  const ts = overrideUpdatedAt ?? Date.now()
  overrideUpdatedAt = null
  return ts
}

/**
 * The newest snapshot and its stamp, kept in memory whether or not the
 * localStorage write landed. Sync reads this rather than localStorage: when the
 * store is full or blocked, localStorage still holds the last write that
 * succeeded, and pushing or comparing against that would send stale data to the
 * cloud — the one backup left.
 */
let latest: { snapshot: string; updatedAt: number } | null = null

/** The in-memory truth for sync: the persisted slice, its stamp, and its snapshot. */
export function currentBlob(): {
  persisted: Partial<PersistedState>
  updatedAt: number
  snapshot: string
} | null {
  if (!latest) return null
  return {
    persisted: JSON.parse(latest.snapshot) as PersistedState,
    updatedAt: latest.updatedAt,
    snapshot: latest.snapshot,
  }
}

/** Write persisted content (a persistedSnapshot string) + its updatedAt stamp. */
export function writeSnapshot(contentJson: string, updatedAt: number): void {
  latest = { snapshot: contentJson, updatedAt }
  try {
    const content = JSON.parse(contentJson) as PersistedState
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...content, updatedAt }))
    setStorageState('ok')
  } catch {
    // Storage full, blocked, or evicted. Never throw — that would break the app
    // mid-set — but never fail silently either: the write did not land, and the
    // athlete needs to know before they trust the tick they just tapped.
    setStorageState('failed')
  }
}

/** Read the stored blob split into its persisted slice and updatedAt stamp. */
export function readBlob(): { persisted: Partial<PersistedState>; updatedAt: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { updatedAt, ...persisted } = JSON.parse(raw) as Partial<PersistedState> & {
      updatedAt?: number
    }
    return { persisted, updatedAt: updatedAt ?? 0 }
  } catch {
    return null
  }
}

/** Read + hydrate persisted state; falls back to defaults on any error. */
export function loadState(): AppState {
  const blob = readBlob()
  const state = mergePersisted(blob?.persisted ?? null)
  // Seed the in-memory truth with what was actually loaded, so sync compares
  // against this device's real stamp before the first write.
  latest = blob ? { snapshot: persistedSnapshot(state), updatedAt: blob.updatedAt } : null
  return state
}
