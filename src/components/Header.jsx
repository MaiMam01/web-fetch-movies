import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import LanguageDropdown, { findLanguage } from "./LanguageDropdown.jsx";
import {
  getGenres,
  getTopAnime,
  searchAnime,
  searchCharacters,
  searchPeople,
} from "../services/jikan.js";
// AuthModal only renders when the user clicks Sign in / Sign up — keep it
// out of the initial bundle to trim ~4kB off every cold load.
const AuthModal = lazy(() => import("./AuthModal.jsx"));
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
  IconAlert,
  IconMessage,
  IconPlus,
  IconUserPlus,
  IconUpload,
  IconLocation,
  IconHelp,
  IconRss,
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

const TRENDING_SEARCHES = [
  "attack on titan",
  "demon slayer",
  "frieren",
  "jujutsu kaisen",
  "solo leveling",
  "chainsaw man",
  "spy x family",
  "dandadan",
  "one piece",
  "studio ghibli",
];

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/top", label: "Top 100", dropdown: "top" },
  { to: "/categories", label: "Categories", dropdown: "categories" },
  { to: "/characters", label: "Characters", dropdown: "characters" },
  { to: "/voice-actors", label: "Voice Actors", dropdown: "voice-actors" },
  { to: "/scenes", label: "Scenes", dropdown: "scenes" },
  { to: "/stories", label: "Stories", dropdown: "stories", align: "right" },
  { to: "/community", label: "Community", dropdown: "community", align: "right" },
  { to: "/search", label: "Search" },
];

