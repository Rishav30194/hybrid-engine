import { supabase } from '../lib/supabase'
import type { PersistedState } from '../state/types'

/** The JSON blob stored in user_state.data. */
export interface RemoteBlob extends Partial<PersistedState> {
  updatedAt: number
}

/** Fetch the user's remote state row, if any. */
export async function fetchRemote(
  userId: string,
): Promise<{ data: RemoteBlob; updatedAt: number } | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_state')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null

  const blob = (data.data ?? {}) as RemoteBlob
  const updatedAt =
    typeof blob.updatedAt === 'number'
      ? blob.updatedAt
      : Date.parse(data.updated_at as string) || 0
  return { data: blob, updatedAt }
}

/** Upsert the user's state row (last-write-wins by updatedAt). */
export async function pushRemote(
  userId: string,
  persisted: Partial<PersistedState>,
  updatedAt: number,
): Promise<{ error?: string }> {
  if (!supabase) return {}
  const { error } = await supabase.from('user_state').upsert({
    user_id: userId,
    data: { ...persisted, updatedAt },
    updated_at: new Date(updatedAt).toISOString(),
  })
  return error ? { error: error.message } : {}
}
