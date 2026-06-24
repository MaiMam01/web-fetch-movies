# AnimeDB — The IMDB for Anime

A React + Vite + Tailwind site that catalogs anime like IMDB does for movies, plus a curated catalog of notable (often violent) scenes per series.

> ⚠️ The `/scenes` section is gated behind an 18+ confirmation by design.

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS v4** (via `@tailwindcss/vite`, CSS-first config in `src/index.css`)
- **React Router v6**
- Anime data: **Jikan v4** (free MyAnimeList REST API — no key required)
- Deploy target: **Vercel**

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Project structure

```
src/
  components/
    Header.jsx
    Footer.jsx
    AnimeCard.jsx
    AgeGate.jsx          # 18+ confirmation gate
  pages/
    Landing.jsx          # Hero + featured + top-rated grid
    AnimeDetail.jsx      # IMDB-style detail page (synopsis, episodes, chars)
    Scenes.jsx           # Curated scene catalog (gated)
    NotFound.jsx
  services/
    jikan.js             # All MyAnimeList API calls (cached)
  data/
    featuredTitles.json  # The top-10 anime names you provide
    scenes.json          # Curated scene entries (schema documented in file)
```

## Adding your top-10 list

Put the titles in `src/data/featuredTitles.json`:

```json
["Attack on Titan", "Death Note", "Vinland Saga", "..."]
```

On load the landing page will look each one up via Jikan and show them in the
**Featured** rail, in the order you listed.

## Adding scene entries

Add objects to the `scenes` array in `src/data/scenes.json`. The schema is
documented in the same file under `_schema_doc`. Required fields:
`id`, `mal_id`, `anime_title`, `season`, `episode`, `timestamp`, `title`,
`description`, `severity` (`mild|moderate|graphic|extreme`).

Put scene screenshots in `public/scenes/<id>.jpg` and set `image: "/scenes/<id>.jpg"`.

## Deploying

Push to GitHub, import the repo in Vercel — the included `vercel.json` rewrite
handles client-side routes.
