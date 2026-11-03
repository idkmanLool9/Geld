import { range } from './format.js'
import { canonicalCountry } from '../data/countries.js'
import { currencyCode, exchangeInfo, legalTenderAdvice } from '../data/currencies.js'

// Texts the app once filled in automatically in English: replace them with the Dutch version.
// Anything the user typed themselves is left alone.
const OLD_LEGAL = /^(Still valid money|Euro: spend it)/
const OLD_EXCH = /Check that this series is still accepted\.$/
const OLD_ENDED = /^Exchange at the central bank ended on /
function dutchTexts(it) {
  const out = {}
  if (it.where && OLD_LEGAL.test(it.where)) {
    const code = currencyCode(it.cc, it.unit)
    if (code) out.where = legalTenderAdvice(code, it.country, it.type)
  } else if (it.where && OLD_EXCH.test(it.where)) {
    const info = exchangeInfo(it.cc, it.unit, it.denom, it.type)
    if (info?.where) out.where = info.where
  }
  if (it.note && OLD_ENDED.test(it.note)) {
    const info = exchangeInfo(it.cc, it.unit, it.denom, it.type)
    if (info?.note) out.note = it.note.replace(/^Exchange at the central bank ended on [^.]*\./, info.note)
  }
  return out
}

/** Fill in derived fields (sortable year, dated) for a stored item. */
export function prepare(it) {
  const m = String(it.year || '').match(/\d{4}/)
  // Show every known country under its Dutch name ("France" from older data → "Frankrijk").
  const country = canonicalCountry(it.country)
  return { ...it, ...dutchTexts({ ...it, country }), country, ys: m ? +m[0] : null, dated: !!m }
}

export const decadeOf = (it) => Math.floor(it.ys / 10) * 10
export const inFolder = (it, folderId) => (it.folders || []).includes(folderId)
export const countryKey = (it) => it.country || 'Onbekend'

/** Totals for a set of items. */
export function sumUp(items) {
  const o = { pieces: 0, lo: 0, hi: 0, face: 0, faceN: 0, nC: 0, nR: 0, valued: 0 }
  const cs = new Set()
  const rs = new Set()
  for (const it of items) {
    const q = Number(it.qty) || 0
    o.pieces += q
    o.lo += (Number(it.lo) || 0) * q
    o.hi += (Number(it.hi) || 0) * q
    if (it.hi > 0) o.valued += q
    if ((it.status === 'exch' || it.status === 'legal') && it.face > 0) {
      o.face += it.face * q
      o.faceN += q
    }
    if (it.country) cs.add(countryKey(it))
    if (it.region && it.region !== 'Other') rs.add(it.region)
  }
  o.nC = cs.size
  o.nR = rs.size
  o.lo = Math.round(o.lo * 100) / 100
  o.hi = Math.round(o.hi * 100) / 100
  o.face = Math.round(o.face * 100) / 100
  return o
}

/** Countries that have at least one item, with their items and totals. */
export function getCountries(items) {
  const map = new Map()
  for (const it of items) {
    if (!it.country) continue
    const key = countryKey(it)
    if (!map.has(key)) map.set(key, { key, cc: it.cc || '?', name: it.country, region: it.region || 'Other', items: [] })
    map.get(key).items.push(it)
  }
  return [...map.values()]
    .map((c) => ({ ...c, ...sumUp(c.items) }))
    .sort((a, b) => b.pieces - a.pieces || a.name.localeCompare(b.name))
}

/** A view is a string: 'home' | 'all' | 'notes' | 'coins' | 'favorites' | 'folder:<id>' | 'country:<name>' | 'decade:1990'. */
export function filterItems(items, { view, type, query, sort }) {
  const q = query.trim().toLowerCase()
  const list = items.filter((it) => {
    if (view === 'favorites' && !it.fav) return false
    if (view.startsWith('folder:') && !inFolder(it, view.slice(7))) return false
    if (view.startsWith('country:') && countryKey(it) !== view.slice(8)) return false
    if (view.startsWith('decade:') && !(it.dated && decadeOf(it) === +view.slice(7))) return false
    if (type !== 'all' && it.type !== type) return false
    if (q) {
      const hay = [it.country, it.denom, it.unit, it.series, it.year, it.front, it.back, it.region, it.note, it.tag].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  const year = (it) => (it.ys == null ? 99999 : it.ys)
  list.sort((a, b) => {
    if (sort === 'country') return (a.country || '').localeCompare(b.country || '') || year(a) - year(b)
    if (sort === 'year') return year(a) - year(b)
    if (sort === 'added') return (b.created || 0) - (a.created || 0)
    return (b.hi || 0) - (a.hi || 0) || (b.created || 0) - (a.created || 0)
  })
  return list
}

export function valueLabel(it) {
  if (!it.lo && !it.hi) return (it.status === 'exch' || it.status === 'legal') && it.face > 0 ? '≈ ' + range(it.face, it.face) : 'Onbekend'
  return range(it.lo || 0, it.hi || it.lo) + (it.qty > 1 ? ' p/st' : '')
}

export const typeForView = (v) => (v === 'coins' ? 'coin' : v === 'notes' ? 'note' : 'all')
