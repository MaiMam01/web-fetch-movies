import { Link } from "react-router-dom";

const ACCENT_BY_HASH = [
  "from-rose-500/40",
  "from-amber-500/40",
  "from-emerald-500/40",
  "from-sky-500/40",
  "from-purple-500/40",
  "from-pink-500/40",
  "from-orange-500/40",
  "from-cyan-500/40",
];

function hashIndex(s, mod) {
  let h = 0;
  for (let i = 0; i < (s ?? "").length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

export default function CategoryTile({ category, count, backdrop }) {
  const accent = ACCENT_BY_HASH[hashIndex(category.name, ACCENT_BY_HASH.length)];

  return (
    <Link
      to={`/categories/${category.mal_id}`}
      className="group relative block aspect-[5/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 transition hover:ring-brand-500"
    >
      {backdrop ? (
        <img
          src={backdrop}
          alt=""
          loading="lazy"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${accent} via-zinc-900 to-zinc-950`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/10" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-base font-bold text-zinc-50 drop-shadow-lg">
          {category.name}
        </p>
        {count != null && (
          <p className="text-[11px] text-zinc-300">
            {count.toLocaleString()} anime
          </p>
        )}
      </div>
    </Link>
  );
}
