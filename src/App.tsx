import './App.css'

/**
 * Phase 0 — app shell only.
 * Header / scrolling main / bottom nav are placeholders; real chrome lands in Phase 3.
 */
export default function App() {
  return (
    <div className="app">
      <header className="app__header shell-placeholder shell-placeholder--header">
        <span className="shell-accent-bar" />
        <span className="shell-title">HYBRID ENGINE</span>
      </header>

      <main className="app__main">
        <div className="shell-placeholder shell-placeholder--body">
          Themed shell ready — screens land in later phases.
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
