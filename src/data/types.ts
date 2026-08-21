/** Program data model — shapes the prescription data in program.ts. */

export type LiftKey = 'squat' | 'bench' | 'tbdl' | 'ohp'
export type PhaseKey = 'base' | 'peak' | 'build' | 'deload' | 'test'
export type CondKey = 'mon' | 'wed' | 'fri'

export interface Lift {
  key: LiftKey
  name: string
  abbr: string
  note: string
}

export interface Phase {
  color: string
  bg: string
  border: string
}

export interface MainPrescription {
  sr: string
  rpe: string
  /** Fraction of 1RM, e.g. 0.785 */
  pct: number
}

export interface Week {
  wk: number
  phase: PhaseKey
  tag: string
  rpe: string
  main: Record<LiftKey, MainPrescription>
  cond: Record<CondKey, string>
}

export interface ConditioningDay {
  key: CondKey
  label: string
  short: string
}

export interface Exercise {
  id: string
  name: string
  /** Present on main lifts; their load is computed from the active week's %1RM. */
  main?: LiftKey
  sr: string
  rpe: string
  rest: string
  /** Guidance/placeholder for accessory weight logging (absent on main lifts). */
  load?: string
  note: string
}

export interface Day {
  n: number
  title: string
  sub: string
  condLabel: string
  condKey: CondKey
  ex: Exercise[]
  /**
   * Loggable loads on this day's conditioning block, e.g. carry weight and
   * climber level. Omitted where the conditioning isn't loaded (intervals, Zone 2).
   * Each `id` is a storage key — treat it like an exercise id and never reuse
   * one for a different movement.
   */
  condLoads?: {
    id: string
    label: string
    /** Unit suffix and input placeholder. Defaults to a weight in pounds —
     *  override for a piece measured in something else, like a machine level. */
    unit?: string
    placeholder?: string
  }[]
}
