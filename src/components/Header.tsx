import './Header.css'
import { PHASES, WEEKS } from '../data/program'
import { useAppDispatch, useAppState } from '../state/context'

/** Sticky header: brand, week's RPE target, and the scrolling week chips. */
export function Header() {
  const { week } = useAppState()
  const dispatch = useAppDispatch()
  const rpe = WEEKS[week - 1].rpe

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
        <div className="header__target">
          <div className="header__rpe">RPE {rpe}</div>
          <div className="header__target-label">week target</div>
        </div>
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
