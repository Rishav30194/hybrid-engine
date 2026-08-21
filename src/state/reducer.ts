import { WEEKS } from '../data/program'
import { toNum } from '../engine/loads'
import type { Action, AppState, BasisAt, LoadBasis } from './types'

/** Keep week within 1..8 so WEEKS[week-1] is always valid (guards corrupt data). */
export const clampWeek = (n: unknown): number =>
  Math.min(Math.max(1, Math.round(toNum(n as number)) || 1), WEEKS.length)

export const INITIAL_STATE: AppState = {
  tab: 'week',
  week: 1,
  rounding: 5,
  rm: { squat: 245, bench: 225, tbdl: 375, ohp: 135 },
  basisAt: {},
  done: {},
  log: {},
  openWeek: 0,
  openDay: 1,
  timer: { open: false, running: false, duration: 90, remaining: 90, endAt: null },
  pillHidden: false,
}

/** What the current week computes its loads from, right now. */
const liveBasis = (state: AppState): LoadBasis => ({
  rm: state.rm,
  rounding: state.rounding,
})

/**
 * Stamp every week before the active one with the basis it was trained on, so
 * changing a 1RM or the rounding mid-block only moves the current week forward
 * instead of rewriting weeks already done. An already-stamped week is left
 * alone: its stamp is the pre-edit basis, which is the history this protects.
 */
function freezePastWeeks(state: AppState): BasisAt {
  const unstamped: number[] = []
  for (let w = 1; w < state.week; w++) if (!state.basisAt[w]) unstamped.push(w)
  if (unstamped.length === 0) return state.basisAt

  const frozen = liveBasis(state)
  const next = { ...state.basisAt }
  for (const w of unstamped) next[w] = frozen
  return next
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setTab':
      return { ...state, tab: action.tab }
    case 'setWeek':
      return { ...state, week: clampWeek(action.week) }
    case 'setRounding':
      return {
        ...state,
        basisAt: freezePastWeeks(state),
        rounding: toNum(action.rounding) || 1,
      }
    case 'setRm':
      // Keep "" as-is so the input can be cleared; the engine treats it as 0.
      return {
        ...state,
        basisAt: freezePastWeeks(state),
        rm: {
          ...state.rm,
          [action.lift]: action.value === '' ? '' : toNum(action.value),
        },
      }
    case 'setRmAt': {
      // An unstamped week shows the live basis, so seed from it before editing.
      const base = state.basisAt[action.week] ?? liveBasis(state)
      return {
        ...state,
        basisAt: {
          ...state.basisAt,
          [action.week]: {
            ...base,
            rm: {
              ...base.rm,
              [action.lift]: action.value === '' ? '' : toNum(action.value),
            },
          },
        },
      }
    }
    case 'setRoundingAt': {
      const base = state.basisAt[action.week] ?? liveBasis(state)
      return {
        ...state,
        basisAt: {
          ...state.basisAt,
          [action.week]: { ...base, rounding: toNum(action.rounding) || 1 },
        },
      }
    }
    case 'setLog':
      return { ...state, log: { ...state.log, [action.id]: action.value } }
    case 'toggleDone':
      return {
        ...state,
        done: { ...state.done, [action.id]: !state.done[action.id] },
      }
    case 'toggleWeek':
      return { ...state, openWeek: state.openWeek === action.week ? 0 : action.week }
    case 'toggleDay':
      return { ...state, openDay: state.openDay === action.day ? 0 : action.day }
    case 'setPillHidden':
      return { ...state, pillHidden: action.hidden }

    case 'hydrateRemote': {
      const d = action.data
      return {
        ...state,
        week: clampWeek(d.week ?? state.week),
        rounding: d.rounding ?? state.rounding,
        rm: { ...state.rm, ...(d.rm ?? {}) },
        basisAt: d.basisAt ?? {},
        done: d.done ?? {},
        log: d.log ?? {},
      }
    }

    case 'startNewBlock':
      return {
        ...state,
        week: 1,
        rm: action.rm,
        basisAt: {},
        done: {},
        log: action.carry,
        openWeek: 0,
        openDay: 1,
      }

    case 'timerToggleOpen':
      return { ...state, timer: { ...state.timer, open: !state.timer.open } }
    case 'timerClose':
      return { ...state, timer: { ...state.timer, open: false } }
    case 'timerStart': {
      const s = action.seconds
      return {
        ...state,
        timer: {
          ...state.timer,
          duration: s,
          remaining: s,
          running: true,
          open: true,
          endAt: action.now + s * 1000,
        },
      }
    }
    case 'timerStartPause': {
      const tm = state.timer
      if (tm.running) {
        return { ...state, timer: { ...tm, running: false, endAt: null } }
      }
      const rem = tm.remaining > 0 ? tm.remaining : tm.duration
      return {
        ...state,
        timer: { ...tm, remaining: rem, running: true, endAt: action.now + rem * 1000 },
      }
    }
    case 'timerReset':
      return {
        ...state,
        timer: { ...state.timer, remaining: state.timer.duration, running: false, endAt: null },
      }
    case 'timerAdd': {
      const tm = state.timer
      const rem = Math.min(3599, tm.remaining + action.seconds)
      return {
        ...state,
        timer: { ...tm, remaining: rem, endAt: tm.running ? action.now + rem * 1000 : tm.endAt },
      }
    }
    case 'timerTick': {
      const tm = state.timer
      if (!tm.running || tm.endAt == null) return state
      const r = Math.max(0, Math.round((tm.endAt - action.now) / 1000))
      if (r <= 0) {
        return { ...state, timer: { ...tm, remaining: 0, running: false, endAt: null } }
      }
      if (r === tm.remaining) return state
      return { ...state, timer: { ...tm, remaining: r } }
    }

    default:
      return state
  }
}
