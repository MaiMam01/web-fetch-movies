import { Link } from "react-router-dom";
import { IconChevronRight } from "./Icons.jsx";

/**
 * Deterministic 8-color gradient fallback so tiles without backdrops still
 * look varied and on-brand. Each genre name always maps to the same hue.
 */
const GRADIENTS = [
  "from-fuchsia-600/60 via-violet-700/70 to-zinc-950",
  "from-cyan-500/60 via-sky-700/70 to-zinc-950",
  "from-rose-500/60 via-pink-700/70 to-zinc-950",
  "from-amber-500/60 via-orange-700/70 to-zinc-950",
  "from-emerald-500/60 via-teal-700/70 to-zinc-950",
  "from-lime-500/60 via-green-700/70 to-zinc-950",
  "from-violet-500/60 via-indigo-700/70 to-zinc-950",
  "from-indigo-500/60 via-blue-700/70 to-zinc-950",
];

function hashIndex(s, mod) {
  let h = 0;
  for (let i = 0; i < (s ?? "").length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

export default function CategoryTile({
  category,
  count,
  backdrop,
  size = "md",
}) {
  const gradient = GRADIENTS[hashIndex(category.name, GRADIENTS.length)];

  const dims =
    size === "sm"
      ? { aspect: "aspect-[16/10]", title: "text-sm sm:text-base", count: "text-[10px]" }
      : { aspect: "aspect-[5/3]",   title: "text-base sm:text-lg",  count: "text-[11px]" };

  return (
    <Link
      to={`/categories/${category.mal_id}`}
      className={`group relative block overflow-hidden rounded-xl ring-1 ring-zinc-800 transition duration-300 hover:-translate-y-0.5 hover:ring-fuchsia-400/50 hover:shadow-[0_10px_30px_-12px_rgba(232,121,249,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 ${dims.aspect}`}
    >
      {backdrop ? (
        <img
          src={backdrop}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.08]"
        />
      ) : (
        <div
          aria-hidden
          className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        />
      )}

      {/* Bottom dark gradient veil for text legibility */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent transition group-hover:from-zinc-950/95"
      />

      {/* Subtle hover wash — fuchsia tint over the whole tile */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/0 via-transparent to-cyan-400/0 opacity-0 transition group-hover:from-fuchsia-500/15 group-hover:to-cyan-400/10 group-hover:opacity-100"
      />

      {/* Title + count */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <p
            className={`line-clamp-1 font-bold text-zinc-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition group-hover:text-white ${dims.title}`}
          >
            {category.name}
          </p>
          {count != null && (
            <p className={`text-zinc-300 ${dims.count}`}>
              {count.toLocaleString()} anime
            </p>
          )}
        </div>
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 translate-x-1 place-items-center rounded-full bg-zinc-950/70 text-zinc-400 ring-1 ring-zinc-800 opacity-0 backdrop-blur transition group-hover:translate-x-0 group-hover:bg-fuchsia-500 group-hover:text-white group-hover:opacity-100 group-hover:ring-fuchsia-300/60"
        >
          <IconChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
