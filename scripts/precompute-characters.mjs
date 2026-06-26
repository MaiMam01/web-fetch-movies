/**
 * Fetch character avatar URLs one at a time with generous spacing.
 * The /characters endpoint is flaky (504s) — this script persists the
 * partial cache to disk after EVERY successful fetch, so re-running it
 * picks up exactly where it left off and converges over a few runs.
 *
 * Writes src/data/iconicCharacters.json (consumed by CharacterCircleRail).
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "iconicCharacters.json");

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE = 1500;

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 3) {
    const wait = 3000 * 2 ** n;
    console.log(`  ${res.status} → retry in ${wait}ms`);
    await sleep(wait);
    return fetchJson(url, n + 1);
  }
  throw new Error(`${res.status}`);
}

let existing = [];
try {
  existing = JSON.parse(readFileSync(FILE, "utf8"));
} catch {}
const byId = new Map(existing.map((e) => [e.id, e]));

function persist() {
  const out = ICONIC.map(
    (e) => byId.get(e.id) ?? { id: e.id, name: e.name, cached_image: null }
  );
  writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
}

for (const entry of ICONIC) {
  const cur = byId.get(entry.id);
  if (cur?.cached_image) {
    console.log(`· ${entry.name} (cached)`);
    continue;
  }
  try {
    const json = await fetchJson(
      `https://api.jikan.moe/v4/characters/${entry.id}`
    );
    const c = json?.data;
    const im = c?.images ?? {};
    const image_url = im.webp?.image_url ?? im.jpg?.image_url ?? null;
    const image_large = im.webp?.image_url ?? im.jpg?.image_url ?? null; // characters only expose 1 size
    byId.set(entry.id, {
      id: entry.id,
      name: c?.name || entry.name,
      cached_image: image_url,
      cached_image_large: image_large,
    });
    persist(); // persist after every success
    console.log(`✓ ${entry.name} → ${image_url}`);
  } catch (e) {
    console.log(`✗ ${entry.name} — ${e.message}`);
    if (!byId.has(entry.id)) {
      byId.set(entry.id, { id: entry.id, name: entry.name, cached_image: null });
      persist();
    }
  }
  await sleep(PACE);
}

persist();
const hit = [...byId.values()].filter((c) => c.cached_image).length;
console.log(`\nDone. ${hit} / ${ICONIC.length} cached → ${FILE}`);
