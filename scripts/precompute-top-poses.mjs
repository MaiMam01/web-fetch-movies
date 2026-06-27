/**
 * Fetch a SECOND image per Top Character & Top Person so the PersonCard grid
 * can cross-fade to an alternate pose on hover (same UX as the Faces You
 * Already Know rail).
 *
 * Writes a `_hover_image` field back into:
 *   src/data/topCharacters.json
 *   src/data/topPeople.json
 *
 * Idempotent — entries that already have `_hover_image` are skipped.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE = 900;

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 3) {
    await sleep(2500 * 2 ** n);
    return fetchJson(url, n + 1);
  }
  throw new Error(`${res.status} ${url}`);
}

function pickAlternate(pictures, primary) {
  if (!Array.isArray(pictures) || pictures.length === 0) return null;
  for (const p of pictures) {
    const url = p?.webp?.image_url || p?.jpg?.image_url;
    if (url && url !== primary) return url;
  }
  return null;
}

async function enrich(file, kind) {
  const path = join(DATA_DIR, file);
  const list = JSON.parse(readFileSync(path, "utf8"));
  let updated = 0;
  for (const entry of list) {
    if (entry._hover_image) continue;
    if (!entry.mal_id) continue;
    try {
      const primary =
        entry.images?.webp?.image_url || entry.images?.jpg?.image_url;
      const json = await fetchJson(
        `https://api.jikan.moe/v4/${kind}/${entry.mal_id}/pictures`
      );
      const alt = pickAlternate(json?.data ?? [], primary);
      if (alt) {
        entry._hover_image = alt;
        updated += 1;
        console.log(`✓ ${entry.name}`);
      } else {
        console.log(`· ${entry.name}: no alternate`);
      }
    } catch (e) {
      console.log(`✗ ${entry.name}: ${e.message}`);
    }
    await sleep(PACE);
  }
  writeFileSync(path, JSON.stringify(list, null, 2) + "\n");
  console.log(`→ ${file}: ${updated} alternates added`);
}

await enrich("topCharacters.json", "characters");
await enrich("topPeople.json", "people");

console.log("\nDone.");
