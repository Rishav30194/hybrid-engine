# Hybrid Engine — how to work here

Process rules for Claude. Self-contained, and they win over any broader or inherited convention.

Engineering knowledge lives in `docs/` and is **not** repeated here:

| Question | File |
|---|---|
| How is the app built? What must not break? | `docs/ARCHITECTURE.md` |
| What rules do I follow when changing it? | `docs/CONVENTIONS.md` |
| Why is the program shaped this way? | `docs/PROGRAM_SOURCE.md` |
| How do I set up cloud sync? | `docs/CLOUD_SYNC.md` |
| What is the app, how do I run it? | `README.md` |

Read only what the task needs. Do not scan the whole repo.

---

## 1. What you are touching

A **live, single-user app**. Rishav runs the 8-week program off it on his iPhone, from the Home
Screen PWA at <https://rishav30194.github.io/hybrid-engine/>. Every push to `main` auto-deploys
to that phone within minutes.

Three consequences that shape every change:

1. **There is real training data in the field.** Check-offs, logged weights and 1RMs live in
   `localStorage` and optionally Supabase. A careless key or shape change silently orphans weeks
   of logged work. There is no undo, no export, and no migration layer.
2. **It is used one-handed, in a gym, mid-set.** Small screen, portrait, sweaty thumbs, possibly
   offline.
3. **The numbers are not decoration.** Percentages in `src/data/program.ts` decide what actually
   goes on the bar. Changing one is a training decision, not a code change.

---

## 2. Classify the change first

State the class in your plan. It determines what the change costs.

| Class | Examples | Required |
|---|---|---|
| **A — Cosmetic** | spacing, colour, copy, a token value | Tests + build pass; check at 390px wide |
| **B — Behaviour** | new interaction, screen layout, timer tweak | Plan approved first; add or extend a test |
| **C — Program data** | a `pct`, `sr`, `rpe`, exercise, week, note | **Explicit approval every time** — this changes his training. Update `loads.test.ts` expectations |
| **D — Persisted shape** | new field in `PersistedState`, key format, `STORAGE_KEY` | Plan + migration + approval |
| **E — Infra** | `package.json`, `vite.config.ts`, workflow, Supabase schema | Explicit approval |

When a request spans classes, **the highest class governs**.

---

## 3. Needs explicit approval

Deleting or renaming files · `package.json` or any build config · `vite.config.ts` · the deploy
workflow · Supabase schema or migrations · `STORAGE_KEY` · **any value in `program.ts`** ·
pushing to remote or opening a PR.

Secrets: `.env.local` is off-limits — never open, read back, or echo it. If a key is needed, say
so and let Rishav set it.

---

## 4. Workflow

1. **Classify** (§2) and name the invariants in blast radius — see `docs/ARCHITECTURE.md`.
2. **Plan** — files to touch, approach, trade-offs. For anything above class A, present it and
   **wait for approval** before writing code.
3. **Branch.** Never commit to `main`. `feature/` · `fix/` · `chore/`.
4. **Implement**, matching the style already in the file. Comments explain *why*, never *what*.
5. **Verify** (§5). All three commands, every time.
6. **Report honestly** — what changed, what you did not test, what you assumed.

---

## 5. Definition of done

```bash
npm test          # vitest — must be green, no skips
npm run build     # tsc -b && vite build — type errors are failures
npm run lint      # oxlint
```

CI runs `npm test` before it will deploy, so a red test blocks the phone from updating. That's
the safety net — don't route around it with `.skip`.

Then, for anything visual or interactive: run `npm run dev`, view at **390px wide**, and confirm
the thing you changed **and** that the rest timer, bottom nav and header still sit correctly. For
real-device checks, `npm run preview` allows `*.trycloudflare.com` tunnels.

If you did not do the visual pass, say so rather than implying you did.

---

## 6. Git

- Never commit to `main`. Branch, then open a PR when asked.
- Commit messages: short imperative subject, no trailing period.
- **No Claude attribution anywhere in git output** — no "Generated with Claude Code" footer in
  PR bodies, and no `Co-Authored-By` trailer in commits.
- Do not push or open a PR unless asked.

---

## 7. Keeping these docs true

The docs drift the moment code moves without them. When a change makes a documented fact wrong,
fix the doc in the same commit — one fact, one home:

- Behaviour, invariants, module layout → `docs/ARCHITECTURE.md`
- Mobile/CSS rules, placement, known issues → `docs/CONVENTIONS.md`
- Program values and rationale → `docs/PROGRAM_SOURCE.md`
- Setup and user-facing description → `README.md` / `docs/CLOUD_SYNC.md`

Don't restate a fact in a second file to make a point — link to its home instead.
