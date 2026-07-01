import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Prefer the new publishable key (sb_publishable_…); fall back to the legacy
// anon key name for backward compatibility.
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

/**
 * Cloud sync is opt-in: it only activates when both env vars are present.
 * With them missing (e.g. before secrets are configured), the app runs exactly
 * as before on localStorage alone.
 */
export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/** The single row shape in public.user_state. */
export interface UserStateRow {
  user_id: string
  data: Record<string, unknown>
  updated_at: string
}
