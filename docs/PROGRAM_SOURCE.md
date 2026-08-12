# Program source — why the plan is shaped this way

`src/data/program.ts` holds the athlete's real prescription and is the source of truth for it.
This file holds the *reasoning* behind it — the part that isn't recoverable by reading the data.

## The constraint

Three sessions a week, **≤45 minutes each**.

| Day | Anchor | Conditioning | Budget |
| --- | --- | --- | --- |
| Monday | Back Squat | Sled push + farmer's carry | 43 min |
| Wednesday | Bench Press (OHP in weeks 3 & 6) | Bike / row intervals | 45 min |
| Friday | Sumo Deadlift | Zone 2 tail, every week without exception | 44 min |

Those time budgets are the reason the accessory work is paired (`A1`/`A2`/`A3`, `B1`/`B2`).
They are not encoded anywhere in `program.ts` — adding exercises to a day spends a budget the
data doesn't track.

Monday once carried an optional "+10 min extension" for weeks with more time. It was removed:
the requirement is **≤45 min**, the per-week prescription already progresses volume
(6 → 7 → 8 sled lengths, deload, restart heavier), and a conditional bolt-on forced a judgement
call mid-session. If Monday needs more work, raise the week's prescribed numbers deliberately.

## What three days a week costs

Weekly volume is **~38 hard sets**. That sits above the one-third maintenance threshold and above
the growth floor for every major muscle group **except arms and calves**, which are deliberately
at maintenance — hence the single direct arm movement (`B2 · EZ-Bar Curl`, 2×12) and the single
calf movement.

Structured Zone 2 is **15 min/week** in weeks 1–3 and 5–8, and **20 min in week 4** — the deload,
where lifting volume drops and the aerobic tail lengthens slightly. Either way it is a thin
aerobic base on its own, backstopped by daily brisk walking on off days. This is why `OFF_DAYS`
copy exists on This Week, and why Friday's Zone 2 tail runs every week including deloads — it
does not get cut when the session runs long.

(`WEEKS` in `program.ts` is authoritative for these values; this paragraph is a summary of it.)

## Changing any of this

Percentages, sets/reps, RPE and exercise selection are training decisions, not code changes.
See `CLAUDE.md` §2 (class C) — they need explicit approval, and `src/engine/loads.test.ts`
expectations must move with them.

Exercise `id`s in `program.ts` are storage keys. Renaming an exercise is free; **reusing an
existing `id` for a different movement is not** — a previously logged weight would resurface on
the wrong lift. Issue a fresh id instead.
