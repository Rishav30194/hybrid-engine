import type { LiftKey } from '../data/types'

export type Tab = 'week' | 'plan' | 'template'

/** A 1RM value may be transiently blank ("") while the user edits the input. */
export type RmValue = number | string
export type Rm = Record<LiftKey, RmValue>

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
  rounding: number
  rm: Rm
  /** Check-off flags, keyed per week (see engine/keys). */
  done: Record<string, boolean>
  /** Logged accessory weights, keyed per week. */
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
  done: Record<string, boolean>
  log: Record<string, string>
}

export type Action =
  | { type: 'setTab'; tab: Tab }
  | { type: 'setWeek'; week: number }
  | { type: 'setRounding'; rounding: RmValue }
  | { type: 'setRm'; lift: LiftKey; value: RmValue }
  | { type: 'setLog'; id: string; value: string }
  | { type: 'toggleDone'; id: string }
  | { type: 'toggleWeek'; week: number }
  | { type: 'toggleDay'; day: number }
  | { type: 'setPillHidden'; hidden: boolean }
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
