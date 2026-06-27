/**
 * Fetch a SECOND image per iconic character from /characters/{id}/pictures
 * so the hover-pop avatar effect can cross-fade between two different
 * poses/angles of the same character.
 *
 * Writes the alternate URL back into src/data/iconicCharacters.json under
 * the `hover_image` key (leaves all other fields untouched).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");
const FILE = join(DATA_DIR, "iconicCharacters.json");

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

async function run() {
  const list = JSON.parse(readFileSync(FILE, "utf8"));
  let updated = 0;

  for (const entry of list) {
    if (entry.hover_image) {
      // Skip if already populated
      continue;
    }
    try {
      const json = await fetchJson(
        `https://api.jikan.moe/v4/characters/${entry.id}/pictures`
      );
      const alt = pickAlternate(json?.data ?? [], entry.cached_image);
      if (alt) {
        entry.hover_image = alt;
        updated += 1;
        console.log(`✓ ${entry.name}: alternate pose set`);
      } else {
        console.log(`· ${entry.name}: no alternate available`);
      }
    } catch (e) {
      console.log(`✗ ${entry.name}: ${e.message}`);
    }
    await sleep(PACE);
  }

  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n");
  console.log(`\nDone — added hover image for ${updated} characters.`);
}

run();
