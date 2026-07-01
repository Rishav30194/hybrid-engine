import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { AuthContext, type AuthStatus, type AuthValue } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'loading' : 'signedOut',
  )

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setStatus(data.session ? 'signedIn' : 'signedOut')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setStatus(next ? 'signedIn' : 'signedOut')
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      signIn: async (email, password) => {
        if (!supabase) return { error: 'Cloud sync is not configured.' }
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        return error ? { error: error.message } : {}
      },
      signUp: async (email, password) => {
        if (!supabase) return { error: 'Cloud sync is not configured.' }
        const { error } = await supabase.auth.signUp({ email, password })
        return error ? { error: error.message } : {}
      },
      signOut: async () => {
        await supabase?.auth.signOut()
      },
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
