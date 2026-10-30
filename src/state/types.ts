import type { LiftKey } from '../data/types'

export type Tab = 'week' | 'plan' | 'template'

export type RmValue = number | string
export type Rm = Record<LiftKey, RmValue>

/**
 * What working loads were once computed from. Nothing reads `rm`, `rounding` or
 * `basisAt` any more; they stay in the persisted slice because dropping them
 * would change the stored shape for no gain.
 */
export interface LoadBasis {
  rm: Rm
  rounding: number
}

/** The basis each past week was trained on, keyed by 1-based week. Unread. */
export type BasisAt = Partial<Record<number, LoadBasis>>

export interface TimerState {
  open: boolean
  running: boolean
  duration: number
  remaining: number
  endAt: number | null
}

export interface AppState {
  tab: Tab
  week: number
  /** Unread; kept so the persisted shape doesn't change (see LoadBasis). */
  rounding: number
  rm: Rm
  basisAt: BasisAt
  /** Check-off flags, keyed per week (see engine/keys). */
  done: Record<string, boolean>
  /** Logged weights and felt RPEs, keyed per week. */
  log: Record<string, string>
  /** Expanded 8-Week card (0 = none); one open at a time. */
  openWeek: number
  /** Expanded Template day (0 = none); toggled independently. */
  openDay: number
  timer: TimerState
  /** Transient, scroll-driven; never persisted. */
  pillHidden: boolean
}

/** The only slice written to localStorage. */
export interface PersistedState {
  week: number
  rounding: number
  rm: Rm
  basisAt: BasisAt
  done: Record<string, boolean>
  log: Record<string, string>
}

export type Action =
  | { type: 'setTab'; tab: Tab }
  | { type: 'setWeek'; week: number }
  | { type: 'setLog'; id: string; value: string }
  | { type: 'toggleDone'; id: string }
  | { type: 'toggleWeek'; week: number }
  | { type: 'toggleDay'; day: number }
  | { type: 'setPillHidden'; hidden: boolean }
  /**
   * Finish the block and start again at week 1. Carries every logged weight
   * forward and clears every check-off. Destructive and not undoable — the UI
   * confirms first.
   */
  | { type: 'startNewBlock'; carry: Record<string, string> }
  // Replace the persisted slice from a remote (cloud) blob.
  | { type: 'hydrateRemote'; data: Partial<PersistedState> }
  // Rest timer. Time-dependent actions carry `now` so the reducer stays pure.
  | { type: 'timerToggleOpen' }
  | { type: 'timerClose' }
  | { type: 'timerStart'; seconds: number; now: number }
  | { type: 'timerStartPause'; now: number }
  | { type: 'timerReset' }
  | { type: 'timerAdd'; seconds: number; now: number }
  | { type: 'timerTick'; now: number }
