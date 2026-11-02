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
- Export (top bar) makes one JSON file `{ app, version, exported, folders, items }` with every
  photo embedded as a data URL. On phones it opens the share sheet. Import reads the same file.
- **Shared collection:** `data/collection.json` (an export) is published for everyone.
  `scripts/publish.mjs` runs before every build and splits it into `public/shared/collection.json`
  + `public/shared/photos/*.jpg` (gitignored). On start the app fetches `shared/collection.json`;
  a new `version` replaces the device's collection — silently, unless the device has local
  changes since its last sync/export (`collection-sync` in localStorage), then it asks first.
- **Publish button (free, GitHub):** `src/lib/github.js` writes `data/collection.json` +
  `data/photos/<id>-<side>.jpg` straight into this repo through the GitHub Git Data API, with a
  fine-grained token (Contents: read & write on this repo only) stored in localStorage
  (`collection-github-token`, never exported). Unchanged photos are skipped by git blob hash;
  photos of deleted pieces are removed. The push triggers the Pages workflow. Setup UI:
  `components/PublishDialog.jsx`. A paid cloud database is not used: the free Supabase plan's
  two active projects are taken by other apps.
- Manual alternative: replace `data/collection.json` with an export and push to `main`.

Item fields: `id, type ('note'|'coin'), country, cc, region, denom, unit, series, year (text),
qty, lo, hi (EUR estimate each), face (exchange value each), status (legal|exch|demo|check),
where, color, front, back, note, photos { front, back }, folders [], fav, created, updated`.
`cc`/`region` are derived from the country name (`src/data/countries.js`); `ys`/`dated` are
derived at load time (`prepare()` in `src/lib/collection.js`) and not stored.

## Auto-fill (free, on-device)

Nothing here may cost money: no paid APIs, no keys. In the Add/Edit form:
- **Photo → text:** Tesseract OCR runs in the browser (`src/lib/autofill.js`); its worker, wasm
  core and English model are copied into `public/ocr/` by `scripts/ocr-assets.mjs` (gitignored)
  and served by the site itself. `parseText()` finds the issuer/country, denomination, year and
  currency word. The photo's main colour fills the colour field.
- **Currency:** `src/data/currencies.js` — current + older units per country, `guessUnit()`,
  and `exchangeInfo()` with the official euro rates and central-bank exchange deadlines
  (status, exchange value in EUR, where).
- **Legal tender:** `currencyCode()` + `legalTenderAdvice()` (currencies.js) and `src/lib/rates.js`:
  today's value in EUR from the free, keyless currency-api (fawazahmed0, via jsDelivr + mirror),
  cached 12 h on the device; `scripts/rates.mjs` saves a copy as `public/rates.json` at build
  time (fallback, gitignored). Stored in `face`; the detail panel recomputes it live.
- **Same piece already owned:** offers to copy its details. Series suggestions come from the collection.
- Auto-filled fields are highlighted (`.is-auto`) and never overwrite what the user typed.
- Collector values cannot be looked up for free; they stay the user's own estimate.

## Structure

```
src/
  App.jsx                 state, storage, routing, page header, top bar, dialogs
  data/countries.js       all ISO countries + historical issuers, region, flag, aliases
  data/currencies.js      units per country, euro legacy rates + exchange deadlines
  data/meta.js            regions + colours, statuses
  lib/store.js            IndexedDB/localStorage, photo downscaling, export/import, shared sync
  lib/github.js           Publish: commit collection + photos to this repo (GitHub API)
  lib/autofill.js         OCR (Tesseract, on-device) + text parsing + photo colour
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
    PublishDialog.jsx     one-time GitHub key setup for Publish
    Modal.jsx             dialog shell (full-screen sheet on phones)
    NoteArt.jsx           drawn note/coin; shows item.photos.front/back when present
    Flag.jsx              flag-icons SVG per country (loaded on demand); code tile otherwise
  flags/<code>.svg        own flags for former states (e.g. yu = Yugoslavia), 4:3 like flag-icons
    Icon.jsx, Segmented.jsx
scripts/publish.mjs       data/collection.json → public/shared (runs before dev/build)
scripts/rates.mjs         saves today's exchange rates as public/rates.json (build only)
scripts/ocr-assets.mjs    copies the OCR engine + model into public/ocr (runs before dev/build)
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

- Live sync between devices (e.g. Supabase) — needs a free project slot.
- CSV export.
- Optional: Dutch UI, dark mode.
