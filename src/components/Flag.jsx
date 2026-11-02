import { FLAGS } from '../data/flags.js'

/** Simplified flag. Size it with width/height; it fills the box. Countries without a drawn flag show their code. */
export default function Flag({ cc, width, height, radius = 3, className = '', style }) {
  const f = FLAGS[cc]
  if (!f && cc && cc !== '?') {
    return (
      <span className={`flag flag-code ${className}`} style={{ width, height, borderRadius: radius, fontSize: Math.max(7, height * 0.42), ...style }} aria-hidden="true">
        {cc}
      </span>
    )
  }
  const g = f || FLAGS['?']
  return (
    <span className={`flag ${className}`} style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true">
      <span className="flag-inner" style={{ flexDirection: g.dir }}>
        {g.stripes.map(([color, w], i) => (
          <span key={i} style={{ flex: `${w} 1 0`, background: color }} />
        ))}
        {(g.marks || []).map((m, i) => (
          <span key={'m' + i} style={{ position: 'absolute', ...m }} />
        ))}
        <span className="flag-ring" />
      </span>
    </span>
  )
}
