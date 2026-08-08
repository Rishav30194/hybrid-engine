import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { AuthContext, type AuthStatus, type AuthValue } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'loading' : 'signedOut',
  )

  useEffect(() => {
    const pending = getSupabase()
    if (!pending) return
    let active = true
    let unsubscribe: (() => void) | undefined

    void pending.then((sb) => {
      if (!active) return

      void sb.auth.getSession().then(({ data }) => {
        if (!active) return
        setSession(data.session)
        setStatus(data.session ? 'signedIn' : 'signedOut')
      })

      const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
        setSession(next)
        setStatus(next ? 'signedIn' : 'signedOut')
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      signIn: async (email, password) => {
        const sb = await getSupabase()
        if (!sb) return { error: 'Cloud sync is not configured.' }
        const { error } = await sb.auth.signInWithPassword({ email, password })
        return error ? { error: error.message } : {}
      },
      signUp: async (email, password) => {
        const sb = await getSupabase()
        if (!sb) return { error: 'Cloud sync is not configured.' }
        const { error } = await sb.auth.signUp({ email, password })
        return error ? { error: error.message } : {}
      },
      signOut: async () => {
        const sb = await getSupabase()
        await sb?.auth.signOut()
      },
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
