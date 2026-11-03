import { useState } from 'react'
import Modal from './Modal.jsx'
import { REPO, checkToken } from '../lib/github.js'

const NEW_TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new'

/** One-time setup: paste a GitHub key that may write to the Geld repository. */
export default function PublishDialog({ token, onSave, onClose }) {
  const [value, setValue] = useState(token)
  const [state, setState] = useState(null) // null | 'checking' | error text
  const clean = value.trim()

  const save = async (e) => {
    e.preventDefault()
    if (!clean) return
    setState('checking')
    try {
      await checkToken(clean)
      onSave(clean)
    } catch (err) {
      setState(err.message || 'GitHub is niet bereikbaar.')
    }
  }

  return (
    <Modal
      title="Publiceren voor iedereen"
      onClose={onClose}
      footer={
        <>
          {token && (
            <button type="button" className="secondary-btn danger" onClick={() => onSave('')}>
              Sleutel verwijderen
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={onClose}>
            Annuleren
          </button>
          <button type="submit" form="publish-form" className="primary-btn" disabled={!clean || state === 'checking'}>
            {state === 'checking' ? 'Controleren…' : 'Sleutel opslaan'}
          </button>
        </>
      }
    >
      <form id="publish-form" className="form" onSubmit={save}>
        <p className="muted small-14">
          Publiceren zet je collectie op de site, zodat iedereen dezelfde stukken en foto's ziet. Het is gratis en gebruikt de
          GitHub-repository waarop de site staat. Je hebt eenmalig een sleutel nodig:
        </p>
        <ol className="steps">
          <li>
            Open{' '}
            <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
              GitHub → nieuwe fine-grained token
            </a>{' '}
            (log in als dat gevraagd wordt).
          </li>
          <li>Noem hem “Collectie” en kies een vervaldatum (maximaal een jaar).</li>
          <li>
            Kies bij <b>Repository access</b> voor <b>Only select repositories</b> → <b>{REPO.repo}</b>.
          </li>
          <li>
            Zet bij <b>Permissions → Repository permissions</b> de optie <b>Contents</b> op <b>Read and write</b>.
          </li>
          <li>Klik op <b>Generate token</b>, kopieer hem en plak hem hieronder.</li>
        </ol>
        <label className="field">
          <span>GitHub-sleutel</span>
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setState(null)
            }}
            placeholder="github_pat_…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </label>
        <p className="muted small">De sleutel staat alleen op dit toestel en zit nooit in een export of in de gepubliceerde collectie.</p>
        {state && state !== 'checking' && (
          <p className="form-error" role="alert">
            {state}
          </p>
        )}
      </form>
    </Modal>
  )
}
