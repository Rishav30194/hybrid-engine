import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../auth/context'
import { supabase } from '../lib/supabase'
import { useAppDispatch, useAppState } from '../state/context'
import { persistedSnapshot, readBlob, setNextUpdatedAt } from '../state/persistence'
import { fetchRemote, pushRemote, type RemoteBlob } from './syncClient'
import { setSyncStatus } from './syncStatus'

const PUSH_DEBOUNCE_MS = 800

/** Headless: reconciles local⇄cloud on sign-in and keeps devices in sync. */
export function SyncManager() {
  const { status, user } = useAuth()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const snapshot = persistedSnapshot(state)
  const ready = useRef(false)
  const userId = user?.id

  // Apply a remote blob if it's newer than what we have locally.
  const applyRemote = useCallback(
    (blob: RemoteBlob | undefined): boolean => {
      const localUpdatedAt = readBlob()?.updatedAt ?? 0
      if (blob && typeof blob.updatedAt === 'number' && blob.updatedAt > localUpdatedAt) {
        setNextUpdatedAt(blob.updatedAt)
        dispatch({ type: 'hydrateRemote', data: blob })
        return true
      }
      return false
    },
    [dispatch],
  )

  const pullRemote = useCallback(
    async (uid: string) => {
      const remote = await fetchRemote(uid)
      applyRemote(remote?.data)
    },
    [applyRemote],
  )

  const flushPush = useCallback((uid: string) => {
    const blob = readBlob()
    if (!blob) return
    setSyncStatus('syncing')
    void pushRemote(uid, blob.persisted, blob.updatedAt).then(({ error }) =>
      setSyncStatus(error ? 'error' : 'synced'),
    )
  }, [])

  // On sign-in: reconcile by updatedAt (pull if remote newer, else push local),
  // then keep pulling other devices' changes via realtime (if enabled).
  useEffect(() => {
    ready.current = false
    if (status !== 'signedIn' || !userId || !supabase) return
    const sb = supabase
    let cancelled = false

    void (async () => {
      setSyncStatus('syncing')
      const local = readBlob()
      const remote = await fetchRemote(userId)
      if (cancelled) return
      if (applyRemote(remote?.data)) {
        setSyncStatus('synced')
      } else if (local) {
        const { error } = await pushRemote(userId, local.persisted, local.updatedAt)
        if (!cancelled) setSyncStatus(error ? 'error' : 'synced')
      } else {
        setSyncStatus('synced')
      }
      if (!cancelled) ready.current = true
    })()

    const channel = sb
      .channel(`user_state:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_state', filter: `user_id=eq.${userId}` },
        (payload) => applyRemote((payload.new as { data?: RemoteBlob }).data),
      )
      .subscribe()

    return () => {
      cancelled = true
      sb.removeChannel(channel)
    }
  }, [status, userId, applyRemote])

  // Re-check the cloud when the tab regains focus/visibility (covers switching
  // back to an already-open device without realtime), and flush a push when the
  // tab is hidden so a change isn't lost if the app is closed before the debounce.
  useEffect(() => {
    if (status !== 'signedIn' || !userId || !supabase) return
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void pullRemote(userId)
      else flushPush(userId)
    }
    const onFocus = () => void pullRemote(userId)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
    }
  }, [status, userId, pullRemote, flushPush])

  // Debounced push of local changes, once the initial reconcile has settled.
  useEffect(() => {
    if (status !== 'signedIn' || !userId || !supabase || !ready.current) return
    const t = setTimeout(() => flushPush(userId), PUSH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [snapshot, status, userId, flushPush])

  return null
}
