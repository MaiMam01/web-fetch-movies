import { useEffect, useState } from "react";
import PersonCard from "../components/PersonCard.jsx";
import FilterPills from "../components/FilterPills.jsx";
import { getTopCharacters } from "../services/jikan.js";
import { IconChevronDown } from "../components/Icons.jsx";

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
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("trending");
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const data = await getTopCharacters(page);
        if (cancelled) return;
        setCharacters(data);
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
  }, [page]);

  const sorted = [...characters].sort((a, b) => {
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "favorites") return (b.favorites ?? 0) - (a.favorites ?? 0);
    return 0;
  });

  const filtered = activeTag
    ? sorted.filter((c) =>
        (c.about || "").toLowerCase().includes(activeTag.toLowerCase())
      )
    : sorted;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-3">
        {QUICK_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTag(activeTag === t ? null : t)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeTag === t
                ? "bg-brand-500 text-zinc-950"
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
            <span className="text-brand-500">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Iconic protagonists, scene-stealing villains, and beloved supporting
            cast — sourced live from MyAnimeList.
          </p>
        </div>

        <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {error && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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

function SortDropdown({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-9 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 focus:border-brand-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            Sort by: {o.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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
