/**
 * Cleanup of state written by the retired 5-day program.
 *
 * The 3-day rewire renamed the conditioning keys (`d1`–`d5` → `mon`/`wed`/`fri`)
 * and re-identified every exercise (`d1e0` → `mon-e0`). The re-id matters: the
 * old ids were reused by *different* movements, so a weight logged against the
 * old `d1e1` (Romanian Deadlift) would have surfaced on the new `d1e1`
 * (Chest-Supported Row), and an old Zone 2 check-off would have shown Friday's
 * deadlift as already done. Those keys are dropped rather than carried over.
 *
 * Main-lift check-offs (`w{n}:m:{lift}`) and the 1RMs are untouched — the lifts
 * and every %1RM survived the rewire.
 *
 * Applied on both paths into state: localStorage hydrate (mergePersisted) and
 * cloud pull (the reducer's `hydrateRemote`), since a cloud blob written before
 * the rewire still carries the old keys.
 */
const RETIRED_KEY = /:(?:c|tc):d[1-5]$|:t:d[1-5]e\d+$/

/** Copy of `map` without any key from the retired 5-day program. */
export function dropRetiredKeys<T>(map: Record<string, T>): Record<string, T> {
  const kept: Record<string, T> = {}
  for (const [k, v] of Object.entries(map)) {
    if (!RETIRED_KEY.test(k)) kept[k] = v
  }
  return kept
}
