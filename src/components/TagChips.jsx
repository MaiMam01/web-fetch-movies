export default function TagChips({ tags = [], highlight = null }) {
  if (!tags.length) return null;
  return (
    <div className="mt-10 flex flex-wrap gap-2">
      {tags.map((t, i) => {
        const isHighlight = highlight ? t === highlight : i === 0;
        return (
          <span
            key={t}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isHighlight
                ? "bg-brand-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:text-zinc-100"
            }`}
          >
            {t}
            {isHighlight && <span aria-hidden>✦</span>}
          </span>
        );
      })}
    </div>
  );
}
