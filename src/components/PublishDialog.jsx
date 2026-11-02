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
      setState(err.message || 'Could not reach GitHub.')
    }
  }

  return (
    <Modal
      title="Publish to everyone"
      onClose={onClose}
      footer={
        <>
          {token && (
            <button type="button" className="secondary-btn danger" onClick={() => onSave('')}>
              Remove key
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="publish-form" className="primary-btn" disabled={!clean || state === 'checking'}>
            {state === 'checking' ? 'Checking…' : 'Save key'}
          </button>
        </>
      }
    >
      <form id="publish-form" className="form" onSubmit={save}>
        <p className="muted small-14">
          Publishing puts your collection on the site, so everyone sees the same pieces and photos. It is free and uses the
          GitHub repository that hosts the site. You need a key once:
        </p>
        <ol className="steps">
          <li>
            Open{' '}
            <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
              GitHub → new fine-grained token
            </a>{' '}
            (sign in if asked).
          </li>
          <li>Name it “Collection”, and set an expiration (up to a year).</li>
          <li>
            Under <b>Repository access</b> choose <b>Only select repositories</b> → <b>{REPO.repo}</b>.
          </li>
          <li>
            Under <b>Permissions → Repository permissions</b> set <b>Contents</b> to <b>Read and write</b>.
          </li>
          <li>Generate the token, copy it, and paste it below.</li>
        </ol>
        <label className="field">
          <span>GitHub key</span>
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
        <p className="muted small">The key is stored only on this device and is never part of an export or of the published collection.</p>
        {state && state !== 'checking' && (
          <p className="form-error" role="alert">
            {state}
          </p>
        )}
      </form>
    </Modal>
  )
}
