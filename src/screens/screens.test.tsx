// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ThisWeek } from './ThisWeek'
import { ExerciseRow, Template } from './Template'
import { WeekPlan } from './WeekPlan'
import { StoreProvider } from '../state/store'
import { DAYS, LAST_WEEK } from '../data/program'

/**
 * jsdom's localStorage isn't exposed as a bare global here, so stub the same
 * in-memory storage the app and the test both read.
 */
function makeStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeStorage())
})

// Vitest globals are off, so RTL's automatic cleanup isn't registered.
afterEach(cleanup)

/** Render a screen with the store hydrated at `week`. */
function renderAtWeek(ui: ReactElement, week: number) {
  localStorage.setItem('hybridEngine.v1', JSON.stringify({ week }))
  return render(<StoreProvider>{ui}</StoreProvider>)
}

const textsOf = (root: HTMLElement, selector: string) =>
  [...root.querySelectorAll(selector)].map((n) => n.textContent)

const saved = () => JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')

/** Render with an explicit persisted blob. */
function renderWith(ui: ReactElement, blob: Record<string, unknown>) {
  localStorage.setItem('hybridEngine.v1', JSON.stringify(blob))
  return render(<StoreProvider>{ui}</StoreProvider>)
}

const rowNamed = (container: HTMLElement, name: string) =>
  [...container.querySelectorAll('.ex-row')].find(
    (r) => r.querySelector('.ex-row__name')?.textContent === name,
  )!

describe('This Week', () => {
  it('has no 1RM editor — every weight is logged, not computed', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelector('.rm-editor')).toBeNull()
  })

  it('names the week out of the whole block', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelector('.week-hero__sub')!.textContent).toBe(
      'of 12 · target RPE ~8',
    )
  })

  // Old devices and the cloud row still carry the retired 1RM fields and the
  // old program's logs; they must load without error and simply be ignored.
  it('loads a saved state from the old program', () => {
    const { container } = renderWith(
      <>
        <ThisWeek />
        <Template />
      </>,
      {
        week: 5,
        rounding: 2.5,
        rm: { squat: 190, bench: 145, tbdl: 225, ohp: 95 },
        basisAt: { 1: { rm: { squat: 145, bench: 135, tbdl: 205, ohp: 95 }, rounding: 5 } },
        done: { 'w5:t:mon-e0': true, 'w5:tc:mon': true },
        log: { 'w5:t:mon-e0': '160', 'w4:t:mon-e0': '155' },
      },
    )
    expect(container.querySelector('.week-hero__title')!.textContent).toBe('WEEK 5')
    const squat = container.querySelector<HTMLInputElement>('[aria-label="Back Squat weight"]')!
    expect(squat.value).toBe('')
    expect(squat.placeholder).toBe('weight')
    expect(textsOf(container, '.block__count')[4]).toBe('0/21')
  })

  it('offers Start new block only in the last week', () => {
    renderAtWeek(<ThisWeek />, LAST_WEEK - 1)
    expect(screen.queryByText('Start new block')).toBeNull()
    cleanup()
    renderAtWeek(<ThisWeek />, LAST_WEEK)
    expect(screen.getByText('Start new block')).toBeDefined()
  })

  it('starts a new block, carrying top-set and back-off weights', () => {
    renderWith(<ThisWeek />, {
      week: LAST_WEEK,
      log: {
        'w12:t:bb-mon-squat': '200',
        'w12:t:bb-mon-squat:reps': '6',
        'w12:t:bb-mon-squat:bo': '170',
      },
      done: { 'w12:t:bb-mon-squat': true },
    })
    fireEvent.click(screen.getByText('Start new block'))
    expect(screen.getByText(/Carries 2 logged weights into week 1/)).toBeDefined()
    fireEvent.click(screen.getByText('Start week 1'))

    expect(saved().week).toBe(1)
    expect(saved().log).toEqual({
      'w1:t:bb-mon-squat': '200',
      'w1:t:bb-mon-squat:bo': '170',
    })
    expect(saved().done).toEqual({})
  })

  it('shows the off-days note', () => {
    renderAtWeek(<ThisWeek />, 1)
    expect(screen.getByText('OFF DAYS')).toBeDefined()
  })

  // The screen is a dashboard. It used to restate the week's lifts and
  // conditioning with its own check-offs, which meant two independent records
  // of the same session; that duplication must not come back.
  it('does not restate the exercises', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelectorAll('.check-btn')).toHaveLength(0)
  })

  it('shows one block-progress row per week, counting 21 items each', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(textsOf(container, '.block__wk')).toEqual(
      Array.from({ length: 12 }, (_, i) => `W${i + 1}`),
    )
    // Mon 6 + Wed 7 + Fri 8
    expect(textsOf(container, '.block__count')).toEqual(Array(12).fill('0/21'))
  })

  it('counts only the active week and marks it', () => {
    const { container } = renderWith(<ThisWeek />, {
      week: 3,
      done: {
        'w3:t:bb-mon-squat': true,
        'w3:t:bb-wed-curl': true,
        'w1:t:bb-mon-squat': true,
      },
    })
    const counts = textsOf(container, '.block__count')
    expect(counts[0]).toBe('1/21') // week 1 keeps its own tally
    expect(counts[2]).toBe('2/21') // week 3
    expect(counts[3]).toBe('0/21')
    expect(container.querySelectorAll('.block__row--active')).toHaveLength(1)
    expect(
      container.querySelector('.block__row--active')?.querySelector('.block__wk')
        ?.textContent,
    ).toBe('W3')
  })
})

