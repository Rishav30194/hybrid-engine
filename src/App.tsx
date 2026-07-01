import './App.css'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { useAppState } from './state/context'

/**
 * Phase 3 — global chrome wired up: header, week chips, bottom nav, tab switching.
 * The three screens land in Phases 4–6; placeholders stand in for now.
 */
export default function App() {
  const { tab } = useAppState()

  return (
    <div className="app">
      <Header />

      <main className="app__main">
        {tab === 'week' && <ScreenPlaceholder label="This Week" />}
        {tab === 'plan' && <ScreenPlaceholder label="8-Week Plan" />}
        {tab === 'template' && <ScreenPlaceholder label="Template" />}
      </main>

      <BottomNav />
    </div>
  )
}

function ScreenPlaceholder({ label }: { label: string }) {
  return <div className="screen-placeholder">{label} — coming in a later phase.</div>
}
