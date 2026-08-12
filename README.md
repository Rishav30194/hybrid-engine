# Hybrid Engine

Mobile-first PWA for a single athlete running a fixed 8-week hybrid (strength + endurance)
training program — **three sessions a week (Mon / Wed / Fri), 45 minutes each**.

Enter your four 1-rep maxes once, pick the current week (1–8), and every working load
recalculates automatically. Three tabs — **This Week**, **8-Week Plan**, **Template** — plus a
floating rest timer and per-day check-off. Everything persists locally; signing in adds optional
cloud backup and cross-device sync.

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
