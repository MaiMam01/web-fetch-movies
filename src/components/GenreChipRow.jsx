import { Link } from "react-router-dom";

export default function GenreChipRow({ genres = [], activeId = null }) {
  if (!genres.length) return null;
  return (
    <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {genres.map((g) => {
        const active = activeId != null && String(g.mal_id) === String(activeId);
        return (
          <Link
            key={g.mal_id}
            to={`/categories/${g.mal_id}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-brand-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:text-zinc-100"
            }`}
          >
            {g.name}
          </Link>
        );
      })}
    </div>
  );
}
