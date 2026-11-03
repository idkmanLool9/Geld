/**
 * Drawn stand-in for a banknote or coin. When the item has `photos.front` /
 * `photos.back`, the real photo is shown instead.
 */
export default function NoteArt({ item, side = 'front', size = 'card' }) {
  const photo = item.photos?.[side]
  if (photo) {
    return (
      <div className={`art art-${size} art-photo ${item.type === 'coin' ? 'art-photo-coin' : ''}`}>
        <img src={photo} alt={`${item.denom || ''} ${item.unit || ''}, ${side}`.trim()} />
      </div>
    )
  }

  if (item.type === 'coin') {
    return (
      <div className={`art art-${size} art-coin-bg`}>
        <div className="coin" style={{ background: item.color }}>
          {side === 'front' ? item.denom || '?' : <span className="coin-back">{item.back || 'No photo of the reverse yet'}</span>}
        </div>
      </div>
    )
  }

  const qtyLabel = item.qty > 1 ? `×${item.qty}` : null

  if (side === 'back') {
    return (
      <div className={`art art-${size} note note-back`} style={{ backgroundColor: item.color }}>
        <div className="note-frame" />
        <div className="note-motif">{item.back || 'No photo of the back yet'}</div>
        <div className="note-denom note-denom-left">{item.denom || '?'}</div>
      </div>
    )
  }

  return (
    <div className={`art art-${size} note`} style={{ backgroundColor: item.color }}>
      <div className="note-frame" />
      <div className="note-thread" />
      <div className="note-portrait" />
      <div className="note-watermark" />
      <div className="note-country">{item.country}</div>
      <div className="note-denom">{item.denom || '?'}</div>
      <div className="note-unit">{item.unit}</div>
      {size === 'card' && qtyLabel && <span className="note-qty">{qtyLabel}</span>}
    </div>
  )
}
