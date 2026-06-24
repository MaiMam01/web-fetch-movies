import { Link } from "react-router-dom";

export default function AnimeCard({ anime }) {
  const score = anime.score ? anime.score.toFixed(2) : "—";
  return (
    <Link
      to={`/anime/${anime.mal_id}`}
      className="group block overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        {anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url ? (
          <img
            src={anime.images.webp?.large_image_url ?? anime.images.jpg.large_image_url}
            alt={anime.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-600">No image</div>
        )}
        <div className="absolute right-2 top-2 rounded bg-zinc-950/80 px-2 py-0.5 text-xs font-semibold text-brand-500">
          ★ {score}
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 group-hover:text-brand-500">
          {anime.title_english || anime.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {anime.type || "TV"} &middot; {anime.episodes ?? "?"} eps &middot;{" "}
          {anime.year || anime.aired?.prop?.from?.year || "—"}
        </p>
      </div>
    </Link>
  );
}
