/**
 * The account is identified by a username, not an email.
 *
 * Supabase's email provider requires an email-shaped identifier, so a fixed
 * domain is appended before the call and stripped again for display. The domain
 * is `example.com`, reserved by RFC 2606 precisely so it can never route to a
 * real inbox — nothing here is connected to a personal address.
 *
 * A consequence worth remembering: there is no email to recover a password
 * through. Reset it from the Supabase dashboard (Authentication → Users).
 */
export const ACCOUNT_DOMAIN = 'example.com'

/**
 * Username → the identifier Supabase stores. Anything already containing `@`
 * is passed through, so a real email still works and never gets double-suffixed.
 */
export function toEmail(input: string): string {
  const v = input.trim().toLowerCase()
  if (!v) return ''
  return v.includes('@') ? v : `${v}@${ACCOUNT_DOMAIN}`
}

/**
 * Why this exists: a username with a space has no `@`, so it would get the
 * domain appended and reach Supabase as `rishav singh@example.com` — rejected
 * with an opaque provider error. Fail here with something readable instead.
 * Returns null when the input is usable.
 */
export function validateAccountId(input: string): string | null {
  const v = input.trim()
  if (!v) return 'Enter a username'
  if (/\s/.test(v)) return 'Username cannot contain spaces'
  if (v.startsWith('@') || v.endsWith('@')) return 'That is not a valid username'
  return null
}

/**
 * Sign-up is stricter than sign-in, on purpose.
 *
 * Every account must end up on ACCOUNT_DOMAIN, because that is the only way
 * `rishavsingh` alone can always reach it. Let someone sign up as
 * `rishavsingh@gyahoo.com` and that account becomes unreachable by username —
 * resolving it would need a lookup table readable *before* authentication,
 * i.e. one that publishes everyone's address to anyone with the URL.
 *
 * Sign-in stays permissive (`validateAccountId`) so any account that already
 * exists on another domain can still get in.
 */
export function validateSignUp(input: string): string | null {
  const invalid = validateAccountId(input)
  if (invalid) return invalid

  const v = input.trim().toLowerCase()
  if (v.includes('@') && !v.endsWith(`@${ACCOUNT_DOMAIN}`)) {
    return 'Sign up with a username, not an email address'
  }
  return null
}

/** The stored identifier → what the signed-in menu shows. */
export function toUsername(email: string): string {
  const suffix = `@${ACCOUNT_DOMAIN}`
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email
}
