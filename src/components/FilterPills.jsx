export default function FilterPills({ value, onChange, options = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.55)] ring-1 ring-fuchsia-300/50"
                : "bg-zinc-900/80 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-white hover:ring-fuchsia-400/30"
            }`}
          >
            {opt.label}
            {opt.count != null && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ring-1 ${
                  active
                    ? "bg-white/20 text-white ring-white/30"
                    : "bg-zinc-950/60 text-zinc-400 ring-zinc-800 group-hover:text-zinc-200 group-hover:ring-zinc-700"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
