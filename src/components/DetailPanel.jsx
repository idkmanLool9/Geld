import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import Flag from './Flag.jsx'
import NoteArt from './NoteArt.jsx'
import Segmented from './Segmented.jsx'
import { StatusPill } from './ItemsView.jsx'
import { valueLabel, countryKey } from '../lib/collection.js'
import { eur, fmtDate } from '../lib/format.js'
import { regionLabel } from '../data/meta.js'
import { currencyCode, parseDenom } from '../data/currencies.js'
import { getRates, toEuro } from '../lib/rates.js'

export default function DetailPanel({ item, folders, onToggleFav, onEdit, onDelete, onPrev, onNext, onClose, go, showValues }) {
  const [side, setSide] = useState('front')
  const ref = useRef(null)
  useEffect(() => setSide('front'), [item.id])

  // Legal tender: recompute today's value with the latest rate.
  const legal = item.status === 'legal'
  const [live, setLive] = useState(null)
  useEffect(() => {
    setLive(null)
    const code = legal ? currencyCode(item.cc, item.unit) : null
    const n = parseDenom(item.denom)
    if (!code || !n) return
    let gone = false
    getRates().then((r) => {
      const v = toEuro(r, code, n)
      if (!gone && v != null) setLive({ value: v, date: r.date })
    })
    return () => {
      gone = true
    }
  }, [legal, item.cc, item.unit, item.denom])
  const cash = live ? live.value : item.face
  // On a phone the panel sits below the list: bring it into view when a piece is opened.
  useEffect(() => {
    if (window.matchMedia('(max-width: 720px)').matches) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [item.id])

  const facts = [
    item.series && ['Serie', item.series],
    item.year && ['Uitgegeven', item.year],
    ['Aantal', String(item.qty)],
    item.region && item.region !== 'Other' && ['Regio', regionLabel(item.region)],
    item.front && ['Voorkant', item.front],
    item.back && ['Achterkant', item.back],
  ].filter(Boolean)

  const chips = folders.filter((f) => (item.folders || []).includes(f.id)).map((f) => ({ label: f.name, view: 'folder:' + f.id }))
  if (item.country) chips.push({ label: item.country, view: 'country:' + countryKey(item) })

  const name = [item.denom, item.unit].filter(Boolean).join(' ') || 'Naamloos'

  return (
    <aside ref={ref} className="card detail" aria-label="Details van het stuk">
      <div className="detail-bar">
        <StatusPill status={item.status} />
        {item.tag && <span className="tag-pill">{item.tag}</span>}
        <div className="grow" />
        <button
          type="button"
          className="round-btn"
          aria-label={item.fav ? 'Uit favorieten halen' : 'Aan favorieten toevoegen'}
          aria-pressed={!!item.fav}
          onClick={onToggleFav}
          style={{ color: item.fav ? '#E8890C' : undefined }}
        >
          <Icon name="star" size={16} stroke={2} fill={item.fav ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className="round-btn" aria-label="Vorig stuk" onClick={onPrev || undefined} disabled={!onPrev}>
          <Icon name="back" size={14} stroke={2.4} />
        </button>
        <button type="button" className="round-btn" aria-label="Volgend stuk" onClick={onNext || undefined} disabled={!onNext}>
          <Icon name="next" size={14} stroke={2.4} />
        </button>
        <button type="button" className="round-btn" aria-label="Details sluiten" onClick={onClose}>
          <Icon name="close" size={14} stroke={2.4} />
        </button>
      </div>

      <button type="button" className="flip" aria-label="Omdraaien" onClick={() => setSide(side === 'front' ? 'back' : 'front')}>
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
          label="Kant"
          value={side}
          onChange={setSide}
          options={[
            { value: 'front', label: 'Voorkant' },
            { value: 'back', label: 'Achterkant' },
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
            <span className="muted xsmall">Geschatte waarde</span>
            <span className="value-num">{valueLabel(item)}</span>
          </div>
          <div className="value-box">
            <span className="muted xsmall">{legal ? 'Vandaag waard in euro' : 'Inwisselwaarde'}</span>
            <span className="value-num">{(item.status === 'exch' || legal) && cash ? eur(cash) : legal ? '—' : 'Geen'}</span>
            {legal && live && <span className="muted xsmall">Koers van {fmtDate(live.date)}</span>}
          </div>
        </div>
      )}

      {(item.status === 'exch' || legal) && item.where && (
        <div className="exchange">
          <Icon name="swap" size={20} stroke={2} />
          <div>
            <span className="exchange-title">{legal ? 'Zo maak je er geld van' : 'Nog in te wisselen'}</span>
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
          <span className="notes-label">Notities</span>
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
          Bewerken
        </button>
        <button type="button" className="secondary-btn danger" onClick={onDelete}>
          <Icon name="trash" size={16} stroke={2} />
          Verwijderen
        </button>
      </div>
    </aside>
  )
}
