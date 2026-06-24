import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getGenres } from "../services/jikan.js";
import {
  IconMenu,
  IconSearch,
  IconUser,
  IconChevronDown,
  IconImage,
  IconPlay,
  IconStar,
  IconHeart,
} from "./Icons.jsx";

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
  const navigate = useNavigate();

  const trendingRef = useRef(null);
  const categoriesRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [g, t, d] = await Promise.all([
          getGenres("genres"),
          getGenres("themes"),
          getGenres("demographics"),
        ]);
        if (cancelled) return;
        setGenres(g);
        setThemes(t);
        setDemographics(d);
      } catch (e) {
        console.warn("Header genre load failed", e);
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

function CategoryMegaPanel({ onClose, genres, themes, demographics }) {
  return (
    <div
      className="absolute left-0 top-11 z-50 w-[min(92vw,820px)] origin-top overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl"
      role="menu"
    >
      <div className="grid gap-6 p-5 sm:grid-cols-3">
        <Column title="Genres" items={genres.slice(0, 14)} onClick={onClose} />
        <Column title="Themes" items={themes.slice(0, 14)} onClick={onClose} />
        <Column
          title="Demographics"
          items={demographics.slice(0, 8)}
          onClick={onClose}
          extra={
            <Link
              to="/categories"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:underline"
            >
              View all categories →
            </Link>
          }
        />
      </div>
    </div>
  );
}

function Column({ title, items, onClick, extra }) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((g) => (
          <li key={g.mal_id}>
            <Link
              to={`/categories/${g.mal_id}`}
              onClick={onClick}
              className="flex items-center justify-between rounded px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-900 hover:text-brand-500"
            >
              <span>{g.name}</span>
              {g.count != null && (
                <span className="text-[10px] text-zinc-500">
                  {g.count.toLocaleString()}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {extra}
    </div>
  );
}
