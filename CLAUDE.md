# Collectie — banknote & coin collection viewer

A personal web app for keeping a collection of banknotes and coins:
folders by type and by country, a timeline by decade, and a detail panel per note.
It started as a design on a Claude canvas and was ported here to keep building it.

Levi usually writes in Dutch; answer in the language he uses. UI copy is English for now.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the build
```

## Hosting

- GitHub Pages via `.github/workflows/deploy.yml` (build + deploy on every push to `main`).
  `vite.config.js` uses `base: './'` so all asset paths are relative — keep them relative
  (no absolute `/...` URLs in code; `public/` files referenced from `index.html` are rewritten).
- Home-screen web app: `public/manifest.webmanifest` (`display: standalone`) plus the
  `apple-mobile-web-app-*` meta tags in `index.html` make it open full screen without browser bars.
  `viewport-fit=cover` + `env(safe-area-inset-*)` padding on `body` keep content off the notch.
  Icons: `public/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.

## Stack

- Vite + React 19, plain JavaScript (no TypeScript), no UI library, no router.
- One stylesheet: `src/styles.css`, with design tokens on `:root`.
- Navigation state lives in `App.jsx` and is mirrored to `location.hash`
  (`#home`, `#all`, `#folder:<id>`, `#country:<name>`, `#decade:1990`, …) so refresh and back work.

## Data

The app starts empty — there is no built-in collection. Everything the user adds is stored
**on the device** (`src/lib/store.js`):

- Items, including photos (downscaled JPEG data URLs), in IndexedDB (`collectie` / `items`).
- User folders in `localStorage` (`collection-folders`), as `[{ id, name }]`.
- Favorites are `item.fav`. Folder membership is `item.folders` (folder ids).
- Backup: export/import a JSON file (`{ app, version, folders, items }`) from the overview.
  The iOS home-screen app has its own storage, separate from Safari.

Item fields: `id, type ('note'|'coin'), country, cc, region, denom, unit, series, year (text),
qty, lo, hi (EUR estimate each), face (exchange value each), status (legal|exch|demo|check),
where, color, front, back, note, photos { front, back }, folders [], fav, created, updated`.
`cc`/`region` are derived from the country name (`src/data/countries.js`); `ys`/`dated` are
derived at load time (`prepare()` in `src/lib/collection.js`) and not stored.

## Structure

```
src/
  App.jsx                 state, storage, routing, page header, top bar, dialogs
  data/countries.js       country list (ISO-2 → region), countryInfo(name)
  data/meta.js            regions + colours, statuses
  data/flags.js           simplified flags; countries without one show their code
  lib/store.js            IndexedDB/localStorage, photo downscaling, backup export/import
  lib/collection.js       prepare, filtering, sorting, totals (sumUp), countries
  lib/format.js           eur(), range(), plural()
  components/
    Sidebar.jsx           library / folders / countries navigation
    Overview.jsx          home: welcome or hero, collections, countries, timeline, backup
    Folder.jsx            the yellow folder tile (notes peek out of the top)
    ItemsView.jsx         summary tiles, toolbar, grid + list, empty states
    DetailPanel.jsx       flip card, values, facts, notes, folder chips, edit/delete
    ItemForm.jsx          add / edit an item (with photo upload)
    FolderDialog.jsx      new / rename folder
    Modal.jsx             dialog shell (full-screen sheet on phones)
    NoteArt.jsx           drawn note/coin; shows item.photos.front/back when present
    Flag.jsx, Icon.jsx, Segmented.jsx
```

## Design rules

- Apple-style: system font stack, light grey ground `#F5F5F7`, white cards with large radii,
  one blue accent `#0071E3`, yellow Finder-style folders. Calm and flat.
- Levi dislikes the "AI-made" look: no purple/rainbow gradients, no glassmorphism,
  no pastel washes, no emoji, no left-border accent cards.
- Real `<button>`s and `<a>`s, visible focus rings, text contrast ≥ 4.5:1, touch targets ~40–44px.
- Must work at phone width (sidebar turns into a horizontal strip under 720px).
- Every button must do something — no placeholders.

## Ideas (not built yet)

- Sync between devices (e.g. Supabase) instead of backup files.
- CSV export.
- Optional: Dutch UI, dark mode.
