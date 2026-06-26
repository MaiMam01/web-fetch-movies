import { useEffect, useRef, useState } from "react";
import { IconChevronRight } from "./Icons.jsx";
import { getCharacterFull } from "../services/jikan.js";
import CharacterCircle, {
  displayFirstName,
} from "./CharacterCircle.jsx";

/**
 * Curated list of iconic / mainstream anime characters that almost everyone
 * recognizes — mixes family-friendly mascots (Doraemon, Shinchan, Pikachu)
 * with shonen heavyweights. Each entry has a baked-in MAL `id` so we can
 * fetch the character directly (no search step) AND so the rail still renders
 * a clickable "editorial" circle for every character even when Jikan is
 * down — only the avatar image is missing in that case.
 */
const ICONIC_CHARACTERS = [
  { id: 7723, name: "Doraemon" },
  { id: 16104, name: "Shin Nohara" }, // Crayon Shin-chan
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

// Builds an "editorial-only" character object that renders correctly even
// when the Jikan API never returns. The MAL `mal_id` links to the proper
// detail page; the gradient ring + first-name label keep the section
// visually populated.
function seedCharacter(entry) {
  return {
    mal_id: entry.id,
    name: entry.name,
    images: { webp: {}, jpg: {} },
    _label: displayFirstName(entry.name),
  };
}

const INITIAL_CHARACTERS = ICONIC_CHARACTERS.map(seedCharacter);

export default function CharacterCircleRail() {
  // Seed with the editorial list so the rail renders immediately. The async
  // fetch below replaces each entry with its API-enriched copy (which adds
  // the avatar image) as data arrives.
  const [items, setItems] = useState(INITIAL_CHARACTERS);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      // Fetch in parallel — the global Jikan rate limiter paces requests so we
      // can't burst past API limits. Each successful response updates the rail
      // in-place via mal_id match, keeping the static fallback for any that
      // fail.
      await Promise.all(
        ICONIC_CHARACTERS.map(async (entry) => {
          if (cancelled) return;
          try {
            const c = await getCharacterFull(entry.id);
            if (cancelled || !c) return;
            setItems((prev) =>
              prev.map((p) =>
                p.mal_id === entry.id
                  ? { ...c, _label: displayFirstName(entry.name) }
                  : p
              )
            );
          } catch {
            /* keep the seed entry — graceful degradation */
          }
        })
      );
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.7 * dir, behavior: "smooth" });
  };

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 ring-1 ring-amber-400/30">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
            </span>
            Fan favourites
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Faces you already know
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            From mascots to shonen icons — tap any to open their profile.
          </p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 hover:text-white active:scale-95"
          >
            <IconChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 hover:text-white active:scale-95"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {items.map((c) => (
          <CharacterCircle key={c.mal_id} character={c} />
        ))}
      </div>
    </section>
  );
}
