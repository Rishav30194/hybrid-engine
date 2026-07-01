import { INITIAL_STATE } from './reducer'
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
    week: saved.week || INITIAL_STATE.week,
    rounding: saved.rounding || INITIAL_STATE.rounding,
    rm: { ...INITIAL_STATE.rm, ...(saved.rm ?? {}) },
    done: saved.done ?? {},
    log: saved.log ?? {},
  }
}

/** Read + hydrate persisted state; falls back to defaults on any error. */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return mergePersisted(raw ? (JSON.parse(raw) as Partial<PersistedState>) : null)
  } catch {
    return INITIAL_STATE
  }
}

/** Serialized persisted slice — used as a stable effect dependency. */
export function persistedSnapshot(state: AppState): string {
  return JSON.stringify(pickPersisted(state))
}

/** Write an already-serialized snapshot; swallows quota/availability errors. */
export function writeSnapshot(json: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, json)
  } catch {
    /* storage unavailable or full — ignore */
  }
}

/** Write the persisted slice; swallows quota/availability errors. */
export function saveState(state: AppState): void {
  writeSnapshot(persistedSnapshot(state))
}
