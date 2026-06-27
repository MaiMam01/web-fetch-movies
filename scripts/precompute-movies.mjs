/**
 * Bake the top anime MOVIES list so the Landing page can render the movie
 * chip slider instantly without a live Jikan call on first paint.
 *
 * Output: src/data/topMovies.json (array of 24 movies, lightly trimmed).
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 3) {
    await sleep(2000 * 2 ** n);
    return fetchJson(url, n + 1);
  }
  throw new Error(`${res.status} ${url}`);
}

try {
  const json = await fetchJson(
    "https://api.jikan.moe/v4/top/anime?page=1&limit=24&type=movie"
  );
  const data = (json?.data ?? []).map((m) => ({
    mal_id: m.mal_id,
    title: m.title,
    title_english: m.title_english,
    year: m.year ?? m?.aired?.prop?.from?.year ?? null,
    score: m.score,
    rank: m.rank,
    duration: m.duration,
    images: {
      jpg: {
        small_image_url: m.images?.jpg?.small_image_url,
        image_url: m.images?.jpg?.image_url,
      },
      webp: {
        small_image_url: m.images?.webp?.small_image_url,
        image_url: m.images?.webp?.image_url,
      },
    },
  }));
  writeFileSync(
    join(DATA_DIR, "topMovies.json"),
    JSON.stringify(data, null, 2) + "\n"
  );
  console.log(`✓ Top Movies: ${data.length} entries → topMovies.json`);
} catch (e) {
  console.log(`✗ Top Movies: ${e.message}`);
}
