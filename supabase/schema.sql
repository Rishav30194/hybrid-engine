-- Hybrid Engine — cloud sync schema.
-- Run this once in your Supabase project: SQL Editor → paste → Run.
--
-- One row per user holds the same JSON blob the app persists locally
-- ({ week, rounding, rm, done, log, updatedAt }). Row-Level Security ensures
-- each user can only read/write their own row.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- Each authenticated user may only touch the row keyed by their own uid.
create policy "read own state"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "insert own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "update own state"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
