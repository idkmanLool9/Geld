// Copies the free, in-browser OCR engine (Tesseract) and its English text model into
// public/ocr so the site serves them itself — no outside service. Runs before every build.
import { copyFileSync, mkdirSync } from 'node:fs'

const OUT = 'public/ocr'
mkdirSync(OUT, { recursive: true })
const files = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'eng.traineddata.gz'],
]
for (const [from, to] of files) copyFileSync(from, `${OUT}/${to}`)
console.log(`ocr: ${files.length} files copied to ${OUT}`)
