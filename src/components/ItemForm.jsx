import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import NoteArt from './NoteArt.jsx'
import Icon from './Icon.jsx'
import { COUNTRIES, countryInfo } from '../data/countries.js'
import { currencyCode, exchangeInfo, isFormerIssuer, guessUnit, legalTenderAdvice, parseDenom, unitsFor } from '../data/currencies.js'
import { getRates, toEuro } from '../lib/rates.js'
import { STATUS } from '../data/meta.js'
import { readPhoto } from '../lib/store.js'
import { parseText, photoColor, readText } from '../lib/autofill.js'

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
  tag: '',
  folders: [],
  photos: {},
}
const LABELS = { country: 'country', denom: 'denomination', unit: 'currency unit', year: 'year', color: 'colour', status: 'status', face: 'exchange value', where: 'where to exchange' }
const COPY_KEYS = ['series', 'year', 'front', 'back', 'lo', 'hi', 'status', 'face', 'where', 'color']

const txt = (v) => String(v ?? '').trim()
const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}
const same = (a, b) => txt(a).toLowerCase() === txt(b).toLowerCase()
const isDefault = (k, v) => v === EMPTY[k] || v === '' || v == null

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
        <button type="button" className="photo-empty" onClick={() => input.current.click()}>
          <Icon name="camera" size={22} stroke={1.8} />
          {side === 'front' ? 'Add the front' : 'Add the back'}
        </button>
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

