import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Cloud sync is opt-in: it only activates when both env vars are present.
 * With them missing (e.g. before secrets are configured), the app runs exactly
 * as before on localStorage alone.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/** The single row shape in public.user_state. */
export interface UserStateRow {
  user_id: string
  data: Record<string, unknown>
  updated_at: string
}
