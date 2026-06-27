import { IconClose, IconSliders } from "./Icons.jsx";

/**
 * Displays the currently applied filters as dismissable pills.
 *
 * Each filter is `{ key, label, accent, onClear }`. `accent` is optional and
 * defaults to fuchsia; supported: fuchsia, cyan, amber, emerald. There's also
 * a "Clear all" button when more than one filter is active.
 */

const ACCENT = {
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/30",
  cyan: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/30",
  amber: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  emerald: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
};

export default function ActiveFiltersBar({ filters = [], onClearAll }) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        <IconSliders className="h-3 w-3" />
        Active
      </span>
      <ul className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const accent = ACCENT[f.accent ?? "fuchsia"] ?? ACCENT.fuchsia;
          return (
            <li key={f.key}>
              <button
                type="button"
                onClick={f.onClear}
                aria-label={`Remove ${f.label} filter`}
                className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition hover:brightness-110 ${accent}`}
              >
                {f.leading && <span className="shrink-0">{f.leading}</span>}
                <span className="line-clamp-1 max-w-[140px]">{f.label}</span>
                <span className="grid h-4 w-4 place-items-center rounded-full bg-zinc-950/40 text-current transition group-hover:bg-zinc-950/70">
                  <IconClose className="h-2.5 w-2.5" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {filters.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto text-[11px] font-semibold text-zinc-500 transition hover:text-zinc-200"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
