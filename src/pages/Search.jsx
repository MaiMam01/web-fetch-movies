import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import PersonCard from "../components/PersonCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { IconSearch } from "../components/Icons.jsx";
import {
  searchAnimeFull,
  searchCharacters,
  searchPeople,
} from "../services/jikan.js";

const TABS = [
  { value: "anime", label: "Anime" },
  { value: "characters", label: "Characters" },
  { value: "people", label: "Voice Actors" },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const tab = params.get("tab") || "anime";
  const page = Number(params.get("page") || 1);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(q);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!q) {
        setResults([]);
        setPagination(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        if (tab === "anime") {
          const r = await searchAnimeFull({ query: q, page });
          if (!cancelled) {
            setResults(r.data);
            setPagination(r.pagination);
          }
        } else if (tab === "characters") {
          const r = await searchCharacters(q, 24);
          if (!cancelled) {
            setResults(r);
            setPagination(null);
          }
        } else {
          const r = await searchPeople(q, 24);
          if (!cancelled) {
            setResults(r);
            setPagination(null);
          }
        }
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
  }, [q, tab, page]);

  const updateParams = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v == null) merged.delete(k);
      else merged.set(k, String(v));
    });
    setParams(merged, { replace: true });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: draft.trim(), page: 1 });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
        Search
      </p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
        Find anime, characters, and voice actors
      </h1>

      <form onSubmit={onSubmit} className="relative mt-5 max-w-2xl">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Try ‘Steins Gate’, ‘Goku’, or ‘Mamoru Miyano’…"
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
        />
      </form>

      <div className="mt-6 inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1 text-xs">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => updateParams({ tab: t.value, page: 1 })}
            className={`rounded px-3 py-1.5 font-semibold transition ${
              tab === t.value
                ? "bg-brand-500 text-zinc-950"
                : "text-zinc-300 hover:text-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!q && <EmptyState />}

      {q && (
        <p className="mt-4 text-sm text-zinc-400">
          Results for <span className="text-zinc-100">“{q}”</span>
          {loading && " · loading…"}
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {q && !loading && results.length === 0 && (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No matches. Try a different query or pick another tab.
        </p>
      )}

      {tab === "anime" && results.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((a) => (
              <AnimeCard key={a.mal_id} anime={a} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={pagination?.last_visible_page ?? 1}
            onChange={(p) => updateParams({ page: p })}
          />
        </>
      )}

      {(tab === "characters" || tab === "people") && results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {results.map((p) => (
            <PersonCard
              key={p.mal_id}
              person={p}
              to={
                tab === "characters"
                  ? `/characters/${p.mal_id}`
                  : `/voice-actors/${p.mal_id}`
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
      <p className="text-sm font-semibold text-zinc-200">
        Start typing to search the catalog.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Or jump straight to{" "}
        <Link to="/categories" className="text-brand-500 hover:underline">
          Categories
        </Link>
        ,{" "}
        <Link to="/characters" className="text-brand-500 hover:underline">
          Characters
        </Link>
        , or{" "}
        <Link to="/voice-actors" className="text-brand-500 hover:underline">
          Voice Actors
        </Link>
        .
      </p>
    </div>
  );
}
