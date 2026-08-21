import './ThisWeek.css'
import { useState } from 'react'
import { DAYS, LIFTS, OFF_DAYS, TEST_WEEK, WEEKS, weekAt } from '../data/program'
import { basisForWeek } from '../engine/loads'
import { weekProgress } from '../engine/progress'
import { planNewBlock } from '../engine/newBlock'
import { useAppDispatch, useAppState } from '../state/context'
import { PhasePill } from '../components/PhasePill'
import { SectionLabel } from '../components/SectionLabel'

/**
 * Screen 1 — the dashboard. Deliberately does *not* restate the week's lifts or
 * conditioning: those live on 8-Week and Template, and duplicating them here
 * meant two independent sets of check-offs for the same session. This screen
 * owns the 1RM editor — the input every load derives from — and shows how far
 * through the block you actually are.
 */
export function ThisWeek() {
  const { week } = useAppState()

  return (
    <>
      <WeekHero week={week} />
      <OneRepMaxEditor />

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

/**
 * The 1RM the *active* week trains on, which is not always the live one. Once a
 * week is frozen (see `basisForWeek`) its loads stop following `rm`, so editing
 * `rm` here would move every week except the one on screen. Edits therefore go
 * to whichever the active week actually reads.
 */
function OneRepMaxEditor() {
  const { week, rm, rounding, basisAt } = useAppState()
  const dispatch = useAppDispatch()
  const frozen = basisAt[week]
  const basis = basisForWeek({ rm, rounding }, basisAt, week)

  return (
    <div className="rm-editor">
      <div className="rm-editor__head">
        <span className="rm-editor__title">YOUR 1-REP MAX</span>
        <span className="rm-editor__hint">
          {frozen ? `week ${week} only ↻` : 'edit to recalc ↻'}
        </span>
      </div>

      <div className="rm-editor__grid">
        {LIFTS.map((l) => (
          <label key={l.key} className="rm-tile">
            <span className="rm-tile__name">{l.name}</span>
            <div className="rm-tile__field">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                className="rm-tile__input"
                value={basis.rm[l.key]}
                onChange={(e) =>
                  dispatch(
                    frozen
                      ? { type: 'setRmAt', week, lift: l.key, value: e.target.value }
                      : { type: 'setRm', lift: l.key, value: e.target.value },
                  )
                }
              />
              <span className="rm-tile__unit">lb</span>
            </div>
          </label>
        ))}
      </div>

      <div className="rm-editor__round">
        <span className="rm-editor__round-label">Round loads to</span>
        <select
          className="rm-editor__select"
          value={basis.rounding}
          onChange={(e) =>
            dispatch(
              frozen
                ? { type: 'setRoundingAt', week, rounding: e.target.value }
                : { type: 'setRounding', rounding: e.target.value },
            )
          }
        >
          <option value="1">1</option>
          <option value="2.5">2.5</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
        <span className="rm-editor__unit">lb</span>
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
 * Week 8 only. Turns the tested sets into the next block's 1RMs, carries the
 * accessory and conditioning weights forward, and clears every check-off.
 * Two taps, because it is not undoable and there is no export.
 */
function NewBlock() {
  const { week, rm, log } = useAppState()
  const dispatch = useAppDispatch()
  const [confirming, setConfirming] = useState(false)

  const plan = planNewBlock(DAYS, week, rm, log)
  const carried = Object.keys(plan.carry).length

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

      <div className="new-block__rows">
        {LIFTS.map((l) => {
          const next = plan.rm[l.key]
          const estimated = plan.estimated[l.key] !== undefined
          return (
            <div key={l.key} className="new-block__row">
              <span className="new-block__lift">{l.abbr}</span>
              <span className="new-block__was">{rm[l.key]}</span>
              <span className="new-block__arrow">→</span>
              <span
                className={`new-block__next${estimated ? ' new-block__next--est' : ''}`}
              >
                {next}
              </span>
              <span className="new-block__src">
                {estimated ? 'from test' : 'unchanged'}
              </span>
            </div>
          )
        })}
      </div>

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
            dispatch({ type: 'startNewBlock', rm: plan.rm, carry: plan.carry })
            setConfirming(false)
          }}
        >
          Start week 1
        </button>
      </div>
    </div>
  )
}
