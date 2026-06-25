import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight } from "./Icons.jsx";
import { getTopCharacters } from "../services/jikan.js";

const PALETTE = [
  { top: "#22d3ee", bot: "#0e7490", accent: "rgba(8,145,178,0.55)" },
  { top: "#fcd34d", bot: "#b45309", accent: "rgba(180,83,9,0.55)" },
  { top: "#fb923c", bot: "#c2410c", accent: "rgba(194,65,12,0.55)" },
  { top: "#f472b6", bot: "#be185d", accent: "rgba(190,24,93,0.55)" },
  { top: "#a78bfa", bot: "#5b21b6", accent: "rgba(91,33,182,0.55)" },
  { top: "#34d399", bot: "#047857", accent: "rgba(4,120,87,0.55)" },
  { top: "#60a5fa", bot: "#1d4ed8", accent: "rgba(29,78,216,0.55)" },
  { top: "#fb7185", bot: "#9f1239", accent: "rgba(159,18,57,0.55)" },
];

export default function IconicCharactersSlider() {
  const [chars, setChars] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getTopCharacters()
      .then((c) => {
        if (cancelled) return;
        setChars(c.slice(0, 14));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.75 * dir, behavior: "smooth" });
  };

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Hall of fame
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Iconic Anime Characters
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            The fan-favorite faces voted to the top of MyAnimeList — tap any to
            jump into their profile.
          </p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:bg-zinc-800 hover:text-brand-500"
          >
            <IconChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:bg-zinc-800 hover:text-brand-500"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading &&
          chars.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonArchCard key={i} palette={PALETTE[i % PALETTE.length]} />
          ))}
        {chars.map((c, i) => (
          <ArchCard
            key={c.mal_id}
            character={c}
            palette={PALETTE[i % PALETTE.length]}
          />
        ))}
      </div>
    </section>
  );
}

function ArchCard({ character, palette }) {
  const img =
    character.images?.webp?.image_url ?? character.images?.jpg?.image_url;
  const firstName = character.name?.split(",")[0]?.trim() ?? character.name;
  return (
    <Link
      to={`/characters/${character.mal_id}`}
      className="group block w-40 shrink-0 snap-start sm:w-44 md:w-48"
    >
      <div
        className="relative h-60 overflow-hidden [border-radius:50%_50%_12px_12px_/_30%_30%_12px_12px] sm:h-64"
        style={{
          background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.top} 60%, ${palette.bot} 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute bottom-3 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[50%]"
          style={{ backgroundColor: palette.accent, filter: "blur(2px)" }}
        />

        {img && (
          <img
            src={img}
            alt={character.name}
            loading="lazy"
            className="absolute inset-x-0 bottom-1 mx-auto h-[88%] w-auto max-w-[100%] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="-mt-1 rounded-md bg-zinc-950 px-3 py-2.5 text-center ring-1 ring-zinc-800 transition group-hover:bg-zinc-900 group-hover:ring-brand-500">
        <p className="line-clamp-1 text-sm font-extrabold uppercase tracking-wide text-zinc-100 transition group-hover:text-brand-500">
          {firstName}
        </p>
      </div>
    </Link>
  );
}

function SkeletonArchCard({ palette }) {
  return (
    <div className="w-40 shrink-0 snap-start sm:w-44 md:w-48">
      <div
        className="relative h-60 animate-pulse overflow-hidden [border-radius:50%_50%_12px_12px_/_30%_30%_12px_12px] sm:h-64"
        style={{
          background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.bot} 100%)`,
          opacity: 0.55,
        }}
      />
      <div className="-mt-1 h-10 animate-pulse rounded-md bg-zinc-900 ring-1 ring-zinc-800" />
    </div>
  );
}
