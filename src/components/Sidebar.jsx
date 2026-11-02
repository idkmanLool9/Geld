import { useState } from 'react'
import Icon from './Icon.jsx'
import Flag from './Flag.jsx'
import { countBadge } from '../lib/collection.js'

function NavItem({ icon, label, count, active, onClick, children }) {
  return (
    <button type="button" className={`nav-item ${active ? 'is-active' : ''}`} onClick={onClick} aria-current={active ? 'page' : undefined}>
      {children || <Icon name={icon} />}
      <span className="nav-label">{label}</span>
      {count != null && <span className="nav-count">{count}</span>}
    </button>
  )
}

export default function Sidebar({ view, go, counts, countries }) {
  const [more, setMore] = useState(false)
  const shown = more ? countries : countries.slice(0, 8)
  const lib = [
    { key: 'home', icon: 'folder', label: 'Overview' },
    { key: 'all', icon: 'grid', label: 'All items', count: counts.all },
    { key: 'notes', icon: 'note', label: 'Banknotes', count: counts.notes },
    { key: 'coins', icon: 'coin', label: 'Coins', count: counts.coins },
    { key: 'favorites', icon: 'star', label: 'Favorites', count: counts.favorites },
  ]
  const folders = [
    { key: 'highlights', icon: 'gem', label: 'Highlights', count: counts.highlights },
    { key: 'exchangeable', icon: 'swap', label: 'Still exchangeable', count: counts.exchangeable },
    { key: 'identify', icon: 'search', label: 'To identify', count: counts.identify },
    { key: 'lots', icon: 'box', label: 'Lot material', count: counts.lots },
  ]

  return (
    <nav className="sidebar" aria-label="Collection">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="note" size={20} />
        </div>
        <div className="brand-text">
          <span className="brand-name">Collection</span>
          <span className="brand-sub">Banknotes &amp; coins</span>
        </div>
      </div>

      <div className="nav-group">
        <span className="nav-heading">Library</span>
        {lib.map((n) => (
          <NavItem key={n.key} {...n} active={view === n.key} onClick={() => go(n.key)} />
        ))}
      </div>

      <div className="nav-group">
        <span className="nav-heading">Folders</span>
        {folders.map((n) => (
          <NavItem key={n.key} {...n} active={view === n.key} onClick={() => go(n.key)} />
        ))}
      </div>

      <div className="nav-group">
        <span className="nav-heading">Countries</span>
        {shown.map((c) => (
          <NavItem
            key={c.cc}
            label={c.name}
            count={countBadge(c)}
            active={view === 'country:' + c.cc}
            onClick={() => go('country:' + c.cc)}
          >
            <Flag cc={c.cc} width={22} height={15} />
          </NavItem>
        ))}
        <button type="button" className="nav-more" onClick={() => setMore(!more)}>
          {more ? 'Show fewer' : `Show all ${countries.length}`}
        </button>
      </div>
    </nav>
  )
}
