export default function Tabs({ value, onChange, options = [] }) {
  return (
    <div className="border-b border-zinc-800">
      <div className="flex items-center gap-6">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`relative pb-2.5 text-sm font-semibold transition ${
                active ? "text-brand-500" : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {opt.label}
              {opt.count != null && (
                <span className="ml-1.5 text-[10px] text-zinc-500">
                  {opt.count}
                </span>
              )}
              {active && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
