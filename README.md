# Hybrid Engine

Mobile-first PWA for a single athlete running a fixed 8-week hybrid (strength + endurance)
training program. Enter your four 1-rep maxes once, pick the current week (1–8), and every
working load recalculates automatically. Three tabs — **This Week**, **8-Week Plan**,
**Template** — plus a floating rest timer and per-day check-off. All state persists locally
(localStorage).

Built from the design bundle in [`design_handoff_hybrid_engine/`](design_handoff_hybrid_engine/).
Build plan and decisions: [`docs/IMPLEMENTATION_PHASES.md`](docs/IMPLEMENTATION_PHASES.md).

## Stack

React + Vite + TypeScript. PWA target for iPhone Home Screen install.

## Develop

```bash
npm install
npm run dev        # start dev server
npm run build      # type-check + production build (also emits the PWA service worker)
npm run preview    # preview the production build
npm test           # run the Vitest suite
npm run gen-icons  # regenerate PWA icons from public/icon.svg
```

## Cloud sync (optional)

Sign-in and cross-device sync via Supabase are opt-in and off by default — the
app works fully on localStorage without an account. To enable, see
[`docs/CLOUD_SYNC.md`](docs/CLOUD_SYNC.md).

## Live

Deployed to GitHub Pages: **https://rishav30194.github.io/hybrid-engine/**
(auto-deploys on every push to `main`).

## Install on iPhone

The production build is a PWA. Open the live URL in Safari, then
**Share → Add to Home Screen** for a standalone, offline-capable install.

## Status

Complete and deployed — recalculation engine, three screens (This Week /
8-Week Plan / Template), rest timer, PWA install, and optional Supabase cloud
sync. See [`docs/IMPLEMENTATION_PHASES.md`](docs/IMPLEMENTATION_PHASES.md) and
[`docs/CLOUD_SYNC.md`](docs/CLOUD_SYNC.md).
