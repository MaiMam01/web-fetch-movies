import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PersonCard from "../components/PersonCard.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import HScrollRail from "../components/HScrollRail.jsx";
import ActiveFiltersBar from "../components/ActiveFiltersBar.jsx";
import { getTopPeople, getCharacters } from "../services/jikan.js";
import SEED_TOP_PEOPLE from "../data/topPeople.json";
import SEED_TOP_ANIME from "../data/topAnimeList.json";
import {
  IconUser,
  IconImage,
  IconPlus,
  IconStar,
} from "../components/Icons.jsx";
import HoverPopAvatar, { deriveYoutubeThumb } from "../components/HoverPopAvatar.jsx";

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

const HERO_ACCENT = {
  pill: "bg-cyan-400/15 text-cyan-200 ring-cyan-400/30",
  gradient: "from-cyan-300 via-sky-400 to-violet-400",
  glow: "shadow-[0_0_28px_-8px_rgba(34,211,238,0.55)]",
};

const ANIME_FILTERS = SEED_TOP_ANIME.slice(0, 18);

// Pull every unique voice_actor (across the anime's character list) and tag
// them with the character they voiced so we can show that as a subtitle.
function extractVoiceActors(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const c = row?.character;
    const vas = Array.isArray(row?.voice_actors) ? row.voice_actors : [];
    vas.forEach((va) => {
      const p = va?.person;
      if (!p?.mal_id) return;
      const existing = map.get(p.mal_id);
      if (existing) {
        existing.roleCount += 1;
        if (c?.name && !existing.role) existing.role = c.name;
      } else {
        map.set(p.mal_id, {
          ...p,
          favorites: p?.favorites ?? 0,
          role: c?.name || null,
          language: va?.language || null,
          roleCount: 1,
        });
      }
    });
  });
  return Array.from(map.values());
}

