/**
 * Pre-bake the /categories page data:
 *   - All genres / themes / demographics with their MAL counts
 *   - A representative backdrop image URL per popular genre
 *
 * Writes src/data/categories.json — consumed by Categories.jsx so the page
 * paints with all tiles AND backdrops on the very first render.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "categories.json");

const POPULAR_NAMES = [
  "Action",
  "Adventure",
  "Drama",
  "Romance",
  "Comedy",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Supernatural",
  "Slice of Life",
  "Sports",
  "Avant Garde",
];

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

const out = { genres: [], themes: [], demographics: [], backdrops: {} };

for (const [key, filter] of [
  ["genres", "genres"],
  ["themes", "themes"],
  ["demographics", "demographics"],
]) {
  try {
    const j = await fetchJson(
      `https://api.jikan.moe/v4/genres/anime?filter=${filter}`
    );
    out[key] = (j?.data ?? []).map((g) => ({
      mal_id: g.mal_id,
      name: g.name,
      count: g.count,
    }));
    console.log(`✓ ${key}: ${out[key].length} entries`);
  } catch (e) {
    console.log(`✗ ${key}: ${e.message}`);
  }
  await sleep(PACE);
}

// Fetch a backdrop image for every popular genre (and a few extras for the
// "All" rail in case the user sorts by something unusual).
const popularGenreObjs = POPULAR_NAMES.map((name) =>
  out.genres.find((g) => g.name === name)
).filter(Boolean);
const extras = out.genres
  .filter((g) => !POPULAR_NAMES.includes(g.name))
  .slice(0, 8);
const toFetch = [...popularGenreObjs, ...extras];

for (const g of toFetch) {
  try {
    const j = await fetchJson(
      `https://api.jikan.moe/v4/anime?genres=${g.mal_id}&limit=1&order_by=popularity&sort=asc`
    );
    const top = j?.data?.[0];
    const im = top?.images ?? {};
    out.backdrops[g.mal_id] =
      im.webp?.large_image_url ??
      im.webp?.image_url ??
      im.jpg?.large_image_url ??
      im.jpg?.image_url ??
      null;
    console.log(`✓ ${g.name} → ${out.backdrops[g.mal_id]}`);
  } catch (e) {
    console.log(`✗ ${g.name}: ${e.message}`);
    out.backdrops[g.mal_id] = null;
  }
  // Persist progress so a kill mid-run doesn't lose state.
  writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
  await sleep(PACE);
}

writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
const withBackdrop = Object.values(out.backdrops).filter(Boolean).length;
console.log(
  `\nDone. genres=${out.genres.length} themes=${out.themes.length} demographics=${out.demographics.length} backdrops=${withBackdrop}`
);
