import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Supabase publishable key (sb_publishable_…).
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/**
 * Cloud sync is opt-in: it only activates when both env vars are present.
 * With them missing (e.g. before secrets are configured), the app runs exactly
 * as before on localStorage alone.
 */
export const isSupabaseConfigured = Boolean(url && key)

let client: Promise<SupabaseClient> | null = null

/**
 * The Supabase client, loaded on first use. The import is dynamic so
 * supabase-js lands in its own chunk instead of the initial bundle — the app is
 * offline-first and paints from localStorage without it. Returns null when
 * cloud sync isn't configured. The promise is cached, so there's one client.
 */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!isSupabaseConfigured) return null
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true },
    }),
  )
  return client
}
