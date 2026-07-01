import './Template.css'
import { CONDINFO, DAYS, WEEKS } from '../data/program'
import type { Day, Exercise } from '../data/types'
import { computeLoad, exerciseMeta } from '../engine/loads'
import { dayProgress } from '../engine/progress'
import { tmplCondDoneKey, tmplDoneKey } from '../engine/keys'
import { useAppDispatch, useAppState } from '../state/context'
import { CheckButton } from '../components/CheckButton'

/** Screen 3 — the 5-day workout; main loads come live from the active week,
 *  accessory weights are logged per week. */
export function Template() {
  const { week } = useAppState()
  return (
    <>
      <p className="tmpl-intro">
        Main-lift loads auto-calculate for{' '}
        <span className="tmpl-intro__wk">WEEK {week}</span>. Type into the box on
        each accessory to log the weight you used — it saves per week.
      </p>
      {DAYS.map((d) => (
        <DayAccordion key={d.n} day={d} />
      ))}
    </>
  )
}

function DayAccordion({ day }: { day: Day }) {
  const { week, done, openDay } = useAppState()
  const dispatch = useAppDispatch()
  const open = openDay === day.n
  const prog = dayProgress(day, week, done)

  const stateClass = prog.complete
    ? ' day-card--complete'
    : open
      ? ' day-card--open'
      : ''

  return (
    <div className={`day-card${stateClass}`}>
      <button
        type="button"
        className="day-card__head"
        onClick={() => dispatch({ type: 'toggleDay', day: day.n })}
      >
        <div className="day-card__head-left">
          <div className="day-card__title">{day.title}</div>
          <div className="day-card__sub">{day.sub}</div>
        </div>
        <div className="day-card__head-right">
          <span
            className={`day-card__progress${prog.complete ? ' day-card__progress--complete' : ''}`}
          >
            {prog.done}/{prog.total}
          </span>
          <span className="day-card__caret">{open ? '▲' : '▾'}</span>
        </div>
      </button>

      {open && (
        <div className="day-card__body">
          {day.ex.map((e) => (
            <ExerciseRow key={e.id} ex={e} />
          ))}
          <ConditioningBlock day={day} />
        </div>
      )}
    </div>
  )
}

function ExerciseRow({ ex }: { ex: Exercise }) {
  const { week, rm, rounding, done, log } = useAppState()
  const dispatch = useAppDispatch()
  const id = tmplDoneKey(week, ex.id)
  const main = ex.main

  return (
    <div className="ex-row">
      <CheckButton
        size="exercise"
        checked={!!done[id]}
        onToggle={() => dispatch({ type: 'toggleDone', id })}
      />
      <div className="ex-row__body">
        <div className="ex-row__top">
          <span className="ex-row__name">{ex.name}</span>
          {main ? (
            <span className="ex-row__load">
              {computeLoad(rm[main], week, main, rounding)} lb
            </span>
          ) : (
            <input
              type="text"
              inputMode="decimal"
              className="ex-row__input"
              value={log[id] ?? ''}
              placeholder={ex.load}
              onChange={(e) =>
                dispatch({ type: 'setLog', id, value: e.target.value })
              }
            />
          )}
        </div>
        <div className="ex-row__meta">{exerciseMeta(ex)}</div>
        <div className="ex-row__note">{ex.note}</div>
      </div>
    </div>
  )
}

function ConditioningBlock({ day }: { day: Day }) {
  const { week, done } = useAppState()
  const dispatch = useAppDispatch()
  const id = tmplCondDoneKey(week, day.condKey)

  return (
    <div className="ex-cond">
      <CheckButton
        size="exercise"
        checked={!!done[id]}
        onToggle={() => dispatch({ type: 'toggleDone', id })}
      />
      <div className="ex-cond__body">
        <div className="ex-cond__label">CONDITIONING · {day.condLabel}</div>
        <div className="ex-cond__desc">{WEEKS[week - 1].cond[day.condKey]}</div>
        <div className="ex-cond__how">{CONDINFO[day.condKey]}</div>
      </div>
    </div>
  )
}
