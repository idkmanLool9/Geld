import { useState } from 'react'
import Icon from './Icon.jsx'
import Flag from './Flag.jsx'

function NavItem({ icon, label, count, active, onClick, children }) {
  return (
    <button type="button" className={`nav-item ${active ? 'is-active' : ''}`} onClick={onClick} aria-current={active ? 'page' : undefined}>
      {children || <Icon name={icon} />}
      <span className="nav-label">{label}</span>
      {count != null && <span className="nav-count">{count}</span>}
    </button>
  )
}

export default function Sidebar({ view, go, counts, folders, folderCounts, countries, onNewFolder }) {
  const [more, setMore] = useState(false)
  const shown = more ? countries : countries.slice(0, 8)
  const lib = [
    { key: 'home', icon: 'folder', label: 'Overzicht' },
    { key: 'all', icon: 'grid', label: 'Alle stukken', count: counts.all },
    { key: 'notes', icon: 'note', label: 'Bankbiljetten', count: counts.notes },
    { key: 'coins', icon: 'coin', label: 'Munten', count: counts.coins },
    { key: 'favorites', icon: 'star', label: 'Favorieten', count: counts.favorites },
  ]

  return (
    <nav className="sidebar" aria-label="Collectie">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="note" size={20} />
        </div>
        <div className="brand-text">
          <span className="brand-name">Collectie</span>
          <span className="brand-sub">Bankbiljetten &amp; munten</span>
        </div>
      </div>

      <div className="nav-group">
        <span className="nav-heading">Bibliotheek</span>
        {lib.map((n) => (
          <NavItem key={n.key} {...n} active={view === n.key} onClick={() => go(n.key)} />
        ))}
      </div>

      <div className="nav-group">
        <span className="nav-heading">Mappen</span>
        {folders.map((f) => (
          <NavItem
            key={f.id}
            icon="folder"
            label={f.name}
            count={folderCounts[f.id] || 0}
            active={view === 'folder:' + f.id}
            onClick={() => go('folder:' + f.id)}
          />
        ))}
        <button type="button" className="nav-more nav-new" onClick={onNewFolder}>
          <Icon name="plus" size={15} stroke={2.2} />
          Nieuwe map
        </button>
      </div>

      {countries.length > 0 && (
        <div className="nav-group">
          <span className="nav-heading">Landen</span>
          {shown.map((c) => (
            <NavItem key={c.key} label={c.name} count={c.pieces} active={view === 'country:' + c.key} onClick={() => go('country:' + c.key)}>
              <Flag cc={c.cc} width={22} height={15} />
            </NavItem>
          ))}
          {countries.length > 8 && (
            <button type="button" className="nav-more" onClick={() => setMore(!more)}>
              {more ? 'Minder tonen' : `Alle ${countries.length} tonen`}
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
