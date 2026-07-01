import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

export interface AuthValue {
  session: Session | null
  user: User | null
  status: AuthStatus
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const notConfigured = async () => ({ error: 'Cloud sync is not configured.' })

export const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  status: 'signedOut',
  signIn: notConfigured,
  signUp: notConfigured,
  signOut: async () => {},
})

export function useAuth(): AuthValue {
  return useContext(AuthContext)
}
