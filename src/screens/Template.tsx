import './Template.css'
import { CONDINFO, DAYS, weekAt } from '../data/program'
import type { Day, Exercise } from '../data/types'
import { exerciseMeta, mainLiftMeta, resolveExercise } from '../engine/loads'
import { dayProgress } from '../engine/progress'
import {
  backoffId,
  lsrpeId,
  repsId,
  tmplCondDoneKey,
  tmplDoneKey,
} from '../engine/keys'
import { useAppDispatch, useAppState } from '../state/context'
import { CheckButton } from '../components/CheckButton'

/** Screen 3 — the 3-day workout; every exercise logs weight × reps per week. */
export function Template() {
  const { week } = useAppState()
  return (
    <>
      <p className="tmpl-intro">
        Log weight × reps of your last set for{' '}
        <span className="tmpl-intro__wk">WEEK {week}</span>. Last week's numbers show
        faintly until you type.
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

export function ExerciseRow({ ex }: { ex: Exercise }) {
  const { week, done, log } = useAppState()
  const dispatch = useAppDispatch()
  const id = tmplDoneKey(week, ex.id)
  const rpeLogId = tmplDoneKey(week, lsrpeId(ex.id))
  const { main, name } = resolveExercise(ex, week)

  return (
    <div className="ex-row">
      <CheckButton
        size="exercise"
        checked={!!done[id]}
        onToggle={() => dispatch({ type: 'toggleDone', id })}
      />
      <div className="ex-row__body">
        <div className="ex-row__top">
          <span className="ex-row__name">{name}</span>
          <SetEntry week={week} logId={ex.id} label={name} />
        </div>
        {ex.backoff && (
          <div className="ex-row__backoff">
            <span className="ex-row__backoff-label">back-off</span>
            <SetEntry
              week={week}
              logId={backoffId(ex.id)}
              label={`${name} back-off`}
            />
          </div>
        )}
        {/* Main lifts read the active week's prescription, which narrows across
            the block (4×5→4×4 becomes 4×5 in week 1); accessories are static.
            The felt RPE rides this line rather than taking one of its own: it
            reads directly against the RPE prescribed a few words to its left,
            and the row keeps the height it had before the field existed. */}
        <div className="ex-row__meta">
          <span className="ex-row__meta-text">
            {main
              ? `${mainLiftMeta(week, main)} · rest ${ex.rest}`
              : exerciseMeta(ex)}
          </span>
          <label className="lsrpe">
            <span className="lsrpe__label">felt</span>
            <input
              type="text"
              inputMode="decimal"
              className="ex-row__input lsrpe__input"
              value={log[rpeLogId] ?? ''}
              placeholder="RPE"
              onChange={(e) =>
                dispatch({ type: 'setLog', id: rpeLogId, value: e.target.value })
              }
            />
          </label>
        </div>
        <div className="ex-row__note">{ex.note}</div>
      </div>
    </div>
  )
}

/**
 * One weight × reps pair; the reps are the last set's. Empty boxes show last
 * week's numbers as placeholders, so the number to match or beat sits where you
 * type it rather than on a line of its own.
 */
function SetEntry({
  week,
  logId,
  label,
}: {
  week: number
  logId: string
  label: string
}) {
  const { log } = useAppState()
  const dispatch = useAppDispatch()
  const weightKey = tmplDoneKey(week, logId)
  const repsKey = tmplDoneKey(week, repsId(logId))
  const last = (id: string) => (week > 1 ? log[tmplDoneKey(week - 1, id)] : undefined)

  return (
    <span className="set-entry">
      <input
        type="text"
        inputMode="decimal"
        className="ex-row__input set-entry__weight"
        aria-label={`${label} weight`}
        value={log[weightKey] ?? ''}
        placeholder={last(logId) || 'weight'}
        onChange={(e) =>
          dispatch({ type: 'setLog', id: weightKey, value: e.target.value })
        }
      />
      <span className="set-entry__x">×</span>
      <input
        type="text"
        inputMode="numeric"
        className="ex-row__input set-entry__reps"
        aria-label={`${label} reps`}
        value={log[repsKey] ?? ''}
        placeholder={last(repsId(logId)) || 'reps'}
        onChange={(e) =>
          dispatch({ type: 'setLog', id: repsKey, value: e.target.value })
        }
      />
    </span>
  )
}

function ConditioningBlock({ day }: { day: Day }) {
  const { week, done, log } = useAppState()
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
        <div className="ex-cond__desc">{weekAt(week).cond[day.condKey]}</div>
        <div className="ex-cond__how">{CONDINFO[day.condKey]}</div>
        {day.condLoads?.map((load) => (
          <CondLoadRow key={load.id} week={week} load={load} log={log} />
        ))}
      </div>
    </div>
  )
}

/** Logged value for one loaded conditioning piece — same storage as accessory
 *  weights (`log` keyed per week), so it progresses week to week alongside them.
 *  Not always a weight: the climber logs a machine level, so unit and
 *  placeholder are per-piece. */
function CondLoadRow({
  week,
  load,
  log,
}: {
  week: number
  load: NonNullable<Day['condLoads']>[number]
  log: Record<string, string>
}) {
  const dispatch = useAppDispatch()
  const id = tmplDoneKey(week, load.id)

  return (
    <label className="cond-load">
      <span className="cond-load__label">{load.label}</span>
      <input
        type="text"
        inputMode="decimal"
        className="ex-row__input cond-load__input"
        value={log[id] ?? ''}
        placeholder={load.placeholder ?? 'weight'}
        onChange={(e) => dispatch({ type: 'setLog', id, value: e.target.value })}
      />
      <span className="cond-load__unit">{load.unit ?? 'lb'}</span>
    </label>
  )
}
