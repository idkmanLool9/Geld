import { ITEMS } from '../data/items.js'
import { FOLDER_NAMES } from '../data/meta.js'
import { range } from './format.js'

export const inFolder = (it, f) => it.folders.includes(f)
export const decadeOf = (it) => Math.floor(it.ys / 10) * 10

/** Totals for a set of items. Uncounted stacks are flagged, not summed. */
export function sumUp(items) {
  const o = { pieces: 0, lo: 0, hi: 0, stack: false, face: 0, faceN: 0, nC: 0, nR: 0 }
  const ccs = new Set()
  const regs = new Set()
  for (const it of items) {
    if (it.stack) o.stack = true
    else {
      o.pieces += it.qty
      o.lo += it.lo * it.qty
      o.hi += it.hi * it.qty
    }
    if (inFolder(it, 'exchangeable')) {
      o.face += it.face * it.qty
      o.faceN += it.qty
    }
    if (it.cc !== '?') ccs.add(it.cc)
    if (it.region !== 'Unidentified') regs.add(it.region)
  }
  o.nC = ccs.size
  o.nR = regs.size
  o.face = Math.round(o.face * 100) / 100
  return o
}

/** Countries that have at least one item, with their items and totals. */
export function getCountries() {
  const map = new Map()
  for (const it of ITEMS) {
    if (it.cc === '?') continue
    if (!map.has(it.cc)) map.set(it.cc, { cc: it.cc, name: it.country, region: it.region, items: [] })
    map.get(it.cc).items.push(it)
  }
  return [...map.values()]
    .map((c) => ({ ...c, ...sumUp(c.items) }))
    .sort((a, b) => b.pieces - a.pieces || a.name.localeCompare(b.name))
}

/** A view is a string: 'home' | 'all' | 'notes' | 'coins' | 'favorites' | folder key | 'country:XX' | 'decade:1990'. */
export function filterItems({ view, type, query, sort, favs }) {
  const q = query.trim().toLowerCase()
  const list = ITEMS.filter((it) => {
    if (FOLDER_NAMES[view] && !inFolder(it, view)) return false
    if (view === 'favorites' && !favs[it.id]) return false
    if (view.startsWith('country:') && it.cc !== view.slice(8)) return false
    if (view.startsWith('decade:') && !(it.dated && decadeOf(it) === +view.slice(7))) return false
    if (type !== 'all' && it.type !== type) return false
    if (q) {
      const hay = [it.country, it.denom, it.unit, it.series, it.year, it.front, it.back, it.region].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  list.sort((a, b) => {
    if (sort === 'country') return a.country.localeCompare(b.country) || b.hi - a.hi
    if (sort === 'year') return a.ys - b.ys
    return (a.stack ? 1 : 0) - (b.stack ? 1 : 0) || b.hi - a.hi
  })
  return list
}

export function valueLabel(it) {
  if (it.stack) return '€30–300'
  if (it.lo === 0 && it.hi === 0) return 'Unknown'
  return range(it.lo, it.hi) + (it.qty > 1 ? ' ea.' : '')
}

export const typeForView = (v) => (v === 'coins' ? 'coin' : v === 'notes' ? 'note' : 'all')

/** Count shown on a country badge: "30+" for a country that is only an uncounted stack. */
export const countBadge = (c) => (c.stack ? (c.pieces ? `${c.pieces}+` : '30+') : c.pieces)
