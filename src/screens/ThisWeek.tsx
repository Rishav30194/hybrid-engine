import './ThisWeek.css'
import { useState } from 'react'
import { DAYS, OFF_DAYS, TEST_WEEK, WEEKS, weekAt } from '../data/program'
import { weekProgress } from '../engine/progress'
import { planNewBlock } from '../engine/newBlock'
import { useAppDispatch, useAppState } from '../state/context'
import { PhasePill } from '../components/PhasePill'
import { SectionLabel } from '../components/SectionLabel'

/**
 * Screen 1 — the dashboard. Deliberately does *not* restate the week's lifts or
 * conditioning: those live on 8-Week and Template, and duplicating them here
 * meant two independent sets of check-offs for the same session. This screen
 * shows how far through the block you actually are.
 */
export function ThisWeek() {
  const { week } = useAppState()

  return (
    <>
      <WeekHero week={week} />

      <SectionLabel>BLOCK PROGRESS</SectionLabel>
      <BlockProgress />

      {week === TEST_WEEK && <NewBlock />}

      <div className="off-days">
        <div className="off-days__label">OFF DAYS</div>
        <div className="off-days__desc">{OFF_DAYS}</div>
      </div>
    </>
  )
}

function WeekHero({ week }: { week: number }) {
  const w = weekAt(week)
  return (
    <div className="week-hero">
      <PhasePill phase={w.phase} tag={w.tag} />
      <div className="week-hero__row">
        <div className="week-hero__title">WEEK {week}</div>
        <div className="week-hero__sub">of 8 · target RPE {w.rpe}</div>
      </div>
    </div>
  )
}

/** One row per week: number, fill bar, count. No prose — a glance, not a report. */
function BlockProgress() {
  const { week, done } = useAppState()

  return (
    <div className="block">
      {WEEKS.map((w) => {
        const p = weekProgress(DAYS, w.wk, done)
        const pct = p.total ? (p.done / p.total) * 100 : 0
        const cls = [
          'block__row',
          w.wk === week ? 'block__row--active' : '',
          p.complete ? 'block__row--complete' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div key={w.wk} className={cls}>
            <span className="block__wk">W{w.wk}</span>
            <span className="block__track">
              <span className="block__fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="block__count">
              {p.done}/{p.total}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * The last week only. Carries every logged weight forward and clears every
 * check-off. Two taps, because it is not undoable and there is no export.
 */
function NewBlock() {
  const { week, log } = useAppState()
  const dispatch = useAppDispatch()
  const [confirming, setConfirming] = useState(false)

  const carry = planNewBlock(DAYS, week, log)
  const carried = Object.keys(carry).length

  if (!confirming) {
    return (
      <button
        type="button"
        className="new-block__open"
        onClick={() => setConfirming(true)}
      >
        Start new block
      </button>
    )
  }

  return (
    <div className="new-block">
      <div className="new-block__title">START NEW BLOCK</div>

      <div className="new-block__note">
        Carries {carried} logged weight{carried === 1 ? '' : 's'} into week 1.
        Clears every check-off. Cannot be undone.
      </div>

      <div className="new-block__actions">
        <button
          type="button"
          className="new-block__cancel"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="new-block__go"
          onClick={() => {
            dispatch({ type: 'startNewBlock', carry })
            setConfirming(false)
          }}
        >
          Start week 1
        </button>
      </div>
    </div>
  )
}
