import { useEffect, useState } from "react";
import PersonCard from "../components/PersonCard.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { getTopPeople } from "../services/jikan.js";

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "favorites", label: "Most Favorited" },
  { value: "alphabetical", label: "A → Z" },
];

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
    if (sort === "alphabetical")
      return (a.name || "").localeCompare(b.name || "");
    if (sort === "favorites")
      return (b.favorites ?? 0) - (a.favorites ?? 0);
    // "trending" → fall back to favorites so the toggle isn't visually inert.
    return (b.favorites ?? 0) - (a.favorites ?? 0);
  });

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
            Browse Voice Actors at{" "}
            <span className="text-funk-gradient">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Seiyuu and dub talent that bring anime to life — sorted by global
            popularity.
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
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
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
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square w-full animate-pulse rounded-md bg-zinc-900" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}
