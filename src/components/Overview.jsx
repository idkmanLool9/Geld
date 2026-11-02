import Folder, { NewFolder } from './Folder.jsx'
import Icon from './Icon.jsx'
import { ITEMS, DATED, YEAR_MIN, YEAR_MAX } from '../data/items.js'
import { REGION_ORDER, REGION_COLORS, GULDEN_DEADLINE } from '../data/meta.js'
import { sumUp, inFolder, decadeOf } from '../lib/collection.js'
import { eur, range, plural } from '../lib/format.js'
import { countBadge } from '../lib/collection.js'

const FOLDER_DEFS = [
  { key: 'notes', name: 'Banknotes', icon: 'note', fn: (it) => it.type === 'note' },
  { key: 'coins', name: 'Coins', icon: 'coin', fn: (it) => it.type === 'coin' },
  { key: 'favorites', name: 'Favorites', icon: 'star', fn: null },
  { key: 'highlights', name: 'Highlights', icon: 'gem', fn: (it) => inFolder(it, 'highlights') },
  { key: 'exchangeable', name: 'Still exchangeable', icon: 'swap', fn: (it) => inFolder(it, 'exchangeable') },
  { key: 'identify', name: 'To identify', icon: 'search', fn: (it) => inFolder(it, 'identify') },
  { key: 'lots', name: 'Lot material', icon: 'box', fn: (it) => inFolder(it, 'lots') },
]

function SectionHead({ title, aside }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {aside && <span>{aside}</span>}
    </div>
  )
}

function Hero({ showValues }) {
  const all = sumUp(ITEMS)
  const regions = REGION_ORDER.map((r) => ({ name: r, color: REGION_COLORS[r], t: sumUp(ITEMS.filter((it) => it.region === r)) })).filter(
    (r) => r.t.pieces > 0,
  )
  return (
    <section className="card hero" aria-label="Collection summary">
      <div className="hero-main">
        <span className="muted">{showValues ? 'Estimated collection value' : 'Pieces in the collection'}</span>
        <span className="hero-big">{showValues ? range(all.lo, all.hi) : all.pieces}</span>
        <span className="muted">Collector prices for circulated notes, plus one unsorted stack still to sort.</span>
        <div className="hero-stats">
          <Stat value={all.pieces} label="Pieces" />
          <Stat value={all.nC} label="Countries" />
          <Stat value={`${YEAR_MIN}–${YEAR_MAX}`} label="Years covered" />
          {showValues && <Stat value={eur(all.face)} label="Still exchangeable" />}
        </div>
      </div>
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
              {showValues && <span className="strong legend-val">{range(r.t.lo, r.t.hi)}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
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

function Callouts({ open }) {
  const days = Math.max(0, Math.ceil((GULDEN_DEADLINE - Date.now()) / 86400000))
  return (
    <section className="callouts" aria-label="Worth knowing">
      <button type="button" className="card tile" onClick={() => open('exchangeable', 'nl10')}>
        <span className="eyebrow" style={{ color: '#A84B00' }}>
          <Icon name="clock" size={15} stroke={2} /> Exchange deadline
        </span>
        <span className="tile-big">{days.toLocaleString('en-US')} days</span>
        <span className="muted">Left to swap your 10 gulden at De Nederlandsche Bank — the window closes on 1 January 2032.</span>
      </button>
      <button type="button" className="card tile" onClick={() => open('highlights', 'au50')}>
        <span className="eyebrow" style={{ color: '#0058B9' }}>
          <Icon name="gem" size={15} stroke={2} /> Top piece
        </span>
        <span className="tile-big">50 dollars</span>
        <span className="muted">Australia, paper series 1973–1994. Still legal tender, and worth more to collectors than its face value.</span>
      </button>
      <button type="button" className="card tile" onClick={() => open('identify', 'il')}>
        <span className="eyebrow" style={{ color: '#7032A8' }}>
          <Icon name="search" size={15} stroke={2} /> Biggest unknown
        </span>
        <span className="tile-big">30–60 notes</span>
        <span className="muted">An unsorted stack, most likely Israeli. Could be worth €30 — or €300. Spread it out and photograph it first.</span>
      </button>
    </section>
  )
}

function Timeline({ go }) {
  const decades = []
  for (let y = 1910; y <= 2000; y += 10) {
    const its = DATED.filter((it) => decadeOf(it) === y).sort((a, b) => a.ys - b.ys)
    decades.push({ y, its, n: its.reduce((k, it) => k + it.qty, 0) })
  }
  return (
    <div className="card timeline-wrap">
      <div className="timeline">
        {decades.map(({ y, its, n }) => (
          <button key={y} type="button" className="decade" disabled={!n} onClick={() => go('decade:' + y)}>
            <div className={`decade-stack ${n ? '' : 'is-empty'}`}>
              {its.slice(0, 8).map((it, i) => (
                <span
                  key={it.id}
                  className="decade-note"
                  style={{ bottom: 4 + i * 11, background: it.color, transform: `rotate(${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg)` }}
                />
              ))}
            </div>
            <span className="decade-label">{y}s</span>
            <span className="muted xsmall">{n ? plural(n, 'note') : 'None yet'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Overview({ go, open, favs, countries, showValues }) {
  const typeFolders = FOLDER_DEFS.map((fd) => {
    const its = ITEMS.filter(fd.fn || ((it) => favs[it.id]))
    const t = sumUp(its)
    let meta
    if (fd.key === 'identify') meta = plural(its.length, 'open question')
    else if (fd.key === 'favorites' && !its.length) meta = 'Star a piece to add it'
    else if (t.hi === 0) meta = t.pieces === 1 ? '1 piece · value unknown' : plural(t.pieces, 'piece')
    else meta = showValues ? range(t.lo, t.hi) : plural(t.pieces, 'piece')
    return { ...fd, items: its, badge: fd.key === 'identify' ? its.length : t.pieces, meta }
  })

  const groups = REGION_ORDER.map((r) => {
    const cs = countries.filter((c) => c.region === r).sort((a, b) => a.name.localeCompare(b.name))
    const t = sumUp(ITEMS.filter((it) => it.region === r))
    return { name: r, cs, t }
  }).filter((g) => g.cs.length)

  return (
    <>
      <Hero showValues={showValues} />
      <Callouts open={open} />

      <section className="section">
        <SectionHead title="Collections" aside="By type and purpose" />
        <div className="card folder-grid">
          {typeFolders.map((f) => (
            <Folder key={f.key} name={f.name} meta={f.meta} items={f.items} icon={f.icon} badge={f.badge} onClick={() => go(f.key)} />
          ))}
          <NewFolder />
        </div>
      </section>

      <section className="section">
        <SectionHead title="Countries" aside={`${countries.length} countries · ${groups.length} regions`} />
        <div className="region-wrap">
          {groups.map((g) => (
            <div key={g.name} className="card region-card" style={{ flex: `${g.cs.length} 1 ${g.cs.length * 188 + 24}px` }}>
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
                    key={c.cc}
                    name={c.name}
                    meta={c.stack ? 'Stack to sort' : showValues ? range(c.lo, c.hi) : plural(c.pieces, 'piece')}
                    items={c.items}
                    cc={c.cc}
                    badge={countBadge(c)}
                    onClick={() => go('country:' + c.cc)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title="Through time" aside="Dated notes by decade of issue" />
        <Timeline go={go} />
      </section>
    </>
  )
}
