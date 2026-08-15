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
   **Turn "Confirm email" off** (Authentication → Sign In / Providers). The app
   signs in with a username, not a real address, so there is no inbox for a
   confirmation link to arrive in — leave it on and you can never confirm.

   The form takes a **username**. Supabase's email provider needs an
   email-shaped identifier, so `src/auth/username.ts` appends a fixed domain:
   type `rishavsingh`, and `rishavsingh@example.com` is what's stored. That
   domain is reserved by RFC 2606 and can never route anywhere real, so nothing
   is tied to a personal address. Typing a genuine email still works and is
   passed through untouched.

   **There is therefore no password recovery by email.** Reset it as project
   owner: Authentication → Users → pick the user → set a new password. Passwords
   are bcrypt-hashed, so they can't be read back from the database — only replaced.

4. **Grab your keys** — Project Settings → API:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `Publishable key` (`sb_publishable_…`) → `VITE_SUPABASE_PUBLISHABLE_KEY`
   (Both are safe in a client bundle; Row-Level Security protects the data.)

5. **(Optional) Realtime** — for live multi-device updates, enable Realtime for
   the `user_state` table under Database → Replication.

## Local development

```bash
cp .env.example .env.local
# paste your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Once configured, an account control appears in the header's top-right. It renders nothing when
Supabase isn't configured, so the header stays clean in localStorage-only mode.

## Deployed build (GitHub Pages)

The Actions build reads the same two vars from repo secrets. Add them under
**Settings → Secrets and variables → Actions → New repository secret**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Then re-run the **Deploy to GitHub Pages** workflow (or push any commit). Until
these are set, the deployed app simply runs on localStorage as before.

## How sync works

- State is the same JSON blob persisted locally, plus an `updatedAt` stamp.
- On sign-in the app reconciles by `updatedAt` — pulls the cloud row if it's
  newer, otherwise pushes local up (**last-write-wins**).
- Local changes debounce-push to the cloud; other devices' changes stream back
  in via realtime. Offline changes stay local and sync on reconnect.

Implementation details and the invariants involved:
[`ARCHITECTURE.md`](ARCHITECTURE.md#cloud-sync).
