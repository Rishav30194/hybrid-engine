// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { ThisWeek } from './ThisWeek'
import { Template } from './Template'
import { StoreProvider } from '../state/store'
import { COND, DAYS } from '../data/program'

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
  it('lists one conditioning row per session plus the off-days note', () => {
    renderAtWeek(<ThisWeek />, 1)
    for (const c of COND) expect(screen.getByText(c.label)).toBeDefined()
    expect(screen.getByText('OFF DAYS')).toBeDefined()
  })

  it('shows only the three lifts programmed that week', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(textsOf(container, '.lift-row__name')).toEqual([
      'Back Squat',
      'Bench Press',
      'Sumo Deadlift',
    ])
  })

  it('swaps the press overhead in weeks 3 and 6', () => {
    for (const wk of [3, 6]) {
      const { container, unmount } = renderAtWeek(<ThisWeek />, wk)
      expect(textsOf(container, '.lift-row__name')).toEqual([
        'Back Squat',
        'Overhead Press',
        'Sumo Deadlift',
      ])
      unmount()
      localStorage.clear()
    }
  })

  it('keeps all four 1RMs editable even when a lift is not programmed', () => {
    const { container } = renderAtWeek(<ThisWeek />, 1)
    expect(container.querySelectorAll('.rm-tile')).toHaveLength(4)
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

  it('logs sled and carry weight per week, like an accessory', () => {
    const { container } = renderAtWeek(<Template />, 2)
    const loads = container.querySelectorAll<HTMLInputElement>('.cond-load__input')
    expect(loads).toHaveLength(2) // Monday only: sled + carry

    fireEvent.change(loads[0]!, { target: { value: '90' } })
    fireEvent.change(loads[1]!, { target: { value: '70' } })

    const saved = JSON.parse(localStorage.getItem('hybridEngine.v1') ?? '{}')
    expect(saved.log['w2:t:mon-sled']).toBe('90')
    expect(saved.log['w2:t:mon-carry']).toBe('70')
  })

  it('offers no weight field on unloaded conditioning', () => {
    // Wednesday is bike/row intervals and Friday is Zone 2 — nothing to load.
    const { container } = renderAtWeek(<Template />, 1)
    fireEvent.click(screen.getByText(DAYS[1]!.title))
    expect(container.querySelectorAll('.cond-load__input')).toHaveLength(0)
  })

  it('opens Monday by default, with its conditioning', () => {
    const { container } = renderAtWeek(<Template />, 1)
    expect(screen.getByText(/CONDITIONING · Sled Push/)).toBeDefined()
    // The optional +10 min extension was removed: the plan states one
    // unconditional prescription, with volume progressing week to week.
    expect(container.querySelector('.ex-ext')).toBeNull()
    expect(screen.queryByText(/Extension/)).toBeNull()
  })

  it("names Wednesday's anchor after the lift that week programs", () => {
    const { container } = renderAtWeek(<Template />, 6)
    fireEvent.click(screen.getByText(DAYS[1]!.title))
    expect(textsOf(container, '.ex-row__name')[0]).toBe('Overhead Press')
  })
})
