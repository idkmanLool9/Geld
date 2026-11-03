import Flag from './Flag.jsx'
import Icon from './Icon.jsx'

const PEEK = [
  { top: '7%', left: '11%', width: '56%', height: '40%', transform: 'rotate(-6deg)' },
  { top: '2%', left: '23%', width: '56%', height: '40%', transform: 'rotate(2deg)' },
  { top: '8%', left: '33%', width: '54%', height: '38%', transform: 'rotate(7deg)' },
]

/** The yellow folder tile. `items` peek out of the top (the three most valuable). */
export function FolderGraphic({ items = [], cc, icon, badge }) {
  const top = [...items].sort((a, b) => (b.hi || 0) - (a.hi || 0)).slice(0, 3)
  return (
    <div className="folder-graphic">
      <svg viewBox="0 0 130 100" preserveAspectRatio="none" className="folder-back" aria-hidden="true">
        <path d="M0 10a10 10 0 0 1 10-10h30l12 12h68a10 10 0 0 1 10 10v68a10 10 0 0 1-10 10H10A10 10 0 0 1 0 90z" />
      </svg>
      {top.map((it, i) =>
        it.type === 'coin' ? (
          <span key={it.id} className="folder-peek folder-peek-coin" style={{ background: it.color }} />
        ) : (
          <span key={it.id} className="folder-peek" style={{ background: it.color, ...PEEK[i] }} />
        ),
      )}
      <div className="folder-front">
        {cc && <Flag cc={cc} width={36} height={25} radius={4} className="folder-flag" />}
        {icon && (
          <span className="folder-icon">
            <Icon name={icon} size={15} stroke={2} />
          </span>
        )}
        {badge != null && <span className="folder-badge">{badge}</span>}
      </div>
    </div>
  )
}

export default function Folder({ name, meta, onClick, ...graphic }) {
  return (
    <button type="button" className="folder" onClick={onClick}>
      <FolderGraphic {...graphic} />
      <span className="folder-label">
        <span className="folder-name">{name}</span>
        <span className="folder-meta">{meta}</span>
      </span>
    </button>
  )
}

export function NewFolder({ onClick }) {
  return (
    <button type="button" className="folder" onClick={onClick}>
      <div className="folder-graphic folder-new">
        <Icon name="plus" size={28} />
      </div>
      <span className="folder-label">
        <span className="folder-name link">Nieuwe map</span>
        <span className="folder-meta">Je eigen indeling</span>
      </span>
    </button>
  )
}
