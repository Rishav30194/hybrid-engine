import './RestTimer.css'
import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppState } from '../state/context'

const PRESETS = [30, 60, 90, 120, 180]

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}

/** Floating rest timer — timestamp-driven so it stays accurate across sleep. */
export function RestTimer() {
  const { timer, pillHidden } = useAppState()
  const dispatch = useAppDispatch()
  const audioRef = useRef<AudioContext | null>(null)
  const prevRemaining = useRef(timer.remaining)

  // Tick once a second while running; recompute from endAt inside the reducer.
  useEffect(() => {
    if (!timer.running) return
    const iv = setInterval(
      () => dispatch({ type: 'timerTick', now: Date.now() }),
      1000,
    )
    return () => clearInterval(iv)
  }, [timer.running, dispatch])

  // Fire the alarm exactly when the countdown crosses into 0.
  useEffect(() => {
    if (prevRemaining.current > 0 && timer.remaining === 0) {
      try {
        navigator.vibrate?.([220, 120, 220, 120, 320])
      } catch {
        /* vibrate unsupported */
      }
      playBeep(ensureAudio())
    }
    prevRemaining.current = timer.remaining
  }, [timer.remaining])

  // Audio must be created/resumed inside a user gesture to satisfy mobile autoplay.
  function ensureAudio(): AudioContext | null {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      const ac = audioRef.current ?? (audioRef.current = new Ctor())
      if (ac.state === 'suspended') void ac.resume()
      return ac
    } catch {
      return null
    }
  }

  const start = (seconds: number) => {
    ensureAudio()
    dispatch({ type: 'timerStart', seconds, now: Date.now() })
  }
  const startPause = () => {
    ensureAudio()
    dispatch({ type: 'timerStartPause', now: Date.now() })
  }

  const started = timer.running || timer.remaining !== timer.duration
  const hidden = pillHidden && !timer.open
  const startPauseLabel = timer.running
    ? 'Pause'
    : timer.remaining > 0 && timer.remaining < timer.duration
      ? 'Resume'
      : 'Start'

  return (
    <>
      <button
        type="button"
        className={`rest-pill${started ? ' rest-pill--started' : ''}${hidden ? ' rest-pill--hidden' : ''}`}
        aria-label="Rest timer"
        onClick={() => dispatch({ type: 'timerToggleOpen' })}
      >
        <span className="rest-pill__icon">⏱</span>
        <span className="rest-pill__label">
          {started ? formatTime(timer.remaining) : 'REST'}
        </span>
      </button>

      {timer.open && (
        <div className="rest-panel">
          <div className="rest-panel__head">
            <span className="rest-panel__title">REST TIMER</span>
            <button
              type="button"
              className="rest-panel__close"
              aria-label="Close timer"
              onClick={() => dispatch({ type: 'timerClose' })}
            >
              ×
            </button>
          </div>

          <div
            className={`rest-panel__readout${timer.remaining === 0 ? ' rest-panel__readout--done' : ''}`}
          >
            {formatTime(timer.remaining)}
          </div>

          <div className="rest-panel__presets">
            {PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                className={`rest-preset${timer.duration === s ? ' rest-preset--active' : ''}`}
                onClick={() => start(s)}
              >
                {formatTime(s)}
              </button>
            ))}
          </div>

          <div className="rest-panel__controls">
            <button
              type="button"
              className="rest-btn"
              onClick={() => dispatch({ type: 'timerReset' })}
            >
              Reset
            </button>
            <button
              type="button"
              className="rest-btn rest-btn--primary"
              onClick={startPause}
            >
              {startPauseLabel}
            </button>
            <button
              type="button"
              className="rest-btn"
              onClick={() =>
                dispatch({ type: 'timerAdd', seconds: 15, now: Date.now() })
              }
            >
              +15s
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/** Three-note WebAudio chime. */
function playBeep(ac: AudioContext | null) {
  if (!ac) return
  try {
    const tone = (t: number, f: number) => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = 'sine'
      o.frequency.value = f
      o.connect(g)
      g.connect(ac.destination)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
      o.start(t)
      o.stop(t + 0.3)
    }
    const n = ac.currentTime
    tone(n, 880)
    tone(n + 0.32, 880)
    tone(n + 0.64, 1175)
  } catch {
    /* audio unavailable */
  }
}
