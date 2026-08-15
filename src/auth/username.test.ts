import { describe, expect, it } from 'vitest'
import {
  ACCOUNT_DOMAIN,
  toEmail,
  toUsername,
  validateAccountId,
} from './username'

describe('toEmail', () => {
  it('appends the account domain to a bare username', () => {
    expect(toEmail('rishavsingh')).toBe(`rishavsingh@${ACCOUNT_DOMAIN}`)
  })

  it('normalises case and surrounding space', () => {
    expect(toEmail('  RishavSingh  ')).toBe(`rishavsingh@${ACCOUNT_DOMAIN}`)
  })

  it('passes a real address through instead of double-suffixing it', () => {
    expect(toEmail('someone@gmail.com')).toBe('someone@gmail.com')
    expect(toEmail(`rishavsingh@${ACCOUNT_DOMAIN}`)).toBe(
      `rishavsingh@${ACCOUNT_DOMAIN}`,
    )
  })

  it('leaves an empty field empty so the form can require it', () => {
    expect(toEmail('   ')).toBe('')
  })
})

describe('toUsername', () => {
  it('strips the account domain for display', () => {
    expect(toUsername(`rishavsingh@${ACCOUNT_DOMAIN}`)).toBe('rishavsingh')
  })

  it('shows a real address in full', () => {
    expect(toUsername('someone@gmail.com')).toBe('someone@gmail.com')
  })

  it('round-trips', () => {
    expect(toUsername(toEmail('rishavsingh'))).toBe('rishavsingh')
  })
})

describe('validateAccountId', () => {
  it('accepts a bare username and a full email', () => {
    expect(validateAccountId('rishavsingh')).toBeNull()
    expect(validateAccountId('someone@gmail.com')).toBeNull()
  })

  it('rejects spaces, which would otherwise reach Supabase as a broken address', () => {
    expect(validateAccountId('rishav singh')).toBe('Username cannot contain spaces')
  })

  it('rejects an empty field and a stray @', () => {
    expect(validateAccountId('   ')).toBe('Enter a username')
    expect(validateAccountId('@gmail.com')).toBe('That is not a valid username')
    expect(validateAccountId('rishav@')).toBe('That is not a valid username')
  })
})
