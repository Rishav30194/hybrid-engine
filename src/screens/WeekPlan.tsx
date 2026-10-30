import './WeekPlan.css'
import { NOTES, WEEKS } from '../data/program'
import type { Week } from '../data/types'
import { useAppDispatch, useAppState } from '../state/context'
import { PhasePill } from '../components/PhasePill'

/** Screen 2 — the whole periodized block; tap a week to make it active. */
export function WeekPlan() {
  return (
    <>
      <p className="plan-intro">Tap a week to make it active.</p>
      {WEEKS.map((w) => (
        <WeekCard key={w.wk} w={w} />
      ))}
      <HowToProgress />
    </>
  )
}

function WeekCard({ w }: { w: Week }) {
  const { week } = useAppState()
  const dispatch = useAppDispatch()
  const active = w.wk === week

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
