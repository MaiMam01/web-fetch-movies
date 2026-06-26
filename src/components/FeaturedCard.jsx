import { memo } from "react";
import { Link } from "react-router-dom";
import { IconStar, IconChevronRight } from "./Icons.jsx";

/**
 * Editor's-list card — magazine-style entry used on the Landing page.
 *
 * Layout (left → right):
 *   [accent bar] [poster w/ rank badge] [vibe eyebrow → title → quote → pills → CTA]
 *
 * Top-3 entries get a podium treatment: gradient rank number, glow shadow on
 * the card, colored accent bar.
 */

const PODIUM = {
  1: {
    name: "fuchsia",
    bar: "from-fuchsia-400 via-violet-400 to-cyan-300",
    ring: "ring-fuchsia-400/40 hover:ring-fuchsia-400/60",
    glow: "shadow-[0_0_36px_-10px_rgba(232,121,249,0.55)]",
    rankText: "from-fuchsia-300 via-violet-300 to-cyan-200",
    badge: "from-fuchsia-500 via-violet-500 to-cyan-400",
    eyebrow: "text-fuchsia-300",
    eyebrowDot: "bg-fuchsia-400",
  },
  2: {
    name: "cyan",
    bar: "from-cyan-300 via-sky-300 to-violet-300",
    ring: "ring-cyan-400/40 hover:ring-cyan-400/60",
    glow: "shadow-[0_0_28px_-10px_rgba(34,211,238,0.5)]",
    rankText: "from-cyan-200 via-sky-200 to-violet-200",
    badge: "from-cyan-400 via-sky-400 to-violet-400",
    eyebrow: "text-cyan-300",
    eyebrowDot: "bg-cyan-400",
  },
  3: {
    name: "amber",
    bar: "from-amber-300 via-orange-300 to-rose-300",
    ring: "ring-amber-400/40 hover:ring-amber-400/60",
    glow: "shadow-[0_0_28px_-10px_rgba(251,191,36,0.5)]",
    rankText: "from-amber-200 via-orange-200 to-rose-200",
    badge: "from-amber-400 via-orange-400 to-rose-400",
    eyebrow: "text-amber-300",
    eyebrowDot: "bg-amber-400",
  },
};

const NEUTRAL = {
  bar: "from-zinc-700 via-zinc-600 to-zinc-700",
  ring: "ring-zinc-800 hover:ring-fuchsia-400/40",
  glow: "",
  rankText: "text-zinc-600",
  eyebrow: "text-zinc-400",
  eyebrowDot: "bg-zinc-500",
};

// Static Tailwind class strings for genre chips — JIT-safe.
const GENRE_ACCENTS = [
  "bg-fuchsia-500/10 text-fuchsia-200 ring-fuchsia-400/30",
  "bg-violet-500/10 text-violet-200 ring-violet-400/30",
  "bg-cyan-500/10 text-cyan-200 ring-cyan-400/30",
  "bg-sky-500/10 text-sky-200 ring-sky-400/30",
  "bg-emerald-500/10 text-emerald-200 ring-emerald-400/30",
  "bg-lime-500/10 text-lime-200 ring-lime-400/30",
  "bg-amber-500/10 text-amber-200 ring-amber-400/30",
  "bg-rose-500/10 text-rose-200 ring-rose-400/30",
];

function hashIdx(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function FeaturedCard({ anime, rank }) {
  const ed = anime._editorial ?? {};
  const malScore = anime.score ? anime.score.toFixed(2) : null;
  const imdb = ed.imdb_rating;
  const poster =
    anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;
  const podium = PODIUM[rank];
  const skin = podium ?? NEUTRAL;
  const year = anime.year || anime.aired?.prop?.from?.year;

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className={`group relative flex gap-3 overflow-hidden rounded-2xl bg-zinc-900/60 p-3 ring-1 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-900/80 sm:gap-4 sm:p-4 ${skin.ring} ${skin.glow}`}
    >
      {/* Vertical accent bar (left) */}
      <span
        aria-hidden
        className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-gradient-to-b opacity-70 transition group-hover:opacity-100 ${skin.bar}`}
      />

      {/* Poster + rank badge */}
      <div className="relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-zinc-800/80 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] transition group-hover:ring-zinc-700 sm:w-28">
        {poster ? (
          <img
            src={poster}
            alt={anime.title}
            loading="lazy"
            decoding="async"
            width="224"
            height="336"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-zinc-600">
            No image
          </div>
        )}

        {rank != null && (
          <span
            className={`absolute left-1 top-1 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-[11px] font-black tabular-nums backdrop-blur ${
              podium
                ? `bg-gradient-to-br ${podium.badge} text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.6)] ring-1 ring-white/20`
                : "bg-zinc-950/80 text-zinc-300 ring-1 ring-zinc-700"
            }`}
          >
            #{rank}
          </span>
        )}

        {/* Subtle gradient veil bottom of poster for legibility on rank badge */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
        />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Eyebrow / vibe */}
        {ed.vibe && (
          <p
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${skin.eyebrow}`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${skin.eyebrowDot} shadow-[0_0_6px_currentColor]`}
            />
            {ed.vibe}
          </p>
        )}

        {/* Big rank ghost behind title (only for top-3, decorative) */}
        {podium && (
          <span
            aria-hidden
            className={`pointer-events-none absolute right-3 top-2 select-none bg-gradient-to-br bg-clip-text text-5xl font-black leading-none text-transparent opacity-15 sm:text-6xl ${podium.rankText}`}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}

        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-tight text-zinc-100 transition group-hover:text-fuchsia-200 sm:text-lg">
          {ed.title || anime.title_english || anime.title}
        </h3>

        {/* Stat pills */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          {imdb && (
            <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-1.5 py-0.5 font-bold text-amber-200 ring-1 ring-amber-400/30">
              <IconStar className="h-3 w-3" />
              IMDb {imdb}
            </span>
          )}
          {malScore && (
            <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-fuchsia-500/20 to-violet-500/10 px-1.5 py-0.5 font-bold text-fuchsia-200 ring-1 ring-fuchsia-400/30">
              <IconStar className="h-3 w-3" />
              MAL {malScore}
            </span>
          )}
          {anime.episodes != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-1.5 py-0.5 font-semibold text-zinc-300 ring-1 ring-zinc-700">
              {anime.episodes} eps
            </span>
          )}
          {year && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/80 px-1.5 py-0.5 font-semibold text-zinc-300 ring-1 ring-zinc-700">
              {year}
            </span>
          )}
        </div>

        {/* Quote-style blurb */}
        {ed.blurb && (
          <blockquote className="mt-2.5 line-clamp-3 border-l-2 border-zinc-800 pl-2.5 text-sm leading-relaxed text-zinc-300 sm:line-clamp-4">
            <span
              aria-hidden
              className={`mr-0.5 text-base font-black leading-none ${skin.eyebrow}`}
            >
              &ldquo;
            </span>
            {ed.blurb}
          </blockquote>
        )}

        {/* Genre chips (max 3, deterministic accent per genre) */}
        {anime.genres?.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1">
            {anime.genres.slice(0, 3).map((g) => {
              const a = GENRE_ACCENTS[hashIdx(g.name, GENRE_ACCENTS.length)];
              return (
                <li key={g.mal_id ?? g.name}>
                  <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${a}`}>
                    <span aria-hidden className="opacity-60">#</span>
                    {g.name}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA */}
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500 transition group-hover:text-fuchsia-300">
          Read full entry
          <IconChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default memo(
  FeaturedCard,
  (a, b) =>
    a.anime?.mal_id === b.anime?.mal_id && a.rank === b.rank
);
