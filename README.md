# Hybrid Engine

Mobile-first PWA for a single athlete running a fixed 8-week hybrid (strength + endurance)
training program — **three sessions a week (Mon / Wed / Fri), around 45 minutes each** (Monday
runs longer; see `docs/PROGRAM_SOURCE.md`).

Enter your four 1-rep maxes once, pick the current week (1–8), and every working load
recalculates automatically. Everything persists locally; signing in adds optional cloud backup
and cross-device sync.

| Tab | What it's for |
|---|---|
| **This Week** | The 1RM editor — the input every load derives from — and block progress: how much of each of the 8 weeks you've completed |
| **8-Week Plan** | The whole block at a glance, load tiles per week, and how to progress |
| **Template** | The session itself — exercises in order, check-offs, and logged accessory weights |

Plus a floating rest timer, anchored to a timestamp so it survives the phone sleeping.

**Closing a block:** week 8 replaces its working sets with one all-out AMRAP at 90%. Log the
weight, reps and RPE, tap **Start new block**, and the app estimates your new 1RMs, carries your
accessory weights into week 1, and resets everything else.

**Live:** <https://rishav30194.github.io/hybrid-engine/> — auto-deploys on every push to `main`.

## Install on iPhone

Open the live URL in Safari, then **Share → Add to Home Screen** for a standalone,
offline-capable install. This also makes local storage considerably more durable — see
[Durability](docs/ARCHITECTURE.md#durability).

## Stack

React + Vite + TypeScript. PWA via `vite-plugin-pwa`. Vitest for tests, oxlint for linting.
No router, no UI framework, no state library — one `useReducer` store.

## Develop

```bash
npm install
npm run dev        # start dev server
npm run build      # type-check + production build (also emits the PWA service worker)
npm run preview    # preview the production build
npm test           # run the Vitest suite
npm run lint       # oxlint
npm run gen-icons  # regenerate PWA icons from public/icon.svg
```

The app targets iPhone Safari in portrait — develop at **390px wide**.

## Cloud sync (optional)

Sign-in and cross-device sync via Supabase are opt-in and off by default; with the env vars
unset the app runs entirely on localStorage. To enable it, see
[`docs/CLOUD_SYNC.md`](docs/CLOUD_SYNC.md).

## Documentation

| Doc | Covers |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How it's built, and the invariants that must not break |
| [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) | Rules for changing it — mobile, CSS, placement, testing |
| [`docs/PROGRAM_SOURCE.md`](docs/PROGRAM_SOURCE.md) | Why the training program is shaped the way it is |
| [`docs/CLOUD_SYNC.md`](docs/CLOUD_SYNC.md) | Supabase setup for optional sync |
| [`CLAUDE.md`](CLAUDE.md) | Working agreement for AI-assisted changes |
