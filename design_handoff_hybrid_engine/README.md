# Handoff: Hybrid Engine — 5-Day Strength-Endurance Training App

## Overview
Hybrid Engine is a mobile-first workout app for a single athlete running one fixed 8-week hybrid (strength + endurance) program. It replaces a spreadsheet: the user enters their four 1-rep maxes once, picks the current training week (1–8), and every working load in the app recalculates automatically (`1RM × week's %1RM`, rounded to a chosen increment). It has three tabs — **This Week**, **8-Week Plan**, **Template** — plus a floating rest timer and per-exercise/day check-off. All user state persists in the browser (localStorage).

The origin was an Excel sheet; this app reproduces its formulas as a live, touch-friendly interface intended to be installed to an iPhone Home Screen.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look, layout, and behavior. They are **not** production code to lift wholesale.

- `index.html` — a single self-contained bundle (fonts + runtime inlined). Open it directly in a browser to see and interact with the finished design. **Use this to see intended behavior.**
- `Hybrid Engine.dc.html` — the authored source. It is written for a proprietary in-house "Design Component" runtime (a `<x-dc>` template + a `class Component extends DCLogic` logic class). **Do not depend on that runtime.** Read it to extract exact markup, styles, the data model, and the recalculation logic — all of which are plain HTML/CSS/JS and translate directly.

**The task:** recreate this design in the target codebase's environment using its established patterns. If there is no existing app yet, the design maps most naturally to **React** (the logic class is effectively a React component already — same lifecycle, `state`/`setState`, and a `renderVals()` that is pure view-model computation). A plain-HTML/vanilla-JS or React + Vite implementation are both reasonable. For a real device install, a small **PWA** (manifest + service worker) is the right target — see "Deployment" below.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are all specified here and present in the files. Recreate the UI to match. Exact hex values, font sizes, and the full data model are documented below; anything ambiguous can be read directly from `Hybrid Engine.dc.html`.

---

## Core Concept: The Recalculation Engine
This is the heart of the app. Everything else is presentation.

- The user stores four **1-rep maxes (1RM)** in pounds: Back Squat, Bench Press, Trap-Bar Deadlift, Overhead Press.
- Each of the 8 weeks defines, per lift, a **percentage of 1RM (`pct`)**, a **sets×reps** string, and a **target RPE**.
- **Working load** = `round( 1RM × pct / increment ) × increment`, where `increment` (rounding) is user-selected: 1 / 2.5 / 5 / 10 lb (default 5).
- Change any 1RM, the week, or the rounding → every displayed load across all three tabs updates instantly.

```js
function roundLoad(oneRepMax, pct, increment) {
  const r = increment || 1;
  return Math.round((oneRepMax * pct) / r) * r;
}
```

Full per-week `pct` tables, sets×reps, RPE, and conditioning strings are in the `WEEKS` array in `Hybrid Engine.dc.html` (weeks 1–8). The 5-day exercise template is in the `DAYS` array. Coaching copy is in `CONDINFO` and `NOTES`. **Copy these arrays verbatim — they are the program's real prescription data.**

---

## Screens / Views

The app is a single fixed-width column (`max-width: 560px`, full viewport height) centered on the page, with a sticky header, a scrolling `<main>`, and a fixed bottom tab bar. Three tabs switch the `<main>` content.

### Global chrome

**Header (sticky top)**
- Left: an accent vertical bar (9×24px, 2px radius) + title block. Title "HYBRID ENGINE" (Oswald 700, 18px, letter-spacing 0.07em) with subtitle "5-DAY STRENGTH · ENDURANCE" (10.5px, 0.16em tracking, uppercase, color `#7C828B`).
- Right: "RPE {value}" (Oswald 600, 15px, accent color) over "WEEK TARGET" (9.5px, uppercase, `#7C828B`).
- Below: a horizontally-scrolling row of **8 week chips** (W1–W8). Each chip is 44px min-width, 40px tall, 10px radius. The active chip is filled with the accent color (text `#0C0D0F`); inactive chips are `#15171B` with `#C7CCD2` text and a subtle border. Each chip has a 14×2px colored underline dash encoding its block phase (see Design Tokens → Phase colors).
- Padding top includes `env(safe-area-inset-top)` for iPhone notch.

