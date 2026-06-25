export default function ProfileNavStrip({ tabs = [], value, onChange, actions }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-5 flex flex-col gap-3 border-b border-zinc-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1">
          {tabs.map((t) => {
            const active = t.value === value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange(t.value)}
                aria-current={active ? "page" : undefined}
                className="group relative inline-flex shrink-0 flex-col items-center gap-1 px-3 py-1.5 sm:flex-row sm:gap-2 sm:py-2"
              >
                <span
                  className={`grid h-8 w-8 place-items-center transition ${
                    active
                      ? "text-brand-500"
                      : "text-zinc-400 group-hover:text-zinc-100"
                  }`}
                >
                  {t.icon}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider sm:text-xs ${
                    active
                      ? "text-brand-500"
                      : "text-zinc-300 group-hover:text-zinc-100"
                  }`}
                >
                  {t.label}
                </span>
                {active && (
                  <span className="absolute -bottom-[13px] left-3 right-3 h-0.5 rounded-t bg-brand-500" />
                )}
              </button>
            );
          })}
        </nav>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
