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
      title={folder ? 'Rename folder' : 'New folder'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="folder-form" className="primary-btn" disabled={!clean}>
            {folder ? 'Save' : 'Create folder'}
          </button>
        </>
      }
    >
      <form id="folder-form" onSubmit={submit} className="form">
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. To sell, Gifts, Euro" maxLength={60} />
        </label>
      </form>
    </Modal>
  )
}
