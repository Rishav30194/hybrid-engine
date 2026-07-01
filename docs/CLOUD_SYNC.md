# Cloud Sync (optional)

The app works fully on localStorage with no account. Cloud sync is **opt-in**:
it activates only when Supabase credentials are present, adding a durable backup
and cross-device sync of your training state. Sign-in is optional — the app
stays offline-first either way.

## One-time setup

1. **Create a Supabase project** (free) at https://supabase.com.

2. **Create the table + policies** — open the project's **SQL Editor**, paste
   the contents of [`supabase/schema.sql`](../supabase/schema.sql), and Run.

3. **Auth settings** — Authentication → Providers → Email is on by default.
   For a single user you may turn **"Confirm email"** off (Authentication →
   Sign In / Providers) so sign-up logs you straight in; otherwise confirm via
   the email link before signing in.

4. **Grab your keys** — Project Settings → API:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
   (Both are safe in a client bundle; Row-Level Security protects the data.)

5. **(Optional) Realtime** — for live multi-device updates, enable Realtime for
   the `user_state` table under Database → Replication.

## Local development

```bash
cp .env.example .env.local
# paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

The "Cloud Sync" card appears at the bottom of each tab once configured.

## Deployed build (GitHub Pages)

The Actions build reads the same two vars from repo secrets. Add them under
**Settings → Secrets and variables → Actions → New repository secret**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then re-run the **Deploy to GitHub Pages** workflow (or push any commit). Until
these are set, the deployed app simply runs on localStorage as before.

## How sync works

- State is the same JSON blob persisted locally, plus an `updatedAt` stamp.
- On sign-in the app reconciles by `updatedAt` — pulls the cloud row if it's
  newer, otherwise pushes local up (**last-write-wins**).
- Local changes debounce-push to the cloud; other devices' changes stream back
  in via realtime. Offline changes stay local and sync on reconnect.
