// Dutch formatting: € 1.234,50 style numbers, "17 februari 2012" style dates.
const money = (n) => {
  const frac = n % 1 !== 0
  return Number(n).toLocaleString('nl-NL', {
    minimumFractionDigits: frac ? 2 : 0,
    maximumFractionDigits: frac && Math.abs(n) < 1 && Math.round(n * 100) === 0 ? 4 : 2,
  })
}
export const eur = (n) => '€' + money(n)
export const range = (lo, hi) => (lo === hi ? eur(lo) : `${eur(lo)}–${money(hi)}`)
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`
export const fmtDate = (iso) => {
  const d = new Date(String(iso).slice(0, 10) + 'T12:00:00Z')
  return isNaN(d) ? String(iso) : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}
