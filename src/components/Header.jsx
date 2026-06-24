import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  IconMenu,
  IconSearch,
  IconUser,
  IconChevronDown,
} from "./Icons.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/top", label: "Top 100" },
  { to: "/categories", label: "Categories", hasDropdown: true },
  { to: "/a-z", label: "A-Z", hasDropdown: true },
  { to: "/series", label: "Series" },
  { to: "/films", label: "Films" },
  { to: "/characters", label: "Characters" },
  { to: "/scenes", label: "Scenes" },
  { to: "/voice-actors", label: "Voice Actors" },
];

export default function Header() {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur">
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen((s) => !s)}
            className="grid h-9 w-9 place-items-center rounded text-zinc-300 hover:bg-zinc-800 md:hidden"
            aria-label="Toggle menu"
          >
            <IconMenu className="h-5 w-5" />
          </button>

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
          {NAV_ITEMS.map((item) => (
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
          ))}
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
