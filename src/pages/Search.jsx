import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import PersonCard from "../components/PersonCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import {
  IconSearch,
  IconStar,
  IconClose,
  IconImage,
  IconTrendUp,
} from "../components/Icons.jsx";
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

const ANIME_SORT = [
  { value: "popularity-asc", label: "Most Popular" },
  { value: "score-desc", label: "Highest Rated" },
  { value: "favorites-desc", label: "Most Favorited" },
  { value: "episodes-desc", label: "Most Episodes" },
  { value: "title-asc", label: "Title A → Z" },
];

const PERSON_SORT = [
  { value: "favorites-desc", label: "Most Favorited" },
  { value: "name-asc", label: "Name A → Z" },
  { value: "name-desc", label: "Name Z → A" },
];

const TRENDING = [
  "Frieren",
  "Attack on Titan",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "One Piece",
  "Spy x Family",
  "Naruto",
  "Bleach",
  "Spirited Away",
  "Your Name",
];

const RECENT_KEY = "search_recent_v1";
const RECENT_MAX = 8;

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function pushRecent(q) {
  if (!q) return;
  try {
    const list = loadRecent().filter(
      (x) => x.toLowerCase() !== q.toLowerCase()
    );
    list.unshift(q);
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(list.slice(0, RECENT_MAX))
    );
  } catch {
    /* ignore quota */
  }
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

const HERO_ACCENT = {
  pill: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
  gradient: "from-fuchsia-400 via-violet-400 to-cyan-300",
  glow: "shadow-[0_0_28px_-8px_rgba(232,121,249,0.55)]",
};

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const tab = params.get("tab") || "anime";
  const page = Number(params.get("page") || 1);
  const sortParam =
    params.get("sort") ||
    (tab === "anime" ? "popularity-asc" : "favorites-desc");

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  usePageTitle(q ? `Search · "${q}"` : "Search");
  const [draft, setDraft] = useState(q);
  const [recent, setRecent] = useState(() => loadRecent());
  const inputRef = useRef(null);

  const sortOptions = useMemo(
    () => (tab === "anime" ? ANIME_SORT : PERSON_SORT),
    [tab]
  );

  const [orderBy, sortDir] = sortParam.split("-");

  useEffect(() => {
    setDraft(q);
  }, [q]);

  // Persist successful queries to the recent list so the empty state shows
  // a useful history.
  useEffect(() => {
    if (q && !loading && !error && results.length > 0) {
      pushRecent(q);
      setRecent(loadRecent());
    }
  }, [q, loading, error, results.length]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!q) {
        setResults([]);
        setPagination(null);
        return;
      }
      // Clear prior results immediately so users see a skeleton, not the old
      // result set from a different query / tab.
      setResults([]);
      setPagination(null);
      try {
        setLoading(true);
        setError(null);
        if (tab === "anime") {
          const r = await searchAnimeFull({
            query: q,
            page,
            orderBy,
            sort: sortDir,
          });
          if (!cancelled) {
            setResults(r.data);
            setPagination(r.pagination);
          }
        } else if (tab === "characters") {
          const r = await searchCharacters(q, 24);
          if (!cancelled) {
            setResults(sortClientSide(r, sortParam));
            setPagination(null);
          }
        } else {
          const r = await searchPeople(q, 24);
          if (!cancelled) {
            setResults(sortClientSide(r, sortParam));
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
  }, [q, tab, page, orderBy, sortDir, sortParam]);

  const updateParams = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v == null) merged.delete(k);
      else merged.set(k, String(v));
    });
    setParams(merged, { replace: true });
  };

  const submit = (value) => {
    const next = (value ?? draft).trim();
    if (!next) return;
    setDraft(next);
    updateParams({ q: next, page: 1 });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const clearDraft = () => {
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div className="page-container py-8 sm:py-10">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950/60 px-6 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br ${HERO_ACCENT.gradient} opacity-[0.14] blur-3xl`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-tr ${HERO_ACCENT.gradient} opacity-[0.08] blur-3xl`}
        />

        <div className="relative max-w-3xl">
          <p
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${HERO_ACCENT.pill}`}
          >
            <IconSearch className="h-3 w-3" />
            Search
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find{" "}
            <span
              className={`bg-gradient-to-r ${HERO_ACCENT.gradient} bg-clip-text text-transparent`}
            >
              anime, characters & seiyuu
            </span>
          </h1>
          <p className="mt-3 max-w-prose text-sm text-zinc-400 sm:text-base">
            Search across MyAnimeList&apos;s entire catalogue. Switch tabs to
            narrow down to specific entity types.
          </p>

          {/* Search input */}
          <form onSubmit={onSubmit} className="relative mt-6">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              ref={inputRef}
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Try ‘Steins Gate’, ‘Goku’, or ‘Mamoru Miyano’…"
              aria-label="Search anime, characters, voice actors"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 py-3.5 pl-11 pr-28 text-sm text-zinc-100 shadow-inner shadow-black/40 ring-0 placeholder:text-zinc-500 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 sm:text-base"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {draft && (
                <button
                  type="button"
                  onClick={clearDraft}
                  aria-label="Clear search"
                  className="grid h-7 w-7 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <IconClose className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={!draft.trim()}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                  draft.trim()
                    ? `bg-gradient-to-r ${HERO_ACCENT.gradient} text-zinc-950 ${HERO_ACCENT.glow}`
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                Search
              </button>
            </div>
          </form>

          {/* Trending chips under input */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <IconTrendUp className="h-3 w-3" />
              Trending
            </span>
            {TRENDING.slice(0, 6).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => submit(t)}
                className="rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-300 ring-1 ring-zinc-800 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 hover:text-zinc-100"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── TAB + SORT BAR ───────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="-mx-1 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-900/70 p-1 backdrop-blur scrollbar-thin">
          {TABS.map((t) => {
            const isActive = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  updateParams({ tab: t.value, page: 1, sort: null })
                }
                aria-pressed={isActive}
                className={`inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                  isActive
                    ? `bg-gradient-to-r ${HERO_ACCENT.gradient} text-zinc-950 ${HERO_ACCENT.glow}`
                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {q && (
            <p className="hidden text-[11px] font-semibold uppercase tracking-widest text-zinc-500 sm:block">
              {loading ? (
                <span className="text-zinc-300">Searching…</span>
              ) : (
                <>
                  <span className="text-zinc-200 tabular-nums">
                    {results.length}
                  </span>{" "}
                  {tab === "anime"
                    ? results.length === 1
                      ? "title"
                      : "titles"
                    : results.length === 1
                      ? "result"
                      : "results"}
                </>
              )}
            </p>
          )}
          <SortDropdown
            label="Sort"
            value={sortParam}
            onChange={(v) => updateParams({ sort: v, page: 1 })}
            options={sortOptions}
          />
        </div>
      </div>

      {/* ─── BODY ─────────────────────────────────────────────────────── */}
      {!q && (
        <EmptyState
          recent={recent}
          onPick={submit}
          onClearRecent={() => {
            clearRecent();
            setRecent([]);
          }}
        />
      )}

      {q && (
        <p className="mt-5 text-sm text-zinc-400">
          Results for{" "}
          <span className="font-semibold text-zinc-100">“{q}”</span>
          {loading && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" />
              loading
            </span>
          )}
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          {error}
        </div>
      )}

      {q && !loading && results.length === 0 && !error && (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <IconImage className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-200">
            No matches for &ldquo;{q}&rdquo;
          </p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Try a different spelling, switch tabs, or pick a trending search
            above.
          </p>
        </div>
      )}

      {q && loading && results.length === 0 && <ResultsSkeleton tab={tab} />}

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
              subtitle={
                p.favorites
                  ? `${p.favorites.toLocaleString()} fans`
                  : tab === "characters"
                    ? p.nicknames?.[0]
                    : p.given_name || p.alternate_names?.[0]
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function sortClientSide(list, key) {
  const copy = [...list];
  switch (key) {
    case "name-asc":
      return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "name-desc":
      return copy.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    case "favorites-desc":
    default:
      return copy.sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));
  }
}

