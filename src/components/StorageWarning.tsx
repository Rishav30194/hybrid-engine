import './StorageWarning.css'
import { useSyncExternalStore } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { getStorageState, subscribeStorageState } from '../state/storageStatus'

/**
 * Shown only once a localStorage write has actually failed. Sits between the
 * header and the scroll container so it can't be scrolled away — a silent
 * failure here means the session isn't being recorded at all.
 */
export function StorageWarning() {
  const state = useSyncExternalStore(subscribeStorageState, getStorageState)
  if (state === 'ok') return null

  return (
    <div className="storage-warn" role="alert">
      <span className="storage-warn__icon" aria-hidden>
        ⚠
      </span>
      <span className="storage-warn__text">
        <strong>Not saving.</strong> Storage is full or blocked — this session
        won&rsquo;t survive a reload.
        {isSupabaseConfigured
          ? ' Sign in to back up to the cloud.'
          : ' Free up space on your device.'}
      </span>
    </div>
  )
}
