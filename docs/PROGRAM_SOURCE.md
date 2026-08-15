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

## Effort is the lever, not volume

Arms and calves sit at maintenance, so the isolation work is two or three sets a week. That only
buys anything if the effort is genuinely high — hence **RPE 9–10 on lateral raise, curl, triceps
extension and calf raise, and RPE 10 on pull-ups**. Expect reps or weight to fall across sets;
that's the prescription working, not you failing it.

The one deliberate exception is the **Hanging Leg Raise at RPE 7**. Its job is to fill the rest
inside Monday's A-series, so pushing it near failure would steal from the row and press it's
paired with — and form (swinging) breaks down before effort does.

## Closing a block

Week 8 doesn't run working sets. Each main lift is **work up, then one all-out AMRAP at 90%**,
and the reps you get set the next block's 1RM.

AMRAP over a true 1RM attempt because it needs no spotter, costs far less fatigue, and repeats
more reliably — a max single swings with technique and adrenaline on the day. 90% rather than
80% because the estimate degrades as reps climb: 90% lands around 3–5 reps, where the maths is
solid.

It self-corrects. At a 200 lb max the week-8 load is 180, and the result reads: 2 reps → 190,
3 → 195, **4 → 200 (the old max was accurate)**, 5 → 210, 6 → 215.

**Start new block** on This Week then applies it — new 1RMs in, accessory and conditioning
weights carried into week 1, every check-off cleared.

## Changing any of this

Percentages, sets/reps, RPE and exercise selection are training decisions, not code changes.
See `CLAUDE.md` §2 (class C) — they need explicit approval, and `src/engine/loads.test.ts`
expectations must move with them.

Exercise `id`s in `program.ts` are storage keys. Renaming an exercise is free; **reusing an
existing `id` for a different movement is not** — a previously logged weight would resurface on
the wrong lift. Issue a fresh id instead.