describe('Template', () => {
  it('renders a card per day, counting its exercises', () => {
    const { container } = renderAtWeek(<Template />, 1)
    expect(textsOf(container, '.day-card__title')).toEqual(DAYS.map((d) => d.title))
    expect(textsOf(container, '.day-card__progress')).toEqual(['0/6', '0/7', '0/8'])
  })

  it('opens Monday by default, with the warm-up and no conditioning block', () => {
    const { container } = renderAtWeek(<Template />, 1)
    expect(textsOf(container, '.ex-row__name')[0]).toBe('Back Squat')
    expect(textsOf(container, '.day-card__sub')[0]).toMatch(/^Warm up: 5 min easy climber/)
    expect(container.querySelector('.ex-cond')).toBeNull()
  })

  it('shows the exercise’s own RPE in a full-effort week', () => {
    const { container } = renderAtWeek(<Template />, 2)
    expect(rowNamed(container, 'Standing Calf Raise').querySelector('.ex-row__meta-text')!
      .textContent).toBe('3×10–12 · RPE 10 · rest 90s')
  })

  it('shows RPE ~8 on every row in the easy week', () => {
    const { container } = renderAtWeek(<Template />, 1)
    for (const meta of textsOf(container, '.ex-row__meta-text')) {
      expect(meta).toContain('RPE ~8')
    }
  })

  describe('weight × reps', () => {
    const squatInputs = (container: HTMLElement) => ({
      weight: container.querySelector<HTMLInputElement>('[aria-label="Back Squat weight"]')!,
      reps: container.querySelector<HTMLInputElement>('[aria-label="Back Squat reps"]')!,
    })

    it('saves the last set’s reps beside the weight', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const { weight, reps } = squatInputs(container)
      expect(reps.inputMode).toBe('numeric')
      fireEvent.change(weight, { target: { value: '155' } })
      fireEvent.change(reps, { target: { value: '6' } })

      expect(saved().log['w1:t:bb-mon-squat']).toBe('155')
      expect(saved().log['w1:t:bb-mon-squat:reps']).toBe('6')
    })

    it('shows last week’s numbers as placeholders', () => {
      const { container } = renderWith(<Template />, {
        week: 3,
        log: { 'w2:t:bb-mon-squat': '185', 'w2:t:bb-mon-squat:reps': '5' },
      })
      const { weight, reps } = squatInputs(container)
      expect(weight.value).toBe('')
      expect(weight.placeholder).toBe('185')
      expect(reps.placeholder).toBe('5')
    })

    it('shows plain hints when there is no last week', () => {
      const { container } = renderWith(<Template />, {
        week: 1,
        log: { 'w12:t:bb-mon-squat': '185', 'w12:t:bb-mon-squat:reps': '5' },
      })
      const { weight, reps } = squatInputs(container)
      expect(weight.placeholder).toBe('weight')
      expect(reps.placeholder).toBe('reps')
    })

    it('gives a top-set exercise a second pair for the back-off sets', () => {
      const { container } = renderAtWeek(<Template />, 2)
      const row = rowNamed(container, 'Back Squat')
      expect(row.querySelectorAll('.set-entry')).toHaveLength(2)
      fireEvent.change(row.querySelector('[aria-label="Back Squat back-off weight"]')!, {
        target: { value: '160' },
      })
      fireEvent.change(row.querySelector('[aria-label="Back Squat back-off reps"]')!, {
        target: { value: '9' },
      })

      expect(saved().log['w2:t:bb-mon-squat:bo']).toBe('160')
      expect(saved().log['w2:t:bb-mon-squat:bo:reps']).toBe('9')
    })

    it('gives an ordinary exercise one pair', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const row = rowNamed(container, 'Leg Press')
      expect(row.querySelectorAll('.set-entry')).toHaveLength(1)
      expect(row.querySelector('.ex-row__backoff')).toBeNull()
    })

    it('renders a standalone row from an exercise alone', () => {
      const { container } = renderWith(<ExerciseRow ex={DAYS[1]!.ex[0]!} />, { week: 2 })
      expect(textsOf(container, '.ex-row__name')).toEqual(['Flat DB Press'])
      expect(container.querySelectorAll('.set-entry')).toHaveLength(2)
    })
  })

  describe('last set RPE', () => {
    it('logs a felt RPE on any row, with no implied-1RM signal', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const row = rowNamed(container, 'Back Squat')
      fireEvent.change(row.querySelector<HTMLInputElement>('.lsrpe__input')!, {
        target: { value: '9' },
      })

      expect(saved().log['w1:t:bb-mon-squat:lsrpe']).toBe('9')
      expect(row.querySelector('.lsrpe-signal')).toBeNull()
    })

    it('keeps the felt RPE in the last week, with no test inputs', () => {
      const { container } = renderAtWeek(<Template />, LAST_WEEK)
      const row = rowNamed(container, 'Back Squat')
      expect(row.querySelector('.lsrpe')).not.toBeNull()
      expect(row.querySelector('.test-set')).toBeNull()
    })
  })
})

describe('Plan', () => {
  it('shows a card per week with no loads and no conditioning toggle', () => {
    const { container } = renderAtWeek(<WeekPlan />, 3)
    expect(container.querySelectorAll('.week-card')).toHaveLength(12)
    expect(container.querySelector('.load-tile')).toBeNull()
    expect(container.querySelector('.week-card__toggle')).toBeNull()
  })

  it('tags week 1 as the easy week and the rest as full effort', () => {
    const { container } = renderAtWeek(<WeekPlan />, 1)
    const tags = textsOf(container, '.phase-pill__tag')
    expect(tags[0]).toBe('EASY WEEK')
    expect(new Set(tags.slice(1))).toEqual(new Set(['FULL EFFORT']))
  })

  it('makes a week active on tap', () => {
    const { container } = renderAtWeek(<WeekPlan />, 1)
    fireEvent.click(container.querySelectorAll('.week-card__head')[11]!)
    expect(saved().week).toBe(12)
  })
})
