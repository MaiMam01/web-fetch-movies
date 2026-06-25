import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  getGenres,
  getTopAnime,
  searchAnime,
  searchCharacters,
  searchPeople,
} from "../services/jikan.js";
import AuthModal from "./AuthModal.jsx";
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
  IconThumbsUp,
  IconUpload,
  IconGlobe,
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
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6 lg:px-8">
          <div className="relative" ref={trendingRef}>
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
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((s) => !s);
                  setTrendingOpen(false);
                  setOpenNav(null);
                }}
                className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                  accountOpen
                    ? "border-brand-500 bg-zinc-800 text-brand-500"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                }`}
                aria-label="Account"
                aria-expanded={accountOpen}
              >
                <IconUser className="h-4 w-4" />
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
          className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8"
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
                    `inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-brand-500"
                        : "text-zinc-300 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={() =>
            setAuthMode((m) => (m === "signup" ? "login" : "signup"))
          }
        />
      )}

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

function SearchSuggestionsPanel({ query, topAnime, results, onClose }) {
  const q = query.trim();
  const showTrending = q.length < 2;

  return (
    <div className="absolute left-0 right-0 top-12 z-50 max-h-[75vh] w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
      {showTrending ? (
        <>
          <SuggestSection title="Trending Searches">
            <ul className="space-y-1.5">
              {TRENDING_SEARCHES.map((t) => (
                <li key={t}>
                  <Link
                    to={`/search?q=${encodeURIComponent(t)}`}
                    onClick={onClose}
                    className="block rounded px-1 py-0.5 text-sm text-zinc-200 transition hover:text-brand-500"
                  >
                    {t}
                  </Link>
                </li>
              ))}
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
                        className="group flex items-center gap-3 rounded p-1.5 transition hover:bg-zinc-900"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-800">
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
                          <p className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-brand-500">
                            {a.title}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {a.type ?? "TV"} · ★ {a.score?.toFixed(1) ?? "—"}
                          </p>
                        </div>
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
                  className="font-bold text-brand-500 hover:underline"
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

          <div className="mt-4 border-t border-zinc-900 pt-3">
            <Link
              to={`/search?q=${encodeURIComponent(q)}`}
              onClick={onClose}
              className="flex items-center justify-between rounded px-2 py-2 text-sm font-bold text-brand-500 transition hover:bg-zinc-900"
            >
              <span>
                See all results for <span className="italic">"{q}"</span>
              </span>
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function SuggestSection({ title, viewAllTo, onClose, className = "", children }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-50">{title}</h3>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            onClick={onClose}
            className="text-xs font-bold text-brand-500 hover:underline"
          >
            View all
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
              className="group flex items-center gap-3 rounded p-1.5 transition hover:bg-zinc-900"
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-800">
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
                <p className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-brand-500">
                  {getName(it)}
                </p>
                <p className="text-[11px] text-zinc-500">{getMeta(it)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AccountDropdown({ onClose, onSignUp, onLogIn }) {
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States");

  return (
    <div
      className="absolute right-0 top-12 z-50 w-[min(94vw,320px)] origin-top-right overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
      role="menu"
    >
      <div className="grid grid-cols-3 gap-2">
        <AccountIconButton
          icon={<IconUserPlus className="h-5 w-5" />}
          label="Sign Up"
          onClick={onSignUp}
          accent
        />
        <AccountIconButton
          icon={<IconUser className="h-5 w-5" />}
          label="Log In"
          onClick={onLogIn}
        />
        <AccountIconButton
          icon={<IconThumbsUp className="h-5 w-5" />}
          label="Watchlist"
          to="/community"
          onClose={onClose}
        />
      </div>

      <ul className="mt-4 space-y-0.5 border-t border-zinc-900 pt-3">
        <DropdownRow
          icon={<IconRss className="h-4 w-4" />}
          label="Activity Feed"
          to="/community"
          onClose={onClose}
        />
        <DropdownRow
          icon={<IconUpload className="h-4 w-4" />}
          label="Submit a Scene"
          to="/request"
          onClose={onClose}
        />
        <DropdownRow
          icon={<IconGlobe className="h-4 w-4" />}
          label={language}
          chevron
          onClick={() =>
            setLanguage((l) =>
              l === "English" ? "Japanese" : l === "Japanese" ? "Spanish" : "English"
            )
          }
        />
        <DropdownRow
          icon={<IconLocation className="h-4 w-4" />}
          label={region}
          chevron
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
    </div>
  );
}

function AccountIconButton({ icon, label, onClick, to, onClose, accent = false }) {
  const ringClass = accent
    ? "ring-brand-500/60 text-brand-500 group-hover:bg-brand-500 group-hover:text-zinc-950"
    : "ring-zinc-800 text-zinc-200 group-hover:bg-zinc-800 group-hover:text-white";

  const inner = (
    <div className="group flex flex-col items-center gap-1.5">
      <span
        className={`grid h-12 w-12 place-items-center rounded-full bg-zinc-900 ring-1 transition ${ringClass}`}
      >
        {icon}
      </span>
      <span className="text-[11px] font-bold text-zinc-200">{label}</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClose} className="block">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full">
      {inner}
    </button>
  );
}

function DropdownRow({ icon, label, to, onClick, onClose, chevron = false }) {
  const content = (
    <span className="flex w-full items-center gap-3">
      <span className="text-zinc-400">{icon}</span>
      <span className="flex-1 text-sm font-semibold text-zinc-100">{label}</span>
      {chevron && <IconChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
    </span>
  );

  if (to) {
    return (
      <li>
        <Link
          to={to}
          onClick={onClose}
          className="group flex items-center rounded px-2 py-2.5 transition hover:bg-zinc-900"
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
        className="group flex w-full items-center rounded px-2 py-2.5 transition hover:bg-zinc-900"
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
      className={`absolute ${sideClass} top-11 z-50 w-[min(94vw,320px)] origin-top overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl`}
      role="menu"
    >
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-100">
          {title}
        </h3>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-500 hover:underline"
          >
            View all
            <IconChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <ul className="p-1.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              onClick={onClose}
              className="group flex items-start gap-3 rounded px-3 py-2.5 transition hover:bg-zinc-900"
            >
              <span className="mt-0.5 text-zinc-500 group-hover:text-brand-500">
                {it.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-zinc-100 group-hover:text-brand-500">
                  {it.label}
                </span>
                {it.hint && (
                  <span className="mt-0.5 block text-[11px] text-zinc-500">
                    {it.hint}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
