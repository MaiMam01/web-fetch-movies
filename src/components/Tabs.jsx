export default function Tabs({ value, onChange, options = [] }) {
  return (
    <div className="-mx-1 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-900/70 p-1 backdrop-blur scrollbar-thin">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`group inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
              active
                ? "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/40"
                : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
            }`}
          >
            <span>{opt.label}</span>
            {opt.count != null && (
              <span
                className={`inline-flex min-w-[1.5rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                  active
                    ? "bg-zinc-950/30 text-zinc-950"
                    : "bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-700/80 group-hover:text-zinc-200"
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
