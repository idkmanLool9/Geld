# Collectie — banknote & coin collection viewer

A personal web app for browsing Levi's collection of foreign banknotes and coins:
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
  (`#home`, `#country:BE`, `#decade:1990`, `#highlights`, …) so refresh and back work.
- Favorites are saved in `localStorage` (`collection-favs`).

## Structure

```
src/
  App.jsx                 state, routing, page header, top bar
  data/items.js           THE collection (one entry per distinct note/coin) — field docs at the top
  data/meta.js            regions + colours, currencies, statuses, folder names, deadlines
  data/flags.js           simplified flags as stripes + positioned marks
  lib/collection.js       filtering, sorting, totals (sumUp), countries, badges
  lib/format.js           eur(), range(), plural()
  components/
    Sidebar.jsx           library / folders / countries navigation
    Overview.jsx          home: hero, callouts, collection folders, country folders, timeline
    Folder.jsx            the yellow folder tile (notes peek out of the top)
    ItemsView.jsx         summary tiles, toolbar, grid + list, empty state
    DetailPanel.jsx       flip card, values, exchange info, facts, notes, folder chips
    NoteArt.jsx           drawn note/coin; shows item.photos.front/back when present
    Flag.jsx, Icon.jsx, Segmented.jsx
```

## Data rules

- All facts and values come from Levi's catalogue document
  ("Bankbiljettencollectie — catalogus & waardebepaling"). Do not invent notes, values,
  dates or exchange rules. Unknowns stay marked as unknown (`status: 'check'`, folder `identify`).
- Values are EUR collector estimates for circulated condition, per piece (`lo`–`hi`).
- The unsorted Israeli stack (`stack: '30–60'`) is not counted in totals.
- Smart folders are tags in `item.folders`; "Favorites" is per-browser.

## Design rules

- Apple-style: system font stack, light grey ground `#F5F5F7`, white cards with large radii,
  one blue accent `#0071E3`, yellow Finder-style folders. Calm and flat.
- Levi dislikes the "AI-made" look: no purple/rainbow gradients, no glassmorphism,
  no pastel washes, no emoji, no left-border accent cards.
- Real `<button>`s and `<a>`s, visible focus rings, text contrast ≥ 4.5:1, touch targets ~40–44px.
- Must work at phone width (sidebar turns into a horizontal strip under 720px).

## Roadmap (not built yet)

1. **Add item** form (the button is a placeholder) — save to a real store
   (localStorage first, or Supabase later) instead of the hard-coded `items.js`.
2. **Photo upload** for front/back — `NoteArt` already renders `item.photos.front/back`.
3. **New folder** — user-defined folders and moving items between them.
4. Edit / delete items; export to CSV.
5. More rounds of notes are coming (Levi has many more); the Israeli stack still has to be sorted.
6. Optional: Dutch UI, dark mode.
