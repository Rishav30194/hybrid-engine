import './App.css'
import { WEEKS } from './data/program'
import { useAppState } from './state/store'

/**
 * Phase 2 — shell now reads live state from the store.
 * Real chrome/screens land in Phases 3+.
 */
export default function App() {
  const { week } = useAppState()
  const rpe = WEEKS[week - 1].rpe

  return (
    <div className="app">
      <header className="app__header shell-placeholder shell-placeholder--header">
        <span className="shell-accent-bar" />
        <span className="shell-title">HYBRID ENGINE</span>
      </header>

      <main className="app__main">
        <div className="shell-placeholder shell-placeholder--body">
          Week {week} · target RPE {rpe} — state wired, screens land in later phases.
        </div>
      </main>

      <nav className="app__nav shell-placeholder shell-placeholder--nav">
        <span>THIS WEEK</span>
        <span>8-WEEK</span>
        <span>TEMPLATE</span>
      </nav>
    </div>
  )
}
