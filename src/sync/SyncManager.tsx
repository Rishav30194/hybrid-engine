import { useEffect, useRef } from 'react'
import { useAuth } from '../auth/context'
import { supabase } from '../lib/supabase'
import { useAppDispatch, useAppState } from '../state/context'
import { persistedSnapshot, readBlob, setNextUpdatedAt } from '../state/persistence'
import { fetchRemote, pushRemote, type RemoteBlob } from './syncClient'

const PUSH_DEBOUNCE_MS = 800

/** Headless: reconciles local⇄cloud on sign-in and syncs changes while signed in. */
export function SyncManager() {
  const { status, user } = useAuth()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const snapshot = persistedSnapshot(state)
  const ready = useRef(false)
  const userId = user?.id

  // On sign-in: reconcile by updatedAt (pull if remote newer, else push local),
  // then keep pulling remote changes from other devices via realtime.
  useEffect(() => {
    ready.current = false
    if (status !== 'signedIn' || !userId || !supabase) return
    const sb = supabase
    let cancelled = false

    const pullIfNewer = (blob: RemoteBlob | undefined) => {
      const localUpdatedAt = readBlob()?.updatedAt ?? 0
      if (blob && typeof blob.updatedAt === 'number' && blob.updatedAt > localUpdatedAt) {
        setNextUpdatedAt(blob.updatedAt)
        dispatch({ type: 'hydrateRemote', data: blob })
        return true
      }
      return false
    }

    void (async () => {
      const local = readBlob()
      const remote = await fetchRemote(userId)
      if (cancelled) return
      if (!pullIfNewer(remote?.data) && local) {
        await pushRemote(userId, local.persisted, local.updatedAt)
      }
      if (!cancelled) ready.current = true
    })()

    const channel = sb
      .channel(`user_state:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_state', filter: `user_id=eq.${userId}` },
        (payload) => pullIfNewer((payload.new as { data?: RemoteBlob }).data),
      )
      .subscribe()

    return () => {
      cancelled = true
      sb.removeChannel(channel)
    }
  }, [status, userId, dispatch])

  // Debounced push of local changes, once the initial reconcile has settled.
  useEffect(() => {
    if (status !== 'signedIn' || !userId || !supabase || !ready.current) return
    const t = setTimeout(() => {
      const blob = readBlob()
      if (blob) void pushRemote(userId, blob.persisted, blob.updatedAt)
    }, PUSH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [snapshot, status, userId])

  return null
}
