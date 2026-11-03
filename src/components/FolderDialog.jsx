import { useState } from 'react'
import Modal from './Modal.jsx'

export default function FolderDialog({ folder, onSave, onClose }) {
  const [name, setName] = useState(folder?.name || '')
  const clean = name.trim()
  const submit = (e) => {
    e.preventDefault()
    if (clean) onSave(clean)
  }
  return (
    <Modal
      title={folder ? 'Map hernoemen' : 'Nieuwe map'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Annuleren
          </button>
          <button type="submit" form="folder-form" className="primary-btn" disabled={!clean}>
            {folder ? 'Opslaan' : 'Map maken'}
          </button>
        </>
      }
    >
      <form id="folder-form" onSubmit={submit} className="form">
        <label className="field">
          <span>Naam</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="bv. Te koop, Cadeaus, Euro" maxLength={60} />
        </label>
      </form>
    </Modal>
  )
}
