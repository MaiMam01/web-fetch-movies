import { useEffect, useState } from "react";
import PersonCard from "../components/PersonCard.jsx";
import FilterPills from "../components/FilterPills.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { getTopCharacters } from "../services/jikan.js";
import SEED_TOP_CHARACTERS from "../data/topCharacters.json";

const QUICK_TAGS = [
  "Main",
  "Antagonist",
  "Supporting",
  "Tsundere",
  "Anti-Hero",
  "Mentor",
  "Demon",
  "Swordsman",
  "Detective",
  "Time Traveler",
  "Pilot",
  "Mage",
  "Shinigami",
  "Hunter",
  "Titan",
  "Vigilante",
];

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "favorites", label: "Most Favorited" },
  { value: "alphabetical", label: "A → Z" },
];

export default function Characters() {
  const [page, setPage] = useState(1);
  // Seed page 1 with baked-in data so the grid is fully painted on first
  // render — zero loading state for the common case (cold visit to /characters).
  // Subsequent pages fall back to a live fetch.
  const [characters, setCharacters] = useState(SEED_TOP_CHARACTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("trending");
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const isBackgroundRefresh = page === 1 && characters.length > 0;
    setError(null); // clear any stale error from a previous page change
    async function run() {
      try {
        if (!isBackgroundRefresh) setLoading(true);
        const data = await getTopCharacters(page);
        if (cancelled) return;
        if (data && data.length) setCharacters(data);
      } catch (e) {
        // Only set a soft inline notice when there's literally nothing to show.
        if (!cancelled && !isBackgroundRefresh && characters.length === 0) {
          setError("Live data unavailable. Try again in a moment.");
        }
      } finally {
        if (!cancelled && !isBackgroundRefresh) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const sorted = [...characters].sort((a, b) => {
    if (sort === "alphabetical")
      return (a.name || "").localeCompare(b.name || "");
    if (sort === "favorites")
      return (b.favorites ?? 0) - (a.favorites ?? 0);
    // "trending" mirrors MAL's own popularity ordering — return API order
    // but break ties by favorites so the rail feels stable.
    return (b.favorites ?? 0) - (a.favorites ?? 0);
  });

  const filtered = activeTag
    ? sorted.filter((c) =>
        (c.about || "").toLowerCase().includes(activeTag.toLowerCase())
      )
    : sorted;

  return (
    <div className="page-container py-6">
      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-3">
        {QUICK_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTag(activeTag === t ? null : t)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeTag === t
                ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.55)] ring-1 ring-fuchsia-300/50"
                : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:text-zinc-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">
            Browse Characters at{" "}
            <span className="text-funk-gradient">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Iconic protagonists, scene-stealing villains, and beloved supporting
            cast — sourced live from MyAnimeList.
          </p>
        </div>

        <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {error && characters.length === 0 && (
        <div className="mt-8 flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p)}
            className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 font-semibold hover:bg-amber-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
          {filtered.map((c) => (
            <PersonCard
              key={c.mal_id}
              person={c}
              to={`/characters/${c.mal_id}`}
              subtitle={c.nicknames?.[0]}
            />
          ))}
        </div>
      )}

      <Pagination page={page} onChange={setPage} canNext={characters.length > 0} />
    </div>
  );
}

function Pagination({ page, onChange, canNext }) {
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
      >
        ← Previous
      </button>
      <span className="text-xs text-zinc-500">Page {page}</span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square w-full animate-pulse rounded-md bg-zinc-900" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-zinc-900" />
          <div className="mt-1 h-2.5 w-1/2 animate-pulse rounded bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}
