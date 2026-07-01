import './SectionLabel.css'
import type { ReactNode } from 'react'

/** Labeled divider: a tracked uppercase label followed by a hairline rule. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-label__text">{children}</span>
      <span className="section-label__rule" />
    </div>
  )
}
