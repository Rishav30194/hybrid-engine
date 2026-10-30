// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ThisWeek } from './ThisWeek'
import { ExerciseRow, Template } from './Template'
import { WeekPlan } from './WeekPlan'
import { StoreProvider } from '../state/store'
import { DAYS } from '../data/program'

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

describe('This Week', () => {
  it('has no 1RM editor — every weight is logged, not computed', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelector('.rm-editor')).toBeNull()
  })

  // Old devices and the cloud row still carry the retired 1RM fields; they
  // must load without error and simply be ignored.
  it('loads a saved state that still holds rm and basisAt', () => {
    localStorage.setItem(
      'hybridEngine.v1',
      JSON.stringify({
        week: 2,
        rounding: 2.5,
        rm: { squat: 190, bench: 145, tbdl: 225, ohp: 95 },
        basisAt: { 1: { rm: { squat: 145, bench: 135, tbdl: 205, ohp: 95 }, rounding: 5 } },
        log: { 'w2:t:mon-e0': '160' },
      }),
    )
    const { container } = render(
      <StoreProvider>
        <ThisWeek />
        <Template />
      </StoreProvider>,
    )
    expect(container.querySelector('.week-hero__title')!.textContent).toBe('WEEK 2')
    expect(container.querySelector<HTMLInputElement>('.ex-row__input')!.value).toBe('160')
  })

  it('starts a new block from the last week, carrying a main-lift weight', () => {
    localStorage.setItem(
      'hybridEngine.v1',
      JSON.stringify({ week: 8, log: { 'w8:t:mon-e0': '200' }, done: { 'w8:t:mon-e0': true } }),
    )
    render(
      <StoreProvider>
        <ThisWeek />
      </StoreProvider>,
    )
    fireEvent.click(screen.getByText('Start new block'))
    expect(screen.getByText(/Carries 1 logged weight into week 1/)).toBeDefined()
    fireEvent.click(screen.getByText('Start week 1'))

    const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
    expect(saved.week).toBe(1)
    expect(saved.log).toEqual({ 'w1:t:mon-e0': '200' })
    expect(saved.done).toEqual({})
  })

  it('shows the off-days note', () => {
    renderAtWeek(<ThisWeek />, 1)
    expect(screen.getByText('OFF DAYS')).toBeDefined()
  })

  // The screen is a dashboard now. It used to restate the week's lifts and
  // conditioning with its own check-offs, which meant two independent records
  // of the same session; that duplication must not come back.
  it('does not restate the lifts or conditioning', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelectorAll('.lift-row')).toHaveLength(0)
    expect(container.querySelectorAll('.cond-row')).toHaveLength(0)
    expect(container.querySelectorAll('.check-btn')).toHaveLength(0)
  })

  it('shows one block-progress row per week, counting 17 items each', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelectorAll('.block__row')).toHaveLength(8)
    expect(textsOf(container, '.block__wk')).toEqual([
      'W1',
      'W2',
      'W3',
      'W4',
      'W5',
      'W6',
      'W7',
      'W8',
    ])
    // Mon 5 + Wed 7 + Fri 5
    expect(textsOf(container, '.block__count')).toEqual(Array(8).fill('0/17'))
  })

  it('counts only the active week and marks it', () => {
    localStorage.setItem(
      'hybridEngine.v1',
      JSON.stringify({
        week: 3,
        done: { 'w3:t:mon-e0': true, 'w3:tc:mon': true, 'w1:t:mon-e0': true },
      }),
    )
    const { container } = render(
      <StoreProvider>
        <ThisWeek />
      </StoreProvider>,
    )
    const counts = textsOf(container, '.block__count')
    expect(counts[0]).toBe('1/17') // week 1 keeps its own tally
    expect(counts[2]).toBe('2/17') // week 3
    expect(counts[3]).toBe('0/17')
    expect(container.querySelectorAll('.block__row--active')).toHaveLength(1)
    expect(
      container.querySelector('.block__row--active')?.querySelector('.block__wk')
        ?.textContent,
    ).toBe('W3')
  })
})