export default function VoiceActors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const animeId = Number(searchParams.get("anime")) || null;
  const activeTag = searchParams.get("tag") || null;

  const selectedAnime = useMemo(
    () => ANIME_FILTERS.find((a) => a.mal_id === animeId) || null,
    [animeId]
  );

  const [page, setPage] = useState(1);
  const [people, setPeople] = useState(SEED_TOP_PEOPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("trending");

  useEffect(() => {
    setPage(1);
  }, [animeId]);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    async function run() {
      try {
        if (animeId) {
          setLoading(true);
          const raw = await getCharacters(animeId);
          if (cancelled) return;
          setPeople(extractVoiceActors(raw));
        } else {
          const isBackgroundRefresh = page === 1 && people.length > 0;
          if (!isBackgroundRefresh) setLoading(true);
          const data = await getTopPeople(page);
          if (cancelled) return;
          if (data && data.length) setPeople(data);
        }
      } catch (e) {
        if (!cancelled && people.length === 0) {
          setError("Live data unavailable. Try again in a moment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, animeId]);

  const sorted = [...people].sort((a, b) => {
    if (sort === "alphabetical")
      return (a.name || "").localeCompare(b.name || "");
    return (b.favorites ?? 0) - (a.favorites ?? 0);
  });

  // For per-anime view we may also want to narrow by language ("Japanese" or
  // "English Dub"). When other tags are active we treat them as soft no-ops.
  const filtered = sorted.filter((p) => {
    if (!activeTag) return true;
    if (activeTag === "Japanese") return (p.language || "").toLowerCase() === "japanese";
    if (activeTag === "English Dub") return (p.language || "").toLowerCase() === "english";
    return true;
  });

  const totalFavorites = people.reduce(
    (sum, p) => sum + (p.favorites ?? 0),
    0
  );
  const topFav = people.reduce(
    (best, p) => ((p.favorites ?? 0) > (best?.favorites ?? 0) ? p : best),
    null
  );

  const updateParams = (mut) => {
    const next = new URLSearchParams(searchParams);
    mut(next);
    setSearchParams(next, { replace: true });
  };
  const setAnimeFilter = (id) => {
    updateParams((p) => {
      if (id) p.set("anime", String(id));
      else p.delete("anime");
    });
  };
  const setTagFilter = (t) => {
    updateParams((p) => {
      if (t) p.set("tag", t);
      else p.delete("tag");
    });
  };
  const clearAll = () => setSearchParams({}, { replace: true });

  const activeFilters = [];
  if (selectedAnime) {
    activeFilters.push({
      key: "anime",
      label: selectedAnime.title,
      accent: "cyan",
      leading: (
        <img
          src={
            selectedAnime.images?.webp?.small_image_url ||
            selectedAnime.images?.jpg?.small_image_url ||
            selectedAnime.images?.webp?.image_url ||
            "/placeholder.svg"
          }
          alt=""
          className="h-4 w-4 rounded-full object-cover ring-1 ring-cyan-400/40"
        />
      ),
      onClear: () => setAnimeFilter(null),
    });
  }
  if (activeTag) {
    activeFilters.push({
      key: "tag",
      label: `#${activeTag}`,
      accent: "fuchsia",
      onClear: () => setTagFilter(null),
    });
  }

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
              Talent
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Browse{" "}
              <span
                className={`bg-gradient-to-r ${HERO_ACCENT.gradient} bg-clip-text text-transparent`}
              >
                Voice Actors
              </span>
            </h1>
            <p className="mt-3 max-w-prose text-sm text-zinc-400 sm:text-base">
              Seiyuu and dub talent that bring anime to life — sorted by global
              popularity from MyAnimeList&apos;s favourites.
            </p>
          </div>

          <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto lg:grid-cols-3">
            <StatTile
              label={selectedAnime ? "In this anime" : "People"}
              value={people.length}
              accent="cyan"
            />
            <StatTile
              label="Total favourites"
              value={`${Math.round(totalFavorites / 1000)}k`}
              accent="fuchsia"
            />
            <StatTile
              label="Most loved"
              value={topFav?.name ?? "—"}
              accent="amber"
              small
            />
          </ul>
        </div>
      </header>

      {/* ─── ANIME AVATAR FILTER RAIL ─────────────────────────────────── */}
      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Filter by anime
          </p>
          {selectedAnime && (
            <button
              type="button"
              onClick={() => setAnimeFilter(null)}
              className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Show all
            </button>
          )}
        </div>
        <HScrollRail ariaLabel="Filter voice actors by anime" itemGap="gap-4">
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => setAnimeFilter(null)}
              aria-pressed={!selectedAnime}
              className="group/tile flex w-[88px] flex-col items-center gap-2 text-center transition"
            >
              <span
                className={`grid h-[72px] w-[72px] place-items-center rounded-full ring-2 transition ${
                  !selectedAnime
                    ? "bg-zinc-900 ring-cyan-300"
                    : "bg-zinc-900/70 ring-zinc-800 group-hover/tile:ring-zinc-600"
                }`}
              >
                <IconPlus
                  className={`h-6 w-6 transition ${
                    !selectedAnime ? "text-cyan-300" : "text-zinc-400"
                  }`}
                />
              </span>
              <span className="line-clamp-1 text-[11px] font-semibold text-zinc-300">
                All anime
              </span>
            </button>
          </li>

          {ANIME_FILTERS.map((a) => {
            const isActive = animeId === a.mal_id;
            const poster =
              a.images?.webp?.image_url ||
              a.images?.jpg?.image_url ||
              a.images?.webp?.small_image_url ||
              "/placeholder.svg";
            const hoverThumb =
              a.trailer?.images?.maximum_image_url ||
              a.trailer?.images?.large_image_url ||
              deriveYoutubeThumb(a.trailer) ||
              a.images?.webp?.large_image_url ||
              null;
            return (
              <li key={a.mal_id} className="group/tile shrink-0">
                <button
                  type="button"
                  onClick={() => setAnimeFilter(isActive ? null : a.mal_id)}
                  aria-pressed={isActive}
                  className="flex w-[88px] flex-col items-center gap-2 text-center"
                >
                  <HoverPopAvatar
                    src={poster}
                    hoverSrc={hoverThumb}
                    alt={a.title}
                    active={isActive}
                    size={72}
                    activeRing="ring-cyan-300 shadow-[0_0_28px_-6px_rgba(103,232,249,0.6)]"
                    topBadge={
                      a.score ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-zinc-950/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                          <IconStar className="h-2 w-2" />
                          {a.score.toFixed(1)}
                        </span>
                      ) : null
                    }
                  />
                  <span
                    className={`line-clamp-2 text-[11px] font-semibold leading-tight transition ${
                      isActive ? "text-cyan-200" : "text-zinc-300"
                    }`}
                  >
                    {a.title}
                  </span>
                </button>
              </li>
            );
          })}
        </HScrollRail>
      </section>

      {/* ─── ACTIVE FILTERS BAR ───────────────────────────────────────── */}
      {activeFilters.length > 0 && (
        <div className="mt-4">
          <ActiveFiltersBar filters={activeFilters} onClearAll={clearAll} />
        </div>
      )}

      {/* ─── TAG CHIPS ────────────────────────────────────────────────── */}
      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Quick filters
          </p>
        </div>
        <HScrollRail ariaLabel="Filter voice actors by tag" itemGap="gap-2">
          {QUICK_TAGS.map((t) => {
            const isActive = activeTag === t;
            return (
              <li key={t} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setTagFilter(isActive ? null : t)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                    isActive
                      ? `bg-gradient-to-r ${HERO_ACCENT.gradient} text-zinc-950 ${HERO_ACCENT.glow} ring-1 ring-white/40`
                      : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  #{t}
                </button>
              </li>
            );
          })}
        </HScrollRail>
      </div>

      {/* ─── SORT BAR ─────────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Showing{" "}
          <span className="text-zinc-200 tabular-nums">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "person" : "people"}
          {selectedAnime && (
            <>
              {" "}
              from{" "}
              <span className="text-cyan-200">{selectedAnime.title}</span>
            </>
          )}
        </p>
        <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      {error && people.length === 0 && (
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
            No voice actors match these filters
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-zinc-100 transition hover:border-cyan-400/40 hover:bg-zinc-800"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
          {filtered.map((p) => (
            <PersonCard
              key={p.mal_id}
              person={p}
              to={`/voice-actors/${p.mal_id}`}
              subtitle={
                selectedAnime
                  ? p.role
                    ? `voices ${p.role}`
                    : p.language || ""
                  : p.favorites
                    ? `${p.favorites.toLocaleString()} fans`
                    : p.given_name || p.alternate_names?.[0]
              }
            />
          ))}
        </div>
      )}

      {!selectedAnime && (
        <Pagination
          page={page}
          onChange={setPage}
          canNext={people.length > 0}
        />
      )}
    </div>
  );
}

const STAT_ACCENTS = {
  fuchsia: { bar: "from-fuchsia-400 to-violet-500", text: "text-fuchsia-200" },
  cyan: { bar: "from-cyan-300 to-sky-500", text: "text-cyan-200" },
  amber: { bar: "from-amber-300 to-orange-500", text: "text-amber-200" },
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
        className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-400/40 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800"
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
        className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-cyan-400/40 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800"
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
        </div>
      ))}
    </div>
  );
}
