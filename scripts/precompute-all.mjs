/**
 * One-time data baker. Hits the Jikan API once to permanently embed image URLs
 * + metadata for every home-page editorial section into JSON files. After this
 * runs, the home page renders images instantly from the static JSON — no API
 * calls required on cold load.
 *
 * Run with:    node scripts/precompute-all.mjs
 * Re-run when Jikan is up to refresh scores. Safe to re-run anytime.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const PACE_MS = 700; // 3 req/s ceiling, stay safely under
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, attempts = 0, maxAttempts = 5) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if (
    (res.status === 429 || res.status >= 500) &&
    attempts < maxAttempts
  ) {
    const wait = 1500 * 2 ** attempts;
    console.log(`  ${res.status} → retry in ${wait}ms`);
    await sleep(wait);
    return fetchJson(url, attempts + 1, maxAttempts);
  }
  throw new Error(`${res.status} ${res.statusText} — ${url}`);
}

function extractImages(images) {
  return {
    image_url:
      images?.webp?.image_url ?? images?.jpg?.image_url ?? null,
    large_image_url:
      images?.webp?.large_image_url ??
      images?.jpg?.large_image_url ??
      images?.webp?.image_url ??
      null,
  };
}

// ---------------------------------------------------------------------------
// 1) Featured editorial TV + Films  (refresh src/data/featuredTitles.json)
// ---------------------------------------------------------------------------
async function bakeFeatured() {
  const file = join(DATA_DIR, "featuredTitles.json");
  const data = JSON.parse(readFileSync(file, "utf8"));
  let modified = 0;

  for (const list of ["tv", "films"]) {
    for (const entry of data[list]) {
      if (!entry.mal_id) {
        console.log(`! ${entry.title} — no mal_id, skipping`);
        continue;
      }
      try {
        const json = await fetchJson(
          `https://api.jikan.moe/v4/anime/${entry.mal_id}/full`
        );
        const a = json?.data;
        if (!a) continue;
        const img = extractImages(a.images);
        entry.cached_title = a.title;
        entry.cached_title_english = a.title_english ?? null;
        entry.cached_year =
          a.year ?? a.aired?.prop?.from?.year ?? null;
        entry.cached_score = a.score ?? null;
        entry.cached_episodes = a.episodes ?? null;
        entry.cached_type = a.type ?? null;
        entry.cached_poster = img.image_url;
        entry.cached_poster_large = img.large_image_url;
        entry.cached_genres = (a.genres ?? [])
          .slice(0, 3)
          .map((g) => ({ mal_id: g.mal_id, name: g.name }));
        modified += 1;
        console.log(`✓ ${entry.title} → ${img.image_url}`);
      } catch (e) {
        console.log(`✗ ${entry.title} — ${e.message}`);
      }
      await sleep(PACE_MS);
    }
  }

  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`\n[featured] updated ${modified} entries → ${file}`);
}

// ---------------------------------------------------------------------------
// 2) Iconic characters  (create src/data/iconicCharacters.json)
// ---------------------------------------------------------------------------
const ICONIC = [
  { id: 7723, name: "Doraemon" },
  { id: 16104, name: "Shin Nohara" },
  { id: 169, name: "Pikachu" },
  { id: 17, name: "Naruto Uzumaki" },
  { id: 13, name: "Sasuke Uchiha" },
  { id: 246, name: "Son Goku" },
  { id: 913, name: "Vegeta" },
  { id: 40, name: "Monkey D. Luffy" },
  { id: 62, name: "Roronoa Zoro" },
  { id: 5, name: "Ichigo Kurosaki" },
  { id: 80, name: "Light Yagami" },
  { id: 71, name: "L Lawliet" },
  { id: 11, name: "Edward Elric" },
  { id: 40882, name: "Eren Yeager" },
  { id: 45627, name: "Levi Ackerman" },
  { id: 40881, name: "Mikasa Ackerman" },
  { id: 146156, name: "Tanjiro Kamado" },
  { id: 146157, name: "Nezuko Kamado" },
  { id: 113138, name: "Saitama" },
  { id: 417, name: "Lelouch Lamperouge" },
  { id: 1, name: "Spike Spiegel" },
  { id: 30, name: "Killua Zoldyck" },
  { id: 31, name: "Gon Freecss" },
  { id: 1057, name: "Astro Boy" },
];

async function bakeCharacters() {
  const file = join(DATA_DIR, "iconicCharacters.json");
  // start from existing file if it exists, so we incrementally fill on re-runs
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    existing = [];
  }
  const byId = new Map(existing.map((e) => [e.id, e]));

  for (const entry of ICONIC) {
    const cached = byId.get(entry.id);
    if (cached?.cached_image) {
      console.log(`· ${entry.name} (already cached)`);
      continue;
    }
    try {
      const json = await fetchJson(
        `https://api.jikan.moe/v4/characters/${entry.id}`,
        0,
        2 // shallow retry — fail fast and move on
      );
      const c = json?.data;
      if (!c) continue;
      const img = extractImages(c.images);
      byId.set(entry.id, {
        id: entry.id,
        name: c.name || entry.name,
        cached_image: img.image_url,
        cached_image_large: img.large_image_url,
      });
      console.log(`✓ ${entry.name} → ${img.image_url}`);
    } catch (e) {
      console.log(`✗ ${entry.name} — ${e.message}`);
      if (!byId.has(entry.id)) {
        byId.set(entry.id, { id: entry.id, name: entry.name, cached_image: null });
      }
    }
    await sleep(PACE_MS);
  }
  // write in the original ICONIC order so the UI stays stable
  const out = ICONIC.map((e) => byId.get(e.id) ?? { id: e.id, name: e.name, cached_image: null });
  writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  const hit = out.filter((c) => c.cached_image).length;
  console.log(`\n[characters] wrote ${out.length} (${hit} with image) → ${file}`);
}

// ---------------------------------------------------------------------------
// 3) Top anime + Top movies  (create src/data/topAnime.json)
// ---------------------------------------------------------------------------
async function bakeTopAnime() {
  const out = { tv: [], movie: [] };
  for (const type of ["tv", "movie"]) {
    try {
      const json = await fetchJson(
        `https://api.jikan.moe/v4/top/anime?limit=14&type=${type}`
      );
      const items = json?.data ?? [];
      for (const a of items) {
        const img = extractImages(a.images);
        out[type].push({
          mal_id: a.mal_id,
          title: a.title,
          title_english: a.title_english ?? null,
          year: a.year ?? a.aired?.prop?.from?.year ?? null,
          score: a.score ?? null,
          cached_poster: img.image_url,
          cached_poster_large: img.large_image_url,
        });
      }
      console.log(`✓ top ${type} → ${out[type].length} entries`);
    } catch (e) {
      console.log(`✗ top ${type} — ${e.message}`);
    }
    await sleep(PACE_MS);
  }
  const file = join(DATA_DIR, "topAnime.json");
  writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log(`\n[top-anime] wrote tv=${out.tv.length} movie=${out.movie.length} → ${file}`);
}

// ---------------------------------------------------------------------------

(async () => {
  const only = process.argv[2]; // optional: featured | characters | top
  if (!only || only === "top") {
    console.log("=== Top Anime + Movies ===");
    await bakeTopAnime();
  }
  if (!only || only === "featured") {
    console.log("\n=== Featured TV + Films ===");
    await bakeFeatured();
  }
  if (!only || only === "characters") {
    console.log("\n=== Iconic Characters ===");
    await bakeCharacters();
  }
  console.log("\nAll done.");
})().catch((e) => {
  console.error("\nFatal:", e);
  process.exit(1);
});
