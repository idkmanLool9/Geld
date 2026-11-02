import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import Flag from './Flag.jsx'
import NoteArt from './NoteArt.jsx'
import Segmented from './Segmented.jsx'
import { StatusPill } from './ItemsView.jsx'
import { valueLabel, countryKey } from '../lib/collection.js'
import { eur } from '../lib/format.js'

export default function DetailPanel({ item, folders, onToggleFav, onEdit, onDelete, onPrev, onNext, onClose, go, showValues }) {
  const [side, setSide] = useState('front')
  const ref = useRef(null)
  useEffect(() => setSide('front'), [item.id])
  // On a phone the panel sits below the list: bring it into view when a piece is opened.
  useEffect(() => {
    if (window.matchMedia('(max-width: 720px)').matches) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [item.id])

  const facts = [
    item.series && ['Series', item.series],
    item.year && ['Issued', item.year],
    ['Quantity', String(item.qty)],
    item.region && item.region !== 'Other' && ['Region', item.region],
    item.front && ['Front', item.front],
    item.back && ['Back', item.back],
  ].filter(Boolean)

  const chips = folders.filter((f) => (item.folders || []).includes(f.id)).map((f) => ({ label: f.name, view: 'folder:' + f.id }))
  if (item.country) chips.push({ label: item.country, view: 'country:' + countryKey(item) })

  const name = [item.denom, item.unit].filter(Boolean).join(' ') || 'Untitled'

  return (
    <aside ref={ref} className="card detail" aria-label="Item details">
      <div className="detail-bar">
        <StatusPill status={item.status} />
        <div className="grow" />
        <button
          type="button"
          className="round-btn"
          aria-label={item.fav ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={!!item.fav}
          onClick={onToggleFav}
          style={{ color: item.fav ? '#E8890C' : undefined }}
        >
          <Icon name="star" size={16} stroke={2} fill={item.fav ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className="round-btn" aria-label="Previous item" onClick={onPrev || undefined} disabled={!onPrev}>
          <Icon name="back" size={14} stroke={2.4} />
        </button>
        <button type="button" className="round-btn" aria-label="Next item" onClick={onNext || undefined} disabled={!onNext}>
          <Icon name="next" size={14} stroke={2.4} />
        </button>
        <button type="button" className="round-btn" aria-label="Close details" onClick={onClose}>
          <Icon name="close" size={14} stroke={2.4} />
        </button>
      </div>

      <button type="button" className="flip" aria-label="Flip to the other side" onClick={() => setSide(side === 'front' ? 'back' : 'front')}>
        <div className="flip-inner" style={{ transform: `rotateY(${side === 'back' ? 180 : 0}deg)` }}>
          <div className="flip-face">
            <NoteArt item={item} side="front" size="large" />
          </div>
          <div className="flip-face flip-back">
            <NoteArt item={item} side="back" size="large" />
          </div>
        </div>
      </button>
      <div className="center">
        <Segmented
          label="Side"
          value={side}
          onChange={setSide}
          options={[
            { value: 'front', label: 'Front' },
            { value: 'back', label: 'Back' },
          ]}
        />
      </div>

      <div>
        <h2 className="detail-title">{name}</h2>
        {(item.country || item.year) && (
          <span className="inline-flag muted">
            {item.country && <Flag cc={item.cc} width={20} height={14} />}
            {[item.country, item.year].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>

      {showValues && (
        <div className="value-row">
          <div className="value-box">
            <span className="muted xsmall">Estimated value</span>
            <span className="value-num">{valueLabel(item)}</span>
          </div>
          <div className="value-box">
            <span className="muted xsmall">Exchange value</span>
            <span className="value-num">{item.status === 'exch' && item.face ? eur(item.face) : 'None'}</span>
          </div>
        </div>
      )}

      {item.status === 'exch' && item.where && (
        <div className="exchange">
          <Icon name="swap" size={20} stroke={2} />
          <div>
            <span className="exchange-title">Can still be exchanged</span>
            <span>{item.where}</span>
          </div>
        </div>
      )}

      <dl className="facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      {item.note && (
        <div className="notes">
          <span className="notes-label">Notes</span>
          <p>{item.note}</p>
        </div>
      )}

      {chips.length > 0 && (
        <div className="chips">
          {chips.map((c) => (
            <button key={c.view} type="button" className="chip" onClick={() => go(c.view)}>
              <Icon name="folder" size={13} stroke={0} fill="#FFB300" />
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="detail-actions">
        <button type="button" className="secondary-btn" onClick={onEdit}>
          <Icon name="edit" size={16} stroke={2} />
          Edit
        </button>
        <button type="button" className="secondary-btn danger" onClick={onDelete}>
          <Icon name="trash" size={16} stroke={2} />
          Delete
        </button>
      </div>
    </aside>
  )
}
