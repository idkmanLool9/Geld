import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Overview from './components/Overview.jsx'
import ItemsView from './components/ItemsView.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import ItemForm from './components/ItemForm.jsx'
import FolderDialog from './components/FolderDialog.jsx'
import PublishDialog from './components/PublishDialog.jsx'
import Flag from './components/Flag.jsx'
import Icon from './components/Icon.jsx'
import { filterItems, getCountries, inFolder, prepare, sumUp, typeForView } from './lib/collection.js'
import { plural } from './lib/format.js'
import * as store from './lib/store.js'
import * as github from './lib/github.js'

// Show estimated values everywhere. Flip to false for a "values hidden" mode.
const SHOW_VALUES = true

const TITLES = { home: 'My Collection', all: 'All items', notes: 'Banknotes', coins: 'Coins', favorites: 'Favorites' }

const readHash = () => {
  try {
    return decodeURIComponent(window.location.hash.slice(1)) || 'home'
  } catch {
    return 'home'
  }
}

export default function App() {
  const [items, setItems] = useState([])
  const [folders, setFolders] = useState(store.loadFolders)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [view, setView] = useState(readHash)
  const [type, setType] = useState(typeForView(readHash()))
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('value')
  const [layout, setLayout] = useState('grid')
  const [sel, setSel] = useState(null)

  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [folderDialog, setFolderDialog] = useState(null) // null | 'new' | folder

  const [exporting, setExporting] = useState(false)
  const [token, setToken] = useState(github.loadToken)
  const [publishDialog, setPublishDialog] = useState(false)
  const [toast, setToast] = useState(null) // { text, kind: 'busy'|'ok'|'error' }

  useEffect(() => {
    ;(async () => {
      let local = []
      try {
        local = await store.loadItems()
      } catch {
        setLoadError('This browser blocks storage, so pieces cannot be saved here (private browsing?).')
      }
      setItems(local.map(prepare))
      setLoaded(true)

      // A collection published on the site reaches every device: take it over when it is new.
      const shared = await store.fetchShared()
      const sync = store.loadSync()
      if (!shared || shared.version === sync.version || shared.version === sync.declined) return
      const changedHere = local.length > 0 && sync.dirty !== false
      if (
        changedHere &&
        !confirm(
          `A new version of the collection is available (${plural(shared.items.length, 'entry', 'entries')}). ` +
            'Load it? Pieces you added or changed on this device only will be replaced.',
        )
      ) {
        store.saveSync({ declined: shared.version })
        return
      }
      try {
        await store.replaceItems(shared.items)
      } catch {
        /* storage blocked: still show it */
      }
      store.saveFolders(shared.folders || [])
      store.saveSync({ version: shared.version, dirty: false, declined: null })
      setItems(shared.items.map(prepare))
      setFolders(shared.folders || [])
    })()
    store.requestPersistence()
  }, [])

  // Keep the view in the URL hash so refresh / back button work.
  const viewRef = useRef(view)
  useEffect(() => {
    viewRef.current = view
    if (readHash() !== view) window.location.hash = view
  }, [view])
  useEffect(() => {
    const onHash = () => {
      const v = readHash()
      if (v === viewRef.current) return // our own hash update, not back/forward
      setView(v)
      setType(typeForView(v))
      setSel(null)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (v) => {
    setView(v)
    setType(typeForView(v))
    setSel(null)
    setQuery('')
    window.scrollTo({ top: 0 })
  }
  const changeType = (t) => {
    setType(t)
    if (view === 'notes' && t !== 'note') setView(t === 'coin' ? 'coins' : 'all')
    if (view === 'coins' && t !== 'coin') setView(t === 'note' ? 'notes' : 'all')
  }

  // ----- Item changes (state first, then device storage) -----
  const persist = (p) => {
    store.saveSync({ dirty: true })
    return p.catch(() => alert('Saving failed — the device storage may be full.'))
  }

  const saveItem = (data) => {
    const now = Date.now()
    const item = prepare({ ...data, id: data.id || store.newId(), created: data.created || now, updated: now })
    delete item.ys
    delete item.dated
    persist(store.saveItem(item))
    const full = prepare(item)
    setItems((prev) => (prev.some((it) => it.id === full.id) ? prev.map((it) => (it.id === full.id ? full : it)) : [...prev, full]))
    setEditing(null)
    if (!data.id && (view === 'home' || !filterItems([full], { view, type, query, sort }).length)) {
      // The new piece would not be visible here: show it under "All items".
      setView('all')
      setType('all')
      setQuery('')
    }
    setSel(full.id)
  }

  const updateItem = (id, patch) => {
    const it = items.find((x) => x.id === id)
    if (!it) return
    const next = { ...it, ...patch }
    const { ys, dated, ...raw } = next
    persist(store.saveItem(raw))
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  const deleteItem = (it) => {
    const name = [it.denom, it.unit].filter(Boolean).join(' ') || 'this piece'
    if (!confirm(`Delete ${name}${it.country ? ` (${it.country})` : ''}? This cannot be undone.`)) return
    persist(store.removeItem(it.id))
    setItems((prev) => prev.filter((x) => x.id !== it.id))
    setSel(null)
  }

  // ----- Folders -----
  const writeFolders = (next) => {
    setFolders(next)
    store.saveFolders(next)
    store.saveSync({ dirty: true })
  }
  const saveFolder = (name) => {
    if (folderDialog === 'new') {
      const f = { id: store.newId(), name }
      writeFolders([...folders, f])
      setFolderDialog(null)
      go('folder:' + f.id)
    } else {
      writeFolders(folders.map((f) => (f.id === folderDialog.id ? { ...f, name } : f)))
      setFolderDialog(null)
    }
  }
  const deleteFolder = (folder) => {
    if (!confirm(`Delete the folder “${folder.name}”? The pieces in it stay in your collection.`)) return
    writeFolders(folders.filter((f) => f.id !== folder.id))
    for (const it of items) if (inFolder(it, folder.id)) updateItem(it.id, { folders: it.folders.filter((x) => x !== folder.id) })
    go('home')
  }

  // ----- Backup -----
  const exportBackup = async () => {
    if (!items.length) {
      alert('There is nothing to export yet — add a piece first.')
      return
    }
    setExporting(true)
    try {
      // This device now matches the exported file: once it is published, no "replace?" question here.
      if (await store.exportCollection(items.map(({ ys, dated, ...raw }) => raw), folders)) store.saveSync({ dirty: false })
    } catch {
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }
  // ----- Publish (GitHub) -----
  const publishNow = async (key = token) => {
    if (!key) {
      setPublishDialog(true)
      return
    }
    if (!items.length) {
      alert('There is nothing to publish yet — add a piece first.')
      return
    }
    if (toast?.kind === 'busy') return
    setToast({ kind: 'busy', text: 'Publishing…' })
    try {
      const raw = items.map(({ ys, dated, ...r }) => r)
      await github.publish(key, raw, folders, (text) => setToast({ kind: 'busy', text }))
      store.saveSync({ dirty: false })
      setToast({ kind: 'ok', text: 'Published. Everyone sees it in about 2 minutes.' })
    } catch (err) {
      setToast({ kind: 'error', text: err.message || 'Publishing failed. Check your internet connection.' })
    }
  }
  const saveToken = (key) => {
    github.saveToken(key)
    setToken(key)
    setPublishDialog(false)
    if (key) publishNow(key)
  }
  useEffect(() => {
    if (toast && toast.kind !== 'busy') {
      const t = setTimeout(() => setToast(null), toast.kind === 'error' ? 8000 : 5000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const importBackup = useCallback(
    async (file) => {
      try {
        const data = await store.readBackup(file)
        const msg = items.length
          ? `Replace your current collection (${plural(items.length, 'entry', 'entries')}) with the ${plural(data.items.length, 'entry', 'entries')} in this backup?`
          : `Import ${plural(data.items.length, 'entry', 'entries')} from this backup?`
        if (!confirm(msg)) return
        await store.replaceItems(data.items)
        store.saveFolders(data.folders)
        store.saveSync({ dirty: true })
        setItems(data.items.map(prepare))
        setFolders(data.folders)
        go('home')
      } catch (err) {
        alert(err instanceof SyntaxError ? 'This file could not be read as a backup.' : err.message || 'Import failed.')
      }
    },
    [items.length],
  )

  // ----- Derived -----
  const countries = useMemo(() => getCountries(items), [items])
  const list = useMemo(() => filterItems(items, { view, type, query, sort }), [items, view, type, query, sort])

  const isHome = view === 'home'
  const isCountry = view.startsWith('country:')
  const isDecade = view.startsWith('decade:')
  const isFolder = view.startsWith('folder:')
  const country = isCountry ? countries.find((c) => c.key === view.slice(8)) : null
  const folder = isFolder ? folders.find((f) => f.id === view.slice(7)) : null
  const all = sumUp(items)
  const st = sumUp(list)

  const title = TITLES[view] || folder?.name || (isCountry ? view.slice(8) : '') || (isDecade ? `The ${view.slice(7)}s` : '') || 'Not found'
  const subtitle = isHome
    ? items.length
      ? `${plural(all.pieces, 'piece')} from ${plural(all.nC, 'country', 'countries')}.`
      : 'Banknotes and coins, all in one place.'
    : `${plural(st.pieces, 'piece')} · ${plural(st.nC, 'country', 'countries')}`
  const crumb = isCountry ? 'Countries' : isDecade ? 'Through time' : isFolder ? 'Folders' : 'Library'

  const counts = {
    all: all.pieces,
    notes: sumUp(items.filter((it) => it.type === 'note')).pieces,
    coins: sumUp(items.filter((it) => it.type === 'coin')).pieces,
    favorites: sumUp(items.filter((it) => it.fav)).pieces,
  }
  const folderCounts = Object.fromEntries(folders.map((f) => [f.id, sumUp(items.filter((it) => inFolder(it, f.id))).pieces]))

  const selItem = items.find((it) => it.id === sel)
  const idx = selItem ? list.findIndex((it) => it.id === sel) : -1

  return (
    <div className="app">
      <Sidebar
        view={view}
        go={go}
        counts={counts}
        folders={folders}
        folderCounts={folderCounts}
        countries={countries}
        onNewFolder={() => setFolderDialog('new')}
      />

      <main className="main">
        <div className="topbar">
          <label className="search">
            <Icon name="search" size={16} stroke={2} />
            <span className="sr-only">Search the collection</span>
            <input
              type="search"
              value={query}
              placeholder="Search country, note, person, year…"
              onChange={(e) => {
                setQuery(e.target.value)
                if (isHome && e.target.value) setView('all')
              }}
            />
          </label>
          <div className="grow" />
          <button type="button" className="secondary-btn" onClick={exportBackup} disabled={exporting}>
            <Icon name="download" size={16} stroke={2} />
            {exporting ? 'Exporting…' : 'Export'}
          </button>
          {token && (
            <button type="button" className="secondary-btn" onClick={() => publishNow()} disabled={toast?.kind === 'busy'}>
              <Icon name="upload" size={16} stroke={2} />
              Publish
            </button>
          )}
          <button type="button" className="primary-btn" onClick={() => setEditing('new')}>
            <Icon name="plus" size={16} stroke={2.2} />
            Add item
          </button>
        </div>

        {loadError && (
          <p className="card warning" role="alert">
            {loadError}
          </p>
        )}

        <header className="page-head">
          {!isHome && (
            <nav aria-label="Breadcrumb" className="crumbs">
              <button type="button" className="crumb-back" onClick={() => go('home')}>
                <Icon name="back" size={16} stroke={2.2} />
                Overview
              </button>
              <span className="crumb-sep">/</span>
              <span className="muted">{crumb}</span>
            </nav>
          )}
          <div className="page-title-row">
            {country && country.cc !== '?' && <Flag cc={country.cc} width={72} height={50} radius={8} className="page-flag" />}
            <div className="grow">
              <h1>{title}</h1>
              <p className="muted">{subtitle}</p>
            </div>
          </div>
          {folder && (
            <div className="page-actions">
              <button type="button" className="secondary-btn small-btn" onClick={() => setFolderDialog(folder)}>
                <Icon name="edit" size={15} stroke={2} />
                Rename
              </button>
              <button type="button" className="secondary-btn small-btn danger" onClick={() => deleteFolder(folder)}>
                <Icon name="trash" size={15} stroke={2} />
                Delete folder
              </button>
            </div>
          )}
        </header>

        {!loaded ? null : isHome ? (
          <Overview
            items={items}
            folders={folders}
            countries={countries}
            go={go}
            onAdd={() => setEditing('new')}
            onNewFolder={() => setFolderDialog('new')}
            onExport={exportBackup}
            onPublish={() => publishNow()}
            onPublishSetup={() => setPublishDialog(true)}
            canPublish={!!token}
            onImport={importBackup}
            showValues={SHOW_VALUES}
          />
        ) : (
          <ItemsView
            view={view}
            list={list}
            total={items.length}
            query={query}
            type={type}
            setType={changeType}
            sort={sort}
            setSort={setSort}
            layout={layout}
            setLayout={setLayout}
            sel={sel}
            select={setSel}
            onAdd={() => setEditing('new')}
            showValues={SHOW_VALUES}
          >
            {selItem && (
              <DetailPanel
                item={selItem}
                folders={folders}
                onToggleFav={() => updateItem(selItem.id, { fav: !selItem.fav })}
                onEdit={() => setEditing(selItem)}
                onDelete={() => deleteItem(selItem)}
                onPrev={idx > 0 ? () => setSel(list[idx - 1].id) : null}
                onNext={idx !== -1 && idx < list.length - 1 ? () => setSel(list[idx + 1].id) : null}
                onClose={() => setSel(null)}
                go={go}
                showValues={SHOW_VALUES}
              />
            )}
          </ItemsView>
        )}
      </main>

      {editing && (
        <ItemForm
          item={editing === 'new' ? null : editing}
          items={items}
          folders={folders}
          defaultFolder={isFolder && folder && editing === 'new' ? folder.id : null}
          onSave={saveItem}
          onClose={() => setEditing(null)}
        />
      )}
      {publishDialog && <PublishDialog token={token} onSave={saveToken} onClose={() => setPublishDialog(false)} />}
      {toast && (
        <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
          <span>{toast.text}</span>
          {toast.kind !== 'busy' && (
            <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
              <Icon name="close" size={14} stroke={2.4} />
            </button>
          )}
        </div>
      )}
      {folderDialog && <FolderDialog folder={folderDialog === 'new' ? null : folderDialog} onSave={saveFolder} onClose={() => setFolderDialog(null)} />}
    </div>
  )
}
