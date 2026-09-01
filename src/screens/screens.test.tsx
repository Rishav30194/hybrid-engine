// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ThisWeek } from './ThisWeek'
import { Template } from './Template'
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
  it('keeps all four 1RMs editable even when a lift is not programmed', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelectorAll('.rm-tile')).toHaveLength(4)
  })

  describe('the 1RM editor follows the active week', () => {
    function renderWeek(blob: Record<string, unknown>) {
      localStorage.setItem('hybridEngine.v1', JSON.stringify(blob))
      return render(
        <StoreProvider>
          <ThisWeek />
        </StoreProvider>,
      )
    }

    const frozenWeek1 = {
      week: 1,
      rounding: 5,
      rm: { squat: 190, bench: 145, tbdl: 225, ohp: 95 },
      basisAt: {
        1: { rm: { squat: 145, bench: 135, tbdl: 205, ohp: 95 }, rounding: 2.5 },
      },
    }

    it('shows the live 1RM on a week that is not frozen', () => {
      const { container } = renderWeek({ ...frozenWeek1, week: 2 })
      const squat = container.querySelector<HTMLInputElement>('.rm-tile__input')!
      expect(squat.value).toBe('190')
      expect(screen.getByText('edit to recalc ↻')).toBeDefined()
    })

    it('shows the frozen 1RM and rounding when the active week is frozen', () => {
      const { container } = renderWeek(frozenWeek1)
      const squat = container.querySelector<HTMLInputElement>('.rm-tile__input')!
      expect(squat.value).toBe('145') // not the live 190
      expect(
        container.querySelector<HTMLSelectElement>('.rm-editor__select')!.value,
      ).toBe('2.5')
      expect(screen.getByText('week 1 only ↻')).toBeDefined()
    })

    it('edits the frozen week rather than the live 1RM', () => {
      const { container } = renderWeek(frozenWeek1)
      fireEvent.change(container.querySelector('.rm-tile__input')!, {
        target: { value: '150' },
      })

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.basisAt['1'].rm.squat).toBe(150)
      expect(saved.rm.squat).toBe(190) // live 1RM untouched
    })

    it('edits the live 1RM on a week that is not frozen', () => {
      const { container } = renderWeek({ ...frozenWeek1, week: 2 })
      fireEvent.change(container.querySelector('.rm-tile__input')!, {
        target: { value: '200' },
      })

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.rm.squat).toBe(200)
      expect(saved.basisAt['1'].rm.squat).toBe(145) // frozen week untouched
    })

    it('edits the frozen week rounding rather than the live one', () => {
      const { container } = renderWeek(frozenWeek1)
      fireEvent.change(container.querySelector('.rm-editor__select')!, {
        target: { value: '1' },
      })

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.basisAt['1'].rounding).toBe(1)
      expect(saved.rounding).toBe(5)
    })
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

  // This Week used to be the only place showing the week-specific prescription
  // and the %1RM. It no longer lists lifts, so the main-lift row carries both.
  it('shows the active week’s prescription and percent on a main lift', () => {
    const { container } = renderAtWeek(<Template />, 1)
    // wk1 squat is 4×5 @ RPE 7, 78.5% — not the block range 4×5→4×4.
    expect(textsOf(container, '.ex-row__meta')[0]).toBe('4×5 · RPE 7 · 79% · rest 2 min')
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
      expect(row.querySelector('.lsrpe__apply')).toBeNull()
    })

    it('estimates a 1RM from a main lift set and applies it on tap', () => {
      const { container } = renderAtWeek(<Template />, 1)
      // Squat: default 245 1RM, wk1 load 192 @ 4×5.
      const squatRow = rowNamed(container, 'Back Squat')
      const squatRpeInput = squatRow.querySelector<HTMLInputElement>('.lsrpe__input')!
      fireEvent.change(squatRpeInput, { target: { value: '9' } })

      // Default rounding is 5, so wk1's 78.5% load is 190, not the raw 192.325.
      // 190 lb × 5 reps @ RPE 9 → 6 to failure ≈ 83.7% → e1RM 225.
      expect(squatRow.querySelector('.lsrpe__implied')?.textContent).toBe(
        'implies 225 lb',
      )
      fireEvent.click(squatRow.querySelector<HTMLButtonElement>('.lsrpe__apply')!)

      const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
      expect(saved.rm.squat).toBe(225)
    })

    it('offers no LSRPE row for a main lift in week 8 — TestSet covers it', () => {
      const { container } = renderAtWeek(<Template />, 8)
      const squatRow = rowNamed(container, 'Back Squat')
      expect(squatRow.querySelector('.lsrpe')).toBeNull()
      expect(squatRow.querySelector('.test-set')).not.toBeNull()
    })
  })
})

