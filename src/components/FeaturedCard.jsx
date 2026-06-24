import { Link } from "react-router-dom";

export default function FeaturedCard({ anime, rank }) {
  const ed = anime._editorial ?? {};
  const malScore = anime.score ? anime.score.toFixed(2) : null;
  const imdb = ed.imdb_rating;
  const poster =
    anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;

  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="group flex gap-4 overflow-hidden rounded-2xl bg-zinc-900/60 p-3 ring-1 ring-zinc-800 transition hover:ring-brand-500 sm:p-4"
    >
      {rank != null && (
        <span className="self-start text-3xl font-black leading-none text-zinc-700 sm:text-4xl">
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <div className="relative aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:w-28">
        {poster ? (
          <img
            src={poster}
            alt={anime.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-zinc-600">
            No image
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-base font-bold text-zinc-100 group-hover:text-brand-500 sm:text-lg">
          {ed.title || anime.title_english || anime.title}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">{ed.vibe}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {imdb && (
            <span className="rounded bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-400">
              IMDb ★ {imdb}
            </span>
          )}
          {malScore && (
            <span className="rounded bg-zinc-800 px-2 py-0.5 font-semibold text-zinc-300">
              MAL ★ {malScore}
            </span>
          )}
          {anime.episodes && (
            <span className="text-zinc-500">{anime.episodes} eps</span>
          )}
          {(anime.year || anime.aired?.prop?.from?.year) && (
            <span className="text-zinc-500">
              {anime.year || anime.aired.prop.from.year}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-3 text-sm text-zinc-300 sm:line-clamp-4">
          {ed.blurb}
        </p>
      </div>
    </Link>
  );
}