const MINI_DROPDOWNS = {
  top: [
    { to: "/top", icon: <IconStar className="h-4 w-4" />, label: "All-time Top 100", hint: "Highest-rated anime ever" },
    { to: "/top?type=tv", icon: <IconImage className="h-4 w-4" />, label: "Top TV Series", hint: "Series-only ranking" },
    { to: "/top?type=movie", icon: <IconImage className="h-4 w-4" />, label: "Top Films", hint: "Theatrical & feature releases" },
    { to: "/categories", icon: <IconGrid className="h-4 w-4" />, label: "Browse by Category", hint: "Filter by genre or theme" },
    { to: "/", icon: <IconHome className="h-4 w-4" />, label: "Editor's Picks", hint: "Curated featured titles" },
  ],
  characters: [
    { to: "/characters", icon: <IconUser className="h-4 w-4" />, label: "Browse All Characters", hint: "Full catalog" },
    { to: "/characters?sort=favorites", icon: <IconHeart className="h-4 w-4" />, label: "Most Favorited", hint: "Fan-favorite leads" },
    { to: "/characters?sort=name", icon: <IconGrid className="h-4 w-4" />, label: "Alphabetical A → Z", hint: "Find by name" },
    { to: "/search?q=character", icon: <IconSearch className="h-4 w-4" />, label: "Search Characters", hint: "Find a specific role" },
  ],
  "voice-actors": [
    { to: "/voice-actors", icon: <IconUser className="h-4 w-4" />, label: "Browse All Voice Actors", hint: "Complete VA roster" },
    { to: "/voice-actors?sort=favorites", icon: <IconHeart className="h-4 w-4" />, label: "Most Favorited", hint: "Top fan favorites" },
    { to: "/voice-actors?sort=name", icon: <IconGrid className="h-4 w-4" />, label: "Alphabetical A → Z", hint: "Find by name" },
    { to: "/search?q=voice", icon: <IconSearch className="h-4 w-4" />, label: "Search Voice Actors", hint: "Find a specific VA" },
  ],
  scenes: [
    { to: "/scenes", icon: <IconPlay className="h-4 w-4" />, label: "All Scenes", hint: "Full curated catalog" },
    { to: "/scenes?severity=extreme", icon: <IconAlert className="h-4 w-4" />, label: "Extreme Violence", hint: "18+ heaviest content" },
    { to: "/scenes?severity=high", icon: <IconHeart className="h-4 w-4" />, label: "High Intensity", hint: "Battle & combat scenes" },
    { to: "/scenes?sort=newest", icon: <IconCalendar className="h-4 w-4" />, label: "Latest Additions", hint: "Most recently catalogued" },
  ],
  stories: [
    { to: "/stories", icon: <IconPlay className="h-4 w-4" />, label: "All Reels", hint: "OPs, EDs, and promos" },
    { to: "/stories?type=music", icon: <IconStar className="h-4 w-4" />, label: "OP & ED Themes", hint: "Opening & ending songs" },
    { to: "/stories?type=promo", icon: <IconImage className="h-4 w-4" />, label: "Promos & Trailers", hint: "Official previews" },
    { to: "/stories?sort=trending", icon: <IconHeart className="h-4 w-4" />, label: "Trending Reels", hint: "What fans are watching" },
  ],
  community: [
    { to: "/community", icon: <IconHome className="h-4 w-4" />, label: "Community Feed", hint: "Latest reviews & takes" },
    { to: "/community?tab=members", icon: <IconUser className="h-4 w-4" />, label: "Discover Members", hint: "Verified reviewers" },
    { to: "/community?tab=search", icon: <IconSearch className="h-4 w-4" />, label: "Advanced Search", hint: "Find by taste & stats" },
    { to: "/community", icon: <IconPlus className="h-4 w-4" />, label: "Create Account", hint: "Join the community" },
  ],
};

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
  const [openNav, setOpenNav] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState({
    anime: [],
    chars: [],
    people: [],
    loading: false,
  });
  const [genres, setGenres] = useState([]);
  const [themes, setThemes] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const trendingRef = useRef(null);
  const navRef = useRef(null);
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [g, t, d, top] = await Promise.all([
          getGenres("genres"),
          getGenres("themes"),
          getGenres("demographics"),
          getTopAnime(4).then((r) => r.items).catch(() => []),
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
    setMobileOpen(false);
    setTrendingOpen(false);
    setOpenNav(null);
    setAccountOpen(false);
    setSearchFocused(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function onClickOutside(e) {
      if (trendingOpen && trendingRef.current && !trendingRef.current.contains(e.target)) {
        setTrendingOpen(false);
      }
      if (openNav && navRef.current && !navRef.current.contains(e.target)) {
        setOpenNav(null);
      }
      if (accountOpen && accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (searchFocused && searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setTrendingOpen(false);
        setOpenNav(null);
        setAccountOpen(false);
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [trendingOpen, openNav, accountOpen, searchFocused]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchResults({ anime: [], chars: [], people: [], loading: false });
      return undefined;
    }
    let cancelled = false;
    setSearchResults((prev) => ({ ...prev, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const [anime, chars, people] = await Promise.all([
          searchAnime(q, 4).catch(() => []),
          searchCharacters(q, 4).catch(() => []),
          searchPeople(q, 3).catch(() => []),
        ]);
        if (!cancelled) {
          setSearchResults({
            anime: Array.isArray(anime) ? anime : [],
            chars: Array.isArray(chars) ? chars : [],
            people: Array.isArray(people) ? people : [],
            loading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setSearchResults({ anime: [], chars: [], people: [], loading: false });
        }
      }
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const openAuth = (mode) => {
    setAccountOpen(false);
    setAuthMode(mode);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur">
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="page-container flex h-14 items-center gap-3">
          {/* Mobile hamburger — opens full nav drawer */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen((s) => !s);
              setTrendingOpen(false);
              setOpenNav(null);
              setAccountOpen(false);
            }}
            className={`grid h-10 w-10 place-items-center rounded transition md:hidden ${
              mobileOpen
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            <IconMenu className="h-5 w-5" />
          </button>

          {/* Desktop trending dropdown */}
          <div className="relative hidden md:block" ref={trendingRef}>
            <button
              type="button"
              onClick={() => {
                setTrendingOpen((s) => !s);
                setOpenNav(null);
              }}
              className={`grid h-9 w-9 place-items-center rounded transition ${
                trendingOpen
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
              aria-label="Open trending menu"
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

          <Logo size="sm" className="shrink-0" />

          <form
            ref={searchRef}
            onSubmit={(e) => {
              onSubmit(e);
              setSearchFocused(false);
            }}
            className="relative ml-2 hidden flex-1 max-w-xl items-center md:flex"
          >
            <IconSearch className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setSearchFocused(true);
                setOpenNav(null);
                setAccountOpen(false);
                setTrendingOpen(false);
              }}
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

            {searchFocused && (
              <SearchSuggestionsPanel
                query={query}
                topAnime={topAnime}
                results={searchResults}
                onClose={() => setSearchFocused(false)}
              />
            )}
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/scenes"
              className="btn btn-primary btn-sm hidden uppercase tracking-wider sm:inline-flex"
            >
              Top Scenes
            </Link>
            <LanguageDropdown className="hidden lg:block" />
            <LanguageDropdown compact className="lg:hidden" />
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((s) => !s);
                  setTrendingOpen(false);
                  setOpenNav(null);
                }}
                className={`group relative grid h-9 w-9 place-items-center rounded-full transition active:scale-95 ${
                  accountOpen
                    ? "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.6)]"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-fuchsia-400/40 hover:bg-zinc-800 hover:text-white"
                }`}
                aria-label="Account"
                aria-expanded={accountOpen}
              >
                <IconUser className="h-4 w-4" />
                {!accountOpen && (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-fuchsia-400 ring-2 ring-zinc-950 shadow-[0_0_6px_currentColor]"
                  />
                )}
              </button>

              {accountOpen && (
                <AccountDropdown
                  onClose={() => setAccountOpen(false)}
                  onSignUp={() => openAuth("signup")}
                  onLogIn={() => openAuth("login")}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="hidden md:block">
        <ul
          ref={navRef}
          className="page-container flex h-12 items-center gap-1"
        >
          {NAV_ITEMS.map((item) => {
            if (item.dropdown) {
              const open = openNav === item.dropdown;
              const toggle = () => {
                setOpenNav(open ? null : item.dropdown);
                setTrendingOpen(false);
              };
              return (
                <li key={item.to} className="relative">
                  <button
                    type="button"
                    onClick={toggle}
                    className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      open
                        ? "bg-zinc-900 text-brand-500"
                        : "text-zinc-300 hover:text-white"
                    }`}
                    aria-expanded={open}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <IconChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && item.dropdown === "categories" && (
                    <CategoryMegaPanel
                      onClose={() => setOpenNav(null)}
                      genres={genres}
                      themes={themes}
                      demographics={demographics}
                      topAnime={topAnime}
                    />
                  )}
                  {open && item.dropdown !== "categories" && (
                    <MiniDropdown
                      title={item.label}
                      items={MINI_DROPDOWNS[item.dropdown] ?? []}
                      viewAllTo={item.to}
                      align={item.align ?? "left"}
                      onClose={() => setOpenNav(null)}
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
                    `relative inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-zinc-300 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 shadow-[0_0_8px_rgba(232,121,249,0.6)]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {authMode && (
        <Suspense fallback={null}>
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onSwitchMode={() =>
              setAuthMode((m) => (m === "signup" ? "login" : "signup"))
            }
          />
        </Suspense>
      )}

      {mobileOpen && (
        <div className="border-t border-zinc-900 bg-zinc-950 md:hidden">
          <form onSubmit={onSubmit} className="relative px-4 py-3">
            <IconSearch className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime, characters…"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none"
            />
          </form>
          <ul className="flex flex-col gap-0.5 px-2 pb-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10 text-fuchsia-200 ring-1 ring-fuchsia-400/20"
                        : "text-zinc-200 hover:bg-zinc-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="border-t border-zinc-900 px-2 py-2">
            <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Trending
            </p>
            <ul className="flex flex-col gap-0.5">
              {TRENDING_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-brand-500"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchSuggestionsPanel({ query, topAnime, results, onClose }) {
  const q = query.trim();
  const showTrending = q.length < 2;

  return (
    <div className="dropdown-panel absolute left-0 right-0 top-12 z-50 max-h-[75vh] w-full overflow-y-auto p-5 pt-6">
      <div className="relative z-[2]">
      {showTrending ? (
        <>
          <SuggestSection title="Trending Searches">
            <ul className="-mx-1 flex flex-wrap gap-1.5">
              {TRENDING_SEARCHES.map((t, i) => {
                const palette = ["fuchsia", "cyan", "lime", "amber", "violet", "rose"];
                const accent = palette[i % palette.length];
                const a = COLUMN_ACCENTS[accent];
                return (
                  <li key={t}>
                    <Link
                      to={`/search?q=${encodeURIComponent(t)}`}
                      onClick={onClose}
                      className={`group inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800 ${a.hoverText} ${a.hoverRing}`}
                    >
                      <span aria-hidden className="text-[10px] opacity-50 group-hover:opacity-90">#</span>
                      {t}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SuggestSection>

          {topAnime.length > 0 && (
            <SuggestSection
              title="Trending Anime"
              viewAllTo="/top"
              onClose={onClose}
              className="mt-5"
            >
              <ul className="space-y-1">
                {topAnime.slice(0, 4).map((a) => {
                  const img =
                    a.images?.webp?.image_url ?? a.images?.jpg?.image_url;
                  return (
                    <li key={a.mal_id}>
                      <Link
                        to={`/anime/${a.mal_id}`}
                        onClick={onClose}
                        className="group flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-zinc-900/70"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-800 transition group-hover:ring-fuchsia-400/40">
                          {img && (
                            <img
                              src={img}
                              alt={a.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-zinc-100 transition group-hover:text-fuchsia-200">
                            {a.title}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {a.type ?? "TV"} · ★ {a.score?.toFixed(1) ?? "—"}
                          </p>
                        </div>
                        <IconChevronRight className="h-3.5 w-3.5 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SuggestSection>
          )}
        </>
      ) : (
        <>
          {results.loading && (
            <p className="px-1 text-xs uppercase tracking-widest text-zinc-500">
              Searching…
            </p>
          )}

          {!results.loading &&
            results.anime.length === 0 &&
            results.chars.length === 0 &&
            results.people.length === 0 && (
              <p className="px-1 py-2 text-sm text-zinc-400">
                No quick matches.{" "}
                <Link
                  to={`/search?q=${encodeURIComponent(q)}`}
                  onClick={onClose}
                  className="font-bold text-funk-gradient hover:opacity-90"
                >
                  See full search results
                </Link>
              </p>
            )}

          {results.anime.length > 0 && (
            <SuggestSection title="Anime">
              <ResultList
                items={results.anime}
                makeTo={(it) => `/anime/${it.mal_id}`}
                getName={(it) => it.title}
                getImg={(it) =>
                  it.images?.webp?.image_url ?? it.images?.jpg?.image_url
                }
                getMeta={(it) =>
                  `${it.type ?? "TV"} · ★ ${it.score?.toFixed(1) ?? "—"}`
                }
                onClose={onClose}
              />
            </SuggestSection>
          )}

          {results.chars.length > 0 && (
            <SuggestSection title="Characters" className="mt-5">
              <ResultList
                items={results.chars}
                makeTo={(it) => `/characters/${it.mal_id}`}
                getName={(it) => it.name}
                getImg={(it) =>
                  it.images?.webp?.image_url ?? it.images?.jpg?.image_url
                }
                getMeta={(it) =>
                  it.favorites != null
                    ? `${it.favorites.toLocaleString()} favorites`
                    : "Character"
                }
                onClose={onClose}
              />
            </SuggestSection>
          )}

          {results.people.length > 0 && (
            <SuggestSection title="Voice Actors" className="mt-5">
              <ResultList
                items={results.people}
                makeTo={(it) => `/voice-actors/${it.mal_id}`}
                getName={(it) => it.name}
                getImg={(it) =>
                  it.images?.webp?.image_url ?? it.images?.jpg?.image_url
                }
                getMeta={(it) =>
                  it.favorites != null
                    ? `${it.favorites.toLocaleString()} favorites`
                    : "Voice Actor"
                }
                onClose={onClose}
              />
            </SuggestSection>
          )}

          <div className="mt-4 border-t border-zinc-900/80 pt-3">
            <Link
              to={`/search?q=${encodeURIComponent(q)}`}
              onClick={onClose}
              className="group flex items-center justify-between rounded-lg bg-gradient-to-r from-fuchsia-500/10 via-violet-500/5 to-cyan-400/10 px-3 py-2.5 text-sm font-bold text-fuchsia-100 ring-1 ring-fuchsia-400/20 transition hover:from-fuchsia-500/20 hover:via-violet-500/15 hover:to-cyan-400/20 hover:ring-fuchsia-400/40"
            >
              <span>
                See all results for{" "}
                <span className="italic text-funk-gradient">&quot;{q}&quot;</span>
              </span>
              <IconChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

function SuggestSection({ title, viewAllTo, onClose, className = "", children }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_currentColor]" />
          {title}
        </h3>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            onClick={onClose}
            className="group inline-flex items-center gap-1 text-[11px] font-bold text-funk-gradient hover:opacity-90"
          >
            View all
            <IconChevronRight className="h-3 w-3 text-fuchsia-300 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function ResultList({ items, makeTo, getName, getImg, getMeta, onClose }) {
  return (
    <ul className="space-y-1">
      {items.map((it) => {
        const img = getImg(it);
        return (
          <li key={it.mal_id}>
            <Link
              to={makeTo(it)}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-zinc-900/70"
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-800 transition group-hover:ring-fuchsia-400/40">
                {img && (
                  <img
                    src={img}
                    alt={getName(it)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-zinc-100 transition group-hover:text-fuchsia-200">
                  {getName(it)}
                </p>
                <p className="text-[11px] text-zinc-500">{getMeta(it)}</p>
              </div>
              <IconChevronRight className="h-3.5 w-3.5 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AccountDropdown({ onClose, onSignUp, onLogIn }) {
  // Read the same persisted language key the LanguageDropdown writes to so this
  // row always shows what's currently selected (and updates live via the
  // `animedb:lang` event the picker broadcasts).
  const [langCode, setLangCode] = useState(() => {
    if (typeof window === "undefined") return "en";
    try {
      return localStorage.getItem("animedb_lang") || "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    const onLang = (e) => setLangCode(e.detail ?? "en");
    window.addEventListener("animedb:lang", onLang);
    return () => window.removeEventListener("animedb:lang", onLang);
  }, []);
  const currentLanguage = findLanguage(langCode);
  const [region, setRegion] = useState("United States");

  return (
    <div
      className="absolute right-0 top-12 z-50 w-[min(94vw,340px)] origin-top-right overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_50px_-15px_rgba(232,121,249,0.35)]"
      role="menu"
      style={{ animation: "menuPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {/* Rainbow top edge */}
      <div
        aria-hidden
        className="h-[2px] bg-gradient-to-r from-fuchsia-500 via-violet-500 via-cyan-400 to-lime-400"
      />

      {/* Guest hero */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(232,121,249,0.22), transparent 55%), radial-gradient(circle at 85% 90%, rgba(34,211,238,0.18), transparent 55%)",
          }}
        />
        <div className="relative flex items-center gap-3 px-4 py-3.5">
          <div className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-900 ring-2 ring-fuchsia-400/40">
              <IconUser className="h-5 w-5 text-zinc-300" />
            </span>
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-zinc-500 ring-2 ring-zinc-950"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">Hello, guest</p>
            <p className="truncate text-[11px] text-zinc-400">
              Sign in to save scenes & watchlists
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-3 pb-3 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSignUp}
            className="btn btn-primary btn-sm justify-center"
          >
            <IconUserPlus className="h-4 w-4" />
            Sign up
          </button>
          <button
            type="button"
            onClick={onLogIn}
            className="btn btn-secondary btn-sm justify-center"
          >
            <IconUser className="h-4 w-4" />
            Log in
          </button>
        </div>

        {/* Quick tiles */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <QuickTile
            icon={<IconHeart className="h-4 w-4" />}
            label="Watchlist"
            to="/community"
            onClose={onClose}
            accent="rose"
          />
          <QuickTile
            icon={<IconRss className="h-4 w-4" />}
            label="Activity"
            to="/community"
            onClose={onClose}
            accent="cyan"
          />
          <QuickTile
            icon={<IconUpload className="h-4 w-4" />}
            label="Submit"
            to="/request"
            onClose={onClose}
            accent="lime"
          />
        </div>
      </div>

      {/* Settings list */}
      <ul className="border-t border-zinc-900 px-2 py-2">
        <DropdownRow
          icon={
            <span className="flag text-base leading-none" aria-hidden>
              {currentLanguage.flag}
            </span>
          }
          label="Language"
          value={currentLanguage.native}
          onClick={() => {
            // Close this dropdown and open the global picker via a custom event
            // that LanguageDropdown listens to.
            onClose?.();
            window.dispatchEvent(new CustomEvent("animedb:lang:open"));
          }}
        />
        <DropdownRow
          icon={<IconLocation className="h-4 w-4" />}
          label="Region"
          value={region}
          onClick={() =>
            setRegion((r) =>
              r === "United States"
                ? "Japan"
                : r === "Japan"
                ? "United Kingdom"
                : "United States"
            )
          }
        />
        <DropdownRow
          icon={<IconHelp className="h-4 w-4" />}
          label="FAQ"
          to="/faq"
          onClose={onClose}
        />
        <DropdownRow
          icon={<IconMessage className="h-4 w-4" />}
          label="Contact Support"
          to="/contact"
          onClose={onClose}
        />
      </ul>

      {/* Footer mini-strip */}
      <div className="flex items-center justify-between border-t border-zinc-900 bg-zinc-950/60 px-4 py-2.5 text-[10px] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_currentColor]" />
          All systems operational
        </span>
        <Link
          to="/privacy"
          onClick={onClose}
          className="font-semibold text-zinc-400 hover:text-fuchsia-300"
        >
          Privacy
        </Link>
      </div>

      <style>{`
        @keyframes menuPop {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}

// Quick-action tile — square, accent ring + glow on hover.
const QUICK_TILE_ACCENTS = {
  rose: {
    icon: "text-rose-300",
    bg: "bg-rose-500/10 group-hover:bg-rose-500/20",
    ring: "ring-rose-400/30 group-hover:ring-rose-400/50",
    glow: "group-hover:shadow-[0_0_18px_-6px_rgba(251,113,133,0.6)]",
  },
  cyan: {
    icon: "text-cyan-300",
    bg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    ring: "ring-cyan-400/30 group-hover:ring-cyan-400/50",
    glow: "group-hover:shadow-[0_0_18px_-6px_rgba(34,211,238,0.6)]",
  },
  lime: {
    icon: "text-lime-300",
    bg: "bg-lime-500/10 group-hover:bg-lime-500/20",
    ring: "ring-lime-400/30 group-hover:ring-lime-400/50",
    glow: "group-hover:shadow-[0_0_18px_-6px_rgba(163,230,53,0.6)]",
  },
};

function QuickTile({ icon, label, to, onClose, accent = "rose" }) {
  const a = QUICK_TILE_ACCENTS[accent];
  return (
    <Link
      to={to}
      onClick={onClose}
      className={`group flex flex-col items-center gap-1.5 rounded-xl ${a.bg} px-2 py-2.5 ring-1 transition ${a.ring} ${a.glow}`}
    >
      <span className={`grid h-7 w-7 place-items-center ${a.icon}`}>{icon}</span>
      <span className="text-[11px] font-bold text-zinc-100">{label}</span>
    </Link>
  );
}

function DropdownRow({ icon, label, value, to, onClick, onClose }) {
  const content = (
    <span className="flex w-full items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 transition group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-300 group-hover:ring-fuchsia-400/30">
        {icon}
      </span>
      <span className="flex-1 text-sm font-semibold text-zinc-200 group-hover:text-white">
        {label}
      </span>
      {value && (
        <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">
          {value}
        </span>
      )}
      <IconChevronRight className="h-3.5 w-3.5 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
    </span>
  );

  if (to) {
    return (
      <li>
        <Link
          to={to}
          onClick={onClose}
          className="group flex items-center rounded-lg px-2 py-2 transition hover:bg-zinc-900/80"
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center rounded-lg px-2 py-2 transition hover:bg-zinc-900/80"
      >
        {content}
      </button>
    </li>
  );
}

function MiniDropdown({ title, items, viewAllTo, align = "left", onClose }) {
  const sideClass = align === "right" ? "right-0" : "left-0";
  return (
    <div
      className={`dropdown-panel absolute ${sideClass} top-11 z-50 w-[min(94vw,340px)] origin-top`}
      role="menu"
    >
      <div className="relative z-[2] flex items-center justify-between border-b border-zinc-900/80 px-4 py-2.5">
        <h3 className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_currentColor]" />
          {title}
        </h3>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            onClick={onClose}
            className="group inline-flex items-center gap-1 text-[11px] font-bold text-funk-gradient hover:opacity-90"
          >
            View all
            <IconChevronRight className="h-3 w-3 text-fuchsia-300 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <ul className="relative z-[2] p-1.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              onClick={onClose}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-zinc-900/70"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 transition group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-300 group-hover:ring-fuchsia-400/30">
                {it.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-zinc-100 transition group-hover:text-white">
                  {it.label}
                </span>
                {it.hint && (
                  <span className="mt-0.5 block text-[11px] text-zinc-500">
                    {it.hint}
                  </span>
                )}
              </span>
              <IconChevronRight className="mt-1 h-3.5 w-3.5 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryMegaPanel({ onClose, genres, themes, demographics, topAnime }) {
  // Anchored to the viewport (not the Categories <li>) so the 1180px-wide
  // mega panel always centers under the header instead of overflowing off
  // the right edge. Header total height: 56px (row 1) + 48px (row 2) = 104px.
  return (
    <div
      className="dropdown-panel fixed left-1/2 top-[104px] z-50 max-h-[calc(100vh-120px)] w-[min(96vw,1180px)] origin-top -translate-x-1/2 overflow-y-auto"
      role="menu"
    >
      <div className="relative z-[2] grid gap-5 p-5 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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

// Static accent-name → tailwind classes lookup so each column can carry its own
// funky hue without breaking JIT class detection.
const COLUMN_ACCENTS = {
  fuchsia: { dot: "bg-fuchsia-400", text: "text-fuchsia-200", hoverText: "group-hover:text-fuchsia-300", hoverBg: "group-hover:bg-fuchsia-500/10", hoverRing: "group-hover:ring-fuchsia-400/30" },
  cyan:    { dot: "bg-cyan-400",    text: "text-cyan-200",    hoverText: "group-hover:text-cyan-300",    hoverBg: "group-hover:bg-cyan-500/10",    hoverRing: "group-hover:ring-cyan-400/30"    },
  violet:  { dot: "bg-violet-400",  text: "text-violet-200",  hoverText: "group-hover:text-violet-300",  hoverBg: "group-hover:bg-violet-500/10",  hoverRing: "group-hover:ring-violet-400/30"  },
  lime:    { dot: "bg-lime-400",    text: "text-lime-200",    hoverText: "group-hover:text-lime-300",    hoverBg: "group-hover:bg-lime-500/10",    hoverRing: "group-hover:ring-lime-400/30"    },
  amber:   { dot: "bg-amber-400",   text: "text-amber-200",   hoverText: "group-hover:text-amber-300",   hoverBg: "group-hover:bg-amber-500/10",   hoverRing: "group-hover:ring-amber-400/30"   },
  rose:    { dot: "bg-rose-400",    text: "text-rose-200",    hoverText: "group-hover:text-rose-300",    hoverBg: "group-hover:bg-rose-500/10",    hoverRing: "group-hover:ring-rose-400/30"    },
};

function ColumnHeader({ title, to, onClick, accent = "fuchsia" }) {
  const a = COLUMN_ACCENTS[accent] ?? COLUMN_ACCENTS.fuchsia;
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${a.text}`}>
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${a.dot} shadow-[0_0_8px_currentColor]`} />
        {title}
      </h3>
      {to && (
        <Link
          to={to}
          onClick={onClick}
          className="group grid h-5 w-5 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-900 hover:text-fuchsia-300"
          aria-label={`View all ${title}`}
        >
          <IconChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function DiscoverColumn({ onClick }) {
  return (
    <div>
      <ColumnHeader title="Discover Anime" accent="fuchsia" />
      <ul className="space-y-0.5">
        {DISCOVER_ITEMS.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              onClick={onClick}
              className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-900/70 hover:text-white"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 transition group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-300 group-hover:ring-fuchsia-400/30">
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
      <ColumnHeader title={title} to={to} onClick={onClick} accent="cyan" />
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
          // Search-suggestion thumb is 80px wide — use the tiny variant.
          const img =
            a.images?.webp?.image_url ??
            a.images?.jpg?.image_url ??
            a.images?.webp?.large_image_url ??
            a.images?.jpg?.large_image_url;
          return (
            <li key={a.mal_id}>
              <Link
                to={`/anime/${a.mal_id}`}
                onClick={onClick}
                className="group flex gap-2 rounded-lg p-1.5 transition hover:bg-zinc-900/70"
              >
                <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-zinc-800 ring-1 ring-zinc-800 transition group-hover:ring-cyan-400/40">
                  {img && (
                    <img
                      src={img}
                      alt={a.title}
                      loading="lazy"
                      decoding="async"
                      width="80"
                      height="45"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  )}
                  {a.score && (
                    <span className="absolute right-0.5 bottom-0.5 rounded bg-zinc-950/85 px-1 py-px text-[9px] font-bold text-cyan-200 ring-1 ring-cyan-400/30">
                      ★ {a.score.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-100 transition group-hover:text-cyan-200">
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

// Each LinkListColumn auto-rotates a funky accent based on its title hash so
// Genres / Themes / Demographics each get a different vibe in the mega panel.
function pickColumnAccent(title) {
  const accents = ["fuchsia", "violet", "lime", "amber", "rose"];
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  return accents[Math.abs(h) % accents.length];
}

function LinkListColumn({ title, to, items, onClick }) {
  const accent = pickColumnAccent(title);
  const a = COLUMN_ACCENTS[accent];
  return (
    <div>
      <ColumnHeader title={title} to={to} onClick={onClick} accent={accent} />
      <ul className="space-y-0.5">
        {items.map((g) => (
          <li key={g.mal_id}>
            <Link
              to={`/categories/${g.mal_id}`}
              onClick={onClick}
              className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-900/70 ${a.hoverText}`}
            >
              <span className="line-clamp-1">{g.name}</span>
              {g.count != null && (
                <span className="ml-2 text-[10px] tabular-nums text-zinc-500 transition group-hover:text-zinc-300">
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
      <ColumnHeader title={title} accent="rose" />
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((c, i) => {
          const palette = ["fuchsia", "cyan", "lime", "amber", "violet", "rose"];
          const accent = palette[i % palette.length];
          const a = COLUMN_ACCENTS[accent];
          return (
            <li key={c}>
              <Link
                to={`/search?q=${encodeURIComponent(c)}`}
                onClick={onClick}
                className={`group inline-block rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-zinc-800 ${a.hoverText} ${a.hoverRing}`}
              >
                {c}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
