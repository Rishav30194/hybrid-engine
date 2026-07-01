import './PhasePill.css'
import { PHASES } from '../data/program'
import type { PhaseKey } from '../data/types'

/** Block-phase pill: colored dot + tag on a translucent phase-color fill.
 *  `hero` carries a border (This Week card); `card` is the compact 8-Week variant. */
export function PhasePill({
  phase,
  tag,
  size = 'hero',
}: {
  phase: PhaseKey
  tag: string
  size?: 'hero' | 'card'
}) {
  const p = PHASES[phase]
  const style =
    size === 'hero'
      ? { background: p.bg, borderColor: p.border }
      : { background: p.bg }

  return (
    <span className={`phase-pill phase-pill--${size}`} style={style}>
      <span className="phase-pill__dot" style={{ background: p.color }} />
      <span className="phase-pill__tag" style={{ color: p.color }}>
        {tag}
      </span>
    </span>
  )
}
