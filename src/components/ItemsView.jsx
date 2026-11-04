import Segmented from './Segmented.jsx'
import NoteArt from './NoteArt.jsx'
import Flag from './Flag.jsx'
import Icon from './Icon.jsx'
import { FolderGraphic } from './Folder.jsx'
import { STATUS } from '../data/meta.js'
import { SHOW_OPTIONS, sumUp, valueLabel } from '../lib/collection.js'
import { eur, range, plural } from '../lib/format.js'

export function StatusPill({ status }) {
  const s = STATUS[status]
  return (
    <span className="pill" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  )
}

function Summary({ list, showValues }) {
  const st = sumUp(list)
  return (
    <section className="summary" aria-label="Samenvatting">
      <div className="card summary-tile">
        <span className="muted small">Stuks</span>
        <span className="summary-value">{st.pieces}</span>
        <span className="muted small">{plural(list.length, 'item', 'items')}</span>
      </div>
      <div className="card summary-tile">
        <span className="muted small">Landen</span>
        <span className="summary-value">{st.nC}</span>
        <span className="muted small">{plural(st.nR, 'regio', "regio's")}</span>
      </div>
      {showValues && (
        <>
          <div className="card summary-tile">
            <span className="muted small">Geschatte waarde</span>
            <span className="summary-value">{st.hi > 0 ? range(st.lo, st.hi) : '—'}</span>
            <span className="muted small">{st.valued < st.pieces ? `${plural(st.valued, 'stuk', 'stuks')} gewaardeerd` : 'Je eigen schattingen'}</span>
          </div>
          {st.faceN > 0 && (
          <div className="card summary-tile">
            <span className="muted small">Geldwaarde</span>
            <span className="summary-value">{eur(st.face)}</span>
            <span className="muted small">{plural(st.faceN, 'stuk', 'stuks')} inwisselbaar of wettig betaalmiddel</span>
          </div>
          )}
        </>
      )}
    </section>
  )
}

function Card({ it, selected, fav, showValues, onSelect }) {
  return (
    <button type="button" className={`item-card ${selected ? 'is-selected' : ''} ${it.tag ? 'is-tagged' : ''}`} onClick={onSelect}>
      <span className="art-wrap">
        <NoteArt item={it} />
        {it.tag && <span className="item-tag">{it.tag}</span>}
      </span>
      <span className="item-text">
        <span className="item-name">
          {[it.denom, it.unit].filter(Boolean).join(' ') || 'Naamloos'}
          {fav && <Icon name="star" size={14} fill="#E8890C" stroke={0} role="img" aria-label="Favoriet" aria-hidden={undefined} />}
        </span>
        <span className="item-sub">
          <Flag cc={it.cc} width={16} height={11} radius={2} />
          <span className="ellipsis">
            {[it.country, it.series || it.year].filter(Boolean).join(' · ') || '—'}
          </span>
        </span>
      </span>
      <span className="row-between">
        <StatusPill status={it.status} />
        {showValues && <span className="strong small-14">{valueLabel(it)}</span>}
      </span>
    </button>
  )
}

function Table({ list, sel, showValues, onSelect }) {
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Stuk</th>
            <th scope="col">Land</th>
            <th scope="col">Jaar</th>
            <th scope="col">Aantal</th>
            <th scope="col">Status</th>
            <th scope="col" className="right">
              Waarde
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((it) => (
            <tr key={it.id} className={sel === it.id ? 'is-selected' : ''}>
              <td>
                <button type="button" className="row-button" onClick={() => onSelect(it.id)}>
                  <span className={it.type === 'coin' ? 'thumb thumb-coin' : 'thumb'} style={{ background: it.color }} />
                  <span className="strong">{[it.denom, it.unit].filter(Boolean).join(' ') || 'Naamloos'}</span>
                  {it.tag && <span className="tag-pill">{it.tag}</span>}
                </button>
              </td>
              <td>
                <span className="inline-flag">
                  <Flag cc={it.cc} width={20} height={14} />
                  {it.country || '—'}
                </span>
              </td>
              <td className="muted">{it.year || '—'}</td>
              <td className="muted">{it.qty}</td>
              <td>
                <StatusPill status={it.status} />
              </td>
              <td className="right strong">{showValues ? valueLabel(it) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ItemsView({ view, list, type, setType, sort, setSort, show, setShow, layout, setLayout, sel, select, showValues, query, onAdd, total, children }) {
  const empty = list.length === 0
  return (
    <>
      <Summary list={list} showValues={showValues} />

      <div className="toolbar">
        <Segmented
          label="Soort"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'Alles' },
            { value: 'note', label: 'Biljetten' },
            { value: 'coin', label: 'Munten' },
          ]}
        />
        <div className="grow" />
        <label className="sort">
          Tonen
          <select value={show} onChange={(e) => setShow(e.target.value)} className={show !== 'all' ? 'is-filtering' : undefined}>
            {SHOW_OPTIONS.map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="sort">
          Sorteren op
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="denom">Nominale waarde (hoog → laag)</option>
            <option value="value">Geschatte waarde</option>
            <option value="country">Land</option>
            <option value="year">Jaar</option>
            <option value="added">Laatst toegevoegd</option>
            <option value="cash">Geldwaarde</option>
          </select>
        </label>
        <Segmented
          label="Weergave"
          icons
          value={layout}
          onChange={setLayout}
          options={[
            { value: 'grid', label: <Icon name="grid" size={16} stroke={2} />, ariaLabel: 'Rasterweergave' },
            { value: 'list', label: <Icon name="list" size={16} stroke={2} />, ariaLabel: 'Lijstweergave' },
          ]}
        />
      </div>

      <div className="content-row">
        <div className="content-main">
          {empty ? (
            <div className="card empty">
              <div className="empty-folder">
                <FolderGraphic />
              </div>
              <span className="empty-title">
                {total === 0 ? 'Je collectie is leeg' : view === 'favorites' && !query ? 'Nog geen favorieten' : view.startsWith('folder:') && !query ? 'Deze map is leeg' : 'Niets gevonden'}
              </span>
              <span className="muted">
                {total === 0
                  ? 'Voeg je eerste bankbiljet of munt toe om te beginnen.'
                  : view === 'favorites' && !query
                    ? 'Open een stuk en tik op de ster om het hier te bewaren.'
                    : view.startsWith('folder:') && !query
                      ? 'Open een stuk, tik op Bewerken en vink deze map aan.'
                      : show !== 'all'
                        ? 'Geen stukken met deze status hier. Kies bij Tonen voor Alles.'
                        : 'Geen stukken in deze weergave. Kies een andere soort of wis de zoekopdracht.'}
              </span>
              {total === 0 && (
                <button type="button" className="primary-btn" onClick={onAdd}>
                  <Icon name="plus" size={16} stroke={2.2} />
                  Stuk toevoegen
                </button>
              )}
            </div>
          ) : layout === 'grid' ? (
            <div className="item-grid">
              {list.map((it) => (
                <Card key={it.id} it={it} selected={sel === it.id} fav={!!it.fav} showValues={showValues} onSelect={() => select(it.id)} />
              ))}
            </div>
          ) : (
            <Table list={list} sel={sel} showValues={showValues} onSelect={select} />
          )}
        </div>
        {children}
      </div>
    </>
  )
}
