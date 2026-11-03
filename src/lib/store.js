// Device storage. Items (with their photos) live in IndexedDB; folders in localStorage.
// Nothing leaves the device — use the backup export/import to move or keep a copy.

const DB = 'collectie'
const STORE = 'items'
const FOLDERS_KEY = 'collection-folders'

let dbPromise = null
function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function tx(mode, fn) {
  const d = await db()
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode)
    const out = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(out?.result)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  })
}

export const loadItems = () => tx('readonly', (s) => s.getAll()).then((r) => r || [])
export const saveItem = (item) => tx('readwrite', (s) => s.put(item))
export const removeItem = (id) => tx('readwrite', (s) => s.delete(id))
export const replaceItems = (items) =>
  tx('readwrite', (s) => {
    s.clear()
    for (const it of items) s.put(it)
  })

export function loadFolders() {
  try {
    const f = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]')
    return Array.isArray(f) ? f : []
  } catch {
    return []
  }
}
export function saveFolders(folders) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  } catch {
    /* storage unavailable */
  }
}

/** Ask the browser not to evict our data under storage pressure. */
export function requestPersistence() {
  try {
    navigator.storage?.persist?.()
  } catch {
    /* not supported */
  }
}

export const newId = () =>
  globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)

/** Downscale a photo to a JPEG data URL so it stays small enough to store. */
export function readPhoto(file, max = 1400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(img.naturalWidth * k)
      c.height = Math.round(img.naturalHeight * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Deze afbeelding kon niet gelezen worden.'))
    }
    img.src = url
  })
}

// ----- Sync state: which shared version this device has, and whether it changed since -----
const SYNC_KEY = 'collection-sync'
export function loadSync() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_KEY) || '{}') || {}
  } catch {
    return {}
  }
}
export function saveSync(patch) {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify({ ...loadSync(), ...patch }))
  } catch {
    /* storage unavailable */
  }
}

/** The collection published on the site (data/collection.json), or null. */
export async function fetchShared() {
  try {
    const res = await fetch('shared/collection.json', { cache: 'no-cache' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.version && Array.isArray(data.items) ? data : null
  } catch {
    return null
  }
}

const toDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })

/** Photos that came from the site are links: embed them so the export is complete on its own. */
async function embedPhotos(items) {
  return Promise.all(
    items.map(async (it) => {
      const photos = { ...(it.photos || {}) }
      for (const side of ['front', 'back']) {
        const p = photos[side]
        if (p && !p.startsWith('data:')) {
          try {
            photos[side] = await toDataUrl(await (await fetch(p)).blob())
          } catch {
            /* keep the link */
          }
        }
      }
      return { ...it, photos }
    }),
  )
}

/** One file with every item, photo and folder. Phones get the share sheet (AirDrop, Files, mail…). */
export async function exportCollection(items, folders) {
  const data = { app: 'collectie', version: 1, exported: new Date().toISOString(), folders, items: await embedPhotos(items) }
  const name = 'collection.json'
  const file = new File([JSON.stringify(data)], name, { type: 'application/json' })
  const touch = window.matchMedia?.('(pointer: coarse)').matches
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Collection export' })
      return true
    } catch (err) {
      if (err?.name === 'AbortError') return false
      /* fall through to a download */
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return true
}

export async function readBackup(file) {
  const data = JSON.parse(await file.text())
  if (!data || !Array.isArray(data.items)) throw new Error('Dit is geen back-upbestand van de collectie.')
  return { items: data.items, folders: Array.isArray(data.folders) ? data.folders : [] }
}