describe('Template', () => {
  it('renders a card per day, counting exercises plus conditioning', () => {
    const { container } = renderAtWeek(<Template />, 1)
    expect(textsOf(container, '.day-card__title')).toEqual(DAYS.map((d) => d.title))
    expect(textsOf(container, '.day-card__progress')).toEqual(
      DAYS.map((d) => `0/${d.ex.length + 1}`),
    )
  })

  it('logs carry weight and climber level per week, like an accessory', () => {
    const { container } = renderAtWeek(<Template />, 2)
    const loads = container.querySelectorAll<HTMLInputElement>('.cond-load__input')
    expect(loads).toHaveLength(2) // Monday only: carry + climber level

    // The carry logs pounds; the climber logs a machine level, so it carries
    // neither the "weight" placeholder nor the lb suffix.
    expect(loads[0]!.placeholder).toBe('weight')
    expect(loads[1]!.placeholder).toBe('level')
    expect(textsOf(container, '.cond-load__unit')).toEqual(['lb', ''])

    fireEvent.change(loads[0]!, { target: { value: '70' } })
    fireEvent.change(loads[1]!, { target: { value: '6' } })

    const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
    expect(saved.log['w2:t:mon-carry-suitcase']).toBe('70')
    expect(saved.log['w2:t:mon-climber']).toBe('6')
  })

  it('offers no weight field on unloaded conditioning', () => {
    // Wednesday is bike/row intervals and Friday is Zone 2 — nothing to load.
    const { container } = renderAtWeek(<Template />, 1)
    fireEvent.click(screen.getByText(DAYS[1]!.title))
    expect(container.querySelectorAll('.cond-load__input')).toHaveLength(0)
  })

  it('opens Monday by default, with its conditioning', () => {
    const { container } = renderAtWeek(<Template />, 1)
    expect(screen.getByText(/CONDITIONING · Suitcase Carry/)).toBeDefined()
    // The optional +10 min extension was removed: the plan states one
    // unconditional prescription, with volume progressing week to week.
    expect(container.querySelector('.ex-ext')).toBeNull()
    expect(screen.queryByText(/Extension/)).toBeNull()
  })

  it('shows the active week’s prescription on a main lift, with no percent', () => {
    const { container } = renderAtWeek(<Template />, 1)
    // wk1 squat is 4×5 @ RPE 7 — not the block range 4×5→4×4.
    expect(textsOf(container, '.ex-row__meta-text')[0]).toBe('4×5 · RPE 7 · rest 2 min')
  })

  it('logs a main-lift weight the same way as an accessory', () => {
    const { container } = renderAtWeek(<Template />, 1)
    expect(container.querySelector('.ex-row__load')).toBeNull()
    const squat = container.querySelector<HTMLInputElement>('.ex-row__input')!
    expect(squat.placeholder).toBe('weight')
    fireEvent.change(squat, { target: { value: '155' } })

    const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
    expect(saved.log['w1:t:mon-e0']).toBe('155')
  })

  describe('weight × reps', () => {
    const squatInputs = (container: HTMLElement) => ({
      weight: container.querySelector<HTMLInputElement>('[aria-label="Back Squat weight"]')!,
      reps: container.querySelector<HTMLInputElement>('[aria-label="Back Squat reps"]')!,
    })

    it('saves the last set’s reps beside the weight', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const { reps } = squatInputs(container)
      expect(reps.inputMode).toBe('numeric')
      fireEvent.change(reps, { target: { value: '6' } })

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.log['w1:t:mon-e0:reps']).toBe('6')
    })

    it('shows last week’s numbers as placeholders', () => {
      localStorage.setItem(
        'hybridEngine.v1',
        JSON.stringify({ week: 3, log: { 'w2:t:mon-e0': '185', 'w2:t:mon-e0:reps': '5' } }),
      )
      const { container } = render(
        <StoreProvider>
          <Template />
        </StoreProvider>,
      )
      const { weight, reps } = squatInputs(container)
      expect(weight.value).toBe('')
      expect(weight.placeholder).toBe('185')
      expect(reps.placeholder).toBe('5')
    })

    it('shows plain hints when there is no last week', () => {
      localStorage.setItem(
        'hybridEngine.v1',
        JSON.stringify({ week: 1, log: { 'w8:t:mon-e0': '185', 'w8:t:mon-e0:reps': '5' } }),
      )
      const { container } = render(
        <StoreProvider>
          <Template />
        </StoreProvider>,
      )
      const { weight, reps } = squatInputs(container)
      expect(weight.placeholder).toBe('weight')
      expect(reps.placeholder).toBe('reps')
    })

    it('gives a top-set exercise a second pair for the back-off sets', () => {
      localStorage.setItem('hybridEngine.v1', JSON.stringify({ week: 2 }))
      const { container } = render(
        <StoreProvider>
          <ExerciseRow ex={{ ...DAYS[0]!.ex[0]!, backoff: true }} />
        </StoreProvider>,
      )
      expect(container.querySelectorAll('.set-entry')).toHaveLength(2)
      fireEvent.change(
        container.querySelector('[aria-label="Back Squat back-off weight"]')!,
        { target: { value: '160' } },
      )
      fireEvent.change(
        container.querySelector('[aria-label="Back Squat back-off reps"]')!,
        { target: { value: '9' } },
      )

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.log['w2:t:mon-e0:bo']).toBe('160')
      expect(saved.log['w2:t:mon-e0:bo:reps']).toBe('9')
    })

    it('gives an ordinary exercise one pair', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const row = container.querySelector('.ex-row')!
      expect(row.querySelectorAll('.set-entry')).toHaveLength(1)
      expect(row.querySelector('.ex-row__backoff')).toBeNull()
    })
  })

  it("names Wednesday's anchor after the lift that week programs", () => {
    const { container } = renderAtWeek(<Template />, 6)
    fireEvent.click(screen.getByText(DAYS[1]!.title))
    expect(textsOf(container, '.ex-row__name')[0]).toBe('Overhead Press')
  })

  describe('last set RPE', () => {
    const rowNamed = (container: HTMLElement, name: string) =>
      [...container.querySelectorAll('.ex-row')].find(
        (r) => r.querySelector('.ex-row__name')?.textContent === name,
      )!

    it('logs an accessory RPE with no implied-1RM signal', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const row = rowNamed(container, 'A1 · Cable Row')
      const rpeInput = row.querySelector<HTMLInputElement>('.lsrpe__input')!
      fireEvent.change(rpeInput, { target: { value: '9' } })

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.log['w1:t:mon-row-cable:lsrpe']).toBe('9')
      expect(row.querySelector('.lsrpe-signal')).toBeNull()
    })

    it('logs a main-lift RPE with no implied-1RM signal', () => {
      const { container } = renderAtWeek(<Template />, 1)
      const squatRow = rowNamed(container, 'Back Squat')
      fireEvent.change(squatRow.querySelector<HTMLInputElement>('.lsrpe__input')!, {
        target: { value: '9' },
      })

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.log['w1:t:mon-e0:lsrpe']).toBe('9')
      expect(squatRow.querySelector('.lsrpe-signal')).toBeNull()
    })

    it('keeps the felt RPE on main lifts in the last week, with no test inputs', () => {
      const { container } = renderAtWeek(<Template />, 8)
      const squatRow = rowNamed(container, 'Back Squat')
      expect(squatRow.querySelector('.lsrpe')).not.toBeNull()
      expect(squatRow.querySelector('.test-set')).toBeNull()
    })
  })
})

describe('8-Week', () => {
  it('shows no computed loads and no past-week 1RM editor', () => {
    localStorage.setItem('hybridEngine.v1', JSON.stringify({ week: 3 }))
    const { container } = render(
      <StoreProvider>
        <WeekPlan />
      </StoreProvider>,
    )
    expect(container.querySelector('.load-tile')).toBeNull()
    fireEvent.click(container.querySelectorAll('.week-card')[1]!.querySelector('.week-card__toggle')!)
    expect(container.querySelector('.week-rm')).toBeNull()
  })
})
