// Today's exchange rates (1 EUR = x units), free and without a key: the open-source
// currency-api (fawazahmed0) via jsDelivr, with a mirror, and a copy saved on the site at
// every deploy (scripts/rates.mjs) as the last fallback. Cached on the device for 12 hours.

const KEY = 'collection-rates'
const MAX_AGE = 12 * 3600 * 1000
export const RATE_URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json',
  'https://latest.currency-api.pages.dev/v1/currencies/eur.json',
]

let pending = null

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null')
    return c && c.rates ? c : null
  } catch {
    return null
  }
}

/** { date, rates: { usd: 1.08, … } } or null when no rates can be found. */
export function getRates() {
  const cached = readCache()
  if (cached && Date.now() - cached.fetched < MAX_AGE) return Promise.resolve(cached)
  if (!pending) {
    pending = (async () => {
      for (const url of [...RATE_URLS, new URL('rates.json', document.baseURI).href]) {
        try {
          const res = await fetch(url, { cache: 'no-cache' })
          if (!res.ok) continue
          const data = await res.json()
          if (!data?.eur) continue
          const out = { date: data.date, fetched: Date.now(), rates: data.eur }
          try {
            localStorage.setItem(KEY, JSON.stringify(out))
          } catch {
            /* storage full: still use it */
          }
          return out
        } catch {
          /* try the next source */
        }
      }
      return cached // old rates are better than none
    })().finally(() => {
      pending = null
    })
  }
  return pending
}

/** Value in euro of `amount` units of `code`, rounded to cents; null when the rate is unknown. */
export function toEuro(rates, code, amount) {
  if (!rates || !code || !amount) return null
  if (code === 'EUR') return Math.round(amount * 100) / 100
  const r = rates.rates?.[code.toLowerCase()]
  if (!r) return null
  const v = amount / r
  return v >= 1 ? Math.round(v * 100) / 100 : Math.round(v * 10000) / 10000
}
