import { readFileSync, writeFileSync } from 'fs'

// RGBE (.hdr) parser
function parseRGBE(buffer) {
  const text = new TextDecoder('ascii')
  let offset = 0

  while (offset < buffer.length) {
    let lineEnd = buffer.indexOf(0x0a, offset)
    if (lineEnd === -1) break
    const line = text.decode(buffer.slice(offset, lineEnd)).trim()
    offset = lineEnd + 1
    if (line === '') break
  }

  let lineEnd = buffer.indexOf(0x0a, offset)
  const resLine = text.decode(buffer.slice(offset, lineEnd)).trim()
  offset = lineEnd + 1
  const match = resLine.match(/-Y\s+(\d+)\s+\+X\s+(\d+)/)
  if (!match) throw new Error(`Bad resolution line: ${resLine}`)
  const height = parseInt(match[1])
  const width = parseInt(match[2])
  console.log(`Input: ${width}×${height}`)

  const pixels = new Float32Array(width * height * 3)

  for (let y = 0; y < height; y++) {
    if (buffer[offset] === 2 && buffer[offset + 1] === 2) {
      const scanlineWidth = (buffer[offset + 2] << 8) | buffer[offset + 3]
      if (scanlineWidth !== width) throw new Error('Scanline width mismatch')
      offset += 4

      const scanline = new Uint8Array(width * 4)
      for (let ch = 0; ch < 4; ch++) {
        let ptr = ch
        let count = 0
        while (count < width) {
          const code = buffer[offset++]
          if (code > 128) {
            const runLen = code - 128
            const val = buffer[offset++]
            for (let i = 0; i < runLen; i++) {
              scanline[ptr] = val
              ptr += 4
              count++
            }
          } else {
            for (let i = 0; i < code; i++) {
              scanline[ptr] = buffer[offset++]
              ptr += 4
              count++
            }
          }
        }
      }

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

// Bilinear downsample in float space
function downsample(src, srcW, srcH, dstW, dstH) {
  const dst = new Float32Array(dstW * dstH * 3)
  const scaleX = srcW / dstW
  const scaleY = srcH / dstH

  for (let y = 0; y < dstH; y++) {
    const srcY = y * scaleY
    const y0 = Math.floor(srcY)
    const y1 = Math.min(y0 + 1, srcH - 1)
    const fy = srcY - y0

    for (let x = 0; x < dstW; x++) {
      const srcX = x * scaleX
      const x0 = Math.floor(srcX)
      const x1 = Math.min(x0 + 1, srcW - 1)
      const fx = srcX - x0

      for (let c = 0; c < 3; c++) {
        const v00 = src[(y0 * srcW + x0) * 3 + c]
        const v10 = src[(y0 * srcW + x1) * 3 + c]
        const v01 = src[(y1 * srcW + x0) * 3 + c]
        const v11 = src[(y1 * srcW + x1) * 3 + c]
        dst[(y * dstW + x) * 3 + c] =
          v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v01 * (1 - fx) * fy + v11 * fx * fy
      }
    }
  }
  return dst
}

// Encode float RGB → RGBE with RLE compression
function encodeRGBE(pixels, width, height) {
  const header = `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`
  const headerBuf = Buffer.from(header, 'ascii')

  const scanlines = []
  for (let y = 0; y < height; y++) {
    // Convert row to RGBE
    const rgbe = new Uint8Array(width * 4)
    for (let x = 0; x < width; x++) {
      const i3 = (y * width + x) * 3
      const r = pixels[i3]
      const g = pixels[i3 + 1]
      const b = pixels[i3 + 2]
      const maxVal = Math.max(r, g, b)
      if (maxVal < 1e-32) {
        rgbe[x * 4] = 0
        rgbe[x * 4 + 1] = 0
        rgbe[x * 4 + 2] = 0
        rgbe[x * 4 + 3] = 0
      } else {
        const exp = Math.ceil(Math.log2(maxVal))
        const scale = Math.pow(2, -exp) * 256
        rgbe[x * 4] = Math.min(255, Math.max(0, Math.round(r * scale)))
        rgbe[x * 4 + 1] = Math.min(255, Math.max(0, Math.round(g * scale)))
        rgbe[x * 4 + 2] = Math.min(255, Math.max(0, Math.round(b * scale)))
        rgbe[x * 4 + 3] = exp + 128
      }
    }

    // RLE encode per channel
    const scanBuf = [2, 2, (width >> 8) & 0xff, width & 0xff]
    for (let ch = 0; ch < 4; ch++) {
      let x = 0
      while (x < width) {
        // Look for run
        let runStart = x
        let runVal = rgbe[x * 4 + ch]
        let runLen = 1
        while (x + runLen < width && runLen < 127 && rgbe[(x + runLen) * 4 + ch] === runVal) {
          runLen++
        }
        if (runLen > 2) {
          scanBuf.push(runLen + 128, runVal)
          x += runLen
        } else {
          // Literal
          const litStart = x
          let litLen = 0
          while (x + litLen < width && litLen < 127) {
            // Check if a run of 3+ starts here
            if (
              x + litLen + 2 < width &&
              rgbe[(x + litLen) * 4 + ch] === rgbe[(x + litLen + 1) * 4 + ch] &&
              rgbe[(x + litLen) * 4 + ch] === rgbe[(x + litLen + 2) * 4 + ch]
            ) {
              break
            }
            litLen++
          }
          if (litLen === 0) litLen = 1
          scanBuf.push(litLen)
          for (let i = 0; i < litLen; i++) {
            scanBuf.push(rgbe[(x + i) * 4 + ch])
          }
          x += litLen
        }
      }
    }
    scanlines.push(Buffer.from(scanBuf))
  }

  return Buffer.concat([headerBuf, ...scanlines])
}

const INPUT = 'public/images/planets/HDR_multi_nebulae_2.hdr'
const OUTPUT = 'public/images/planets/nebula_bg.hdr'
const TARGET_W = 4096
const TARGET_H = 2048

console.log('Reading HDR file...')
const buf = readFileSync(INPUT)
const { width, height, pixels } = parseRGBE(buf)

console.log(`Downsampling ${width}×${height} → ${TARGET_W}×${TARGET_H}...`)
const downsampled = downsample(pixels, width, height, TARGET_W, TARGET_H)

console.log('Encoding RGBE...')
const output = encodeRGBE(downsampled, TARGET_W, TARGET_H)

writeFileSync(OUTPUT, output)
console.log(`✓ Saved ${OUTPUT} (${(output.length / 1024 / 1024).toFixed(2)} MB)`)
