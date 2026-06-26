/**
 * For every genre on the /categories page, bake page 1 of its default sort
 * (score|desc) so the /categories/:id detail page paints with content
 * instantly. Covers the vast majority of user clicks — the only time we hit
 * the API is when the user paginates or changes the sort/type filter.
 *
 * Output: src/data/genreAnimePage1.json
 *   { [genreId]: { items: [...], total: number } }
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "genreAnimePage1.json");
const CATEGORIES_FILE = join(__dirname, "..", "src", "data", "categories.json");

const cats = JSON.parse(readFileSync(CATEGORIES_FILE, "utf8"));
const allGenres = [
  ...cats.genres,
  ...cats.themes,
  ...cats.demographics,
];

// To keep the bundle reasonable, only bake the most-visited genres.
// Themes & demographics fall through to the live API.
const PRIORITY_NAMES = new Set([
  "Action", "Adventure", "Drama", "Romance", "Comedy", "Fantasy", "Sci-Fi",
  "Mystery", "Supernatural", "Slice of Life", "Sports", "Avant Garde",
  "Award Winning", "Horror", "Suspense", "Boys Love", "Girls Love",
  "Gourmet", "Ecchi", "Erotica", "Hentai",
]);
const targets = cats.genres.filter((g) => PRIORITY_NAMES.has(g.name));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE = 700;

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 3) {
    await sleep(2000 * 2 ** n);
    return fetchJson(url, n + 1);
  }
  throw new Error(`${res.status} ${url}`);
}

let existing = {};
try {
  existing = JSON.parse(readFileSync(FILE, "utf8"));
} catch {}
const out = { ...existing };

function persist() {
  writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
}

for (const g of targets) {
  if (out[g.mal_id]?.items?.length) {
    console.log(`· ${g.name} (cached)`);
    continue;
  }
  try {
    const j = await fetchJson(
      `https://api.jikan.moe/v4/anime?genres=${g.mal_id}&limit=24&page=1&order_by=score&sort=desc`
    );
    const items = (j?.data ?? []).map((a) => ({
      mal_id: a.mal_id,
      title: a.title,
      title_english: a.title_english ?? null,
      year: a.year ?? a.aired?.prop?.from?.year ?? null,
      score: a.score ?? null,
      episodes: a.episodes ?? null,
      type: a.type ?? null,
      members: a.members ?? null,
      images: {
        webp: {
          image_url: a.images?.webp?.image_url ?? null,
          large_image_url: a.images?.webp?.large_image_url ?? null,
        },
        jpg: {
          image_url: a.images?.jpg?.image_url ?? null,
          large_image_url: a.images?.jpg?.large_image_url ?? null,
        },
      },
      genres: (a.genres ?? []).slice(0, 3).map((x) => ({
        mal_id: x.mal_id,
        name: x.name,
      })),
    }));
    out[g.mal_id] = {
      items,
      total: j?.pagination?.items?.total ?? null,
      last_visible_page: j?.pagination?.last_visible_page ?? null,
    };
    persist();
    console.log(`✓ ${g.name} (${items.length} items, total ${out[g.mal_id].total})`);
  } catch (e) {
    console.log(`✗ ${g.name} — ${e.message}`);
  }
  await sleep(PACE);
}

persist();
console.log(`\nDone. ${Object.keys(out).length} genres cached.`);
