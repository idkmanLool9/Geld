import { FLAGS } from '../data/flags.js'

/** Simplified flag. Size it with width/height; it fills the box. */
export default function Flag({ cc, width, height, radius = 3, className = '', style }) {
  const f = FLAGS[cc] || FLAGS['?']
  return (
    <span className={`flag ${className}`} style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true">
      <span className="flag-inner" style={{ flexDirection: f.dir }}>
        {f.stripes.map(([color, w], i) => (
          <span key={i} style={{ flex: `${w} 1 0`, background: color }} />
        ))}
        {(f.marks || []).map((m, i) => (
          <span key={'m' + i} style={{ position: 'absolute', ...m }} />
        ))}
        <span className="flag-ring" />
      </span>
    </span>
  )
}
