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
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Status

Phase 0 complete — scaffold, design tokens, and app shell. See the phases doc for what's next.
