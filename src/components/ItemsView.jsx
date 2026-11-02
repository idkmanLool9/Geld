import Segmented from './Segmented.jsx'
import NoteArt from './NoteArt.jsx'
import Flag from './Flag.jsx'
import Icon from './Icon.jsx'
import { FolderGraphic } from './Folder.jsx'
import { STATUS } from '../data/meta.js'
import { sumUp, valueLabel } from '../lib/collection.js'
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
    <section className="summary" aria-label="Summary">
      <div className="card summary-tile">
        <span className="muted small">Pieces</span>
        <span className="summary-value">{st.pieces}</span>
        <span className="muted small">{plural(list.length, 'entry', 'entries')}</span>
      </div>
      <div className="card summary-tile">
        <span className="muted small">Countries</span>
        <span className="summary-value">{st.nC}</span>
        <span className="muted small">{plural(st.nR, 'region')}</span>
      </div>
      {showValues && (
        <>
          <div className="card summary-tile">
            <span className="muted small">Estimated value</span>
            <span className="summary-value">{st.hi > 0 ? range(st.lo, st.hi) : '—'}</span>
            <span className="muted small">{st.valued < st.pieces ? `${plural(st.valued, 'piece')} valued` : 'Your estimates'}</span>
          </div>
          {st.faceN > 0 && (
          <div className="card summary-tile">
            <span className="muted small">Cash value</span>
            <span className="summary-value">{eur(st.face)}</span>
            <span className="muted small">{plural(st.faceN, 'piece')} exchangeable or legal tender</span>
          </div>
          )}
        </>
      )}
    </section>
  )
}

function Card({ it, selected, fav, showValues, onSelect }) {
  return (
    <button type="button" className={`item-card ${selected ? 'is-selected' : ''}`} onClick={onSelect}>
      <NoteArt item={it} />
      <span className="item-text">
        <span className="item-name">
          {[it.denom, it.unit].filter(Boolean).join(' ') || 'Untitled'}
          {fav && <Icon name="star" size={14} fill="#E8890C" stroke={0} role="img" aria-label="Favorite" aria-hidden={undefined} />}
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
            <th scope="col">Item</th>
            <th scope="col">Country</th>
            <th scope="col">Year</th>
            <th scope="col">Qty</th>
            <th scope="col">Status</th>
            <th scope="col" className="right">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((it) => (
            <tr key={it.id} className={sel === it.id ? 'is-selected' : ''}>
              <td>
                <button type="button" className="row-button" onClick={() => onSelect(it.id)}>
                  <span className={it.type === 'coin' ? 'thumb thumb-coin' : 'thumb'} style={{ background: it.color }} />
                  <span className="strong">{[it.denom, it.unit].filter(Boolean).join(' ') || 'Untitled'}</span>
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

export default function ItemsView({ view, list, type, setType, sort, setSort, layout, setLayout, sel, select, showValues, query, onAdd, total, children }) {
  const empty = list.length === 0
  return (
    <>
      <Summary list={list} showValues={showValues} />

      <div className="toolbar">
        <Segmented
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'All' },
            { value: 'note', label: 'Banknotes' },
            { value: 'coin', label: 'Coins' },
          ]}
        />
        <div className="grow" />
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="value">Value</option>
            <option value="country">Country</option>
            <option value="year">Year</option>
            <option value="added">Recently added</option>
          </select>
        </label>
        <Segmented
          label="Layout"
          icons
          value={layout}
          onChange={setLayout}
          options={[
            { value: 'grid', label: <Icon name="grid" size={16} stroke={2} />, ariaLabel: 'Grid view' },
            { value: 'list', label: <Icon name="list" size={16} stroke={2} />, ariaLabel: 'List view' },
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
                {total === 0 ? 'Your collection is empty' : view === 'favorites' && !query ? 'No favorites yet' : view.startsWith('folder:') && !query ? 'This folder is empty' : 'Nothing here'}
              </span>
              <span className="muted">
                {total === 0
                  ? 'Add your first banknote or coin to get started.'
                  : view === 'favorites' && !query
                    ? 'Open any piece and tap the star to keep it here.'
                    : view.startsWith('folder:') && !query
                      ? 'Open a piece, tap Edit and tick this folder to add it.'
                      : 'No pieces match this view. Try another type, or clear the search.'}
              </span>
              {total === 0 && (
                <button type="button" className="primary-btn" onClick={onAdd}>
                  <Icon name="plus" size={16} stroke={2.2} />
                  Add item
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
