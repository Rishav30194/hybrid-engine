import { clampWeek, INITIAL_STATE } from './reducer'
import type { AppState, PersistedState } from './types'

const STORAGE_KEY = 'hybridEngine.v1'

/** The persisted slice of state — never includes tab/timer/accordions/pillHidden. */
export function pickPersisted(state: AppState): PersistedState {
  const { week, rounding, rm, done, log } = state
  return { week, rounding, rm, done, log }
}

/** Merge a (possibly partial/untrusted) persisted blob onto the defaults. */
export function mergePersisted(saved: Partial<PersistedState> | null): AppState {
  if (!saved) return INITIAL_STATE
  return {
    ...INITIAL_STATE,
    week: clampWeek(saved.week || INITIAL_STATE.week),
    rounding: saved.rounding || INITIAL_STATE.rounding,
    rm: { ...INITIAL_STATE.rm, ...(saved.rm ?? {}) },
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

/** Write persisted content (a persistedSnapshot string) + its updatedAt stamp. */
export function writeSnapshot(contentJson: string, updatedAt: number): void {
  try {
    const content = JSON.parse(contentJson) as PersistedState
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...content, updatedAt }))
  } catch {
    /* storage unavailable or full — ignore */
  }
}

/** Convenience: write the persisted slice with a fresh timestamp. */
export function saveState(state: AppState): void {
  writeSnapshot(persistedSnapshot(state), Date.now())
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
  return mergePersisted(readBlob()?.persisted ?? null)
}
