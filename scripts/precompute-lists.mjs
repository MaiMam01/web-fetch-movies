/**
 * Bake the first page of /top/characters, /top/people, and /top/anime into
 * static JSON files. The corresponding pages seed from these on first paint
 * so users see content INSTANTLY — the live API call still happens but only
 * as a background refresh after the page is interactive.
 *
 * Generated files (consumed by their respective page components):
 *   - src/data/topCharacters.json
 *   - src/data/topPeople.json
 *   - src/data/topAnimeList.json
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE = 600;

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 3) {
    await sleep(2000 * 2 ** n);
    return fetchJson(url, n + 1);
  }
  throw new Error(`${res.status} ${url}`);
}

async function bake(endpoint, file, label) {
  try {
    const json = await fetchJson(`https://api.jikan.moe/v4${endpoint}`);
    const data = json?.data ?? [];
    writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2) + "\n");
    console.log(`✓ ${label}: ${data.length} entries → ${file}`);
  } catch (e) {
    console.log(`✗ ${label}: ${e.message}`);
  }
}

await bake("/top/characters?page=1", "topCharacters.json", "Top Characters");
await sleep(PACE);

await bake("/top/people?page=1", "topPeople.json", "Top People");
await sleep(PACE);

await bake("/top/anime?page=1&limit=24", "topAnimeList.json", "Top Anime");

console.log("\nDone.");
