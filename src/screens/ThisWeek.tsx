import './ThisWeek.css'
import { COND, CONDINFO, LIFTS, WEEKS } from '../data/program'
import type { ConditioningDay, Lift } from '../data/types'
import { computeLoad, mainLiftMeta } from '../engine/loads'
import { condDoneKey, mainDoneKey } from '../engine/keys'
import { SHOW_PERCENTS } from '../config'
import { useAppDispatch, useAppState } from '../state/context'
import { CheckButton } from '../components/CheckButton'
import { PhasePill } from '../components/PhasePill'
import { SectionLabel } from '../components/SectionLabel'

/** Screen 1 — the athlete's "what am I lifting today" view for the active week. */
export function ThisWeek() {
  const { week } = useAppState()

  return (
    <>
      <WeekHero week={week} />
      <OneRepMaxEditor />

      <SectionLabel>MAIN LIFTS</SectionLabel>
      {LIFTS.map((lift) => (
        <MainLiftRow key={lift.key} lift={lift} />
      ))}

      <SectionLabel>CONDITIONING</SectionLabel>
      {COND.map((c) => (
        <ConditioningRow key={c.key} cond={c} />
      ))}
    </>
  )
}

function WeekHero({ week }: { week: number }) {
  const w = WEEKS[week - 1]
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

function MainLiftRow({ lift }: { lift: Lift }) {
  const { week, rm, rounding, done } = useAppState()
  const dispatch = useAppDispatch()
  const id = mainDoneKey(week, lift.key)

  return (
    <div className="lift-row">
      <CheckButton
        checked={!!done[id]}
        onToggle={() => dispatch({ type: 'toggleDone', id })}
      />
      <div className="lift-row__body">
        <div className="lift-row__name">{lift.name}</div>
        <div className="lift-row__meta">
          {mainLiftMeta(week, lift.key, SHOW_PERCENTS)}
        </div>
        <div className="lift-row__note">{lift.note}</div>
      </div>
      <div className="lift-row__load">
        <div className="lift-row__load-num">
          {computeLoad(rm[lift.key], week, lift.key, rounding)}
        </div>
        <div className="lift-row__load-unit">lb</div>
      </div>
    </div>
  )
}

function ConditioningRow({ cond }: { cond: ConditioningDay }) {
  const { week, done } = useAppState()
  const dispatch = useAppDispatch()
  const id = condDoneKey(week, cond.key)

  return (
    <div className="cond-row">
      <CheckButton
        size="cond"
        checked={!!done[id]}
        onToggle={() => dispatch({ type: 'toggleDone', id })}
      />
      <div className="cond-row__body">
        <div className="cond-row__label">{cond.label}</div>
        <div className="cond-row__desc">{WEEKS[week - 1].cond[cond.key]}</div>
        <div className="cond-row__how">{CONDINFO[cond.key]}</div>
      </div>
    </div>
  )
}
