import { useRef } from 'react'
import Folder, { FolderGraphic, NewFolder } from './Folder.jsx'
import Icon from './Icon.jsx'
import { REGION_ORDER, REGION_COLORS } from '../data/meta.js'
import { sumUp, inFolder, decadeOf } from '../lib/collection.js'
import { eur, range, plural } from '../lib/format.js'

function SectionHead({ title, aside }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {aside && <span>{aside}</span>}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="muted small">{label}</span>
    </div>
  )
}

function Hero({ items, showValues }) {
  const all = sumUp(items)
  const years = items.filter((it) => it.dated).map((it) => it.ys)
  const regions = REGION_ORDER.map((r) => ({ name: r, color: REGION_COLORS[r], t: sumUp(items.filter((it) => (it.region || 'Other') === r)) })).filter(
    (r) => r.t.pieces > 0,
  )
  return (
    <section className="card hero" aria-label="Collection summary">
      <div className="hero-main">
        <span className="muted">{showValues ? 'Estimated collection value' : 'Pieces in the collection'}</span>
        <span className="hero-big">{showValues ? range(all.lo, all.hi) : all.pieces}</span>
        <span className="muted">
          {all.valued < all.pieces ? `Based on ${plural(all.valued, 'piece')} with a value filled in.` : 'Your own estimates, added up.'}
        </span>
        <div className="hero-stats">
          <Stat value={all.pieces} label="Pieces" />
          <Stat value={all.nC} label={all.nC === 1 ? 'Country' : 'Countries'} />
          {years.length > 0 && <Stat value={`${Math.min(...years)}–${Math.max(...years)}`} label="Years covered" />}
          {showValues && all.faceN > 0 && <Stat value={eur(all.face)} label="Still exchangeable" />}
        </div>
      </div>
      {regions.length > 0 && (
        <div className="hero-regions">
          <div className="row-between">
            <span className="strong">Where it comes from</span>
            <span className="muted small">Share of pieces by region</span>
          </div>
          <div className="region-bar" role="img" aria-label={regions.map((r) => `${r.name} ${r.t.pieces}`).join(', ')}>
            {regions.map((r) => (
              <span key={r.name} style={{ flex: `${r.t.pieces} 1 0`, background: r.color }} />
            ))}
          </div>
          <div>
            {regions.map((r) => (
              <div key={r.name} className="legend-row">
                <span className="dot" style={{ background: r.color }} />
                <span className="grow">{r.name}</span>
                <span className="muted legend-num">{plural(r.t.pieces, 'piece')}</span>
                {showValues && <span className="strong legend-val">{r.t.hi > 0 ? range(r.t.lo, r.t.hi) : '—'}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function Timeline({ items, go }) {
  const dated = items.filter((it) => it.dated)
  if (!dated.length) {
    return <p className="card muted timeline-empty">Add a year to your pieces to see them here, decade by decade.</p>
  }
  const first = Math.min(...dated.map(decadeOf))
  const last = Math.max(...dated.map(decadeOf))
  const decades = []
  for (let y = first; y <= last; y += 10) {
    const its = dated.filter((it) => decadeOf(it) === y).sort((a, b) => a.ys - b.ys)
    decades.push({ y, its, n: its.reduce((k, it) => k + (it.qty || 0), 0) })
  }
  return (
    <div className="card timeline-wrap">
      <div className="timeline" style={{ gridTemplateColumns: `repeat(${decades.length}, minmax(76px, 1fr))` }}>
        {decades.map(({ y, its, n }) => (
          <button key={y} type="button" className="decade" disabled={!n} onClick={() => go('decade:' + y)}>
            <div className={`decade-stack ${n ? '' : 'is-empty'}`}>
              {its.slice(0, 8).map((it, i) => (
                <span
                  key={it.id}
                  className={it.type === 'coin' ? 'decade-note decade-coin' : 'decade-note'}
                  style={{ bottom: 4 + i * 11, background: it.color, transform: `rotate(${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg)` }}
                />
              ))}
            </div>
            <span className="decade-label">{y}s</span>
            <span className="muted xsmall">{n ? plural(n, 'piece') : 'None yet'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Backup({ onExport, onImport, count }) {
  const input = useRef(null)
  return (
    <section className="section">
      <SectionHead title="Export & share" aside="One file with everything" />
      <div className="card backup">
        <p className="muted">
          Export makes one file with every piece, photo and folder. Once that file is published on the site, everyone who opens the app
          gets the same collection, on every device. You can also import the file yourself, for example to restore a copy.
        </p>
        <div className="backup-actions">
          <button type="button" className="secondary-btn" onClick={onExport} disabled={!count}>
            <Icon name="download" size={16} stroke={2} />
            Export
          </button>
          <button type="button" className="secondary-btn" onClick={() => input.current.click()}>
            <Icon name="upload" size={16} stroke={2} />
            Import
          </button>
          <input
            ref={input}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) onImport(file)
            }}
          />
        </div>
      </div>
    </section>
  )
}

function Welcome({ onAdd }) {
  return (
    <section className="card welcome">
      <div className="empty-folder">
        <FolderGraphic />
      </div>
      <h2>Start your collection</h2>
      <p className="muted">Add your first banknote or coin. Photos, values and folders are all optional — you can fill them in later.</p>
      <button type="button" className="primary-btn" onClick={onAdd}>
        <Icon name="plus" size={16} stroke={2.2} />
        Add first item
      </button>
    </section>
  )
}

export default function Overview({ items, folders, countries, go, onAdd, onNewFolder, onExport, onImport, showValues }) {
  const empty = items.length === 0

  const libFolders = [
    { key: 'notes', name: 'Banknotes', icon: 'note', its: items.filter((it) => it.type === 'note') },
    { key: 'coins', name: 'Coins', icon: 'coin', its: items.filter((it) => it.type === 'coin') },
    { key: 'favorites', name: 'Favorites', icon: 'star', its: items.filter((it) => it.fav) },
    ...folders.map((f) => ({ key: 'folder:' + f.id, name: f.name, icon: null, its: items.filter((it) => inFolder(it, f.id)) })),
  ].map((fd) => {
    const t = sumUp(fd.its)
    let meta
    if (fd.key === 'favorites' && !fd.its.length) meta = 'Star a piece to add it'
    else if (!fd.its.length) meta = 'Empty'
    else meta = showValues && t.hi > 0 ? range(t.lo, t.hi) : plural(t.pieces, 'piece')
    return { ...fd, badge: t.pieces, meta }
  })

  const groups = REGION_ORDER.map((r) => {
    const cs = countries.filter((c) => c.region === r).sort((a, b) => a.name.localeCompare(b.name))
    return { name: r, cs, t: sumUp(cs.flatMap((c) => c.items)) }
  }).filter((g) => g.cs.length)

  return (
    <>
      {empty ? <Welcome onAdd={onAdd} /> : <Hero items={items} showValues={showValues} />}

      <section className="section">
        <SectionHead title="Collections" aside="By type and your own folders" />
        <div className="card folder-grid">
          {libFolders.map((f) => (
            <Folder key={f.key} name={f.name} meta={f.meta} items={f.its} icon={f.icon} badge={f.badge} onClick={() => go(f.key)} />
          ))}
          <NewFolder onClick={onNewFolder} />
        </div>
      </section>

      {groups.length > 0 && (
        <section className="section">
          <SectionHead title="Countries" aside={`${plural(countries.length, 'country', 'countries')} · ${plural(groups.length, 'region')}`} />
          <div className="region-wrap">
            {groups.map((g) => (
              <div key={g.name} className="card region-card" style={{ flex: `${g.cs.length} 1 ${Math.min(g.cs.length, 4) * 188 + 24}px` }}>
                <div className="region-head">
                  <h3>
                    <span className="dot" style={{ background: REGION_COLORS[g.name] }} />
                    {g.name}
                  </h3>
                  <span className="muted small">
                    {plural(g.cs.length, 'country', 'countries')} · {plural(g.t.pieces, 'piece')}
                  </span>
                </div>
                <div className="folder-grid">
                  {g.cs.map((c) => (
                    <Folder
                      key={c.key}
                      name={c.name}
                      meta={showValues && c.hi > 0 ? range(c.lo, c.hi) : plural(c.pieces, 'piece')}
                      items={c.items}
                      cc={c.cc}
                      badge={c.pieces}
                      onClick={() => go('country:' + c.key)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!empty && (
        <section className="section">
          <SectionHead title="Through time" aside="Pieces by decade of issue" />
          <Timeline items={items} go={go} />
        </section>
      )}

      <Backup onExport={onExport} onImport={onImport} count={items.length} />
    </>
  )
}
