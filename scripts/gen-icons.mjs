// Rasterize public/icon.svg into the PNG sizes the PWA + iOS install need.
// Run with: node scripts/gen-icons.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))
const svg = readFileSync(pub('icon.svg'))

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of targets) {
  await sharp(svg).resize(size, size).png().toFile(pub(name))
  console.log(`wrote public/${name} (${size}×${size})`)
}
