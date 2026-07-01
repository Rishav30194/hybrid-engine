import './Account.css'
import { useState, type FormEvent } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './context'

/** Cloud-sync account card. Renders nothing until Supabase is configured. */
export function Account() {
  if (!isSupabaseConfigured) return null
  return <AccountCard />
}

function AccountCard() {
  const { status, user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (status === 'loading') {
    return <div className="account account--muted">Checking sync…</div>
  }

  if (status === 'signedIn' && user) {
    return (
      <div className="account">
        <div className="account__head">
          <span className="account__title">CLOUD SYNC</span>
          <span className="account__status">Synced ✓</span>
        </div>
        <div className="account__row">
          <span className="account__email">{user.email}</span>
          <button
            type="button"
            className="account__btn"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

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
    }
  }

  return (
    <div className="account">
      <div className="account__head">
        <span className="account__title">CLOUD SYNC</span>
        <span className="account__hint">back up &amp; sync devices</span>
      </div>

      <form className="account__form" onSubmit={submit}>
        <input
          className="account__input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="account__input"
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <div className="account__error">{error}</div>}
        {message && <div className="account__message">{message}</div>}
        <button className="account__submit" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <button
        type="button"
        className="account__toggle"
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
