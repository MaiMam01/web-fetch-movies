import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getGenres, getTopAnime } from "../services/jikan.js";
import {
  IconMenu,
  IconSearch,
  IconUser,
  IconChevronDown,
  IconChevronRight,
  IconImage,
  IconPlay,
  IconStar,
  IconHeart,
  IconHome,
  IconEye,
  IconCalendar,
  IconGrid,
} from "./Icons.jsx";

const DISCOVER_ITEMS = [
  { to: "/", icon: <IconHome className="h-4 w-4" />, label: "Featured" },
  { to: "/top", icon: <IconStar className="h-4 w-4" />, label: "Top 100" },
  { to: "/top?type=tv", icon: <IconImage className="h-4 w-4" />, label: "Top TV Series" },
  { to: "/top?type=movie", icon: <IconImage className="h-4 w-4" />, label: "Top Films" },
  { to: "/stories", icon: <IconPlay className="h-4 w-4" />, label: "Stories & Reels" },
  { to: "/scenes", icon: <IconHeart className="h-4 w-4" />, label: "Scene Catalog" },
  { to: "/characters", icon: <IconUser className="h-4 w-4" />, label: "All Characters" },
  { to: "/voice-actors", icon: <IconUser className="h-4 w-4" />, label: "Voice Actors" },
  { to: "/categories", icon: <IconGrid className="h-4 w-4" />, label: "All Categories" },
  { to: "/search", icon: <IconSearch className="h-4 w-4" />, label: "Search" },
];

const TRENDING_CHIPS = [
  "Currently Airing",
  "Demon Slayer",
  "Attack on Titan",
  "Jujutsu Kaisen",
  "One Piece",
  "Studio Ghibli",
  "Isekai",
  "Slice of Life",
  "Cyberpunk",
  "Mecha",
];

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/top", label: "Top 100" },
  { to: "/categories", label: "Categories", dropdown: "categories" },
  { to: "/characters", label: "Characters" },
  { to: "/voice-actors", label: "Voice Actors" },
  { to: "/scenes", label: "Scenes" },
  { to: "/stories", label: "Stories" },
  { to: "/search", label: "Search" },
];

const TRENDING_ITEMS = [
  { to: "/top", label: "Trending Anime", icon: <IconStar className="h-4 w-4 text-amber-400" /> },
  { to: "/top?type=movie", label: "Trending Films", icon: <IconImage className="h-4 w-4 text-purple-400" /> },
  { to: "/scenes", label: "Trending Scenes", icon: <IconPlay className="h-4 w-4 text-rose-400" /> },
  { to: "/characters", label: "Trending Characters", icon: <IconHeart className="h-4 w-4 text-pink-400" /> },
  { to: "/voice-actors", label: "Trending Voice Actors", icon: <IconUser className="h-4 w-4 text-sky-400" /> },
];

