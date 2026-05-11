import { readFileSync, writeFileSync } from 'fs'
import sharp from 'sharp'

const PLANETS_DIR = 'public/images/planets'

// Downscale 8K textures to 4K
async function downscale(input, output, width = 4096) {
  await sharp(input)
    .resize(width, width / 2, { fit: 'fill' })
    .jpeg({ quality: 90 })
    .toFile(output)
  console.log(`✓ ${input} → ${output}`)
}

// Convert HDR to high-quality JPG (background plane doesn't need float precision)
async function convertHdrToJpg(input, output) {
  // HDR files can't be read by sharp directly, so we'll use a tonemapped EXR→JPG approach
  // Instead, let's just document that this needs manual conversion
  console.log(`⚠ HDR conversion requires manual step or hdr-to-jpg tool`)
  console.log(`  Input: ${input} (92MB)`)
  console.log(`  Recommended: use an HDR→JPG converter at 4096x2048, quality 92`)
  console.log(`  Save as: ${output}`)
}

async function createAtlas() {
  const COLS = 4
  const ROWS = 4
  const CHUNK_W = 512
  const CHUNK_H = 256
  const atlasW = COLS * CHUNK_W // 2048
  const atlasH = ROWS * CHUNK_H // 1024

  const composites = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col
      const file = `public/images/asteroids/chunk_${String(idx).padStart(2, '0')}.jpg`
      composites.push({
        input: file,
        left: col * CHUNK_W,
        top: row * CHUNK_H
      })
    }
  }

  await sharp({ create: { width: atlasW, height: atlasH, channels: 3, background: { r: 0, g: 0, b: 0 } } })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile('public/images/asteroids/atlas.jpg')

  console.log(`✓ Created asteroid atlas: public/images/asteroids/atlas.jpg (${atlasW}×${atlasH})`)
}

await downscale(`${PLANETS_DIR}/8k_mars.jpg`, `${PLANETS_DIR}/4k_mars.jpg`)
await downscale(`${PLANETS_DIR}/8k_earth_clouds.jpg`, `${PLANETS_DIR}/4k_earth_clouds.jpg`)
await createAtlas()
await convertHdrToJpg(`${PLANETS_DIR}/HDR_multi_nebulae_2.hdr`, `${PLANETS_DIR}/nebula_bg.jpg`)
