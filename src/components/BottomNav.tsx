import './BottomNav.css'
import { useAppDispatch, useAppState } from '../state/context'
import type { Tab } from '../state/types'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'week', label: 'THIS WEEK', icon: '◉' },
  { key: 'plan', label: '8-WEEK', icon: '▦' },
  { key: 'template', label: 'TEMPLATE', icon: '≣' },
]

/** Fixed bottom tab bar; active tab gets an accent top border + accent color. */
export function BottomNav() {
  const { tab } = useAppState()
  const dispatch = useAppDispatch()

  return (
    <nav className="app__nav bottom-nav">
      {TABS.map((t) => {
        const active = tab === t.key
        return (
          <button
            key={t.key}
            type="button"
            className={`bottom-nav__tab${active ? ' bottom-nav__tab--active' : ''}`}
            onClick={() => dispatch({ type: 'setTab', tab: t.key })}
          >
            <span className="bottom-nav__icon">{t.icon}</span>
            <span className="bottom-nav__label">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