**Bottom nav (fixed)**
- Three equal tabs: "THIS WEEK" (icon ◉), "8-WEEK" (icon ▦), "TEMPLATE" (icon ≣). Oswald 600, 10.5px labels. Active tab: accent color + a 2px accent top border. Inactive: `#6C727A`.
- Padding bottom includes `env(safe-area-inset-bottom)`.

**Floating Rest Timer** (see Interactions) — a pill anchored bottom-right above the nav, present on all tabs.

---

### Screen 1 — This Week (default tab)

**Purpose:** the athlete's at-a-glance "what am I lifting today" view for the active week.

Layout, top to bottom:

1. **Week hero card** — rounded 16px card, subtle diagonal gradient `#16181C → #101216`, 1px border `rgba(255,255,255,0.08)`. Contains a phase pill (dot + tag e.g. "BLOCK 1 · BASE" in the phase color on a 13%-opacity phase-color fill) and a large "WEEK 1" (Oswald 700, 46px) with "of 8 · target RPE 7" beside it (13px, `#9AA0A8`).

2. **1-Rep Max editor card** — `#15171B`, 14px radius. Header "YOUR 1-REP MAX" (Oswald 600, 13px, 0.14em) with hint "edit to recalc ↻". A 2-column grid of four input tiles (`#0E1014`, 10px radius): each shows the lift name (10px uppercase `#7C828B`) and a large numeric input (Oswald 600, 22px) with a "lb" suffix. Editing any value recalculates the whole app. Below: a "Round loads to" row with a styled `<select>` (1 / 2.5 / 5 / 10) + "lb".

3. **MAIN LIFTS** section (labeled divider). Four lift rows — each a `#15171B` card, 14px radius, containing:
   - a square check-off button (30px, 9px radius) that fills with accent + shows ✓ when done,
   - lift name (Oswald 600, 16px), a meta line "`sets×reps · RPE x · nn%`" (12.5px `#9AA0A8`), and a short cue note (11.5px `#6C727A`),
   - the computed load right-aligned in large accent Oswald 700 (40px, or 52px if the `bigLoad` option is on) with a "LB" caption.

4. **CONDITIONING** section (labeled divider). Five rows (Day 1–5), each `#121419` card with a check-off button, an uppercase day label (`#7C828B`), the week's prescription (14.5px `#F2F3F5` 600, e.g. "Sled push 6 × 20m · Farmer's carry 3 × 30m"), and a coaching "how" line (11.5px `#6C727A`).

---

### Screen 2 — 8-Week Plan

**Purpose:** see the whole periodized block and jump between weeks.

- Intro line (12px `#7C828B`): "Loads recalculate from your 1RM × each week's %1RM. Tap a week to make it active."
- **Eight week cards**, one per week. Each card:
  - Header button: big "W{n}" (Oswald 700, 24px), a phase pill (dot + tag in phase color), "target RPE {x}", and a right-aligned CTA — "● ACTIVE" (accent) for the current week, else "SET ACTIVE" (`#6C727A`). Tapping sets that week active.
  - The **active** card gets an accent border and a slightly lighter gradient background; others use `#121419` + faint border.
  - A 4-column grid of computed loads (SQ / BN / DL / OHP): each a `#0E1014` tile with the abbreviation (9.5px `#7C828B`) and the load (Oswald 700, 18px).
  - A dashed-top-border toggle "Show conditioning ▾ / Hide conditioning ▲" that expands the 5 conditioning lines for that week (label left, description right).
- **"HOW TO PROGRESS" card** at the bottom (`#101216`) — a bulleted list (accent ▸ markers) from the `NOTES` array explaining progression rules.

---

### Screen 3 — Template

**Purpose:** the actual 5-day workout, with main-lift loads pulled live from the active week and editable weight logging for accessories.

