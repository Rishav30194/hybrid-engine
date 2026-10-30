import './Header.css'
import { useEffect, useRef } from 'react'
import { PHASES, WEEKS } from '../data/program'
import { useAppDispatch, useAppState } from '../state/context'
import { AccountControl } from '../auth/AccountControl'

/** Sticky header: brand, account/sync control, and the scrolling week chips. */
export function Header() {
  const { week } = useAppState()
  const dispatch = useAppDispatch()
  const chipsRef = useRef<HTMLDivElement>(null)

  // Twelve chips overflow a phone, and most of the block is spent past the
  // first screenful — keep the active one centred rather than off to the right.
  useEffect(() => {
    const row = chipsRef.current
    const chip = row?.querySelector<HTMLElement>('.chip--active')
    if (!row || !chip) return
    const offset = chip.getBoundingClientRect().left - row.getBoundingClientRect().left
    row.scrollLeft += offset - (row.clientWidth - chip.offsetWidth) / 2
  }, [week])

  return (
    <header className="app__header header">
      <div className="header__top">
        <div className="header__brand">
          <span className="header__accent-bar" />
          <div>
            <div className="header__title">HYBRID ENGINE</div>
            <div className="header__subtitle">3-Day Hypertrophy</div>
          </div>
        </div>
        <AccountControl />
      </div>

      <div className="header__chips" ref={chipsRef}>
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
