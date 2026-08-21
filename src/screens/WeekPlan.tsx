import './WeekPlan.css'
import { anchorLifts, COND, NOTES, WEEKS } from '../data/program'
import type { Week } from '../data/types'
import { basisForWeek, computeLoad } from '../engine/loads'
import { useAppDispatch, useAppState } from '../state/context'
import { PhasePill } from '../components/PhasePill'

/** Screen 2 — the whole periodized block; tap a week to make it active. */
export function WeekPlan() {
  return (
    <>
      <p className="plan-intro">
        Loads recalculate from your 1RM × each week's %1RM. Tap a week to make it
        active.
      </p>
      {WEEKS.map((w) => (
        <WeekCard key={w.wk} w={w} />
      ))}
      <HowToProgress />
    </>
  )
}

function WeekCard({ w }: { w: Week }) {
  const { week, rm, basisAt, rounding, openWeek } = useAppState()
  const dispatch = useAppDispatch()
  const active = w.wk === week
  const open = openWeek === w.wk
  const past = w.wk < week
  const basis = basisForWeek({ rm, rounding }, basisAt, w.wk)

  return (
    <div className={`week-card${active ? ' week-card--active' : ''}`}>
      <button
        type="button"
        className="week-card__head"
        onClick={() => dispatch({ type: 'setWeek', week: w.wk })}
      >
        <div className="week-card__head-left">
          <div className="week-card__wk">W{w.wk}</div>
          <div className="week-card__meta">
            <PhasePill phase={w.phase} tag={w.tag} size="card" />
            <div className="week-card__rpe">target RPE {w.rpe}</div>
          </div>
        </div>
        <div
          className={`week-card__cta${active ? ' week-card__cta--active' : ''}`}
        >
          {active ? '● ACTIVE' : 'SET ACTIVE'}
        </div>
      </button>

      <div className="week-card__loads">
        {anchorLifts(w.wk).map((l) => (
          <div key={l.key} className="load-tile">
            <div className="load-tile__abbr">{l.abbr}</div>
            <div className="load-tile__num">
              {computeLoad(basis.rm[l.key], w.wk, l.key, basis.rounding)}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="week-card__toggle"
        onClick={() => dispatch({ type: 'toggleWeek', week: w.wk })}
      >
        {open ? 'Hide conditioning ▲' : 'Show conditioning ▾'}
      </button>

      {open && (
        <div className="week-card__cond">
          {past && <PastWeekRm w={w} />}
          {COND.map((c) => (
            <div key={c.key} className="week-card__cond-row">
              <span className="week-card__cond-label">{c.short}</span>
              <span className="week-card__cond-desc">{w.cond[c.key]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The basis a finished week was trained on. Shown only on past weeks, because
 * the current and future ones follow the live values by design. Editable so a
 * week that froze at the wrong numbers can be corrected after the fact.
 */
function PastWeekRm({ w }: { w: Week }) {
  const { rm, rounding, basisAt } = useAppState()
  const dispatch = useAppDispatch()
  const frozen = basisAt[w.wk]
  const basis = frozen ?? { rm, rounding }

  return (
    <div className="week-rm">
      <div className="week-rm__head">
        <span className="week-rm__title">1RM USED</span>
        {!frozen && (
          <span className="week-rm__hint">still follows current</span>
        )}
      </div>
      <div className="week-rm__grid">
        {anchorLifts(w.wk).map((l) => (
          <label key={l.key} className="week-rm__tile">
            <span className="week-rm__abbr">{l.abbr}</span>
            <input
              type="number"
              inputMode="numeric"
              className="week-rm__input"
              aria-label={`Week ${w.wk} ${l.name} 1RM`}
              value={basis.rm[l.key]}
              onChange={(e) =>
                dispatch({
                  type: 'setRmAt',
                  week: w.wk,
                  lift: l.key,
                  value: e.target.value,
                })
              }
            />
          </label>
        ))}
      </div>
      <label className="week-rm__round">
        <span className="week-rm__round-label">Rounded to</span>
        <select
          className="week-rm__select"
          aria-label={`Week ${w.wk} rounding`}
          value={basis.rounding}
          onChange={(e) =>
            dispatch({
              type: 'setRoundingAt',
              week: w.wk,
              rounding: e.target.value,
            })
          }
        >
          <option value="1">1</option>
          <option value="2.5">2.5</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
        <span className="week-rm__round-unit">lb</span>
      </label>
    </div>
  )
}

function HowToProgress() {
  return (
    <div className="progress-card">
      <div className="progress-card__head">
        <span className="progress-card__title">HOW TO PROGRESS</span>
        <span className="progress-card__rule" />
      </div>
      {NOTES.map((text) => (
        <div key={text} className="progress-card__note">
          <span className="progress-card__marker">▸</span>
          <span className="progress-card__text">{text}</span>
        </div>
      ))}
    </div>
  )
}
