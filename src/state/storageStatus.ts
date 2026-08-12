/**
 * Whether the last localStorage write actually landed.
 *
 * `writeSnapshot` has to swallow its exception — a throwing setItem must not
 * take the app down mid-set — but swallowing it silently is worse: check-offs
 * and logged weights appear to save and are gone on reload. This store lets the
 * failure reach the screen. Same shape as `sync/syncStatus`, and deliberately
 * outside `AppState` so a storage failure can't itself become persisted state.
 */

export type StorageState = 'ok' | 'failed'

let state: StorageState = 'ok'
const listeners = new Set<() => void>()

export function getStorageState(): StorageState {
  return state
}

export function subscribeStorageState(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function setStorageState(next: StorageState): void {
  if (next === state) return // no-op keeps every successful write from re-rendering
  state = next
  listeners.forEach((l) => l())
}
