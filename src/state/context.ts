import { createContext, useContext, type Dispatch } from 'react'
import { INITIAL_STATE } from './reducer'
import type { Action, AppState } from './types'

export const StateContext = createContext<AppState>(INITIAL_STATE)
export const DispatchContext = createContext<Dispatch<Action>>(() => {})

export function useAppState(): AppState {
  return useContext(StateContext)
}

export function useAppDispatch(): Dispatch<Action> {
  return useContext(DispatchContext)
}
