import { range } from './format.js'
import { canonicalCountry, englishCountry } from '../data/countries.js'
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

// Lowercase without accents, so "israel" finds Israël and "zloty" finds Złoty.
const plain = (v) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').toLowerCase()
const digits = (v) => plain(v).replace(/[\s.,']/g, '')
const words = (v) => plain(v).split(/[^\p{L}\p{N}]+/u).filter(Boolean)

/** How well a piece matches the search: 0 = best. */
function matchRank(it, q) {
  const qd = digits(q)
  const name = plain([it.denom, it.unit].filter(Boolean).join(' '))
  if (digits(it.denom) === qd || name === q) return 0 // exactly this denomination / name
  // Denomination starts with it: the closest first ("2" → 2, then 20, then 200, then 2000).
  if (qd && digits(it.denom).startsWith(qd)) return 1 + Math.min(digits(it.denom).length - qd.length, 9) / 10
  if (name.startsWith(q)) return 1.95
  const main = [it.country, englishCountry(it.country), it.tag, it.series, it.unit]
  if (main.some((v) => plain(v).startsWith(q) || words(v).some((w) => w.startsWith(q)))) return 2
  const rest = [it.year, it.front, it.back, it.region, it.note]
  if (rest.some((v) => words(v).some((w) => w.startsWith(q)))) return 3
  return 4 // somewhere inside a word or number
}

// "Tonen" filter: which statuses to show ('all' = every status).
export const SHOW_OPTIONS = [
  ['all', 'Alles', null],
  ['legal', 'Wettig betaalmiddel', ['legal']],
  ['exch', 'Inwisselbaar', ['exch']],
  ['cash', 'Wettig of inwisselbaar', ['legal', 'exch']],
  ['demo', 'Buiten omloop', ['demo']],
  ['check', 'Te identificeren', ['check']],
]
const SHOW = Object.fromEntries(SHOW_OPTIONS.map(([k, , st]) => [k, st]))

/** A view is a string: 'home' | 'all' | 'notes' | 'coins' | 'favorites' | 'folder:<id>' | 'country:<name>' | 'decade:1990'. */
export function filterItems(items, { view, type, query, sort, show = 'all' }) {
  const q = plain(query.trim())
  const list = items.filter((it) => {
    if (view === 'favorites' && !it.fav) return false
    if (view.startsWith('folder:') && !inFolder(it, view.slice(7))) return false
    if (view.startsWith('country:') && countryKey(it) !== view.slice(8)) return false
    if (view.startsWith('decade:') && !(it.dated && decadeOf(it) === +view.slice(7))) return false
    if (type !== 'all' && it.type !== type) return false
    if (SHOW[show] && !SHOW[show].includes(it.status)) return false
    if (q) {
      const hay = plain([it.country, englishCountry(it.country), it.denom, it.unit, it.series, it.year, it.front, it.back, it.region, it.note, it.tag].join(' '))
      // Numbers match with or without thousands separators: "1.000" = "1 000" = "1000".
      const qd = digits(q)
      const numeric = /^\d+$/.test(qd)
      if (!hay.includes(q) && !(numeric && digits(it.denom).includes(qd))) return false
    }
    return true
  })
  const year = (it) => (it.ys == null ? 99999 : it.ys)
  // While searching, the best matches come first ("1" → the 1 dollar notes before 100 or 1988).
  const rank = q ? new Map(list.map((it) => [it, matchRank(it, q)])) : null
  list.sort((a, b) => {
    if (rank && rank.get(a) !== rank.get(b)) return rank.get(a) - rank.get(b)
    if (sort === 'cash') return (b.face || 0) - (a.face || 0) || (b.hi || 0) - (a.hi || 0)
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
