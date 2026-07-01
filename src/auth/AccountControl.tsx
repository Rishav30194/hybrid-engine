import './AccountControl.css'
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { getSyncStatus, subscribeSyncStatus } from '../sync/syncStatus'
import { useAuth } from './context'

const SYNC_LABEL: Record<string, string> = {
  idle: 'Signed in',
  syncing: 'Syncing…',
  synced: 'Synced ✓',
  error: 'Sync failed — will retry',
}

/** Header account/sync control. Renders nothing until Supabase is configured. */
export function AccountControl() {
  if (!isSupabaseConfigured) return null
  return <Control />
}

function Control() {
  const { status, user, signOut } = useAuth()
  const sync = useSyncExternalStore(subscribeSyncStatus, getSyncStatus)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (status === 'loading') return <div className="acct" />

  const signedIn = status === 'signedIn' && !!user

  return (
    <div className="acct" ref={rootRef}>
      <button
        type="button"
        className={`acct__trigger${signedIn ? ' acct__trigger--in' : ''}`}
        aria-label={signedIn ? `Account — ${SYNC_LABEL[sync.state]}` : 'Sign in'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {signedIn ? (
          <>
            <span className={`acct__dot acct__dot--${sync.state}`} aria-hidden />
            <span className="acct__caret">▾</span>
          </>
        ) : (
          'Sign in'
        )}
      </button>

      {open && (
        <div className="acct__pop">
          {signedIn ? (
            <SignedInMenu
              email={user.email ?? ''}
              label={SYNC_LABEL[sync.state]}
              error={sync.state === 'error'}
              onSignOut={() => {
                void signOut()
                setOpen(false)
              }}
            />
          ) : (
            <SignInForm onSignedIn={() => setOpen(false)} />
          )}
        </div>
      )}
    </div>
  )
}

function SignedInMenu({
  email,
  label,
  error,
  onSignOut,
}: {
  email: string
  label: string
  error: boolean
  onSignOut: () => void
}) {
  return (
    <div className="acct-menu">
      <div className="acct-menu__email">{email}</div>
      <div className={`acct-menu__status${error ? ' acct-menu__status--error' : ''}`}>
        {label}
      </div>
      <button type="button" className="acct-menu__signout" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  )
}

function SignInForm({ onSignedIn }: { onSignedIn: () => void }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)
    const run = mode === 'signin' ? signIn : signUp
    const { error: err } = await run(email.trim(), password)
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    if (mode === 'signup') {
      setMessage('Account created. If email confirmation is on, confirm then sign in.')
      setMode('signin')
      setPassword('')
    } else {
      onSignedIn()
    }
  }

  return (
    <div className="acct-form">
      <div className="acct-form__title">CLOUD SYNC</div>
      <div className="acct-form__hint">Back up &amp; sync across devices</div>
      <form className="acct-form__body" onSubmit={submit}>
        <input
          className="acct-form__input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="acct-form__input"
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <div className="acct-form__error">{error}</div>}
        {message && <div className="acct-form__message">{message}</div>}
        <button className="acct-form__submit" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button
        type="button"
        className="acct-form__toggle"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setError(null)
          setMessage(null)
        }}
      >
        {mode === 'signin'
          ? 'Need an account? Create one'
          : 'Have an account? Sign in'}
      </button>
    </div>
  )
}
