import { useEffect, useMemo, useState } from "react";
import CategoryTile from "../components/CategoryTile.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { IconChevronRight, IconStar } from "../components/Icons.jsx";
import { getGenres, getAnimeByGenre } from "../services/jikan.js";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "least", label: "Least Popular" },
  { value: "name", label: "Name A \u2192 Z" },
  { value: "name-desc", label: "Name Z \u2192 A" },
];

// Curated "fan favorite" pick order used when the active tab is "genres".
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
  "Slice of Life",
  "Sports",
  "Avant Garde",
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

  /** "Recommended for you" — top 8 backdropped tiles in a horizontal rail. */
  const recommended = useMemo(() => {
    if (filter !== "genres") return genres.slice(0, 8);
    const byName = new Map(genres.map((g) => [g.name, g]));
    const ordered = POPULAR_NAMES.map((n) => byName.get(n)).filter(Boolean);
    return ordered.slice(0, 8);
  }, [genres, filter]);

  /** "Popular" — the next 12 with backdrops. */
  const popular = useMemo(() => {
    if (filter !== "genres") return genres.slice(0, 12);
    const byName = new Map(genres.map((g) => [g.name, g]));
    const ordered = POPULAR_NAMES.map((n) => byName.get(n)).filter(Boolean);
    const fillers = genres
      .filter((g) => !POPULAR_NAMES.includes(g.name))
      .slice(0, 12);
    return [...ordered, ...fillers].slice(0, 12);
  }, [genres, filter]);

  // Stagger fetches so the API isn't hammered; only fetch for the top ~12 items.
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

  /** Everything except the popular pick — sortable. */
  const rest = useMemo(() => {
    const out = genres.filter(
      (g) => !popular.find((p) => p.mal_id === g.mal_id)
    );
    if (sortOrder === "name") {
      return [...out].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOrder === "name-desc") {
      return [...out].sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortOrder === "least") {
      return [...out].sort((a, b) => (a.count ?? 0) - (b.count ?? 0));
    }
    return [...out].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  }, [genres, popular, sortOrder]);

  const tabLabel =
    filter === "genres" ? "Genres" : filter === "themes" ? "Themes" : "Demographics";

  return (
    <div className="page-container py-6">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200 ring-1 ring-fuchsia-400/30">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
            </span>
            Browse
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Categories at{" "}
            <span className="text-funk-gradient">AnimeDB</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
            From shounen action to slow-burn drama — explore anime by genre,
            theme, or demographic.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/70 p-1 text-xs backdrop-blur">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilter(t.value)}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition active:scale-[0.97] ${
                filter === t.value
                  ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.55)] ring-1 ring-fuchsia-300/50"
                  : "text-zinc-300 hover:text-white"
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

      {/* RECOMMENDED RAIL — horizontal scroll, backdropped tiles only */}
      <SectionEyebrow
        title="Recommended for you"
        accent="fuchsia"
        action={
          <p className="text-[11px] font-semibold text-zinc-500">
            Hand-picked starting points
          </p>
        }
      />
      {loading ? (
        <RailSkeleton count={8} />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-3 sm:w-auto sm:grid sm:grid-cols-4 lg:grid-cols-8">
            {recommended.map((g) => (
              <li key={g.mal_id} className="w-44 shrink-0 sm:w-auto">
                <CategoryTile
                  category={g}
                  count={g.count}
                  backdrop={popularBackdrops[g.mal_id]}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* POPULAR */}
      <SectionEyebrow
        title={`Popular ${tabLabel}`}
        accent="cyan"
        action={
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300">
            <IconStar className="h-3 w-3" />
            Curated by editors
          </p>
        }
      />
      {loading ? (
        <SkeletonTiles count={12} />
      ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
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

      {/* ALL */}
      {rest.length > 0 && (
        <>
          <SectionEyebrow
            title={`All ${tabLabel}`}
            accent="lime"
            action={
              <SortDropdown
                label="Sort"
                value={sortOrder}
                onChange={setSortOrder}
                options={SORT_OPTIONS}
              />
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
            {rest.map((g) => (
              <CategoryTile
                key={g.mal_id}
                category={g}
                count={g.count}
                size="sm"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const EYEBROW_ACCENT = {
  fuchsia: { dot: "bg-fuchsia-400", text: "text-fuchsia-200", via: "via-fuchsia-500/60" },
  cyan:    { dot: "bg-cyan-400",    text: "text-cyan-200",    via: "via-cyan-400/60"    },
  lime:    { dot: "bg-lime-400",    text: "text-lime-200",    via: "via-lime-400/60"    },
};

/** Reusable section header w/ accent eyebrow + gradient divider line. */
function SectionEyebrow({ title, accent = "fuchsia", action }) {
  const a = EYEBROW_ACCENT[accent] ?? EYEBROW_ACCENT.fuchsia;
  return (
    <div className="mb-4 mt-10 sm:mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          className={`inline-flex items-center gap-2 text-base font-bold tracking-tight text-zinc-100 ${a.text}`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${a.dot} shadow-[0_0_8px_currentColor]`}
          />
          <span className="text-white">{title}</span>
        </h2>
        {action}
      </div>
      <div
        aria-hidden
        className={`mt-3 h-px w-full bg-gradient-to-r from-transparent ${a.via} to-transparent`}
      />
    </div>
  );
}

function SkeletonTiles({ count }) {
  return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[5/3] animate-pulse rounded-xl bg-zinc-900 ring-1 ring-zinc-800"
        />
      ))}
    </div>
  );
}

function RailSkeleton({ count }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-3 sm:w-auto sm:grid sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="aspect-[16/10] w-44 shrink-0 animate-pulse rounded-xl bg-zinc-900 ring-1 ring-zinc-800 sm:w-auto"
          />
        ))}
      </div>
    </div>
  );
}
