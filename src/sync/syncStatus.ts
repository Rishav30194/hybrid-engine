/** A tiny external store so the headless SyncManager can report real sync state
 *  to the Account card without threading it through React context. */

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

interface Status {
  state: SyncState
  lastSyncedAt: number | null
}

let status: Status = { state: 'idle', lastSyncedAt: null }
const listeners = new Set<() => void>()

export function getSyncStatus(): Status {
  return status
}

export function subscribeSyncStatus(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function setSyncStatus(state: SyncState): void {
  status = {
    state,
    lastSyncedAt: state === 'synced' ? Date.now() : status.lastSyncedAt,
  }
  listeners.forEach((l) => l())
}
