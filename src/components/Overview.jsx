import { useRef } from 'react'
import Folder, { FolderGraphic, NewFolder } from './Folder.jsx'
import Icon from './Icon.jsx'
import { REGION_ORDER, REGION_COLORS, regionLabel } from '../data/meta.js'
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
    <section className="card hero" aria-label="Samenvatting van de collectie">
      <div className="hero-main">
        <span className="muted">{showValues ? 'Geschatte waarde van de collectie' : 'Stukken in de collectie'}</span>
        <span className="hero-big">{showValues ? range(all.lo, all.hi) : all.pieces}</span>
        <span className="muted">
          {all.valued < all.pieces ? `Op basis van ${plural(all.valued, 'stuk', 'stuks')} met een ingevulde waarde.` : 'Je eigen schattingen, opgeteld.'}
        </span>
        <div className="hero-stats">
          <Stat value={all.pieces} label="Stuks" />
          <Stat value={all.nC} label={all.nC === 1 ? 'Land' : 'Landen'} />
          {years.length > 0 && <Stat value={`${Math.min(...years)}–${Math.max(...years)}`} label="Periode" />}
          {showValues && all.faceN > 0 && <Stat value={eur(all.face)} label="Geldwaarde" />}
        </div>
      </div>
      {regions.length > 0 && (
        <div className="hero-regions">
          <div className="row-between">
            <span className="strong">Waar het vandaan komt</span>
            <span className="muted small">Aandeel stuks per regio</span>
          </div>
          <div className="region-bar" role="img" aria-label={regions.map((r) => `${regionLabel(r.name)} ${r.t.pieces}`).join(', ')}>
            {regions.map((r) => (
              <span key={r.name} style={{ flex: `${r.t.pieces} 1 0`, background: r.color }} />
            ))}
          </div>
          <div>
            {regions.map((r) => (
              <div key={r.name} className="legend-row">
                <span className="dot" style={{ background: r.color }} />
                <span className="grow">{regionLabel(r.name)}</span>
                <span className="muted legend-num">{plural(r.t.pieces, 'stuk', 'stuks')}</span>
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
    return <p className="card muted timeline-empty">Vul bij je stukken een jaar in om ze hier per tien jaar te zien.</p>
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
            <span className="decade-label">{y}–{String(y + 9).slice(2)}</span>
            <span className="muted xsmall">{n ? plural(n, 'stuk', 'stuks') : 'Nog geen'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Backup({ onExport, onImport, onPublish, onPublishSetup, canPublish, count }) {
  const input = useRef(null)
  return (
    <section className="section">
      <SectionHead title="Publiceren & delen" aside="Gratis, via de site zelf" />
      <div className="card backup">
        <p className="muted">
          <b>Publiceren</b> zet je collectie op de site: iedereen die de app opent krijgt dezelfde stukken, foto's en mappen, op elk
          toestel, ongeveer 2 minuten later. <b>Exporteren</b> maakt één bestand met alles, om te bewaren of elders te importeren.
        </p>
        <div className="backup-actions">
          {canPublish ? (
            <>
              <button type="button" className="primary-btn" onClick={onPublish} disabled={!count}>
                <Icon name="upload" size={16} stroke={2} />
                Nu publiceren
              </button>
              <button type="button" className="secondary-btn" onClick={onPublishSetup}>
                Publicatiesleutel
              </button>
            </>
          ) : (
            <button type="button" className="primary-btn" onClick={onPublishSetup}>
              <Icon name="upload" size={16} stroke={2} />
              Publiceren instellen
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={onExport} disabled={!count}>
            <Icon name="download" size={16} stroke={2} />
            Exporteren
          </button>
          <button type="button" className="secondary-btn" onClick={() => input.current.click()}>
            <Icon name="upload" size={16} stroke={2} />
            Importeren
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
      <h2>Begin je collectie</h2>
      <p className="muted">Voeg je eerste bankbiljet of munt toe. Foto’s, waarden en mappen zijn allemaal optioneel — die kun je later invullen.</p>
      <button type="button" className="primary-btn" onClick={onAdd}>
        <Icon name="plus" size={16} stroke={2.2} />
        Eerste stuk toevoegen
      </button>
    </section>
  )
}

export default function Overview({ items, folders, countries, go, onAdd, onNewFolder, onExport, onImport, onPublish, onPublishSetup, canPublish, showValues }) {
  const empty = items.length === 0

  const libFolders = [
    { key: 'notes', name: 'Bankbiljetten', icon: 'note', its: items.filter((it) => it.type === 'note') },
    { key: 'coins', name: 'Munten', icon: 'coin', its: items.filter((it) => it.type === 'coin') },
    { key: 'favorites', name: 'Favorieten', icon: 'star', its: items.filter((it) => it.fav) },
    ...folders.map((f) => ({ key: 'folder:' + f.id, name: f.name, icon: null, its: items.filter((it) => inFolder(it, f.id)) })),
  ].map((fd) => {
    const t = sumUp(fd.its)
    let meta
    if (fd.key === 'favorites' && !fd.its.length) meta = 'Geef een stuk een ster'
    else if (!fd.its.length) meta = 'Leeg'
    else meta = showValues && t.hi > 0 ? range(t.lo, t.hi) : plural(t.pieces, 'stuk', 'stuks')
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
        <SectionHead title="Collecties" aside="Per soort en je eigen mappen" />
        <div className="card folder-grid">
          {libFolders.map((f) => (
            <Folder key={f.key} name={f.name} meta={f.meta} items={f.its} icon={f.icon} badge={f.badge} onClick={() => go(f.key)} />
          ))}
          <NewFolder onClick={onNewFolder} />
        </div>
      </section>

      {groups.length > 0 && (
        <section className="section">
          <SectionHead title="Landen" aside={`${plural(countries.length, 'land', 'landen')} · ${plural(groups.length, 'regio', "regio's")}`} />
          <div className="region-wrap">
            {groups.map((g) => (
              <div key={g.name} className="card region-card" style={{ flex: `${g.cs.length} 1 ${Math.min(g.cs.length, 4) * 188 + 24}px` }}>
                <div className="region-head">
                  <h3>
                    <span className="dot" style={{ background: REGION_COLORS[g.name] }} />
                    {regionLabel(g.name)}
                  </h3>
                  <span className="muted small">
                    {plural(g.cs.length, 'land', 'landen')} · {plural(g.t.pieces, 'stuk', 'stuks')}
                  </span>
                </div>
                <div className="folder-grid">
                  {g.cs.map((c) => (
                    <Folder
                      key={c.key}
                      name={c.name}
                      meta={showValues && c.hi > 0 ? range(c.lo, c.hi) : plural(c.pieces, 'stuk', 'stuks')}
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
          <SectionHead title="Door de tijd" aside="Stuks per decennium van uitgifte" />
          <Timeline items={items} go={go} />
        </section>
      )}

      <Backup onExport={onExport} onImport={onImport} onPublish={onPublish} onPublishSetup={onPublishSetup} canPublish={canPublish} count={items.length} />
    </>
  )
}
