// Saves today's exchange rates on the site (public/rates.json) as a fallback for the app.
// Runs before every build; if there is no internet (e.g. offline builds) it simply skips.
import { writeFileSync } from 'node:fs'

const URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json'
try {
  const res = await fetch(URL, { signal: AbortSignal.timeout(8000) })
  const data = await res.json()
  if (!data?.eur) throw new Error('unexpected answer')
  writeFileSync('public/rates.json', JSON.stringify({ date: data.date, eur: data.eur }))
  console.log(`rates: saved ${Object.keys(data.eur).length} rates of ${data.date}`)
} catch (err) {
  console.log(`rates: skipped (${err.message})`)
}
