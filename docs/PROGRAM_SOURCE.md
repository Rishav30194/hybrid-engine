# Program source — why the plan is shaped this way

`src/data/program.ts` holds the athlete's real prescription and is the source of truth for it.
This file holds the *reasoning* behind it — the part that isn't recoverable by reading the data.

## The goal and the constraint

The goal is **hypertrophy** — building muscle. Until 2026-10-29 the program was an 8-week hybrid
of strength and conditioning; Rishav switched the goal and the program was rebuilt around it.

Three sessions a week, **about 55 minutes each, 60 at most**:

| Day | Session | Anchor |
| --- | --- | --- |
| Monday | Lower | Back Squat |
| Wednesday | Upper | Flat DB Press |
| Friday | Full body | Conventional Deadlift |

Every session opens with the same warm-up: 5 minutes easy on the stair climber, then arm and leg
swings, then 2–3 warm-up sets before the anchor and the DB presses and 0–1 before isolation work.

## Sources

Two Jeff Nippard programs, combined rather than run as written:

- **The Essentials Program (3x a week)** gives the shape: Full Body / Upper / Lower, a heavy top
  set with lighter back-off sets, 1–3 hard sets per exercise, and paired exercises for opposing
  muscles. It is built for 45 minutes; the extra 15 here buys more sets.
- **The Pure Bodybuilding Program** gives the effort and the progression: last set to failure on
  isolation work, stretch-focused exercise choices, and adding reps before weight. It runs 4–6
  days a week, which is why it isn't followed directly.

## Why the main choices

| Choice | Why |
| --- | --- |
| Flat DB press, not barbell bench | Unracking and setting up under a loaded bar alone was awkward. Dumbbells also give the chest a deeper stretch. |
| Conventional deadlift, not sumo | It works the hamstrings and back harder, which counts for more in how a physique looks. If sumo was originally chosen for a back or hip reason, swap it back with the same scheme. |
| Deadlift back-off sets at 6–8 reps, not 8–10 | On high-rep deadlifts, grip and lower back give out before the target muscles do. |
| Seated leg curl on Friday, in place of a calf raise | A deadlift loads the hamstrings far less than the RDL it replaced, so they needed direct work. |
| No leg extension | A leg curl and leg extension pair holds two machines at once, which doesn't work at a busy commercial gym. After squat and leg press it was the third quad exercise and added the least. |
| No hard conditioning | Nippard keeps cardio minimal on hypertrophy programs, and the RPE-9 stair climber cut into leg recovery. Dropping it freed about 12 minutes a session. Easy climber minutes are now the warm-up, and daily walking stays. |

**Paired exercises share a station.** Each A/B/C pair runs on one bench with one set of
dumbbells, or at one cable station — a pair that needs two machines at once fails at a busy gym.
That pairing is what fits the sessions in under an hour, so don't split pairs into straight sets
without accounting for the time.

## Weekly volume

About **54 hard sets a week**. Per muscle: chest 8, back 9 (plus the deadlift), side delts 5,
quads 8, hamstrings 5 (plus the deadlift), biceps 4, triceps 5, calves 3, abs 2.

That is the low end of what supports growth. It works because sets are taken close to failure —
Essentials' bet, fewer sets each worth more — so the effort prescription is not optional.

## Effort and progression

- **Compound lifts at RPE 8–9, isolation to RPE 10** on the last set. RPE 10 means the last rep
  you can complete with good form, not one ground out with bad form.
- **Rep ranges with double progression.** When the last set reaches the top of the range at the
  target RPE, add the smallest jump and drop back to the bottom of the range. Dumbbells go up
  5 lb a hand, and a rep range is what absorbs a jump that size.
- **Only the last set's reps are logged.** Reps fall across sets, so the last set reaching the
  top of the range means every set did.
- **Top sets progress first;** back-off sets run 10–15% lighter.

## The block

**12 weeks, one easy week, at the start.** Week 1 is RPE ~8 on everything, with no sets to
failure and no drop sets: it is for finding weights on new exercises. Weeks 2–12 are full effort.

There is no deload inside the block. Rishav was already training when it started, so no ramp-in
was needed, and Essentials runs 12 weeks without a deload at similar volume. When the block
repeats, its week 1 is also the rest week after the previous 11 hard ones, so the program never
needs a second easy week.

**The safety valve:** if weights or reps drop on two or more lifts for two sessions in a row,
start the next block early instead of pushing through.

Exercises stay the same for all 12 weeks — changing them flattens the strength curve that the
logbook depends on.

## Changing any of this

Sets, reps, RPE and exercise selection are training decisions, not code changes. See `CLAUDE.md`
§2 (class C) — they need explicit approval, and the program integrity tests in
`src/engine/loads.test.ts` must move with them.

Exercise `id`s in `program.ts` are storage keys. Renaming an exercise is free; **reusing an
existing `id` for a different movement is not** — a previously logged weight would resurface on
the wrong lift. Issue a fresh id instead. Every id in the current program starts with `bb-` so
none can collide with the old program's.
