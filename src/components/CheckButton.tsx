import './CheckButton.css'

/** Square check-off button; fills with accent and shows ✓ when done. */
export function CheckButton({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={`check-btn${checked ? ' check-btn--on' : ''}`}
      aria-pressed={checked}
      aria-label={checked ? 'Mark not done' : 'Mark done'}
      onClick={onToggle}
    >
      {checked ? '✓' : ''}
    </button>
  )
}
