import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Overview from './components/Overview.jsx'
import ItemsView from './components/ItemsView.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Flag from './components/Flag.jsx'
import Icon from './components/Icon.jsx'
import { ITEMS, YEAR_MIN, YEAR_MAX } from './data/items.js'
import { CURRENCY, FOLDER_NAMES } from './data/meta.js'
import { filterItems, getCountries, inFolder, sumUp, typeForView } from './lib/collection.js'
import { plural } from './lib/format.js'

// Show estimated values everywhere. Flip to false for a "values hidden" mode.
const SHOW_VALUES = true

const TITLES = {
  home: 'My Collection',
  all: 'All items',
  notes: 'Banknotes',
  coins: 'Coins',
  favorites: 'Favorites',
  ...FOLDER_NAMES,
}
const SUBTITLES = {
  highlights: 'The eight notes that carry about half of the total value.',
  exchangeable: 'Notes a central bank still swaps for real money.',
  identify: 'Open questions — a sharper photo settles most of them.',
  lots: 'Low-value pieces: sell grouped per country, never one by one.',
  favorites: 'The pieces you starred.',
}

const readHash = () => decodeURIComponent(window.location.hash.slice(1)) || 'home'

function loadFavs() {
  try {
    return JSON.parse(localStorage.getItem('collection-favs') || '{}') || {}
  } catch {
    return {}
  }
}

export default function App() {
  const [view, setView] = useState(readHash)
  const [type, setType] = useState(typeForView(readHash()))
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('value')
  const [layout, setLayout] = useState('grid')
  const [sel, setSel] = useState(null)
  const [favs, setFavs] = useState(loadFavs)

  // Keep the view in the URL hash so refresh / back button work.
  useEffect(() => {
    if (readHash() !== view) window.location.hash = view
  }, [view])
  useEffect(() => {
    const onHash = () => {
      const v = readHash()
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
    if (v === 'home') setQuery('')
    window.scrollTo({ top: 0 })
  }
  const open = (v, id) => {
    setView(v)
    setType('all')
    setQuery('')
    setSel(id)
  }
  const toggleFav = (id) => {
    const next = { ...favs }
    if (next[id]) delete next[id]
    else next[id] = true
    setFavs(next)
    try {
      localStorage.setItem('collection-favs', JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }
  const changeType = (t) => {
    setType(t)
    if (view === 'notes' && t !== 'note') setView(t === 'coin' ? 'coins' : 'all')
    if (view === 'coins' && t !== 'coin') setView(t === 'note' ? 'notes' : 'all')
  }

  const countries = useMemo(getCountries, [])
  const list = useMemo(() => filterItems({ view, type, query, sort, favs }), [view, type, query, sort, favs])

  const isHome = view === 'home'
  const isCountry = view.startsWith('country:')
  const isDecade = view.startsWith('decade:')
  const cc = isCountry ? view.slice(8) : null
  const country = countries.find((c) => c.cc === cc)
  const all = sumUp(ITEMS)
  const st = sumUp(list)

  const title = TITLES[view] || country?.name || (isDecade ? `The ${view.slice(7)}s` : '')
  const subtitle = isHome
    ? `Banknotes and coins from ${all.nC} countries, issued between ${YEAR_MIN} and ${YEAR_MAX}.`
    : SUBTITLES[view] || (isCountry ? CURRENCY[cc] : `${plural(st.pieces, 'piece')}${st.stack ? ' + one unsorted stack' : ''} · ${plural(st.nC, 'country', 'countries')}`)
  const crumb = isCountry ? 'Countries' : isDecade ? 'Through time' : ['all', 'notes', 'coins', 'favorites'].includes(view) ? 'Library' : 'Collections'

  const counts = {
    all: all.pieces,
    notes: sumUp(ITEMS.filter((it) => it.type === 'note')).pieces,
    coins: sumUp(ITEMS.filter((it) => it.type === 'coin')).pieces,
    favorites: ITEMS.filter((it) => favs[it.id]).length,
    highlights: sumUp(ITEMS.filter((it) => inFolder(it, 'highlights'))).pieces,
    exchangeable: sumUp(ITEMS.filter((it) => inFolder(it, 'exchangeable'))).pieces,
    identify: ITEMS.filter((it) => inFolder(it, 'identify')).length,
    lots: sumUp(ITEMS.filter((it) => inFolder(it, 'lots'))).pieces,
  }

  const selItem = ITEMS.find((it) => it.id === sel)
  const idx = selItem ? list.indexOf(selItem) : -1

  return (
    <div className="app">
      <Sidebar view={view} go={go} counts={counts} countries={countries} />

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
          <button type="button" className="primary-btn">
            <Icon name="plus" size={16} stroke={2.2} />
            Add item
          </button>
        </div>

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
            {isCountry && <Flag cc={cc} width={72} height={50} radius={8} className="page-flag" />}
            <div>
              <h1>{title}</h1>
              <p className="muted">{subtitle}</p>
            </div>
          </div>
        </header>

        {isHome ? (
          <Overview go={go} open={open} favs={favs} countries={countries} showValues={SHOW_VALUES} />
        ) : (
          <ItemsView
            view={view}
            list={list}
            type={type}
            setType={changeType}
            sort={sort}
            setSort={setSort}
            layout={layout}
            setLayout={setLayout}
            sel={sel}
            select={setSel}
            favs={favs}
            showValues={SHOW_VALUES}
          >
            {selItem && (
              <DetailPanel
                item={selItem}
                fav={!!favs[selItem.id]}
                onToggleFav={() => toggleFav(selItem.id)}
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
    </div>
  )
}
