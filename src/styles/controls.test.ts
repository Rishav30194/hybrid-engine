/// <reference types="node" />
/**
 * iOS zooms the page when a focused form control computes to under 16px, and it
 * never zooms back — a real hazard for a one-handed, mid-set PWA. This guards
 * the floor across every control in the app, because the bug is invisible in
 * jsdom and on desktop: it only shows up on the phone, after the fact.
 *
 * Sources are read off disk rather than imported: vitest stubs CSS imports
 * (`css: false`), so `import.meta.glob('*.css', …?raw)` returns empty strings.
 * The reference above pulls in node types without touching tsconfig.app.json.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = dirname(dirname(fileURLToPath(import.meta.url)))
const MIN_PX = 16

function walk(dir: string, ext: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return walk(path, ext)
    return entry.name.endsWith(ext) ? [path] : []
  })
}

/** `--name: 16px` declarations, so `var(--name)` can be resolved to a number. */
function readTokens(): Record<string, string> {
  const css = readFileSync(join(SRC, 'styles', 'tokens.css'), 'utf8')
  const out: Record<string, string> = {}
  for (const [, name, value] of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    out[name] = value.trim()
  }
  return out
}

/** Every `.class { … font-size: … }` in the app, resolved through tokens. */
function readFontSizes(): Record<string, number> {
  const tokens = readTokens()
  const out: Record<string, number> = {}
  for (const file of walk(SRC, '.css')) {
    const css = readFileSync(file, 'utf8')
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const size = /font-size:\s*([^;]+);/.exec(body)?.[1]?.trim()
      if (!size) continue
      const token = /var\((--[\w-]+)\)/.exec(size)
      const px = parseFloat(token ? (tokens[token[1]] ?? '') : size)
      if (Number.isNaN(px)) continue
      // Last class in the selector is the one the rule targets.
      const cls = selector.trim().match(/\.([\w-]+)/g)?.pop()
      if (cls) out[cls.slice(1)] = px
    }
  }
  return out
}

/** className of every <input>/<select>/<textarea> the app renders. */
function readControls(): { cls: string; where: string }[] {
  const found: { cls: string; where: string }[] = []
  for (const file of walk(SRC, '.tsx')) {
    if (file.includes('.test.')) continue
    const src = readFileSync(file, 'utf8')
    const where = file.slice(SRC.length + 1)
    for (const [, , attrs] of src.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
      const literal = /className="([^"]+)"/.exec(attrs)
      expect(
        literal,
        `${where}: control has a non-literal className; extend this test to cover it`,
      ).not.toBeNull()
      for (const cls of literal![1].split(/\s+/)) {
        found.push({ cls, where: `${where} .${cls}` })
      }
    }
  }
  return found
}

describe('iOS zoom floor', () => {
  const sizes = readFontSizes()
  const controls = readControls()

  it('finds every form control in the app', () => {
    expect(controls.length).toBeGreaterThanOrEqual(5)
  })

  it.each(controls)('$where is at least 16px', ({ cls, where }) => {
    const px = sizes[cls]
    expect(px, `${where} has no explicit font-size — it would inherit`).toBeDefined()
    expect(px, `${where} is ${px}px; iOS zooms below ${MIN_PX}px`).toBeGreaterThanOrEqual(
      MIN_PX,
    )
  })
})
