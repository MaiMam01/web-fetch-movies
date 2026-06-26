import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight, IconStar, IconTrendUp } from "./Icons.jsx";
import { getTopAnime } from "../services/jikan.js";

// Same arch palette as the previous Hall-of-Fame design — keeps the visual
// continuity people are used to.
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

const TABS = [
  { value: "tv", label: "Series", to: "/top?type=tv" },
  { value: "movie", label: "Movies", to: "/top?type=movie" },
];

// Hard-coded editorial top-rated list. Used as an immediate render seed so the
// slider is populated even before / when Jikan can't be reached. Once the API
// returns, each entry is replaced in-place with the full Jikan record (poster,
// real-time score, etc.). Each entry includes the canonical MAL id so the
// Link target is always correct.
const FALLBACK_TOP = {
  tv: [
    { mal_id: 52991, title: "Sousou no Frieren", title_english: "Frieren: Beyond Journey's End", year: 2023, score: 9.32 },
    { mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", year: 2009, score: 9.10 },
    { mal_id: 9253, title: "Steins;Gate", year: 2011, score: 9.07 },
    { mal_id: 28977, title: "Gintama°", year: 2015, score: 9.06 },
    { mal_id: 41467, title: "Bleach: Sennen Kessen-hen", title_english: "Bleach: Thousand-Year Blood War", year: 2022, score: 9.05 },
    { mal_id: 11061, title: "Hunter x Hunter (2011)", year: 2011, score: 9.04 },
    { mal_id: 9969, title: "Gintama'", year: 2011, score: 9.03 },
    { mal_id: 53998, title: "Bleach: Sennen Kessen-hen - Ketsubetsu-tan", year: 2023, score: 9.00 },
    { mal_id: 820, title: "Ginga Eiyuu Densetsu", title_english: "Legend of the Galactic Heroes", year: 1988, score: 9.00 },
    { mal_id: 35247, title: "Owarimonogatari 2nd Season", year: 2017, score: 8.93 },
    { mal_id: 15417, title: "Gintama': Enchousen", year: 2012, score: 8.93 },
    { mal_id: 4181, title: "Clannad: After Story", year: 2008, score: 8.92 },
    { mal_id: 16498, title: "Shingeki no Kyojin", title_english: "Attack on Titan", year: 2013, score: 8.55 },
    { mal_id: 1575, title: "Code Geass: Hangyaku no Lelouch", year: 2006, score: 8.71 },
  ],
  movie: [
    { mal_id: 5114, title: "Sen to Chihiro no Kamikakushi", title_english: "Spirited Away", year: 2001, score: 8.78 },
    { mal_id: 199, title: "Sen to Chihiro no Kamikakushi", title_english: "Spirited Away", year: 2001, score: 8.78 },
    { mal_id: 32281, title: "Kimi no Na wa.", title_english: "Your Name.", year: 2016, score: 8.83 },
    { mal_id: 50594, title: "Suzume no Tojimari", title_english: "Suzume", year: 2022, score: 8.30 },
    { mal_id: 28851, title: "Koe no Katachi", title_english: "A Silent Voice", year: 2016, score: 8.93 },
    { mal_id: 523, title: "Tonari no Totoro", title_english: "My Neighbor Totoro", year: 1988, score: 8.18 },
    { mal_id: 164, title: "Mononoke Hime", title_english: "Princess Mononoke", year: 1997, score: 8.65 },
    { mal_id: 431, title: "Howl no Ugoku Shiro", title_english: "Howl's Moving Castle", year: 2004, score: 8.66 },
    { mal_id: 578, title: "Hotaru no Haka", title_english: "Grave of the Fireflies", year: 1988, score: 8.51 },
    { mal_id: 47, title: "Akira", year: 1988, score: 8.13 },
    { mal_id: 38000, title: "Kimetsu no Yaiba: Mugen Ressha-hen", title_english: "Demon Slayer: Mugen Train", year: 2020, score: 8.30 },
    { mal_id: 437, title: "Perfect Blue", year: 1997, score: 8.18 },
    { mal_id: 43, title: "Koukaku Kidoutai", title_english: "Ghost in the Shell", year: 1995, score: 7.99 },
    { mal_id: 1689, title: "Byousoku 5 Centimeter", title_english: "5 Centimeters per Second", year: 2007, score: 7.59 },
  ],
};

function seedAnime(entry) {
  return {
    mal_id: entry.mal_id,
    title: entry.title,
    title_english: entry.title_english ?? null,
    year: entry.year ?? null,
    score: entry.score ?? null,
    images: { webp: {}, jpg: {} },
    _placeholder: true,
  };
}

const INITIAL_BY_TYPE = {
  tv: FALLBACK_TOP.tv.map(seedAnime),
  movie: FALLBACK_TOP.movie.map(seedAnime),
};

export default function BestOfAllTimeSlider() {
  const [type, setType] = useState("tv");
  // Seed both tabs with the static editorial list so the slider renders the
  // moment it mounts. The API enrichment below replaces them in-place if /
  // when Jikan responds; if it never does, the seed stays visible.
  const [byType, setByType] = useState(INITIAL_BY_TYPE);
  const [enrichedTypes, setEnrichedTypes] = useState(() => new Set());
  const scrollerRef = useRef(null);

  const items = byType[type] ?? [];

  useEffect(() => {
    let cancelled = false;
    // Skip the network call if we already have API-enriched data for this tab.
    if (enrichedTypes.has(type)) return undefined;
    getTopAnime(14, 1, type)
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res.items) && res.items.length) {
          setByType((prev) => ({ ...prev, [type]: res.items }));
          setEnrichedTypes((prev) => {
            const next = new Set(prev);
            next.add(type);
            return next;
          });
        }
      })
      .catch(() => {
        /* keep the seed entries — graceful degradation */
      });
    return () => {
      cancelled = true;
    };
  }, [type, enrichedTypes]);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.75 * dir, behavior: "smooth" });
  };

  const activeTab = TABS.find((t) => t.value === type);

  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200 ring-1 ring-amber-400/30">
            <IconTrendUp className="h-3 w-3" />
            All-time greatest
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Best of <span className="text-funk-gradient">All Time</span>
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            The highest-rated {activeTab?.label.toLowerCase()} on MyAnimeList —
            voted by millions of fans. Tap any to dive into its profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/70 p-1 text-xs backdrop-blur">
            {TABS.map((t) => {
              const active = t.value === type;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 font-semibold transition active:scale-[0.97] ${
                    active
                      ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.55)] ring-1 ring-fuchsia-300/50"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
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
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3"
      >
        {items.map((a, i) => (
          <ArchCard
            key={a.mal_id}
            anime={a}
            rank={i + 1}
            palette={PALETTE[i % PALETTE.length]}
          />
        ))}
      </div>
    </section>
  );
}

