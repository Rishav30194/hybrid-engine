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
    default:
      return state
  }
}
