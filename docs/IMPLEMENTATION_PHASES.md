# Hybrid Engine — Implementation Phases

Build plan for the Hybrid Engine app, derived from `design_handoff_hybrid_engine/README.md`
and the authored source `design_handoff_hybrid_engine/Hybrid Engine.dc.html`.

## Locked decisions

- **Stack:** React + Vite + TypeScript. PWA via `vite-plugin-pwa`.
- **Location:** built at **repo root**, alongside `design_handoff_hybrid_engine/`.
- **Options:** hardcoded defaults — accent `#FF7A1A` (orange), `showPercents` on, `bigLoad` off. No settings UI.
- **Persistence:** localStorage (`hybridEngine.v1`) by default; optional cloud sync when signed in.
- **Data:** `WEEKS`, `DAYS`, `COND`, `CONDINFO`, `NOTES`, `PHASES`, `LIFTS` copied **verbatim** from the authored source — they are the program's real prescription data.

## Delivered beyond the original plan

- **Deployed** to GitHub Pages (base `/hybrid-engine/`) via an Actions workflow that tests, builds, and publishes on every push to `main`.
- **User accounts + cloud sync** — implemented (Supabase email/password auth + `user_state` jsonb, offline-first last-write-wins). Opt-in and off unless configured. See [`CLOUD_SYNC.md`](CLOUD_SYNC.md).

## Still parked / intentionally out

- **JSON export/import backup** — intentionally left out.

## iOS Safari persistence note

localStorage survives a normal phone shutdown/restart (it is on disk, not RAM). The real risks are
Apple's rules: a **7-day eviction cap** for script-writable storage if the app isn't opened for a week
in a Safari tab, eviction under storage pressure, and "Clear History and Website Data". **Add to Home
Screen (PWA)** greatly improves durability (separate storage container, not subject to the 7-day Safari
cap the same way) but is still best-effort. `navigator.storage.persist()` is effectively ignored on iOS.
Guaranteed durability comes from signing in — cloud sync backs the state up to Supabase.

---

## Phases

Each phase is independently reviewable. Ship/verify at each boundary before moving on.

### Phase 0 — Scaffold + design tokens
- `npm create vite` (React + TS); remove boilerplate.
- Load Google Fonts: Oswald (500/600/700), Barlow (400/500/600/700).
- CSS reset + all design tokens as CSS variables: colors, phase colors, radii, type scale, `--accent`.
- App shell layout only: centered column, `max-width 560px`, `height 100dvh`, `env(safe-area-inset-*)`.
- **Deliverable:** empty themed shell that boots.

### Phase 1 — Data model + recalculation engine
- Port `WEEKS`, `DAYS`, `COND`, `CONDINFO`, `NOTES`, `PHASES`, `LIFTS` verbatim into typed modules.
- `roundLoad(oneRepMax, pct, increment)` = `Math.round((oneRepMax * pct) / r) * r`, `r = increment || 1`.
- Pure view-model builder (the `renderVals()` equivalent).
- Vitest unit tests for the engine.
- **Deliverable:** engine + green tests, no UI.

### Phase 2 — State + persistence
- Central state (`useReducer` or small store): `tab, week, rounding, rm, done, log, openWeek, openDay, timer, pillHidden`.
- Per-week keying: `w{week}:m:{lift}` | `w{week}:c:{d}` | `w{week}:t:{exId}` | `w{week}:tc:{d}`.
- Hydrate on mount; persist `{week, rounding, rm, done, log}` to `localStorage["hybridEngine.v1"]` on change.
- Do **not** persist `tab`, timer, accordions, or `pillHidden`. Never clear foreign keys.
- **Deliverable:** state survives reload.

### Phase 3 — Global chrome
- Sticky header: accent bar + title/subtitle, right-side "RPE {value} / WEEK TARGET".
- Horizontally-scrolling 8 week chips (W1–W8) with phase-color underline dashes; active chip filled with accent.
- Fixed bottom tab nav (This Week / 8-Week / Template) with safe-area padding; tab switching.
- **Deliverable:** navigable shell with placeholder tab content.

### Phase 4 — Screen 1: This Week
- Week hero card (phase pill + large "WEEK n").
- 1-Rep Max editor (four input tiles + rounding select) → recalc on edit.
- MAIN LIFTS rows (check-off, name, meta, cue, computed load).
- CONDITIONING rows (Day 1–5, check-off, prescription, coaching line).

### Phase 5 — Screen 2: 8-Week Plan
- Eight week cards; active card gets accent border + lighter gradient.
- Per-card 4-col load grid (SQ / BN / DL / OHP), "SET ACTIVE" / "● ACTIVE" CTA.
- Conditioning expand toggle (one open at a time via `openWeek`).
- "HOW TO PROGRESS" card from `NOTES`.

### Phase 6 — Screen 3: Template
- Five day accordions (independent open via `openDay`; Day 1 open by default).
- Per-exercise rows; load slot differs by type:
  - **Main lifts:** read-only computed load from the engine.
  - **Accessories:** editable weight input, saved per-week per-exercise in `log`.
- Per-day progress count + accent border at 100%; dashed conditioning block per day.

### Phase 7 — Rest timer
- Floating pill (auto-hide on `<main>` scroll, returns ~600ms after scroll stops).
- Panel: presets 0:30 / 1:00 / 1:30 / 2:00 / 3:00, m:ss readout, Reset / Start-Pause-Resume / +15s.
- **Timestamp-driven:** store `endAt = Date.now() + remaining*1000`; compute `remaining` each tick. Accurate across sleep/background.
- On 0: WebAudio 3-note beep + `navigator.vibrate`. Resume audio context on user gesture.

### Phase 8 — PWA + iPhone install
- Web app manifest: name, `display: standalone`, `theme_color: #0C0D0F`, icons.
- Apple meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style = black-translucent`, `theme-color`, `viewport … viewport-fit=cover`.
- Service worker for offline (static program data). Verify Home Screen install on iPhone.
