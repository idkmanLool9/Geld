import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

/** Centered dialog (a full-height sheet on phones). Escape or the close button dismisses it. */
export default function Modal({ title, onClose, children, footer, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    ref.current?.querySelector('input, select, textarea, button:not(.modal-close)')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="round-btn modal-close" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={14} stroke={2.4} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
