import './ThisWeek.css'
import { DAYS, LIFTS, OFF_DAYS, WEEKS, weekAt } from '../data/program'
import { weekProgress } from '../engine/progress'
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

function OneRepMaxEditor() {
  const { rm, rounding } = useAppState()
  const dispatch = useAppDispatch()

  return (
    <div className="rm-editor">
      <div className="rm-editor__head">
        <span className="rm-editor__title">YOUR 1-REP MAX</span>
        <span className="rm-editor__hint">edit to recalc ↻</span>
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
                value={rm[l.key]}
                onChange={(e) =>
                  dispatch({ type: 'setRm', lift: l.key, value: e.target.value })
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
          value={rounding}
          onChange={(e) =>
            dispatch({ type: 'setRounding', rounding: e.target.value })
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
