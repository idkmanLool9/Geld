const money = (n) => (n % 1 ? n.toFixed(2) : String(n))
export const eur = (n) => '€' + money(n)
export const range = (lo, hi) => (lo === hi ? eur(lo) : `${eur(lo)}–${money(hi)}`)
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`
