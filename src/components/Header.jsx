import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "text-brand-500" : "text-zinc-300 hover:text-white"
  }`;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded bg-brand-500 px-2 py-1 text-sm font-black tracking-tight text-zinc-950">
            AnimeDB
          </span>
          <span className="hidden text-sm text-zinc-400 sm:inline">
            The IMDB for Anime
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/top" className={navLinkClass}>
            Top 100
          </NavLink>
          <NavLink to="/scenes" className={navLinkClass}>
            Scenes
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
