import { useEffect, useReducer, type ReactNode } from 'react'
import { StateContext, DispatchContext } from './context'
import { loadState, persistedSnapshot, writeSnapshot } from './persistence'
import { reducer } from './reducer'

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy init hydrates from localStorage before the first render (no flash).
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  // Persist only when the serialized saved slice actually changes. Tab/timer/
  // accordion/scroll updates leave this snapshot untouched, so no write fires.
  const snapshot = persistedSnapshot(state)
  useEffect(() => {
    writeSnapshot(snapshot)
  }, [snapshot])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}
