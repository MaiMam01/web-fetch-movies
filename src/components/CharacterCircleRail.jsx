import { useRef } from "react";
import { IconChevronRight } from "./Icons.jsx";
import CharacterCircle from "./CharacterCircle.jsx";
import ICONIC from "../data/iconicCharacters.json";

/**
 * Iconic anime characters rail. Sourced from the baked-in JSON file
 * (src/data/iconicCharacters.json) which is populated via
 * scripts/precompute-characters.mjs. Every entry already has a verified
 * MAL `id` and a `cached_image` URL, so the avatars show up instantly on
 * first render — no Jikan API calls required.
 *
 * If you want to refresh / extend the list, edit the JSON directly (image
 * URLs come straight from cdn.myanimelist.net and remain stable).
 */
const ITEMS = ICONIC.map((entry) => ({
  mal_id: entry.id,
  name: entry.name,
  images: {
    webp: { image_url: entry.cached_image ?? null },
    jpg: { image_url: entry.cached_image ?? null },
  },
  _label: entry.label,
}));

export default function CharacterCircleRail() {
  const scrollerRef = useRef(null);

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
        {ITEMS.map((c) => (
          <CharacterCircle key={c.mal_id} character={c} />
        ))}
      </div>
    </section>
  );
}
