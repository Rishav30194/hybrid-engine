import './PhasePill.css'
import { PHASES } from '../data/program'
import type { PhaseKey } from '../data/types'

/** Block-phase pill: colored dot + tag on a translucent phase-color fill. */
export function PhasePill({ phase, tag }: { phase: PhaseKey; tag: string }) {
  const p = PHASES[phase]
  return (
    <span className="phase-pill" style={{ background: p.bg, borderColor: p.border }}>
      <span className="phase-pill__dot" style={{ background: p.color }} />
      <span className="phase-pill__tag" style={{ color: p.color }}>
        {tag}
      </span>
    </span>
  )
}
