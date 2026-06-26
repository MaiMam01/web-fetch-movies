// Enrich storyReels.json source anime with poster + stats.
//
// The reel grid + player both want to show the source anime as a "creator"
// (poster, episode count, score, members, synopsis snippet). We bake those
// once into `src/data/reelAnimeMeta.json` keyed by mal_id so the player can
// render its right rail instantly with zero Jikan calls.
//
// Run via `node scripts/precompute-reel-anime.mjs`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REELS_PATH = path.join(ROOT, "src", "data", "storyReels.json");
const OUT_PATH = path.join(ROOT, "src", "data", "reelAnimeMeta.json");

const JIKAN = "https://api.jikan.moe/v4";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJsonRetrying(url, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 429) {
        const wait = 1500 * (i + 1);
        console.warn(`429 on ${url} — waiting ${wait}ms`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

function trimSynopsis(s) {
  if (!s) return "";
  const flat = s.replace(/\s+/g, " ").trim();
  if (flat.length <= 280) return flat;
  return flat.slice(0, 277).trimEnd() + "…";
}

async function main() {
  const reels = JSON.parse(fs.readFileSync(REELS_PATH, "utf8"));
  const ids = [...new Set(reels.map((r) => r.anime_mal_id).filter(Boolean))];
  console.log(`Resolving anime meta for ${ids.length} unique anime`);

  const out = {};
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const url = `${JIKAN}/anime/${id}`;
    try {
      const json = await fetchJsonRetrying(url);
      const a = json?.data;
      if (a) {
        out[id] = {
          mal_id: id,
          title: a.title_english || a.title,
          title_japanese: a.title_japanese,
          poster:
            a.images?.webp?.large_image_url ??
            a.images?.jpg?.large_image_url ??
            null,
          poster_small:
            a.images?.webp?.image_url ?? a.images?.jpg?.image_url ?? null,
          score: a.score ?? null,
          members: a.members ?? null,
          favorites: a.favorites ?? null,
          episodes: a.episodes ?? null,
          year: a.year ?? a.aired?.prop?.from?.year ?? null,
          synopsis: trimSynopsis(a.synopsis),
          type: a.type ?? null,
          studio: a.studios?.[0]?.name ?? null,
        };
        console.log(`  ✓ ${id} · ${out[id].title}`);
      } else {
        console.warn(`  · ${id} returned no data`);
      }
    } catch (e) {
      console.warn(`  ✗ ${id} failed: ${e.message}`);
    }
    // Be polite to the public Jikan endpoint
    await sleep(900);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`Wrote ${Object.keys(out).length} entries to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
