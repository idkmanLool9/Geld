import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import Flag from './Flag.jsx'
import NoteArt from './NoteArt.jsx'
import Segmented from './Segmented.jsx'
import { StatusPill } from './ItemsView.jsx'
import { FOLDER_NAMES } from '../data/meta.js'
import { valueLabel } from '../lib/collection.js'
import { eur } from '../lib/format.js'

export default function DetailPanel({ item, fav, onToggleFav, onPrev, onNext, onClose, go, showValues }) {
  const [side, setSide] = useState('front')
  useEffect(() => setSide('front'), [item.id])

  const facts = [
    ['Series', item.series],
    ['Issued', item.year],
    ['Quantity', item.stack ? `${item.stack} notes (estimate)` : String(item.qty)],
    ['Condition', item.type === 'coin' ? 'Unknown' : 'Circulated'],
    ['Region', item.region],
    item.front && ['Front', item.front],
    item.back && ['Back', item.back],
  ].filter(Boolean)

  const chips = item.folders.map((f) => ({ label: FOLDER_NAMES[f], view: f }))
  if (item.cc !== '?') chips.push({ label: item.country, view: 'country:' + item.cc })

  return (
    <aside className="card detail" aria-label="Item details">
      <div className="detail-bar">
        <StatusPill status={item.status} />
        <div className="grow" />
        <button
          type="button"
          className="round-btn"
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={fav}
          onClick={onToggleFav}
          style={{ color: fav ? '#E8890C' : undefined }}
        >
          <Icon name="star" size={16} stroke={2} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className="round-btn" aria-label="Previous item" onClick={onPrev} disabled={!onPrev}>
          <Icon name="back" size={14} stroke={2.4} />
        </button>
        <button type="button" className="round-btn" aria-label="Next item" onClick={onNext} disabled={!onNext}>
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
        <h2 className="detail-title">
          {item.denom} {item.unit}
        </h2>
        <span className="inline-flag muted">
          <Flag cc={item.cc} width={20} height={14} />
          {item.country} · {item.year}
        </span>
      </div>

      {showValues && (
        <div className="value-row">
          <div className="value-box">
            <span className="muted xsmall">Estimated value</span>
            <span className="value-num">{item.stack ? '€30–300 total' : valueLabel(item)}</span>
          </div>
          <div className="value-box">
            <span className="muted xsmall">Face value today</span>
            <span className="value-num">{item.face ? eur(item.face) : 'None'}</span>
          </div>
        </div>
      )}

      {item.where && (
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

      <div className="notes">
        <span className="notes-label">Notes</span>
        <p>{item.note}</p>
      </div>

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
    </aside>
  )
}