export default function ItemForm({ item, items = [], folders, defaultFolder, onSave, onClose }) {
  const [f, setF] = useState(() => ({
    ...EMPTY,
    ...item,
    photos: { ...(item?.photos || {}) },
    folders: item ? [...(item.folders || [])] : defaultFolder ? [defaultFolder] : [],
  }))
  const [error, setError] = useState('')
  const [ocr, setOcr] = useState(null) // null | { state: 'loading'|'reading'|'done'|'error', progress, filled }
  const [copyDismissed, setCopyDismissed] = useState(false)
  const [tagOn, setTagOn] = useState(!!item?.tag)

  // Auto-fill bookkeeping: fields the user typed in are never overwritten; auto-filled ones are
  // highlighted until edited. When editing an existing piece, everything already filled counts as typed.
  const fRef = useRef(f)
  fRef.current = f
  const touched = useRef(new Set(item ? Object.keys(item).filter((k) => !isDefault(k, item[k])).concat('status') : []))
  const autoRef = useRef(new Set())
  const [auto, setAuto] = useState(new Set())

  /** Fill fields that the user has not filled in; returns the keys it changed. */
  const apply = (patch) => {
    const cur = fRef.current
    const next = { ...cur }
    const changed = []
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '' || touched.current.has(k)) continue
      if (!isDefault(k, cur[k]) && !autoRef.current.has(k)) continue
      if (String(cur[k]) === String(v)) continue
      next[k] = v
      changed.push(k)
      autoRef.current.add(k)
    }
    if (changed.length) {
      fRef.current = next
      setF(next)
      setAuto(new Set(autoRef.current))
    }
    return changed
  }
  /** Clear auto-filled fields that no longer apply. */
  const unapply = (keys) => {
    const cur = fRef.current
    const next = { ...cur }
    let any = false
    for (const k of keys) {
      if (autoRef.current.has(k) && !touched.current.has(k)) {
        next[k] = EMPTY[k]
        autoRef.current.delete(k)
        any = true
      }
    }
    if (any) {
      fRef.current = next
      setF(next)
      setAuto(new Set(autoRef.current))
    }
  }

  const userSet = (k, v) => {
    touched.current.add(k)
    autoRef.current.delete(k)
    setAuto(new Set(autoRef.current))
    setF((prev) => ({ ...prev, [k]: v }))
  }
  const set = (k) => (e) => userSet(k, e.target.value)

  const cc = countryInfo(f.country).cc

  // "200 Franse Francs" typed as denomination: keep the number, move the currency to its own field.
  const splitDenom = () => {
    const m = txt(fRef.current.denom).match(/^([\d.,'’ ]*\d(?:\s*[KkMm])?)\s+(\D.*)$/)
    if (!m) return
    const rest = m[2].trim()
    const stemOf = (w) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().slice(0, 4)
    const known = unitsFor(cc).find((u) => rest.split(/\s+/).some((w) => stemOf(w) === stemOf(u.split(' ').pop())))
    const next = { ...fRef.current, denom: m[1].replace(/\s+/g, '') }
    if (!txt(next.unit)) next.unit = known || rest
    touched.current.add('denom')
    fRef.current = next
    setF(next)
  }

  // Currency unit from the country (and the year, for euro countries).
  useEffect(() => {
    if (cc !== '?') apply({ unit: guessUnit(cc, f.year) })
  }, [cc, f.year]) // eslint-disable-line react-hooks/exhaustive-deps

  // Status, exchange value and where to exchange for old euro-area banknotes / current money.
  useEffect(() => {
    const info = exchangeInfo(cc, f.unit, f.denom, f.type)
    if (info) apply({ status: info.status, face: info.face || '', where: info.where, note: info.note })
    else if (currencyCode(cc, f.unit)) apply({ status: 'legal' })
    else if (isFormerIssuer(cc)) {
      unapply(['face', 'where'])
      apply({ status: 'demo' })
    } else unapply(['status', 'face', 'where'])
  }, [cc, f.unit, f.denom, f.type]) // eslint-disable-line react-hooks/exhaustive-deps

  // Still legal tender: today's value in euro (live rate) and how to turn it into money.
  const [rateNote, setRateNote] = useState('')
  useEffect(() => {
    setRateNote('')
    if (f.status !== 'legal') return
    const code = currencyCode(cc, f.unit)
    if (!code) return
    apply({ where: legalTenderAdvice(code, txt(f.country), f.type) })
    const n = parseDenom(f.denom)
    if (!n) return
    let gone = false
    getRates().then((r) => {
      if (gone) return
      const v = toEuro(r, code, n)
      if (v != null) {
        apply({ face: v })
        setRateNote(code === 'EUR' ? '' : `Rate of ${r.date}: 1 EUR = ${r.rates[code.toLowerCase()]} ${code}.`)
      } else setRateNote(r ? `No exchange rate found for ${code}.` : 'Exchange rates could not be loaded (no internet?).')
    })
    return () => {
      gone = true
    }
  }, [cc, f.unit, f.denom, f.type, f.status, f.country]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reading a new photo: colour + text (country, denomination, year, unit).
  const readPhotoInfo = async (side, dataUrl) => {
    const filled = []
    if (side === 'front' || isDefault('color', fRef.current.color)) {
      const color = await photoColor(dataUrl)
      filled.push(...apply({ color }))
    }
    setOcr({ state: 'loading', progress: 0, filled })
    try {
      const text = await readText(dataUrl, (m) => {
        if (m.status === 'recognizing text') setOcr((o) => ({ ...o, state: 'reading', progress: m.progress }))
      })
      const known = countryInfo(fRef.current.country).cc
      const found = parseText(text, known !== '?' ? known : null)
      if (found.cc) {
        const name = COUNTRIES.find((c) => c.cc === found.cc)?.name
        filled.push(...apply({ country: name }))
      }
      filled.push(...apply({ denom: found.denom, year: found.year }))
      if (found.unit) filled.push(...apply({ unit: found.unit }))
      setOcr({ state: 'done', filled: [...new Set(filled)] })
    } catch {
      setOcr({ state: 'error', filled })
    }
  }

  const setPhoto = (side) => (v) => {
    setF((prev) => ({ ...prev, photos: { ...prev.photos, [side]: v || undefined } }))
    if (v) readPhotoInfo(side, v)
  }
  const toggleFolder = (id) =>
    setF({ ...f, folders: f.folders.includes(id) ? f.folders.filter((x) => x !== id) : [...f.folders, id] })

  // Same piece already in the collection? Offer to copy its details.
  const twin = useMemo(
    () =>
      txt(f.denom) && txt(f.country)
        ? items.find((it) => it.id !== f.id && same(it.country, f.country) && same(it.denom, f.denom) && (!txt(f.unit) || same(it.unit, f.unit)))
        : null,
    [items, f.id, f.country, f.denom, f.unit],
  )
  const copyTwin = () => {
    apply(Object.fromEntries(COPY_KEYS.map((k) => [k, twin[k]])))
    setCopyDismissed(true)
  }

  // Suggestions: this country's currencies and the series already used for it.
  const unitOptions = useMemo(() => {
    const own = items.filter((it) => same(it.country, f.country)).map((it) => it.unit)
    return [...new Set([...unitsFor(cc), ...own].filter(Boolean))]
  }, [cc, items, f.country])
  const seriesOptions = useMemo(
    () => [...new Set(items.filter((it) => same(it.country, f.country) && (!f.unit || same(it.unit, f.unit))).map((it) => it.series).filter(Boolean))],
    [items, f.country, f.unit],
  )

  const submit = (e) => {
    e.preventDefault()
    splitDenom()
    const f = fRef.current
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
      where: f.status === 'exch' || f.status === 'legal' ? txt(f.where) : '',
      note: txt(f.note),
      tag: tagOn ? txt(f.tag) : '',
      qty: Math.max(1, Math.round(num(f.qty)) || 1),
      lo: Math.min(lo, hi),
      hi: Math.max(lo, hi),
      face: f.status === 'exch' || f.status === 'legal' ? num(f.face) : 0,
      photos,
    })
  }

  const cls = (k) => (auto.has(k) ? 'is-auto' : undefined)
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
        {!item && !f.photos.front && <p className="form-hint">Start with a photo: country, denomination, currency, year and colour are read from it and filled in for you.</p>}

        <div className="photo-grid">
          <PhotoField side="front" value={f.photos.front} onChange={setPhoto('front')} setError={setError} />
          <PhotoField side="back" value={f.photos.back} onChange={setPhoto('back')} setError={setError} />
        </div>

        {ocr && (
          <div className={`autofill-status ${ocr.state === 'error' ? 'is-error' : ''}`} role="status">
            {ocr.state === 'loading' && 'Getting the text reader ready… (the first time takes a moment)'}
            {ocr.state === 'reading' && `Reading the text on the photo… ${Math.round((ocr.progress || 0) * 100)}%`}
            {ocr.state === 'done' &&
              (ocr.filled.length
                ? `Filled in from the photo: ${ocr.filled.map((k) => LABELS[k] || k).join(', ')}. Check the blue fields.`
                : 'No new details could be read from this photo. A sharper, straight photo helps.')}
            {ocr.state === 'error' && 'The text on the photo could not be read here (no internet?). Fill in the fields yourself.'}
          </div>
        )}

        {twin && !copyDismissed && (
          <div className="autofill-status">
            <span className="grow">
              You already have a {[twin.denom, twin.unit].filter(Boolean).join(' ')} from {twin.country}
              {twin.series ? ` (${twin.series})` : ''}.
            </span>
            <button type="button" className="secondary-btn small-btn" onClick={copyTwin}>
              Copy its details
            </button>
          </div>
        )}

        {!f.photos.front && (
          <div className="form-preview">
            <NoteArt item={preview} size="large" />
          </div>
        )}

        <div className="field">
          <span className="field-label" id="type-label">
            Type
          </span>
          <div className="segmented" role="group" aria-labelledby="type-label">
            {[
              ['note', 'Banknote'],
              ['coin', 'Coin'],
            ].map(([v, l]) => (
              <button key={v} type="button" className={`seg ${f.type === v ? 'is-on' : ''}`} aria-pressed={f.type === v} onClick={() => userSet('type', v)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Country</span>
            <input className={cls('country')} list="country-list" value={f.country} onChange={set('country')} placeholder="e.g. Belgium" autoComplete="off" />
            <datalist id="country-list">
              {COUNTRIES.map((c) => (
                <option key={c.cc + c.name} value={c.name} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Status</span>
            <select className={cls('status')} value={f.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Denomination</span>
            <input className={cls('denom')} value={f.denom} onChange={set('denom')} onBlur={splitDenom} placeholder="e.g. 100" />
          </label>
          <div className="field">
            <label className="field">
              <span>Currency unit</span>
              <input className={cls('unit')} list="unit-list" value={f.unit} onChange={set('unit')} placeholder="e.g. Frank" autoComplete="off" />
            </label>
            <datalist id="unit-list">
              {unitOptions.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
            {unitOptions.length > 1 && (
              <div className="suggest">
                {unitOptions.map((u) => (
                  <button key={u} type="button" className={`suggest-chip ${same(u, f.unit) ? 'is-on' : ''}`} onClick={() => userSet('unit', u)}>
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className="field">
            <span>Series</span>
            <input className={cls('series')} list="series-list" value={f.series} onChange={set('series')} placeholder="e.g. Constant Permeke" autoComplete="off" />
            <datalist id="series-list">
              {seriesOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Year</span>
            <input className={cls('year')} value={f.year} onChange={set('year')} placeholder="e.g. 1997 or 1973–1994" />
          </label>
          <label className="field">
            <span>Quantity</span>
            <input type="number" inputMode="numeric" min="1" step="1" value={f.qty} onChange={set('qty')} />
          </label>
          <label className="field">
            <span>Colour</span>
            <input type="color" value={f.color} onChange={set('color')} className={`color-input ${cls('color') || ''}`} />
          </label>
          <label className="field">
            <span>Value from (€ each)</span>
            <input className={cls('lo')} inputMode="decimal" value={f.lo} onChange={set('lo')} placeholder="0" />
          </label>
          <label className="field">
            <span>Value to (€ each)</span>
            <input className={cls('hi')} inputMode="decimal" value={f.hi} onChange={set('hi')} placeholder="same as from" />
          </label>
          {(f.status === 'exch' || f.status === 'legal') && (
            <>
              <label className="field">
                <span>{f.status === 'legal' ? 'Worth in euro today (each)' : 'Exchange value (€ each)'}</span>
                <input className={cls('face')} inputMode="decimal" value={f.face} onChange={set('face')} placeholder="0" />
                {f.status === 'legal' && rateNote && <span className="field-note">{rateNote}</span>}
              </label>
              <label className="field">
                <span>{f.status === 'legal' ? 'How to cash it' : 'Where to exchange'}</span>
                <textarea className={cls('where')} rows={3} value={f.where} onChange={set('where')} placeholder="Bank, address, deadline" />
              </label>
            </>
          )}
          <label className="field">
            <span>Front shows</span>
            <input className={cls('front')} value={f.front} onChange={set('front')} placeholder="Portrait, building…" />
          </label>
          <label className="field">
            <span>Back shows</span>
            <input className={cls('back')} value={f.back} onChange={set('back')} placeholder="Landscape, animal…" />
          </label>
        </div>

        <div className="field tag-field">
          <label className="check tag-check">
            <input
              type="checkbox"
              checked={tagOn}
              onChange={(e) => {
                setTagOn(e.target.checked)
                if (!e.target.checked) userSet('tag', '')
              }}
            />
            Add a tag
          </label>
          {tagOn && (
            <input
              value={f.tag}
              onChange={set('tag')}
              placeholder="e.g. Special serial number"
              maxLength={28}
              aria-label="Tag text"
              autoFocus
            />
          )}
          <span className="field-note">Shown as a small label on the top right of the piece, so it stands out.</span>
        </div>

        <label className="field">
          <span>Notes</span>
          <textarea className={cls('note')} rows={3} value={f.note} onChange={set('note')} placeholder="Condition, where you got it, things to check…" />
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
