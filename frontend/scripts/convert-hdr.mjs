import { readFileSync } from 'fs'
import sharp from 'sharp'

// Simple RGBE (.hdr) parser → tonemapped JPG
function parseRGBE(buffer) {
  const text = new TextDecoder('ascii')
  let offset = 0

  // Skip header lines until empty line
  while (offset < buffer.length) {
    let lineEnd = buffer.indexOf(0x0a, offset)
    if (lineEnd === -1) break
    const line = text.decode(buffer.slice(offset, lineEnd)).trim()
    offset = lineEnd + 1
    if (line === '') break
  }

  // Resolution line: -Y height +X width
  let lineEnd = buffer.indexOf(0x0a, offset)
  const resLine = text.decode(buffer.slice(offset, lineEnd)).trim()
  offset = lineEnd + 1
  const match = resLine.match(/-Y\s+(\d+)\s+\+X\s+(\d+)/)
  if (!match) throw new Error(`Bad resolution line: ${resLine}`)
  const height = parseInt(match[1])
  const width = parseInt(match[2])
  console.log(`HDR: ${width}×${height}`)

  // Decode scanlines (run-length encoded RGBE)
  const pixels = new Float32Array(width * height * 3)

  for (let y = 0; y < height; y++) {
    // Check for new-style RLE
    if (buffer[offset] === 2 && buffer[offset + 1] === 2) {
      const scanlineWidth = (buffer[offset + 2] << 8) | buffer[offset + 3]
      if (scanlineWidth !== width) throw new Error('Scanline width mismatch')
      offset += 4

      // Read 4 channels separately (R, G, B, E)
      const scanline = new Uint8Array(width * 4)
      for (let ch = 0; ch < 4; ch++) {
        let ptr = ch
        let count = 0
        while (count < width) {
          const code = buffer[offset++]
          if (code > 128) {
            // RLE run
            const runLen = code - 128
            const val = buffer[offset++]
            for (let i = 0; i < runLen; i++) {
              scanline[ptr] = val
              ptr += 4
              count++
            }
          } else {
            // Literal
            for (let i = 0; i < code; i++) {
              scanline[ptr] = buffer[offset++]
              ptr += 4
              count++
            }
          }
        }
      }

      // Convert RGBE to float RGB
      for (let x = 0; x < width; x++) {
        const idx = x * 4
        const e = scanline[idx + 3]
        if (e === 0) {
          pixels[(y * width + x) * 3] = 0
          pixels[(y * width + x) * 3 + 1] = 0
          pixels[(y * width + x) * 3 + 2] = 0
        } else {
          const scale = Math.pow(2, e - 128 - 8)
          pixels[(y * width + x) * 3] = scanline[idx] * scale
          pixels[(y * width + x) * 3 + 1] = scanline[idx + 1] * scale
          pixels[(y * width + x) * 3 + 2] = scanline[idx + 2] * scale
        }
      }
    } else {
      throw new Error('Old-style HDR format not supported')
    }
  }

  return { width, height, pixels }
}

// Reinhard tonemap + gamma
function tonemap(pixels, width, height) {
  const out = Buffer.alloc(width * height * 3)
  for (let i = 0; i < width * height; i++) {
    for (let c = 0; c < 3; c++) {
      const hdr = pixels[i * 3 + c]
      // Reinhard tonemap
      const mapped = hdr / (1 + hdr)
      // Gamma correction
      const gamma = Math.pow(mapped, 1 / 2.2)
      out[i * 3 + c] = Math.min(255, Math.max(0, Math.round(gamma * 255)))
    }
  }
  return out
}

const INPUT = 'public/images/planets/HDR_multi_nebulae_2.hdr'
const OUTPUT = 'public/images/planets/nebula_bg.jpg'
const TARGET_W = 8192
const TARGET_H = 4096

console.log('Reading HDR file...')
const buf = readFileSync(INPUT)
const { width, height, pixels } = parseRGBE(buf)

console.log('Tonemapping...')
const rgb = tonemap(pixels, width, height)

console.log(`Resizing ${width}×${height} → ${TARGET_W}×${TARGET_H} and saving as JPG...`)
await sharp(rgb, { raw: { width, height, channels: 3 } })
  .resize(TARGET_W, TARGET_H)
  .jpeg({ quality: 92 })
  .toFile(OUTPUT)

console.log(`✓ Saved ${OUTPUT}`)
