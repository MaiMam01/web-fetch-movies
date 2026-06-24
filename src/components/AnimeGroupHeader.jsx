import { Link } from "react-router-dom";
import { IconChevronRight } from "./Icons.jsx";

const TYPE_COLORS = {
  TV: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
  Movie: "bg-purple-500/20 text-purple-300 ring-purple-500/30",
  OVA: "bg-sky-500/20 text-sky-300 ring-sky-500/30",
  ONA: "bg-sky-500/20 text-sky-300 ring-sky-500/30",
  Special: "bg-pink-500/20 text-pink-300 ring-pink-500/30",
  Music: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30",
};

export default function AnimeGroupHeader({ anime, badge, year, role }) {
  const malId = anime?.mal_id;
  const title = anime?.title || anime?.title_english;
  const tag = badge || anime?.type || "TV";
  const yr = year || anime?.year || anime?.aired?.prop?.from?.year;
  const colorClass =
    TYPE_COLORS[tag] || "bg-zinc-700/40 text-zinc-200 ring-zinc-600/40";

  return (
    <Link
      to={malId ? `/anime/${malId}` : "#"}
      className="group mb-3 inline-flex items-center gap-2"
    >
      <span className="block h-5 w-1 rounded bg-brand-500" />
      <span className="text-sm font-semibold text-brand-500">{title}</span>
      {yr && <span className="text-xs text-zinc-400">({yr})</span>}
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${colorClass}`}
      >
        {tag}
      </span>
      {role && (
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
          {role}
        </span>
      )}
      <IconChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  );
}
