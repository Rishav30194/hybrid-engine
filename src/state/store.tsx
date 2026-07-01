import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { loadState, saveState } from './persistence'
import { INITIAL_STATE, reducer } from './reducer'
import type { Action, AppState } from './types'

const StateContext = createContext<AppState>(INITIAL_STATE)
const DispatchContext = createContext<Dispatch<Action>>(() => {})

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy init hydrates from localStorage before the first render (no flash).
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  // Persist only when the saved slice changes — not on tab/timer/accordion/scroll.
  useEffect(() => {
    saveState(state)
  }, [state.week, state.rounding, state.rm, state.done, state.log])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState(): AppState {
  return useContext(StateContext)
}

export function useAppDispatch(): Dispatch<Action> {
  return useContext(DispatchContext)
}
