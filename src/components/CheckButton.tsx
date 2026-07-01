import './CheckButton.css'

export type CheckSize = 'lift' | 'cond' | 'exercise'

/** Square check-off button; fills with accent and shows ✓ when done. */
export function CheckButton({
  checked,
  onToggle,
  size = 'lift',
}: {
  checked: boolean
  onToggle: () => void
  size?: CheckSize
}) {
  return (
    <button
      type="button"
      className={`check-btn check-btn--${size}${checked ? ' check-btn--on' : ''}`}
      aria-pressed={checked}
      aria-label={checked ? 'Mark not done' : 'Mark done'}
      onClick={onToggle}
    >
      {checked ? '✓' : ''}
    </button>
  )
}
