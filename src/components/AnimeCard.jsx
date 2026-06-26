import { memo } from "react";
import { Link } from "react-router-dom";
import { IconStar, IconCalendar, IconPlay } from "./Icons.jsx";

/**
 * MAL-score-based "heat" tier for the score badge. Top tier shifts toward
 * fuchsia, dropping into cool then warm hues as quality decreases.
 */
function scoreTier(score) {
  if (score == null) return { text: "text-zinc-400", bg: "bg-zinc-950/80",   ring: "ring-zinc-700",          glow: "" };
  if (score >= 8.5) return { text: "text-fuchsia-100", bg: "bg-fuchsia-500/30", ring: "ring-fuchsia-300/60", glow: "shadow-[0_0_14px_-4px_rgba(232,121,249,0.6)]" };
  if (score >= 8.0) return { text: "text-violet-100",  bg: "bg-violet-500/30",  ring: "ring-violet-300/60",  glow: "shadow-[0_0_14px_-4px_rgba(168,85,247,0.55)]" };
  if (score >= 7.5) return { text: "text-cyan-100",    bg: "bg-cyan-500/30",    ring: "ring-cyan-300/60",    glow: "shadow-[0_0_12px_-4px_rgba(34,211,238,0.5)]" };
  if (score >= 7.0) return { text: "text-lime-100",    bg: "bg-lime-500/30",    ring: "ring-lime-300/60",    glow: "shadow-[0_0_12px_-4px_rgba(163,230,53,0.5)]" };
  if (score >= 6.5) return { text: "text-amber-100",   bg: "bg-amber-500/30",   ring: "ring-amber-300/60",   glow: "" };
  return                  { text: "text-rose-100",    bg: "bg-rose-500/30",    ring: "ring-rose-300/60",    glow: "" };
}

/**
 * Short, friendly label for anime type — keeps the type badge compact.
 */
function typeLabel(type) {
  switch ((type || "").toLowerCase()) {
    case "movie": return "Film";
    case "ova": return "OVA";
    case "ona": return "ONA";
    case "special": return "Special";
    case "music": return "Music";
    case "tv": return "TV";
    default: return type || "TV";
  }
}

function AnimeCard({ anime }) {
  const score = anime.score ? anime.score.toFixed(2) : null;
  // Prefer the smaller ~225px MAL thumbnail. The card renders at ≤240px
  // wide so the large_image_url (~430px) is 4× the file size for zero
  // visual benefit. Fall back gracefully if only the large URL exists.
  const img =
    anime.images?.webp?.image_url ??
    anime.images?.jpg?.image_url ??
    anime.images?.webp?.large_image_url ??
    anime.images?.jpg?.large_image_url;
  const tier = scoreTier(anime.score);
  const year = anime.year || anime.aired?.prop?.from?.year;
  const type = typeLabel(anime.type);

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="funk-border group relative block overflow-hidden rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:ring-transparent"
    >
      {/* Poster + overlays */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        {img ? (
          <img
            src={img}
            alt={anime.title}
            loading="lazy"
            decoding="async"
            width="320"
            height="480"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-600">
            No image
          </div>
        )}

        {/* Bottom gradient veil — keeps top-left chip and bottom-row meta legible
            over busy artwork on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 transition group-hover:opacity-100"
        />

        {/* Type chip — top-left */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-zinc-950/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-200 ring-1 ring-zinc-700 backdrop-blur">
          {type}
        </span>

        {/* Score badge — top-right */}
        {score && (
          <span
            className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold backdrop-blur ring-1 ${tier.bg} ${tier.text} ${tier.ring} ${tier.glow}`}
          >
            <IconStar className="h-3 w-3" />
            {score}
          </span>
        )}

        {/* Bottom-row meta — sits on top of the gradient veil so it stays visible */}
        <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] font-semibold text-zinc-300">
          {anime.episodes != null && anime.episodes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 ring-1 ring-white/10 backdrop-blur">
              <IconPlay className="h-2.5 w-2.5" />
              {anime.episodes}
            </span>
          )}
          {year && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 ring-1 ring-white/10 backdrop-blur">
              <IconCalendar className="h-2.5 w-2.5" />
              {year}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition group-hover:text-fuchsia-200">
          {anime.title_english || anime.title}
        </h3>
        {anime.title_english && anime.title && anime.title_english !== anime.title && (
          <p className="mt-0.5 line-clamp-1 text-[11px] italic text-zinc-500">
            {anime.title}
          </p>
        )}
      </div>
    </Link>
  );
}

export default memo(AnimeCard, (a, b) => a.anime?.mal_id === b.anime?.mal_id);
