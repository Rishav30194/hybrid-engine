import { describe, expect, it } from 'vitest'
import { applyDecision } from './applyDecision'
import { INITIAL_STATE } from '../state/reducer'
import type { AppState } from '../state/types'

const state: AppState = { ...INITIAL_STATE, week: 3, log: { 'w3:t:bb-mon-squat': '185' } }
const sameContent = { week: 3, log: { 'w3:t:bb-mon-squat': '185' } }

describe('applyDecision', () => {
  it('ignores a missing or older blob', () => {
    expect(applyDecision(state, 100, undefined)).toBe('ignore')
    expect(applyDecision(state, 100, { ...sameContent, updatedAt: 50 })).toBe('ignore')
    expect(applyDecision(state, 100, { week: 4, updatedAt: 100 })).toBe('ignore')
  })

  it('hydrates a newer blob with different content', () => {
    expect(applyDecision(state, 100, { week: 4, updatedAt: 200 })).toBe('hydrate')
  })

  // The bug this guards: a no-op hydrate never writes, so its stamp was left
  // pending and back-dated the next local edit behind the cloud.
  it('only adopts the stamp when a newer blob changes nothing', () => {
    expect(applyDecision(state, 100, { ...sameContent, updatedAt: 200 })).toBe('stamp')
  })
})
