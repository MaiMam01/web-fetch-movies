/**
 * Fetch image URLs for every anime in the BestOfAllTime FALLBACK_TOP list.
 * Writes a flat lookup map of {mal_id: {image_url, large_image_url}} to
 * src/data/bestOfAllTimePosters.json that the slider component imports.
 *
 * Uses /anime/{id} which has been more reliable than /top in our testing.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "bestOfAllTimePosters.json");

const IDS = [
  // tv
  52991, 5114, 9253, 28977, 41467, 11061, 9969, 53998, 820, 35247, 15417, 4181,
  16498, 1575,
  // movies
  199, 28851, 32281, 431, 164, 578, 38000, 50594, 437, 523, 47, 43, 1689, 372,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE = 800;

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 4) {
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

for (const id of IDS) {
  if (out[id]?.image_url) {
    console.log(`· ${id} (already cached)`);
    continue;
  }
  try {
    const json = await fetchJson(`https://api.jikan.moe/v4/anime/${id}`);
    const im = json?.data?.images ?? {};
    out[id] = {
      image_url: im.webp?.image_url ?? im.jpg?.image_url ?? null,
      large_image_url:
        im.webp?.large_image_url ??
        im.jpg?.large_image_url ??
        im.webp?.image_url ??
        null,
    };
    console.log(`✓ ${id} → ${out[id].image_url}`);
  } catch (e) {
    console.log(`✗ ${id} — ${e.message}`);
  }
  // Persist on every iteration so partial runs aren't lost.
  writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
  await sleep(PACE);
}

const hit = Object.values(out).filter((p) => p.image_url).length;
console.log(`\nDone. ${hit} / ${IDS.length} cached → ${FILE}`);
