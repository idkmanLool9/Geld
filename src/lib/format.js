export const eur = (n) => '€' + (n % 1 ? n.toFixed(2) : String(n))
export const range = (lo, hi) => (lo === hi ? eur(lo) : `${eur(lo)}–${hi % 1 ? hi.toFixed(2) : hi}`)
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`
