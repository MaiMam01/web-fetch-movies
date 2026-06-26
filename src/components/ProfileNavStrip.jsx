export default function ProfileNavStrip({ tabs = [], value, onChange, actions }) {
  return (
    <div className="page-container">
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab pills — matches the rest of the site (fuchsia → cyan gradient on active) */}
        <nav className="-mx-1 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-900/70 p-1 backdrop-blur scrollbar-thin">
          {tabs.map((t) => {
            const active = t.value === value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange(t.value)}
                aria-pressed={active}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                  active
                    ? "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/40"
                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center ${
                    active ? "text-zinc-950" : "text-zinc-400"
                  }`}
                >
                  {t.icon}
                </span>
                {t.label}
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
