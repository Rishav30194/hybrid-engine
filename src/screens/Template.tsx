import './Template.css'
import { CONDINFO, DAYS, weekAt } from '../data/program'
import type { Day, Exercise } from '../data/types'
import {
  computeLoad,
  rmForWeek,
  exerciseMeta,
  mainLiftMeta,
  resolveExercise,
} from '../engine/loads'
import { SHOW_PERCENTS } from '../config'
import { dayProgress } from '../engine/progress'
import { tmplCondDoneKey, tmplDoneKey } from '../engine/keys'
import { testRepsId, testRpeId } from '../engine/e1rm'
import { TEST_WEEK } from '../data/program'
import { useAppDispatch, useAppState } from '../state/context'
import { CheckButton } from '../components/CheckButton'

/** Screen 3 — the 3-day workout; main loads come live from the active week,
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
  const { week, rm, rmAt, rounding, done, log } = useAppState()
  const weekRm = rmForWeek(rm, rmAt, week)
  const dispatch = useAppDispatch()
  const id = tmplDoneKey(week, ex.id)
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
          {main ? (
            <span className="ex-row__load">
              {computeLoad(weekRm[main], week, main, rounding)} lb
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
        {/* Main lifts read the active week's prescription, which narrows across
            the block (4×5→4×4 becomes 4×5 in week 1); accessories are static. */}
        <div className="ex-row__meta">
          {main
            ? `${mainLiftMeta(week, main, SHOW_PERCENTS)} · rest ${ex.rest}`
            : exerciseMeta(ex)}
        </div>
        <div className="ex-row__note">{ex.note}</div>
        {main && week === TEST_WEEK && <TestSet ex={ex} week={week} log={log} />}
      </div>
    </div>
  )
}

/**
 * Week 8 only. What the AMRAP actually produced, so the next block's 1RM can be
 * estimated from it. Weight pre-fills with the calculated 90% — which is the
 * set you're doing — leaving reps and RPE as the two things only you know.
 */
function TestSet({
  ex,
  week,
  log,
}: {
  ex: Exercise
  week: number
  log: Record<string, string>
}) {
  const dispatch = useAppDispatch()
  const { rm, rmAt, rounding } = useAppState()
  const weekRm = rmForWeek(rm, rmAt, week)
  const { main } = resolveExercise(ex, week)

  const fields = [
    {
      id: tmplDoneKey(week, ex.id),
      label: 'Weight',
      hint: main ? String(computeLoad(weekRm[main], week, main, rounding)) : '',
    },
    // Reps are the unknown in an AMRAP, so there's nothing sensible to suggest.
    { id: tmplDoneKey(week, testRepsId(ex.id)), label: 'Reps', hint: 'reps' },
    { id: tmplDoneKey(week, testRpeId(ex.id)), label: 'RPE', hint: '10' },
  ]

  return (
    <div className="test-set">
      {fields.map((f) => (
        <label key={f.id} className="test-set__field">
          <span className="test-set__label">{f.label}</span>
          <input
            type="text"
            inputMode="decimal"
            className="ex-row__input test-set__input"
            value={log[f.id] ?? ''}
            placeholder={f.hint}
            onChange={(e) =>
              dispatch({ type: 'setLog', id: f.id, value: e.target.value })
            }
          />
        </label>
      ))}
    </div>
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
