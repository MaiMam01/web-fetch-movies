import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import GenreChipRow from "../components/GenreChipRow.jsx";
import Pagination from "../components/Pagination.jsx";
import {
  IconChevronRight,
  IconImage,
} from "../components/Icons.jsx";
import SharedSortDropdown from "../components/SortDropdown.jsx";
import { getGenres, getAnimeByGenre } from "../services/jikan.js";

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movies" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Specials" },
];

const SORT_OPTIONS = [
  { value: "score|desc", label: "Highest Rated" },
  { value: "popularity|asc", label: "Most Popular" },
  { value: "members|desc", label: "Most Members" },
  { value: "favorites|desc", label: "Most Favorited" },
  { value: "title|asc", label: "Title A → Z" },
];

export default function CategoryDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();

  const page = Number(params.get("page") || 1);
  const type = params.get("type") || "";
  const sortKey = params.get("sort") || "score|desc";
  const [orderBy, sortDir] = sortKey.split("|");

  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeGenre = useMemo(
    () => genres.find((g) => String(g.mal_id) === String(id)),
    [genres, id]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        const lists = await Promise.all([
          getGenres("genres"),
          getGenres("themes"),
          getGenres("demographics"),
        ]);
        if (cancelled) return;
        setGenres(lists.flat());
      } catch (e) {
        console.warn("Genre list load failed", e);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const r = await getAnimeByGenre({
          genreId: id,
          page,
          limit: 24,
          type: type || null,
          orderBy,
          sort: sortDir,
        });
        if (cancelled) return;
        setResults(r.data);
        setPagination(r.pagination);
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
  }, [id, page, type, orderBy, sortDir]);

  const updateParams = (next) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v == null) merged.delete(k);
      else merged.set(k, String(v));
    });
    setParams(merged, { replace: true });
  };

  const totalPages = pagination?.last_visible_page ?? 1;
  const totalItems = pagination?.items?.total;

  const featuredBackdrop =
    results[0]?.images?.webp?.large_image_url ??
    results[0]?.images?.jpg?.large_image_url;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs name={activeGenre?.name} />

      <GenreChipRow genres={genres} activeId={id} />

      {featuredBackdrop && (
        <FeatureStrip
          backdrop={featuredBackdrop}
          name={activeGenre?.name}
          total={totalItems}
        />
      )}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">
            {activeGenre?.name || "Category"} Anime at{" "}
            <span className="text-brand-500">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {totalItems != null
              ? `${totalItems.toLocaleString()} titles`
              : "Loading…"}
            {type && ` · filtered to ${type.toUpperCase()}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TypeSwitcher
            value={type}
            onChange={(v) => updateParams({ type: v, page: 1 })}
          />
          <SharedSortDropdown
            value={sortKey}
            onChange={(v) => updateParams({ sort: v, page: 1 })}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : results.length === 0 ? (
        <p className="mt-12 text-center text-sm text-zinc-500">
          No results match this filter.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((a) => (
            <AnimeCard key={a.mal_id} anime={a} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => updateParams({ page: p })}
      />
    </div>
  );
}

function Breadcrumbs({ name }) {
  return (
    <nav className="mb-3 flex items-center gap-1 text-xs text-zinc-500">
      <Link to="/" className="hover:text-zinc-300">
        Home
      </Link>
      <IconChevronRight className="h-3 w-3" />
      <Link to="/categories" className="hover:text-zinc-300">
        Categories
      </Link>
      <IconChevronRight className="h-3 w-3" />
      <span className="text-zinc-300">{name || "Loading…"}</span>
    </nav>
  );
}

function FeatureStrip({ backdrop, name, total }) {
  return (
    <div className="relative mt-4 hidden h-32 overflow-hidden rounded-xl ring-1 ring-zinc-800 sm:block">
      <img
        src={backdrop}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
      <div className="relative flex h-full items-center px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
            Browsing
          </p>
          <p className="mt-1 text-2xl font-black text-zinc-50">{name}</p>
          {total != null && (
            <p className="mt-0.5 text-xs text-zinc-300">
              {total.toLocaleString()} titles in this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeSwitcher({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1 text-xs">
      {TYPE_FILTERS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`rounded px-2.5 py-1.5 font-semibold transition ${
            value === t.value
              ? "bg-brand-500 text-zinc-950"
              : "text-zinc-300 hover:text-zinc-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800"
        >
          <div className="aspect-[2/3] w-full animate-pulse bg-zinc-800" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
