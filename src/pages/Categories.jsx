import { useEffect, useMemo, useState } from "react";
import CategoryTile from "../components/CategoryTile.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { getGenres, getAnimeByGenre } from "../services/jikan.js";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "least", label: "Least Popular" },
  { value: "name", label: "Name A \u2192 Z" },
];

const POPULAR_NAMES = [
  "Action",
  "Adventure",
  "Drama",
  "Romance",
  "Comedy",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Supernatural",
  "Mecha",
  "Slice of Life",
  "Sports",
];

const FILTER_TABS = [
  { value: "genres", label: "Genres" },
  { value: "themes", label: "Themes" },
  { value: "demographics", label: "Demographics" },
];

export default function Categories() {
  const [filter, setFilter] = useState("genres");
  const [sortOrder, setSortOrder] = useState("popular");
  const [genres, setGenres] = useState([]);
  const [popularBackdrops, setPopularBackdrops] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const data = await getGenres(filter);
        if (cancelled) return;
        setGenres(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const popular = useMemo(() => {
    if (filter !== "genres") return genres.slice(0, 12);
    const byName = new Map(genres.map((g) => [g.name, g]));
    const ordered = POPULAR_NAMES.map((n) => byName.get(n)).filter(Boolean);
    const fillers = genres.filter((g) => !POPULAR_NAMES.includes(g.name)).slice(0, 12);
    return [...ordered, ...fillers].slice(0, 12);
  }, [genres, filter]);

  useEffect(() => {
    let cancelled = false;
    async function fetchBackdrops() {
      const map = { ...popularBackdrops };
      for (const g of popular) {
        if (map[g.mal_id]) continue;
        try {
          const r = await getAnimeByGenre({ genreId: g.mal_id, limit: 1 });
          if (cancelled) return;
          const top = r.data?.[0];
          map[g.mal_id] =
            top?.images?.webp?.large_image_url ??
            top?.images?.jpg?.large_image_url ??
            null;
          await new Promise((res) => setTimeout(res, 350));
        } catch {
          map[g.mal_id] = null;
        }
      }
      if (!cancelled) setPopularBackdrops(map);
    }
    if (popular.length) fetchBackdrops();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popular]);

  const rest = useMemo(() => {
    const out = genres.filter((g) => !popular.find((p) => p.mal_id === g.mal_id));
    if (sortOrder === "name") {
      return [...out].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOrder === "least") {
      return [...out].sort((a, b) => (a.count ?? 0) - (b.count ?? 0));
    }
    return [...out].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  }, [genres, popular, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Browse
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
            Categories at <span className="text-brand-500">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            From shounen action to slow-burn drama — explore anime by genre, theme,
            or demographic.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1 text-xs">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilter(t.value)}
              className={`rounded px-3 py-1.5 font-semibold transition ${
                filter === t.value
                  ? "bg-brand-500 text-zinc-950"
                  : "text-zinc-300 hover:text-zinc-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-base font-bold text-zinc-100">
          Popular {filter === "genres" ? "Genres" : filter === "themes" ? "Themes" : "Demographics"}
        </h2>
        {loading ? (
          <SkeletonTiles count={12} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popular.map((g) => (
              <CategoryTile
                key={g.mal_id}
                category={g}
                count={g.count}
                backdrop={popularBackdrops[g.mal_id]}
              />
            ))}
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-zinc-100">All {filter}</h2>
            <SortDropdown
              label="Sort"
              value={sortOrder}
              onChange={setSortOrder}
              options={SORT_OPTIONS}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {rest.map((g) => (
              <a
                key={g.mal_id}
                href={`/categories/${g.mal_id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-white"
              >
                {g.name}
                {g.count != null && (
                  <span className="text-[10px] text-zinc-500">
                    {g.count.toLocaleString()}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SkeletonTiles({ count }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[5/3] animate-pulse rounded-lg bg-zinc-900"
        />
      ))}
    </div>
  );
}