function EmptyState({ recent, onPick, onClearRecent }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Recent searches */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-100">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_currentColor]" />
            Recent searches
          </h2>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={onClearRecent}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="mt-3 text-xs text-zinc-500">
            Your recent searches will show up here.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {recent.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => onPick(r)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-900"
                >
                  <IconSearch className="h-3 w-3 text-zinc-500" />
                  {r}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick links */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-100">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_currentColor]" />
          Or jump to
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { to: "/categories", label: "Categories", accent: "fuchsia" },
            { to: "/characters", label: "Characters", accent: "cyan" },
            { to: "/voice-actors", label: "Voice Actors", accent: "amber" },
            { to: "/stories", label: "Stories", accent: "rose" },
            { to: "/top", label: "Top Rated", accent: "emerald" },
            { to: "/scenes", label: "Scenes", accent: "violet" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group inline-flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:border-fuchsia-400/30 hover:bg-zinc-900"
            >
              <span>{l.label}</span>
              <span className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResultsSkeleton({ tab }) {
  const cols =
    tab === "anime"
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8";
  return (
    <div className={`mt-6 grid gap-4 ${cols}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <div
            className={`w-full animate-pulse rounded-xl bg-zinc-900 ${
              tab === "anime" ? "aspect-[2/3]" : "aspect-square"
            }`}
          />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-zinc-900" />
          <div className="mt-1 h-2.5 w-1/2 animate-pulse rounded bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}
