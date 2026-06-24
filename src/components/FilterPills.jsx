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
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-brand-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:text-zinc-100"
            }`}
          >
            {opt.label}
            {opt.count != null && (
              <span
                className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                  active ? "bg-zinc-950/30 text-zinc-950" : "text-zinc-500"
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
