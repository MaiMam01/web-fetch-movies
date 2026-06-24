import { useEffect, useState } from "react";
import PersonCard from "../components/PersonCard.jsx";
import { getTopPeople } from "../services/jikan.js";
import { IconChevronDown } from "../components/Icons.jsx";

const QUICK_TAGS = [
  "Japanese",
  "English Dub",
  "Studio Ghibli",
  "Madhouse",
  "MAPPA",
  "Trigger",
  "Shounen Lead",
  "Female Lead",
  "Veteran",
  "Newcomer",
];

export default function VoiceActors() {
  const [people, setPeople] = useState([]);
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
        const data = await getTopPeople(page);
        if (cancelled) return;
        setPeople(data);
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

  const sorted = [...people].sort((a, b) => {
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "favorites") return (b.favorites ?? 0) - (a.favorites ?? 0);
    return 0;
  });

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
            Browse Voice Actors at{" "}
            <span className="text-brand-500">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Seiyuu and dub talent that bring anime to life — sorted by global
            popularity.
          </p>
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-9 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 focus:border-brand-500 focus:outline-none"
          >
            <option value="trending">Sort by: Trending</option>
            <option value="favorites">Sort by: Most Favorited</option>
            <option value="alphabetical">Sort by: A → Z</option>
          </select>
          <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>
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
          {sorted.map((p) => (
            <PersonCard
              key={p.mal_id}
              person={p}
              to={`/voice-actors/${p.mal_id}`}
              subtitle={p.given_name || p.alternate_names?.[0]}
            />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
        >
          ← Previous
        </button>
        <span className="text-xs text-zinc-500">Page {page}</span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={!people.length}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
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
        </div>
      ))}
    </div>
  );
}