describe('8-Week — per-week 1RM', () => {
  /** Hydrate with an explicit persisted blob so rmAt can be seeded. */
  function renderPlan(blob: Record<string, unknown>) {
    localStorage.setItem('hybridEngine.v1', JSON.stringify(blob))
    return render(
      <StoreProvider>
        <WeekPlan />
      </StoreProvider>,
    )
  }

  const squatTileOf = (container: HTMLElement, wk: number) =>
    container.querySelectorAll('.week-card')[wk - 1]!.querySelector('.load-tile__num')!

  it('holds a frozen week at its own 1RM while later weeks follow the live one', () => {
    const { container } = renderPlan({
      week: 3,
      rounding: 5,
      rm: { squat: 200, bench: 225, tbdl: 375, ohp: 135 },
      basisAt: {
        1: { rm: { squat: 145, bench: 225, tbdl: 375, ohp: 135 }, rounding: 5 },
      },
    })
    // Week 1 squat is 78.5% — 145 freezes to 115, while 200 would give 155.
    expect(squatTileOf(container, 1).textContent).toBe('115')
    expect(squatTileOf(container, 2).textContent).toBe('160') // 200 × 80%
  })

  it('offers the 1RM editor on past weeks only', () => {
    const { container } = renderPlan({ week: 3 })
    const cards = container.querySelectorAll('.week-card')

    // Week 2 is past; week 3 is active and still follows the live 1RM.
    fireEvent.click(cards[1]!.querySelector('.week-card__toggle')!)
    expect(container.querySelectorAll('.week-rm')).toHaveLength(1)

    fireEvent.click(cards[2]!.querySelector('.week-card__toggle')!)
    expect(container.querySelectorAll('.week-rm')).toHaveLength(0)
  })

  it('holds a frozen week at its own rounding', () => {
    const { container } = renderPlan({
      week: 2,
      rounding: 5,
      rm: { squat: 200, bench: 225, tbdl: 375, ohp: 135 },
      basisAt: {
        1: { rm: { squat: 200, bench: 225, tbdl: 375, ohp: 135 }, rounding: 2.5 },
      },
    })
    // Same 1RM either side — only the rounding differs. 200 × 78.5% = 157.
    expect(squatTileOf(container, 1).textContent).toBe('157.5')
    expect(squatTileOf(container, 2).textContent).toBe('160')
  })

  it('edits a past week rounding without moving the live one', () => {
    const { container } = renderPlan({
      week: 2,
      rounding: 5,
      rm: { squat: 200, bench: 225, tbdl: 375, ohp: 135 },
    })
    fireEvent.click(
      container.querySelectorAll('.week-card')[0]!.querySelector('.week-card__toggle')!,
    )
    fireEvent.change(container.querySelector('.week-rm__select')!, {
      target: { value: '2.5' },
    })

    const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
    expect(saved.basisAt['1'].rounding).toBe(2.5)
    expect(saved.rounding).toBe(5)
    expect(squatTileOf(container, 1).textContent).toBe('157.5')
    expect(squatTileOf(container, 2).textContent).toBe('160')
  })

  it('edits a past week without moving the live 1RM', () => {
    const { container } = renderPlan({
      week: 2,
      rounding: 5,
      rm: { squat: 200, bench: 225, tbdl: 375, ohp: 135 },
    })
    fireEvent.click(
      container.querySelectorAll('.week-card')[0]!.querySelector('.week-card__toggle')!,
    )
    fireEvent.change(container.querySelector('.week-rm__input')!, {
      target: { value: '145' },
    })

    const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
    expect(saved.basisAt['1'].rm.squat).toBe(145)
    expect(saved.rm.squat).toBe(200)
    expect(squatTileOf(container, 1).textContent).toBe('115')
    expect(squatTileOf(container, 2).textContent).toBe('160')
  })
})
