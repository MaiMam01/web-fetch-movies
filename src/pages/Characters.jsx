import { useEffect, useState } from "react";
import PersonCard from "../components/PersonCard.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { getTopCharacters } from "../services/jikan.js";
import SEED_TOP_CHARACTERS from "../data/topCharacters.json";
import { IconUser, IconHeart, IconImage } from "../components/Icons.jsx";

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

const HERO_ACCENT = {
  pill: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
  gradient: "from-fuchsia-400 via-violet-400 to-cyan-300",
  glow: "shadow-[0_0_28px_-8px_rgba(232,121,249,0.55)]",
};

export default function Characters() {
  const [page, setPage] = useState(1);
  const [characters, setCharacters] = useState(SEED_TOP_CHARACTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("trending");
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const isBackgroundRefresh = page === 1 && characters.length > 0;
    setError(null);
    async function run() {
      try {
        if (!isBackgroundRefresh) setLoading(true);
        const data = await getTopCharacters(page);
        if (cancelled) return;
        if (data && data.length) setCharacters(data);
      } catch (e) {
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
    return (b.favorites ?? 0) - (a.favorites ?? 0);
  });

  const filtered = activeTag
    ? sorted.filter((c) =>
        (c.about || "").toLowerCase().includes(activeTag.toLowerCase())
      )
    : sorted;

  // Stats for the hero strip
  const totalFavorites = characters.reduce(
    (sum, c) => sum + (c.favorites ?? 0),
    0
  );
  const topFav = characters.reduce(
    (best, c) => ((c.favorites ?? 0) > (best?.favorites ?? 0) ? c : best),
    null
  );

  return (
    <div className="page-container py-8 sm:py-10">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950/60 px-6 py-8 sm:px-10 sm:py-10">
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br ${HERO_ACCENT.gradient} opacity-[0.12] blur-3xl`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-tr ${HERO_ACCENT.gradient} opacity-[0.08] blur-3xl`}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${HERO_ACCENT.pill}`}
            >
              <IconUser className="h-3 w-3" />
              Cast & Crew
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Browse{" "}
              <span
                className={`bg-gradient-to-r ${HERO_ACCENT.gradient} bg-clip-text text-transparent`}
              >
                Characters
              </span>
            </h1>
            <p className="mt-3 max-w-prose text-sm text-zinc-400 sm:text-base">
              Iconic protagonists, scene-stealing villains, and beloved
              supporting cast — sourced from MyAnimeList&apos;s most-favourited
              picks.
            </p>
          </div>

          <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
            <StatTile label="Characters" value={characters.length} accent="fuchsia" />
            <StatTile
              label="Total favourites"
              value={`${Math.round(totalFavorites / 1000)}k`}
              accent="cyan"
            />
            <StatTile
              label="Most loved"
              value={topFav?.name?.split(",")?.[0]?.trim() ?? "—"}
              accent="amber"
              small
            />
          </ul>
        </div>
      </header>

      {/* ─── TAG CHIPS ────────────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Filter by archetype
          </p>
          {activeTag && (
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className="text-[11px] font-semibold text-fuchsia-300 hover:text-fuchsia-200"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
          {QUICK_TAGS.map((t) => {
            const isActive = activeTag === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTag(isActive ? null : t)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                  isActive
                    ? `bg-gradient-to-r ${HERO_ACCENT.gradient} text-zinc-950 ${HERO_ACCENT.glow} ring-1 ring-white/40`
                    : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                #{t}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── SORT BAR ─────────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Showing{" "}
          <span className="text-zinc-200 tabular-nums">{filtered.length}</span>{" "}
          of{" "}
          <span className="text-zinc-200 tabular-nums">
            {characters.length}
          </span>{" "}
          {filtered.length === 1 ? "character" : "characters"}
        </p>
        <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {error && characters.length === 0 && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
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

      {/* ─── GRID / EMPTY ─────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <IconImage className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-200">
            No characters match this archetype yet
          </p>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className="mt-4 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-zinc-100 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
          {filtered.map((c) => (
            <PersonCard
              key={c.mal_id}
              person={c}
              to={`/characters/${c.mal_id}`}
              subtitle={
                c.favorites
                  ? `${c.favorites.toLocaleString()} fans`
                  : c.nicknames?.[0]
              }
            />
          ))}
        </div>
      )}

      <Pagination page={page} onChange={setPage} canNext={characters.length > 0} />
    </div>
  );
}

const STAT_ACCENTS = {
  fuchsia: { bar: "from-fuchsia-400 to-violet-500", text: "text-fuchsia-200" },
  cyan: { bar: "from-cyan-300 to-sky-500", text: "text-cyan-200" },
  amber: { bar: "from-amber-300 to-orange-500", text: "text-amber-200" },
  emerald: { bar: "from-emerald-300 to-teal-500", text: "text-emerald-200" },
};

function StatTile({ label, value, accent = "fuchsia", small = false }) {
  const a = STAT_ACCENTS[accent] ?? STAT_ACCENTS.fuchsia;
  return (
    <li className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-3 py-2.5 transition hover:border-zinc-700 hover:bg-zinc-900/80">
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${a.bar} opacity-70 transition group-hover:opacity-100`}
      />
      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${a.text}`}>
        {label}
      </p>
      <p
        className={`mt-0.5 font-black text-white ${
          small
            ? "line-clamp-1 text-sm sm:text-base"
            : "text-xl tabular-nums sm:text-2xl"
        }`}
      >
        {value}
      </p>
    </li>
  );
}

function Pagination({ page, onChange, canNext }) {
  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800"
      >
        ← Previous
      </button>
      <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 ring-1 ring-zinc-800">
        Page <span className="text-zinc-100">{page}</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800"
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
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-zinc-900" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-zinc-900" />
          <div className="mt-1 h-2.5 w-1/2 animate-pulse rounded bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}
