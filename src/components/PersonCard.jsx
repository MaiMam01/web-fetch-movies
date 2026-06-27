import { memo } from "react";
import { Link } from "react-router-dom";
import { IconHeart, StarRating, formatCompact } from "./Icons.jsx";
import SafeImage from "./SafeImage.jsx";

function PersonCard({ person, to, subtitle, stats = [], rating = null }) {
  const img =
    person.images?.webp?.image_url ??
    person.images?.jpg?.image_url ??
    person.images?.webp?.large_image_url ??
    person.images?.jpg?.large_image_url;
  const hoverImg = person._hover_image;
  const name = person.name;
  const views = person.favorites;

  return (
    <Link to={to} className="group relative block">
      <div className="relative z-0 aspect-square w-full overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition-all duration-300 ease-out will-change-transform group-hover:z-20 group-hover:-translate-y-2 group-hover:scale-[1.18] group-hover:rounded-xl group-hover:ring-2 group-hover:ring-fuchsia-400/70 group-hover:shadow-[0_18px_40px_-10px_rgba(232,121,249,0.55)]">
        <SafeImage
          src={img}
          alt={name}
          width="300"
          height="300"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            hoverImg ? "group-hover:opacity-0" : "group-hover:scale-[1.06]"
          }`}
        />
        {hoverImg && (
          <SafeImage
            src={hoverImg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-[1.08] object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {views != null && (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-100">
            <IconHeart className="h-3 w-3 text-rose-400" />
            {formatCompact(views)}
          </span>
        )}
      </div>

      <div className="relative z-0 mt-2 transition-transform duration-300 group-hover:translate-y-3">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-fuchsia-200">
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

export default memo(
  PersonCard,
  (a, b) => a.person?.mal_id === b.person?.mal_id && a.to === b.to
);
