// Publishes the shared collection: turns data/collection.json (an export from the app)
// into public/shared/collection.json + one JPEG per photo, so every visitor gets the
// same collection without downloading all photos at once. Runs before every build.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const SRC = 'data/collection.json'
const OUT = 'public/shared'

rmSync(OUT, { recursive: true, force: true })
if (!existsSync(SRC)) {
  // An empty marker (version null) keeps the app's check quiet; it is ignored by the app.
  mkdirSync(OUT, { recursive: true })
  writeFileSync(`${OUT}/collection.json`, JSON.stringify({ version: null, folders: [], items: [] }))
  console.log('publish: no data/collection.json — the app starts empty.')
  process.exit(0)
}

const raw = readFileSync(SRC)
const data = JSON.parse(raw)
if (!Array.isArray(data.items)) throw new Error('data/collection.json is not an export from the app (no items).')

mkdirSync(OUT + '/photos', { recursive: true })
let n = 0
const items = data.items.map((it) => {
  const photos = {}
  for (const side of ['front', 'back']) {
    const p = it.photos?.[side]
    const m = typeof p === 'string' && p.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/)
    if (m) {
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
      const file = `photos/${String(it.id).replace(/[^\w-]/g, '')}-${side}.${ext}`
      writeFileSync(`${OUT}/${file}`, Buffer.from(m[2], 'base64'))
      photos[side] = `shared/${file}`
      n++
    } else if (p) photos[side] = p
  }
  return { ...it, photos }
})

const version = createHash('sha1').update(raw).digest('hex').slice(0, 12)
writeFileSync(`${OUT}/collection.json`, JSON.stringify({ version, exported: data.exported, folders: data.folders || [], items }))
console.log(`publish: ${items.length} entries, ${n} photos, version ${version}`)
