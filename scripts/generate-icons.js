// Run: node scripts/generate-icons.js
// Requires: npm install canvas (or use Sharp)
// This generates placeholder PWA icons.
// For production, replace public/icons/icon-192.png and icon-512.png
// with your actual app icons.

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const sizes = [192, 512]
const outDir = join(process.cwd(), 'public', 'icons')
mkdirSync(outDir, { recursive: true })

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#4f46e5'
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.arcTo(size, 0, size, r, r)
  ctx.lineTo(size, size - r)
  ctx.arcTo(size, size, size - r, size, r)
  ctx.lineTo(r, size)
  ctx.arcTo(0, size, 0, size - r, r)
  ctx.lineTo(0, r)
  ctx.arcTo(0, 0, r, 0, r)
  ctx.closePath()
  ctx.fill()

  // Emoji
  ctx.font = `${size * 0.5}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('💑', size / 2, size / 2)

  const buf = canvas.toBuffer('image/png')
  writeFileSync(join(outDir, `icon-${size}.png`), buf)
  console.log(`Generated icon-${size}.png`)
}
