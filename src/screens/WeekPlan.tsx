import './WeekPlan.css'
import { COND, LIFTS, NOTES, WEEKS } from '../data/program'
import type { Week } from '../data/types'
import { computeLoad } from '../engine/loads'
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
  const { week, rm, rounding, openWeek } = useAppState()
  const dispatch = useAppDispatch()
  const active = w.wk === week
  const open = openWeek === w.wk

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
        {LIFTS.map((l) => (
          <div key={l.key} className="load-tile">
            <div className="load-tile__abbr">{l.abbr}</div>
            <div className="load-tile__num">
              {computeLoad(rm[l.key], w.wk, l.key, rounding)}
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
