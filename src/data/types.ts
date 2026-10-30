/** Program data model — shapes the prescription data in program.ts. */

export type PhaseKey = 'easy' | 'build'

export interface Phase {
  color: string
  bg: string
  border: string
}

export interface Week {
  wk: number
  phase: PhaseKey
  tag: string
  rpe: string
  /** Replaces every exercise's own RPE for the week — the easy week's `~8`. */
  rpeOverride?: string
}

export interface Exercise {
  id: string
  name: string
  sr: string
  rpe: string
  rest: string
  /** A top set followed by lighter back-off sets, logged as two weight × reps pairs. */
  backoff?: boolean
  note: string
}

export interface Day {
  n: number
  title: string
  sub: string
  ex: Exercise[]
}
