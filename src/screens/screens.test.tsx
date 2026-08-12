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
      'Trap-Bar Deadlift',
    ])
  })

  it('swaps the press overhead in weeks 3 and 6', () => {
    for (const wk of [3, 6]) {
      const { container, unmount } = renderAtWeek(<ThisWeek />, wk)
      expect(textsOf(container, '.lift-row__name')).toEqual([
        'Back Squat',
        'Overhead Press',
        'Trap-Bar Deadlift',
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

  it('opens Monday by default, with its conditioning and extension', () => {
    renderAtWeek(<Template />, 1)
    expect(screen.getByText(/CONDITIONING · Sled Push/)).toBeDefined()
    expect(screen.getByText(/Extension · \+10 min/)).toBeDefined()
  })

  it("names Wednesday's anchor after the lift that week programs", () => {
    const { container } = renderAtWeek(<Template />, 6)
    fireEvent.click(screen.getByText(DAYS[1]!.title))
    expect(textsOf(container, '.ex-row__name')[0]).toBe('Overhead Press')
  })
})