- Intro line naming the active week (with the week name in accent).
- **Five day accordions** (`#121419`, 14px radius). Collapsed header: day title (Oswald 700, 16px, e.g. "DAY 1 — LOWER"), a sub line (e.g. "Strength + Sled Push & Carry"), a "done/total" progress count (accent when complete), and a caret. A **completed** day (all items checked) gets an accent border. Day 1 is expanded by default; opening one is independent (multiple can be open).
- Expanded body — one row per exercise:
  - check-off button (26px),
  - exercise name (Barlow 600, 14px),
  - a **load slot on the right that differs by type**:
    - **Main lifts** (Back Squat, Bench, Trap-Bar DL): a read-only computed load (e.g. "175 lb") in accent Oswald — comes straight from the recalculation engine.
    - **Accessories / supersets** (A1, A2, B1…): an **editable text input** (98px wide, right-aligned, `#0E1014`, accent text) where the user logs the weight they used. Placeholder shows the guidance ("RPE-based", "Bodyweight", "Light", etc.). Value is saved per-week per-exercise.
  - a meta line "`sets×reps · RPE x · rest …`" (12px `#8A9097`) and a form cue note (11.5px `#666C74`).
- Each day ends with a dashed **conditioning block** (check-off + label + the week's prescription + coaching "how" line), styled with a faint dashed border and accent label.

---

## Interactions & Behavior

- **Recalculation:** editing any 1RM input, changing the rounding select, or selecting a week updates all derived loads immediately (pure recompute on each render).
- **Week selection:** tapping a header chip OR an 8-Week card's header sets `week`. Check-off and logged-weight state are **keyed per week** (`w{week}:…`), so each week tracks its own completion and logged loads.
- **Check-off:** main lifts, conditioning rows, template exercises, and template conditioning each toggle a boolean in `done`. Template day headers show aggregate progress and flip to an accent border at 100%.
- **Accessory weight logging:** free-text input per accessory, stored in `log` keyed `w{week}:t:{exerciseId}`.
- **Accordions:** 8-Week conditioning toggles use a single `openWeek` (one open at a time); Template days use `openDay` (toggle independent). Match whichever feels right — the source uses one-at-a-time for weeks, toggle for days.
- **Rest Timer:**
  - Floating pill bottom-right (46px tall, accent-filled when a countdown is active, otherwise dark with accent text; shows "REST" idle or the live "m:ss" running).
  - Tapping opens a panel: presets 0:30 / 1:00 / 1:30 / 2:00 / 3:00, a large m:ss readout, and Reset / Start-Pause-Resume / +15s controls.
  - **Must be timestamp-driven, not tick-decrement.** Store an `endAt = Date.now() + remaining*1000` when running and compute `remaining = max(0, round((endAt - Date.now())/1000))` each second. This keeps it accurate when the phone sleeps or the app is backgrounded. Pausing clears `endAt` and freezes `remaining`; resuming recomputes `endAt`.
  - On reaching 0: play a 3-note WebAudio beep and `navigator.vibrate([...])`. Audio context must be resumed on a user gesture (Start/preset tap) to satisfy mobile autoplay rules.
  - **Auto-hide on scroll:** while `<main>` scrolls, the pill slides out (`translateX(140%)`, opacity 0, pointer-events none) and returns ~600ms after scrolling stops, via a 0.25s transition. It stays visible when the timer panel is open. This prevents it from covering inputs.
- **Options / tweaks** (in the prototype these are component props; implement as settings or hardcode):
  - `accentColor` — theme accent. Options used: `#FF7A1A` (default, orange), `#D7FF3E`, `#35D6FF`, `#FF4D8D`.
  - `showPercents` — show/hide the "· nn%" in main-lift meta lines (default true).
  - `bigLoad` — enlarge main-lift load numerals 40px → 52px (default false).

## State Management
All state is client-side; no backend, no data fetching.

State shape:
```
tab:      "week" | "plan" | "template"
week:     1..8
rounding: 1 | 2.5 | 5 | 10
rm:       { squat, bench, tbdl, ohp }   // numbers (lb)
done:     { [key]: boolean }            // key = `w{week}:m:{lift}` | `w{week}:c:{d}` | `w{week}:t:{exId}` | `w{week}:tc:{d}`
log:      { [`w{week}:t:{exId}`]: string }  // logged accessory weights
openWeek: 0..8                          // expanded 8-Week card (0 = none)
openDay:  0..5                          // expanded Template day
timer:    { open, running, duration, remaining, endAt }
pillHidden: boolean                     // transient, scroll-driven; not persisted
```

**Persistence:** on any change to `week / rounding / rm / done / log`, write `JSON.stringify({week, rounding, rm, done, log})` to `localStorage["hybridEngine.v1"]`. Hydrate on mount. Do **not** persist `tab`, timer, accordions, or `pillHidden`. Never clear keys you didn't write.

## Design Tokens

**Fonts** (Google Fonts): `Oswald` (500/600/700) for headings, numerals, labels, buttons. `Barlow` (400/500/600/700) for body/exercise names. Load both.

**Colors**
- App background: `#0C0D0F`
- Surfaces: `#101216`, `#121419`, `#15171B`, `#16181C`; input wells `#0E1014`
- Text: primary `#F2F3F5` / `#EDEFF1`; secondary `#C7CCD2` / `#9AA0A8`; muted `#8A9097` / `#7C828B`; faint `#6C727A` / `#666C74`
- Borders: `rgba(255,255,255,0.06–0.16)` hairlines; dashed dividers `rgba(255,255,255,0.10)`
- Accent (themeable): default `#FF7A1A`. Alternates `#D7FF3E`, `#35D6FF`, `#FF4D8D`. On-accent text is `#0C0D0F`.
- **Phase colors** (block periodization, used on chips/pills): base `#2DD4BF` (teal), peak `#FB923C` (orange), build `#38BDF8` (blue), deload `#A78BFA` (purple), test `#FB7185` (red). Pill fills are the same color at 0.13 opacity with a 0.40-opacity border.

**Radii:** tiles/inputs 7–10px; cards 12–16px; pills/chips 999px or 10–23px. **Shadows:** timer pill `0 8px 22px rgba(0,0,0,0.45)`; timer panel `0 16px 40px rgba(0,0,0,0.55)`.

**Type scale (px):** hero week 46; big load 40/52; section labels 13 (0.14–0.16em tracking, uppercase); card titles 16; 1RM input 22; timer readout 54; body 12.5–14.5; captions 9.5–11.5.

**Layout:** centered column, `max-width 560px`, `height 100dvh` (use dvh, not vh, for mobile Safari). Header/nav respect `env(safe-area-inset-*)`.

## Deployment (device install)
The prototype is a single self-contained HTML file added to the iPhone Home Screen. For the real build, ship a **PWA**: add a web app manifest (name, `display: standalone`, `theme_color: #0C0D0F`, icons) and these meta tags (already in the prototype's head): `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style = black-translucent`, `theme-color`, and `viewport … viewport-fit=cover`. A service worker for offline is recommended since the program data is static. No accounts or server needed unless cross-device sync is later desired.

## Assets
None external. No images or icon files — the few glyphs (◉ ▦ ≣ ⏱ ▸ ✓ ×) are Unicode characters. Fonts load from Google Fonts. The bundled `index.html` has fonts inlined.

## Files
- `index.html` — self-contained, runnable prototype. **Open this first** to experience the intended design.
- `Hybrid Engine.dc.html` — authored source. Read the `<script>` logic block for the authoritative data (`WEEKS`, `DAYS`, `COND`, `CONDINFO`, `NOTES`, `PHASES`, `LIFTS`), the `roundLoad`/timer/persistence logic, and `renderVals()` (the view-model). Read the `<x-dc>` template for exact markup, inline styles, and structure. Ignore the `DCLogic`/`<x-dc>`/`support.js` runtime wrapper — everything inside is portable HTML/CSS/JS.
