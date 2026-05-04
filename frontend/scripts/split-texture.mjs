import { execSync } from 'child_process'

const src = 'public/images/planets/2k_makemake_fictional.jpg'
const outDir = 'public/images/asteroids'
const cols = 4
const rows = 4
const chunkW = 512
const chunkH = 256

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const left = col * chunkW
    const top = row * chunkH
    const idx = row * cols + col
    const out = `${outDir}/chunk_${String(idx).padStart(2, '0')}.jpg`
    execSync(`npx sharp-cli -i ${src} -o ${out} extract ${top} ${left} ${chunkW} ${chunkH}`)
    console.log(`Created ${out}`)
  }
}
