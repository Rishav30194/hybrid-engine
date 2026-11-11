# Bodybuilding rework — tracker

Record of the move from the 8-week strength and conditioning block to a 12-week hypertrophy block.
The rework is done: merged to `main` (PR #31, `b698769`) and live on the phone. `src/data/program.ts`
holds the values and `docs/PROGRAM_SOURCE.md` holds the reasoning. The per-phase plans, checklists,
and the original decisions table are in git history before this trim.

## Status

| Phase | Class | Status |
|---|---|---|
| 1 — Remove the 1RM load engine | B | Done 2026-10-29 (`dff176e`) |
| 2 — Log reps and show last week | B | Done 2026-10-29 (`434a812`) |
| 3 — Load the new program | C | Done 2026-10-29 (`3453cb7`, `05f6816`) |
| 4 — Ship and cut over | Push and PR | Done 2026-11-11: deployed 2026-10-29 (`b698769`), first week trained and reviewed, cloud reload confirmed |

## Session log

- **2026-10-29:** Plan agreed. Branch `feature/bodybuilding-program` created from `main` at
  `f8b98e7`. Tracker written; nothing committed yet. Later the same day: gym machines confirmed,
  reps format decided (last set only). No open questions; next is the Phase 1 plan.
- **2026-10-29:** Phase 1 done on the branch, not committed. Deleted `e1rm.ts` and its test
  (approved). `lsrpeId` moved to `keys.ts`. **Start new block** now carries main-lift weights
  too. `config.ts` kept with no exports, as the documented home for future flags. Unused CSS and
  the `--fs-load` and `--fs-1rm-input` tokens removed. Committed as `dff176e`.
- **2026-10-29:** Phase 2 done and committed. Reps sit beside the weight (`weight × reps`), last
  week's numbers as placeholders, back-off pair behind `Exercise.backoff`. Weight box narrowed
  98 → 72px. Committed as `434a812`.
- **2026-10-29:** Phase 3 built and committed. New program in `program.ts` with `bb-` ids;
  conditioning, lifts, the press swap, and the week-card toggle removed; week 1's RPE override.
  Nav label `8-WEEK` → `PLAN`, header subtitle `3-Day Hypertrophy`. `CLAUDE.md` §1 and §2 wording
  updated (approved). Open: Rishav's read of the three days in the dev build. Noticed, not
  changed: the header chips don't scroll the active week into view, so W12 starts off-screen.
- **2026-10-29:** From Rishav's read of the dev build: Friday's seated leg curl back to a standing
  calf raise (`bb-fri-calf`, 2×12–15 @ RPE 10). Hamstrings 3 direct sets plus the deadlift,
  calves 5.
- **2026-10-29:** Rishav confirmed the three days. Phase 3 done. Phase 4 started: branch pushed
  and PR #31 opened (approved). No CI ran on the PR: `deploy.yml` triggers only on pushes to
  `main`. Next: merge, with approval.
- **2026-10-29:** PR #31 merged as `b698769` (approved). Deploy run 40998477359 passed; the live
  bundle contains the new program. Open: the phone checks (update arrives, week set to 1, an
  entry survives a reopen, cloud reload if signed in) and one full week of training.
- **2026-10-29:** Rishav checked the phone: all good. The cloud-reload item stays open, since the
  report doesn't say whether he was signed in. Lint run on the merged code: clean. Remaining: the
  cloud-reload check and the first full training week.
- **2026-11-06:** Friday's calf raise changed to seated (`bb-fri-seatedcalf`, same 2×12–15 @ RPE
  10). `bb-fri-calf` retired, with a test against reuse.
- **2026-11-06:** Monday's leg press replaced by a leg extension (`bb-mon-legext`, 3×10–12 @ RPE
  9–10, last set a drop set). `bb-mon-legpress` retired, with a test against reuse.
- **2026-11-06:** Review changes on `feature/program-review-changes`: Friday back to a standing calf
  raise (`bb-fri-calf`; the seated version never shipped), Monday leg curl 4 sets, new cable lateral
  raise (`bb-mon-lateral`) and reverse fly (`bb-mon-reversefly`), isolation at RPE 9 with the last
  set at 10, stall rule, block rotation, time budget 60–80 min. Conventional deadlift stays;
  `docs/PROGRAM_SOURCE.md` now holds the corrected reasoning, and the older entries here are history.
- **2026-11-11:** Rishav confirmed the first week ran with no app problems, signed in throughout,
  and a logged entry survived a reload from the cloud. Phase 4 closed; the rework is done. This
  file trimmed to its status and log.
