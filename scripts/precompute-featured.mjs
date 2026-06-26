/**
 * One-time data baker: enriches `src/data/featuredTitles.json` with mal_id +
 * cached image URLs so the Landing page's editorial sections render INSTANTLY
 * from static data instead of doing 19 separate Jikan search calls on every
 * cold load.
 *
 * Run with:    node scripts/precompute-featured.mjs
 * Re-run when adding/changing entries. Safe to re-run — skips entries that
 * already have a mal_id baked in unless you pass --force.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "featuredTitles.json");
const FORCE = process.argv.includes("--force");

const data = JSON.parse(readFileSync(FILE, "utf8"));

async function search(query) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
    query
  )}&limit=1&order_by=popularity&sort=asc`;
  let attempts = 0;
  while (true) {
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      return json.data?.[0] ?? null;
    }
    if (res.status === 429 && attempts < 5) {
      attempts += 1;
      const wait = 1500 * 2 ** attempts;
      console.log(`  → 429, retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`${res.status} ${res.statusText}`);
  }
}

async function enrich() {
  let modified = 0;
  for (const list of ["tv", "films"]) {
    for (const entry of data[list]) {
      if (!FORCE && entry.mal_id) {
        console.log(`· skip (cached): ${entry.title}`);
        continue;
      }
      const q = entry.search ?? entry.title;
      try {
        const hit = await search(q);
        if (!hit) {
          console.log(`✗ no match: ${entry.title}`);
          continue;
        }
        entry.mal_id = hit.mal_id;
        entry.cached_title = hit.title;
        entry.cached_title_english = hit.title_english ?? null;
        entry.cached_year = hit.year ?? hit.aired?.prop?.from?.year ?? null;
        entry.cached_score = hit.score ?? null;
        entry.cached_episodes = hit.episodes ?? null;
        entry.cached_type = hit.type ?? null;
        entry.cached_poster_large =
          hit.images?.webp?.large_image_url ??
          hit.images?.jpg?.large_image_url ??
          null;
        entry.cached_poster =
          hit.images?.webp?.image_url ??
          hit.images?.jpg?.image_url ??
          entry.cached_poster_large;
        entry.cached_genres = (hit.genres ?? [])
          .slice(0, 3)
          .map((g) => ({ mal_id: g.mal_id, name: g.name }));
        modified += 1;
        console.log(`✓ ${entry.title} → ${hit.mal_id}`);
      } catch (e) {
        console.log(`✗ error: ${entry.title} — ${e.message}`);
      }
      // Pace requests to stay under Jikan's 3 req/sec + 60/min cap.
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  if (modified > 0) {
    writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
    console.log(`\nWrote ${modified} updated entries → ${FILE}`);
  } else {
    console.log("\nNothing to update.");
  }
}

enrich().catch((e) => {
  console.error(e);
  process.exit(1);
});
