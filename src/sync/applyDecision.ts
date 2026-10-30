import { persistedSnapshot } from '../state/persistence'
import { reducer } from '../state/reducer'
import type { AppState } from '../state/types'
import type { RemoteBlob } from './syncClient'

/**
 * What to do with a blob from the cloud, given this device's state and stamp.
 *
 * - `ignore`: not newer than what this device has.
 * - `stamp`: newer, but hydrating it changes no state. The store would never
 *   write, so a stamp set aside for that write would leak into the next local
 *   edit and back-date it behind the cloud; adopt the stamp directly instead.
 * - `hydrate`: newer, with different content.
 */
export function applyDecision(
  state: AppState,
  localUpdatedAt: number,
  blob: RemoteBlob | undefined,
): 'ignore' | 'stamp' | 'hydrate' {
  if (!blob || typeof blob.updatedAt !== 'number' || blob.updatedAt <= localUpdatedAt) {
    return 'ignore'
  }
  const next = reducer(state, { type: 'hydrateRemote', data: blob })
  return persistedSnapshot(next) === persistedSnapshot(state) ? 'stamp' : 'hydrate'
}
