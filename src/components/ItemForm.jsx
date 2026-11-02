import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import NoteArt from './NoteArt.jsx'
import Icon from './Icon.jsx'
import { COUNTRIES, countryInfo } from '../data/countries.js'
import { STATUS } from '../data/meta.js'
import { readPhoto } from '../lib/store.js'

const EMPTY = {
  type: 'note',
  country: '',
  denom: '',
  unit: '',
  series: '',
  year: '',
  qty: 1,
  lo: '',
  hi: '',
  face: '',
  status: 'demo',
  color: '#4E6A8A',
  front: '',
  back: '',
  where: '',
  note: '',
  folders: [],
  photos: {},
}

const txt = (v) => String(v ?? '').trim()
const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function PhotoField({ side, value, onChange, setError }) {
  const input = useRef(null)
  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      onChange(await readPhoto(file))
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div className="photo-field">
      <span className="field-label">{side === 'front' ? 'Front photo' : 'Back photo'}</span>
      {value ? (
        <div className="photo-preview">
          <img src={value} alt={`${side} preview`} />
        </div>
      ) : (
        <div className="photo-empty">No photo</div>
      )}
      <div className="photo-actions">
        <button type="button" className="secondary-btn small-btn" onClick={() => input.current.click()}>
          <Icon name="camera" size={15} stroke={2} />
          {value ? 'Replace' : 'Add photo'}
        </button>
        {value && (
          <button type="button" className="secondary-btn small-btn danger" onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  )
}

export default function ItemForm({ item, folders, defaultFolder, onSave, onClose }) {
  const [f, setF] = useState(() => ({
    ...EMPTY,
    ...item,
    photos: { ...(item?.photos || {}) },
    folders: item ? [...(item.folders || [])] : defaultFolder ? [defaultFolder] : [],
  }))
  const [error, setError] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const setPhoto = (side) => (v) => setF({ ...f, photos: { ...f.photos, [side]: v || undefined } })
  const toggleFolder = (id) =>
    setF({ ...f, folders: f.folders.includes(id) ? f.folders.filter((x) => x !== id) : [...f.folders, id] })

  const submit = (e) => {
    e.preventDefault()
    if (!txt(f.denom) && !txt(f.country)) {
      setError('Fill in at least a country or a denomination.')
      return
    }
    const lo = num(f.lo)
    const hi = f.hi === '' ? lo : num(f.hi)
    const country = txt(f.country)
    const photos = {}
    if (f.photos.front) photos.front = f.photos.front
    if (f.photos.back) photos.back = f.photos.back
    onSave({
      ...f,
      ...countryInfo(country),
      country,
      denom: txt(f.denom),
      unit: txt(f.unit),
      series: txt(f.series),
      year: txt(f.year),
      front: txt(f.front),
      back: txt(f.back),
      where: f.status === 'exch' ? txt(f.where) : '',
      note: txt(f.note),
      qty: Math.max(1, Math.round(num(f.qty)) || 1),
      lo: Math.min(lo, hi),
      hi: Math.max(lo, hi),
      face: f.status === 'exch' ? num(f.face) : 0,
      photos,
    })
  }

  const preview = { ...f, qty: 1 }

  return (
    <Modal
      wide
      title={item ? 'Edit item' : 'Add item'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="item-form" className="primary-btn">
            {item ? 'Save changes' : 'Add to collection'}
          </button>
        </>
      }
    >
      <form id="item-form" className="form" onSubmit={submit} noValidate>
        <div className="form-preview">
          <NoteArt item={preview} size="large" />
        </div>

        <div className="field">
          <span className="field-label" id="type-label">
            Type
          </span>
          <div className="segmented" role="group" aria-labelledby="type-label">
            {[
              ['note', 'Banknote'],
              ['coin', 'Coin'],
            ].map(([v, l]) => (
              <button key={v} type="button" className={`seg ${f.type === v ? 'is-on' : ''}`} aria-pressed={f.type === v} onClick={() => setF({ ...f, type: v })}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Country</span>
            <input list="country-list" value={f.country} onChange={set('country')} placeholder="e.g. Belgium" autoComplete="off" />
            <datalist id="country-list">
              {COUNTRIES.map((c) => (
                <option key={c.cc} value={c.name} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={f.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Denomination</span>
            <input value={f.denom} onChange={set('denom')} placeholder="e.g. 100" />
          </label>
          <label className="field">
            <span>Currency unit</span>
            <input value={f.unit} onChange={set('unit')} placeholder="e.g. Frank" />
          </label>
          <label className="field">
            <span>Series</span>
            <input value={f.series} onChange={set('series')} placeholder="e.g. Constant Permeke" />
          </label>
          <label className="field">
            <span>Year</span>
            <input value={f.year} onChange={set('year')} placeholder="e.g. 1997 or 1973–1994" />
          </label>
          <label className="field">
            <span>Quantity</span>
            <input type="number" inputMode="numeric" min="1" step="1" value={f.qty} onChange={set('qty')} />
          </label>
          <label className="field">
            <span>Colour</span>
            <input type="color" value={f.color} onChange={set('color')} className="color-input" />
          </label>
          <label className="field">
            <span>Value from (€ each)</span>
            <input inputMode="decimal" value={f.lo} onChange={set('lo')} placeholder="0" />
          </label>
          <label className="field">
            <span>Value to (€ each)</span>
            <input inputMode="decimal" value={f.hi} onChange={set('hi')} placeholder="same as from" />
          </label>
          {f.status === 'exch' && (
            <>
              <label className="field">
                <span>Exchange value (€ each)</span>
                <input inputMode="decimal" value={f.face} onChange={set('face')} placeholder="0" />
              </label>
              <label className="field">
                <span>Where to exchange</span>
                <input value={f.where} onChange={set('where')} placeholder="Bank, address, deadline" />
              </label>
            </>
          )}
          <label className="field">
            <span>Front shows</span>
            <input value={f.front} onChange={set('front')} placeholder="Portrait, building…" />
          </label>
          <label className="field">
            <span>Back shows</span>
            <input value={f.back} onChange={set('back')} placeholder="Landscape, animal…" />
          </label>
        </div>

        <div className="form-grid">
          <PhotoField side="front" value={f.photos.front} onChange={setPhoto('front')} setError={setError} />
          <PhotoField side="back" value={f.photos.back} onChange={setPhoto('back')} setError={setError} />
        </div>

        <label className="field">
          <span>Notes</span>
          <textarea rows={3} value={f.note} onChange={set('note')} placeholder="Condition, where you got it, things to check…" />
        </label>

        <div className="field">
          <span className="field-label">Folders</span>
          {folders.length ? (
            <div className="check-list">
              {folders.map((fo) => (
                <label key={fo.id} className="check">
                  <input type="checkbox" checked={f.folders.includes(fo.id)} onChange={() => toggleFolder(fo.id)} />
                  {fo.name}
                </label>
              ))}
            </div>
          ) : (
            <span className="muted small">No folders yet. Create one with “New folder” on the overview.</span>
          )}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
