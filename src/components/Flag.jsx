import { flagFor } from '../data/countries.js'

// One small SVG file per flag, fetched by the browser only when that flag is on screen.
const FILES = import.meta.glob('../../node_modules/flag-icons/flags/4x3/*.svg', { query: '?url', import: 'default', eager: true })
const URLS = Object.fromEntries(Object.entries(FILES).map(([path, url]) => [path.split('/').pop().slice(0, -4), url]))

/** Country flag. Issuers without a flag show their short code; unknown shows a "?" tile. */
export default function Flag({ cc, width, height, radius = 3, className = '', style }) {
  const box = { width, height, borderRadius: radius, ...style }
  const url = URLS[flagFor(cc)]
  if (url) return <span className={`flag flag-img ${className}`} style={{ ...box, backgroundImage: `url("${url}")` }} aria-hidden="true" />
  return (
    <span className={`flag flag-code ${className}`} style={{ ...box, fontSize: Math.max(7, height * (cc && cc.length > 2 ? 0.34 : 0.42)) }} aria-hidden="true">
      {cc && cc !== '?' ? cc : '?'}
    </span>
  )
}
