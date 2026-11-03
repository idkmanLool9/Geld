// "Publish": writes the collection straight into the GitHub repository that hosts the site,
// using a personal access token that only lives on this device. Free; GitHub Actions then
// rebuilds the site and every device picks up the new version.
//
// Layout in the repo:  data/collection.json  +  data/photos/<id>-<side>.jpg
// Unchanged photos are detected by their git blob hash and not uploaded again.

export const REPO = { owner: 'idkmanLool9', repo: 'geld', branch: 'main', dir: 'data' }
const TOKEN_KEY = 'collection-github-token'
const API = 'https://api.github.com'

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
export function saveToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

async function gh(token, method, path, body) {
  const res = await fetch(`${API}/repos/${REPO.owner}/${REPO.repo}${path}`, {
    method,
    // Never reuse a cached answer: right after a publish, a cached branch pointer would make
    // the next publish build on an old version, which GitHub rejects (422).
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json()).message || ''
    } catch {
      /* no body */
    }
    const err = new Error(
      res.status === 401
        ? 'GitHub aanvaardt de sleutel niet. Controleer of hij volledig gekopieerd is en niet verlopen is.'
        : res.status === 403 || res.status === 404
          ? 'Deze sleutel mag niet schrijven in de Geld-repository. Geef hem “Contents: Read and write” voor die repository.'
          : res.status === 422 && /fast.forward/i.test(detail)
            ? 'De collectie op GitHub veranderde tijdens het publiceren. Tik nog eens op Publiceren.'
            : `GitHub gaf een fout (${res.status}${detail ? `: ${detail}` : ''}). Probeer het opnieuw.`,
    )
    err.status = res.status
    err.detail = detail
    throw err
  }
  return res.status === 204 ? null : res.json()
}

/** Checks that the key can read the repository. */
export async function checkToken(token) {
  await gh(token, 'GET', '')
  return true
}

// ----- helpers -----
const b64 = (bytes) => {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(s)
}
async function photoBytes(src) {
  if (src.startsWith('data:')) {
    const bin = atob(src.slice(src.indexOf(',') + 1))
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }
  return new Uint8Array(await (await fetch(src)).arrayBuffer())
}
/** The hash git gives a file ("blob <size>\0" + content), so unchanged photos can be skipped. */
export async function gitBlobSha(bytes) {
  const head = new TextEncoder().encode(`blob ${bytes.length}\0`)
  const all = new Uint8Array(head.length + bytes.length)
  all.set(head)
  all.set(bytes, head.length)
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-1', all))
  return [...hash].map((b) => b.toString(16).padStart(2, '0')).join('')
}
const safe = (id) => String(id).replace(/[^\w-]/g, '')

/**
 * Publishes items + folders. onProgress(text) gets short status lines.
 * Returns the number of photos uploaded.
 */
export async function publish(token, items, folders, onProgress = () => {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await publishOnce(token, items, folders, onProgress)
    } catch (err) {
      // The branch moved in between (another publish): wait a moment and start again from the new state.
      if (err.status === 422 && attempt < 3) {
        onProgress('Even bijwerken met GitHub…')
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        continue
      }
      throw err
    }
  }
}

async function publishOnce(token, items, folders, onProgress) {
  onProgress('Verbinden met GitHub…')
  const ref = await gh(token, 'GET', `/git/ref/heads/${REPO.branch}`)
  const head = await gh(token, 'GET', `/git/commits/${ref.object.sha}`)
  const tree = await gh(token, 'GET', `/git/trees/${head.tree.sha}?recursive=1`)
  const existing = new Map(tree.tree.filter((t) => t.type === 'blob').map((t) => [t.path, t.sha]))

  const photoDir = `${REPO.dir}/photos/`
  const entries = []
  const used = new Set()
  const jobs = []
  const outItems = items.map((it) => {
    const photos = {}
    for (const side of ['front', 'back']) {
      const src = it.photos?.[side]
      if (!src) continue
      const rel = `photos/${safe(it.id)}-${side}.jpg`
      photos[side] = rel
      used.add(REPO.dir + '/' + rel)
      jobs.push({ src, path: REPO.dir + '/' + rel })
    }
    return { ...it, photos }
  })

  let uploaded = 0
  let done = 0
  const queue = [...jobs]
  const worker = async () => {
    while (queue.length) {
      const job = queue.shift()
      const bytes = await photoBytes(job.src)
      if ((await gitBlobSha(bytes)) !== existing.get(job.path)) {
        const blob = await gh(token, 'POST', '/git/blobs', { content: b64(bytes), encoding: 'base64' })
        entries.push({ path: job.path, mode: '100644', type: 'blob', sha: blob.sha })
        uploaded++
      }
      done++
      onProgress(`Foto's ${done} van ${jobs.length}…`)
    }
  }
  await Promise.all([worker(), worker(), worker()])

  // Photos of pieces that were deleted.
  for (const path of existing.keys()) if (path.startsWith(photoDir) && !used.has(path)) entries.push({ path, mode: '100644', type: 'blob', sha: null })

  onProgress('Collectie opslaan…')
  const data = { app: 'collectie', version: 1, exported: new Date().toISOString(), folders, items: outItems }
  const json = await gh(token, 'POST', '/git/blobs', { content: JSON.stringify(data), encoding: 'utf-8' })
  entries.push({ path: `${REPO.dir}/collection.json`, mode: '100644', type: 'blob', sha: json.sha })

  const newTree = await gh(token, 'POST', '/git/trees', { base_tree: head.tree.sha, tree: entries })
  const commit = await gh(token, 'POST', '/git/commits', {
    message: `Publish collection: ${items.length} entries`,
    tree: newTree.sha,
    parents: [ref.object.sha],
  })
  await gh(token, 'PATCH', `/git/refs/heads/${REPO.branch}`, { sha: commit.sha })
  return uploaded
}
