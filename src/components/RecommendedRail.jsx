import { Link } from "react-router-dom";
import { IconPlay, IconImage, StarRating } from "./Icons.jsx";

export default function RecommendedRail({ items = [], title = "Recommended Anime" }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-base font-bold text-zinc-100">{title}</h2>
      <div className="scrollbar-thin -mx-2 flex gap-3 overflow-x-auto px-2 pb-3">
        {items.map((it) => {
          const a = it.entry ?? it;
          // Rail card is 128–144px wide — small variant is enough.
          const poster =
            a.images?.webp?.image_url ??
            a.images?.jpg?.image_url ??
            a.images?.webp?.large_image_url ??
            a.images?.jpg?.large_image_url;
          return (
            <Link
              key={a.mal_id}
              to={`/anime/${a.mal_id}`}
              className="group block w-32 shrink-0 sm:w-36"
            >
              <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition group-hover:ring-brand-500">
                {poster && (
                  <img
                    src={poster}
                    alt={a.title}
                    loading="lazy"
                    decoding="async"
                    width="144"
                    height="216"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-semibold text-zinc-100 group-hover:text-brand-500">
                {a.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                {it.votes != null && (
                  <span className="flex items-center gap-0.5">
                    <IconPlay className="h-3 w-3" />
                    {it.votes}
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <IconImage className="h-3 w-3" />
                  {a.episodes ?? "—"}
                </span>
              </div>
              <StarRating value={Math.round((a.score ?? 0) / 2)} className="mt-1" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