export default function Header() {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trendingOpen, setTrendingOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [themes, setThemes] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const navigate = useNavigate();

  const trendingRef = useRef(null);
  const categoriesRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [g, t, d, top] = await Promise.all([
          getGenres("genres"),
          getGenres("themes"),
          getGenres("demographics"),
          getTopAnime(4).catch(() => []),
        ]);
        if (cancelled) return;
        setGenres(g);
        setThemes(t);
        setDemographics(d);
        setTopAnime(top);
      } catch (e) {
        console.warn("Header data load failed", e);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (trendingOpen && trendingRef.current && !trendingRef.current.contains(e.target)) {
        setTrendingOpen(false);
      }
      if (categoriesOpen && categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setTrendingOpen(false);
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [trendingOpen, categoriesOpen]);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur">
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6 lg:px-8">
          <div className="relative" ref={trendingRef}>
            <button
              type="button"
              onClick={() => {
                setTrendingOpen((s) => !s);
                setCategoriesOpen(false);
              }}
              className={`grid h-9 w-9 place-items-center rounded transition ${
                trendingOpen
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
              aria-label="Open menu"
              aria-expanded={trendingOpen}
            >
              <IconMenu className="h-5 w-5" />
            </button>

            {trendingOpen && (
              <div className="absolute left-0 top-12 z-50 w-64 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 shadow-2xl">
                <ul className="py-1.5">
                  {TRENDING_ITEMS.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setTrendingOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-900 hover:text-brand-500"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link to="/" className="flex shrink-0 items-center gap-1.5">
            <span className="font-black tracking-tight">
              <span className="text-zinc-100">Anime</span>
              <span className="rounded-sm bg-brand-500 px-1 text-zinc-950">DB</span>
            </span>
          </Link>

          <form
            onSubmit={onSubmit}
            className="relative ml-2 hidden flex-1 max-w-xl items-center md:flex"
          >
            <IconSearch className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime, characters, voice actors…"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 grid h-8 w-9 place-items-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              aria-label="Search"
            >
              <IconSearch className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/scenes"
              className="hidden rounded-md bg-brand-500 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 transition hover:bg-amber-400 sm:inline-flex"
            >
              Top Scenes
            </Link>
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 lg:inline-flex"
            >
              <span aria-hidden>🌐</span>
              Region
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              aria-label="Account"
            >
              <IconUser className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <nav className="hidden md:block">
        <ul className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {NAV_ITEMS.map((item) => {
            if (item.dropdown === "categories") {
              return (
                <li key={item.to} className="relative" ref={categoriesRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriesOpen((s) => !s);
                      setTrendingOpen(false);
                    }}
                    className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      categoriesOpen
                        ? "bg-zinc-900 text-brand-500"
                        : "text-zinc-300 hover:text-white"
                    }`}
                    aria-expanded={categoriesOpen}
                  >
                    {item.label}
                    <IconChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        categoriesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {categoriesOpen && (
                    <CategoryMegaPanel
                      onClose={() => setCategoriesOpen(false)}
                      genres={genres}
                      themes={themes}
                      demographics={demographics}
                      topAnime={topAnime}
                    />
                  )}
                </li>
              );
            }
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-brand-500"
                        : "text-zinc-300 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                  {item.hasDropdown && (
                    <IconChevronDown className="h-3.5 w-3.5 opacity-70" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {mobileOpen && (
        <div className="border-t border-zinc-900 bg-zinc-950 md:hidden">
          <form onSubmit={onSubmit} className="relative px-4 py-3">
            <IconSearch className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
            />
          </form>
          <ul className="flex flex-col px-2 pb-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 text-sm ${
                      isActive
                        ? "bg-brand-500/10 text-brand-500"
                        : "text-zinc-200 hover:bg-zinc-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

function CategoryMegaPanel({ onClose, genres, themes, demographics, topAnime }) {
  return (
    <div
      className="absolute left-0 top-11 z-50 max-h-[80vh] w-[min(96vw,1180px)] origin-top overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl"
      role="menu"
    >
      <div className="grid gap-5 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <DiscoverColumn onClick={onClose} />
        <ThumbsColumn
          title="Top Rated"
          to="/top"
          items={topAnime.slice(0, 3)}
          onClick={onClose}
        />
        <LinkListColumn
          title="Genres"
          to="/categories"
          items={genres.slice(0, 11)}
          onClick={onClose}
        />
        <LinkListColumn
          title="Themes"
          to="/categories"
          items={themes.slice(0, 11)}
          onClick={onClose}
        />
        <LinkListColumn
          title="Demographics"
          to="/categories"
          items={demographics.slice(0, 7)}
          onClick={onClose}
        />
        <ChipsColumn
          title="Trending"
          chips={TRENDING_CHIPS}
          onClick={onClose}
        />
      </div>
    </div>
  );
}

function ColumnHeader({ title, to, onClick }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-100">
        {title}
      </h3>
      {to && (
        <Link
          to={to}
          onClick={onClick}
          className="grid h-5 w-5 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-900 hover:text-brand-500"
          aria-label={`View all ${title}`}
        >
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function DiscoverColumn({ onClick }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-zinc-100">Discover Anime</h3>
      <ul className="space-y-0.5">
        {DISCOVER_ITEMS.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              onClick={onClick}
              className="group flex items-center gap-2.5 rounded px-1.5 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-brand-500"
            >
              <span className="text-zinc-500 group-hover:text-brand-500">
                {it.icon}
              </span>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThumbsColumn({ title, to, items, onClick }) {
  return (
    <div>
      <ColumnHeader title={title} to={to} onClick={onClick} />
      <ul className="space-y-2">
        {items.length === 0 &&
          Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex gap-2 rounded bg-zinc-900/40 p-1.5 ring-1 ring-zinc-900"
            >
              <div className="aspect-video w-20 animate-pulse rounded bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-3/4 animate-pulse rounded bg-zinc-800" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-800" />
              </div>
            </li>
          ))}
        {items.map((a) => {
          const img =
            a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;
          return (
            <li key={a.mal_id}>
              <Link
                to={`/anime/${a.mal_id}`}
                onClick={onClick}
                className="group flex gap-2 rounded p-1.5 transition hover:bg-zinc-900"
              >
                <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded bg-zinc-800">
                  {img && (
                    <img
                      src={img}
                      alt={a.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  )}
                  {a.score && (
                    <span className="absolute right-0.5 bottom-0.5 rounded bg-zinc-950/85 px-1 py-px text-[9px] font-bold text-brand-500">
                      ★ {a.score.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-100 group-hover:text-brand-500">
                    {a.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500">
                    {a.type ?? "TV"} · {a.episodes ?? "?"} eps
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LinkListColumn({ title, to, items, onClick }) {
  return (
    <div>
      <ColumnHeader title={title} to={to} onClick={onClick} />
      <ul className="space-y-0.5">
        {items.map((g) => (
          <li key={g.mal_id}>
            <Link
              to={`/categories/${g.mal_id}`}
              onClick={onClick}
              className="flex items-center justify-between rounded px-1.5 py-1 text-sm text-zinc-200 transition hover:bg-zinc-900 hover:text-brand-500"
            >
              <span className="line-clamp-1">{g.name}</span>
              {g.count != null && (
                <span className="ml-2 text-[10px] tabular-nums text-zinc-500">
                  {g.count.toLocaleString()}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChipsColumn({ title, chips, onClick }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-100">
        {title}
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <li key={c}>
            <Link
              to={`/search?q=${encodeURIComponent(c)}`}
              onClick={onClick}
              className="inline-block rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-brand-500"
            >
              {c}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
