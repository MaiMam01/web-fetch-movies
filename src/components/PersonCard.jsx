import { Link } from "react-router-dom";
import { IconEye, IconHeart, StarRating, formatCompact } from "./Icons.jsx";

export default function PersonCard({
  person,
  to,
  subtitle,
  stats = [],
  rating = null,
}) {
  const img =
    person.images?.webp?.image_url ??
    person.images?.jpg?.image_url ??
    person.images?.webp?.large_image_url ??
    person.images?.jpg?.large_image_url;
  const name = person.name;
  const views = person.favorites;

  return (
    <Link to={to} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition group-hover:ring-brand-500">
        {img ? (
          <img
            src={img}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">
            No image
          </div>
        )}
        {views != null && (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-100">
            <IconHeart className="h-3 w-3 text-rose-400" />
            {formatCompact(views)}
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-brand-500">
          {name}
        </p>
        {subtitle && (
          <p className="line-clamp-1 text-[11px] text-zinc-500">{subtitle}</p>
        )}

        {stats.length > 0 && (
          <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400">
            {stats.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {s.icon}
                {s.value}
              </span>
            ))}
          </div>
        )}

        {rating != null && (
          <StarRating value={rating} className="mt-1" />
        )}
      </div>
    </Link>
  );
}
