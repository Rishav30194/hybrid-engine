// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ThisWeek } from './ThisWeek'
import { Template } from './Template'
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
})
