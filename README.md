# Collectie

Viewer for a collection of banknotes and coins — folders by type and country, a timeline by decade,
and a flip-card detail view for every note.

## Live on GitHub Pages — no commands needed

Every push to `main` is built and published automatically by
`.github/workflows/deploy.yml`. Editing a file on github.com is enough:
about a minute later the site is updated.

**One-time setup:** repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site is then at `https://idkmanlool9.github.io/geld/`.

## Add to Home Screen (full screen)

Open the site in Safari → Share → **Add to Home Screen**. Opened from the icon it runs
full screen as its own app, without Safari's address bar or toolbar. On Android,
Chrome's menu → **Add to Home screen / Install app** does the same.

## Run it locally (optional)

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Continue in Claude Code

Open a terminal in this folder and run `claude`. `CLAUDE.md` explains the structure,
the data rules and what to build next.

## Share the collection with everyone

1. In the app, tap **Export** (top right). You get one file, `collection.json`, with every
   piece, photo and folder.
2. Put that file in this repository as `data/collection.json` (send it to Claude, or on
   github.com: open `data/` → **Add file → Upload files**).
3. About a minute later everyone who opens the site or the home-screen app gets the same collection.
