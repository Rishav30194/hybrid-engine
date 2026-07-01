import { useEffect, useReducer, useRef, type ReactNode } from 'react'
import { StateContext, DispatchContext } from './context'
import {
  consumeUpdatedAt,
  loadState,
  persistedSnapshot,
  writeSnapshot,
} from './persistence'
import { reducer } from './reducer'

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy init hydrates from localStorage before the first render (no flash).
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const firstRun = useRef(true)

  // Persist when the serialized content changes. Skip the first run so the
  // initial hydrate doesn't re-stamp updatedAt (which would make local always
  // look newer than the cloud). Tab/timer/accordion/scroll leave this untouched.
  const snapshot = persistedSnapshot(state)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    writeSnapshot(snapshot, consumeUpdatedAt())
  }, [snapshot])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}
