/**
 * Pre-bake the Stories (vertical reels) feed. Hits /anime/{id}/videos for a
 * curated list of popular titles and saves YouTube IDs + thumbnails into
 * src/data/storyReels.json. The Stories page seeds from this file so the
 * grid is fully populated on first paint without depending on Jikan at all.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "data", "storyReels.json");

// Hand-picked popular titles likely to have OP/ED + promo reels.
const SOURCES = [
  { mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", members: 3400000 },
  { mal_id: 16498, title: "Attack on Titan", members: 3900000 },
  { mal_id: 9253, title: "Steins;Gate", members: 2700000 },
  { mal_id: 1535, title: "Death Note", members: 4200000 },
  { mal_id: 11061, title: "Hunter x Hunter (2011)", members: 2900000 },
  { mal_id: 38000, title: "Demon Slayer: Kimetsu no Yaiba", members: 3700000 },
  { mal_id: 40748, title: "Jujutsu Kaisen", members: 2500000 },
  { mal_id: 21, title: "One Piece", members: 2700000 },
  { mal_id: 20, title: "Naruto", members: 2300000 },
  { mal_id: 1735, title: "Naruto: Shippuuden", members: 1900000 },
  { mal_id: 52991, title: "Sousou no Frieren", members: 900000 },
  { mal_id: 50265, title: "Spy x Family", members: 1400000 },
  { mal_id: 30276, title: "One Punch Man", members: 2700000 },
  { mal_id: 22319, title: "Tokyo Ghoul", members: 2400000 },
  { mal_id: 31964, title: "Boku no Hero Academia", members: 2400000 },
  { mal_id: 1575, title: "Code Geass: Hangyaku no Lelouch", members: 1900000 },
  { mal_id: 4181, title: "Clannad: After Story", members: 1200000 },
  { mal_id: 28977, title: "Gintama°", members: 320000 },
  { mal_id: 199, title: "Spirited Away", members: 950000 },
  { mal_id: 32281, title: "Kimi no Na wa.", members: 2000000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE = 800;

async function fetchJson(url, n = 0) {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if ((res.status === 429 || res.status >= 500) && n < 4) {
    const wait = 2000 * 2 ** n;
    console.log(`  ${res.status} → retry in ${wait}ms`);
    await sleep(wait);
    return fetchJson(url, n + 1);
  }
  throw new Error(`${res.status}`);
}

// Jikan's `youtube_id` field is often `null` even when a video exists — the
// actual ID lives inside `embed_url` (e.g. `youtube-nocookie.com/embed/XXXX`).
function pickYouTubeId(node) {
  if (!node) return null;
  if (node.youtube_id) return node.youtube_id;
  const m = (node.embed_url || node.url || "").match(/embed\/([\w-]{6,})/);
  return m ? m[1] : null;
}

// Resume support — if the file exists, skip sources whose reels are already
// captured. This means partial runs converge over a few invocations.
let existing = [];
try {
  existing = JSON.parse(readFileSync(FILE, "utf8"));
} catch {}
const captured = new Set(existing.map((s) => s.id));
const out = [...existing];

function persist() {
  writeFileSync(FILE, JSON.stringify(out, null, 2) + "\n");
}

for (const src of SOURCES) {
  const alreadyHave = out.some((s) => s.anime_mal_id === src.mal_id);
  if (alreadyHave) {
    console.log(`· ${src.title} (cached)`);
    continue;
  }
  try {
    const json = await fetchJson(
      `https://api.jikan.moe/v4/anime/${src.mal_id}/videos`
    );
    const v = json?.data ?? {};
    let added = 0;

    for (const mv of v.music_videos ?? []) {
      const yt = pickYouTubeId(mv.video);
      if (!yt) continue;
      const id = `mv-${src.mal_id}-${yt}`;
      if (captured.has(id)) continue;
      captured.add(id);
      out.push({
        id,
        kind: "music",
        title: mv.meta?.title || mv.title || "Music Video",
        anime_title: src.title,
        anime_mal_id: src.mal_id,
        youtube_id: yt,
        image: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
        views: src.members,
      });
      added += 1;
    }

    (v.promo ?? []).forEach((p, i) => {
      const yt = pickYouTubeId(p.trailer);
      if (!yt) return;
      const id = `pr-${src.mal_id}-${yt}-${i}`;
      if (captured.has(id)) return;
      captured.add(id);
      out.push({
        id,
        kind: "promo",
        title: p.title || "Promo",
        anime_title: src.title,
        anime_mal_id: src.mal_id,
        youtube_id: yt,
        image:
          p.trailer?.images?.maximum_image_url ??
          p.trailer?.images?.large_image_url ??
          `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
        views: src.members,
      });
      added += 1;
    });

    persist();
    console.log(`✓ ${src.title} (+${added} reels, total ${out.length})`);
  } catch (e) {
    console.log(`✗ ${src.title} — ${e.message}`);
  }
  await sleep(PACE);
}

persist();
console.log(`\nDone. ${out.length} reels cached → ${FILE}`);
