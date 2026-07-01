import './Header.css'
import { PHASES, WEEKS } from '../data/program'
import { useAppDispatch, useAppState } from '../state/context'
import { AccountControl } from '../auth/AccountControl'

/** Sticky header: brand, account/sync control, and the scrolling week chips. */
export function Header() {
  const { week } = useAppState()
  const dispatch = useAppDispatch()

  return (
    <header className="app__header header">
      <div className="header__top">
        <div className="header__brand">
          <span className="header__accent-bar" />
          <div>
            <div className="header__title">HYBRID ENGINE</div>
            <div className="header__subtitle">5-Day Strength · Endurance</div>
          </div>
        </div>
        <AccountControl />
      </div>

      <div className="header__chips">
        {WEEKS.map((w) => {
          const active = w.wk === week
          return (
            <button
              key={w.wk}
              type="button"
              className={`chip${active ? ' chip--active' : ''}`}
              onClick={() => dispatch({ type: 'setWeek', week: w.wk })}
            >
              <span>W{w.wk}</span>
              <span
                className="chip__dash"
                style={{ background: PHASES[w.phase].color }}
              />
            </button>
          )
        })}
      </div>
    </header>
  )
}