function ArchCard({ anime, rank, palette }) {
  // Arch card poster renders at 160–192px wide — small variant is enough.
  const img =
    anime.images?.webp?.image_url ??
    anime.images?.jpg?.image_url ??
    anime.images?.webp?.large_image_url ??
    anime.images?.jpg?.large_image_url;
  const title = anime.title_english || anime.title;
  const year = anime.year ?? anime.aired?.prop?.from?.year;
  const score = anime.score;

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="group block w-40 shrink-0 snap-start sm:w-44 md:w-48"
      title={title}
    >
      {/* Outer arch — colored gradient frame */}
      <div
        className="relative h-60 overflow-hidden p-1.5 [border-radius:50%_50%_12px_12px_/_30%_30%_12px_12px] sm:h-64"
        style={{
          background: `linear-gradient(180deg, ${palette.top} 0%, ${palette.top} 55%, ${palette.bot} 100%)`,
        }}
      >
        {/* Subtle dot pattern overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
        {/* Top highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Inner arch holding the poster */}
        <div className="relative h-full w-full overflow-hidden bg-zinc-950 [border-radius:50%_50%_8px_8px_/_30%_30%_8px_8px]">
          {img && (
            <img
              src={img}
              alt={title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
            />
          )}
          {/* Bottom darkening so the title strip below reads cleanly */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950/85 via-zinc-950/35 to-transparent"
          />

          {/* Rank badge — top-left */}
          <span
            aria-label={`Rank ${rank}`}
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-zinc-950/85 px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur"
          >
            <span className="text-fuchsia-300">#</span>
            <span className="tabular-nums">{rank}</span>
          </span>

          {/* Score chip — top-right */}
          {score != null && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-1.5 py-0.5 text-[10px] font-black text-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              <IconStar className="h-2.5 w-2.5" />
              <span className="tabular-nums">{score.toFixed(2)}</span>
            </span>
          )}

          {/* Year pill — bottom-center, only on hover */}
          {year && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-200 opacity-0 ring-1 ring-zinc-700 backdrop-blur transition group-hover:opacity-100">
              {year}
            </span>
          )}
        </div>

        {/* Soft halo beneath the poster (lives inside the arch frame) */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] blur-[3px]"
          style={{ backgroundColor: palette.accent }}
        />
      </div>

      {/* Title strip below the arch */}
      <div className="-mt-1 rounded-md bg-zinc-950 px-3 py-2.5 text-center ring-1 ring-zinc-800 transition group-hover:bg-zinc-900 group-hover:ring-fuchsia-400/50">
        <p className="line-clamp-1 text-sm font-extrabold uppercase tracking-wide text-zinc-100 transition group-hover:text-fuchsia-200">
          {title}
        </p>
      </div>
    </Link>
  );
}

