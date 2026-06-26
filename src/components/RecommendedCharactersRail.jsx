import { useEffect, useRef, useState } from "react";
import { IconChevronRight } from "./Icons.jsx";
import { getCharacters } from "../services/jikan.js";
import CharacterCircle, {
  CharacterCircleSkeleton,
} from "./CharacterCircle.jsx";

/**
 * "Recommended characters" rail — sources its picks from the same anime the
 * current character appears in, so the suggestions stay genre/series relevant
 * without needing a separate recommendation API.
 *
 * Strategy (cheap, no extra heavy endpoints):
 *   1. Take the current character's anime appearances.
 *   2. Prefer the top 3 anime where they have a Main role (fall back to any).
 *   3. For each, fetch /anime/:id/characters (already cached + throttled).
 *   4. Flatten → exclude current char → dedupe by mal_id → sort by favorites.
 *   5. Show the top ~20 in a horizontal scrollable rail of circle avatars.
 *
 * Props:
 *   currentId          mal_id of the character being viewed (excluded from the rail)
 *   animeAppearances   the `anime` array from the character's `getCharacterFull` response
 *   title              section title  (default "Fans also love")
 *   subtitle           microcopy
 */
export default function RecommendedCharactersRail({
  currentId,
  animeAppearances = [],
  title = "Fans also love",
  subtitle = "Characters from the same series — tap any to jump in.",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!animeAppearances.length) {
      setLoading(false);
      setItems([]);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setItems([]);

      // Prefer Main-role anime first, then any other appearances. Cap at 3
      // anime so we don't fan out into too many requests.
      const mains = animeAppearances.filter((a) => a.role === "Main");
      const fallback = animeAppearances.filter((a) => a.role !== "Main");
      const pickList = [...mains, ...fallback]
        .map((a) => a.anime)
        .filter(Boolean)
        .slice(0, 3);

      const seen = new Set([String(currentId)]);
      const collected = [];

      for (const anime of pickList) {
        if (cancelled) return;
        try {
          const cast = await getCharacters(anime.mal_id);
          if (cancelled) return;
          for (const entry of cast ?? []) {
            const c = entry.character;
            if (!c?.mal_id) continue;
            const key = String(c.mal_id);
            if (seen.has(key)) continue;
            seen.add(key);
            collected.push({
              ...c,
              _favorites: entry.favorites ?? 0,
              _role: entry.role,
            });
          }
          // Stream after each anime's characters resolve.
          if (!cancelled) {
            const sorted = [...collected].sort(
              (a, b) => (b._favorites ?? 0) - (a._favorites ?? 0)
            );
            setItems(sorted.slice(0, 20));
          }
        } catch {
          /* skip silently */
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentId, animeAppearances]);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.7 * dir, behavior: "smooth" });
  };

  // If we have neither items nor anime to source from, skip the section entirely.
  if (!animeAppearances.length || (!loading && items.length === 0)) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 ring-1 ring-cyan-400/30">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
            </span>
            Recommended
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
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
        {loading &&
          Array.from({ length: Math.max(0, 20 - items.length) }).map((_, i) => (
            <CharacterCircleSkeleton key={`sk-${i}`} />
          ))}
      </div>
    </section>
  );
}
