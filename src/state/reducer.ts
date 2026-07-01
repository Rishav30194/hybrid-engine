import { toNum } from '../engine/loads'
import type { Action, AppState } from './types'

export const INITIAL_STATE: AppState = {
  tab: 'week',
  week: 1,
  rounding: 5,
  rm: { squat: 245, bench: 225, tbdl: 375, ohp: 135 },
  done: {},
  log: {},
  openWeek: 0,
  openDay: 1,
  timer: { open: false, running: false, duration: 90, remaining: 90, endAt: null },
  pillHidden: false,
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setTab':
      return { ...state, tab: action.tab }
    case 'setWeek':
      return { ...state, week: action.week }
    case 'setRounding':
      return { ...state, rounding: toNum(action.rounding) || 1 }
    case 'setRm':
      // Keep "" as-is so the input can be cleared; the engine treats it as 0.
      return {
        ...state,
        rm: {
          ...state.rm,
          [action.lift]: action.value === '' ? '' : toNum(action.value),
        },
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
