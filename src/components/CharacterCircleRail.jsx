import { useEffect, useRef, useState } from "react";
import { IconChevronRight } from "./Icons.jsx";
import { searchCharacters } from "../services/jikan.js";
import CharacterCircle, {
  CharacterCircleSkeleton,
  displayFirstName,
} from "./CharacterCircle.jsx";

/**
 * Curated list of iconic / mainstream anime characters that almost everyone
 * recognizes — mixes family-friendly mascots (Doraemon, Shinchan, Pikachu)
 * with shonen heavyweights. We look each one up by name via the Jikan search
 * endpoint; the service layer cache makes subsequent loads instant.
 */
const ICONIC_NAMES = [
  "Doraemon",
  "Shin Nohara",       // Crayon Shin-chan
  "Pikachu",
  "Naruto Uzumaki",
  "Sasuke Uchiha",
  "Son Goku",
  "Vegeta",
  "Monkey D Luffy",
  "Roronoa Zoro",
  "Ichigo Kurosaki",
  "Light Yagami",
  "L Lawliet",
  "Edward Elric",
  "Eren Yeager",
  "Levi Ackerman",
  "Mikasa Ackerman",
  "Tanjiro Kamado",
  "Nezuko Kamado",
  "Saitama",
  "Lelouch Lamperouge",
  "Spike Spiegel",
  "Killua Zoldyck",
  "Gon Freecss",
  "Astro Boy",
];

export default function CharacterCircleRail() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const collected = [];
      for (const name of ICONIC_NAMES) {
        if (cancelled) return;
        try {
          const hits = await searchCharacters(name, 1);
          if (cancelled) return;
          const c = hits?.[0];
          if (c) collected.push({ ...c, _label: displayFirstName(name) });
        } catch {
          /* skip silently — graceful degradation */
        }
        // Stream-render so the rail fills in progressively rather than waiting
        // for all 24 lookups.
        if (!cancelled) setItems([...collected]);
      }
      if (!cancelled) setLoading(false);
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
        {loading &&
          Array.from({ length: Math.max(0, ICONIC_NAMES.length - items.length) }).map(
            (_, i) => <CharacterCircleSkeleton key={`sk-${i}`} />
          )}
      </div>
    </section>
  );
}
