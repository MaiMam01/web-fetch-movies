import { IconChevronRight } from "./Icons.jsx";

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const items = buildPageList(page, totalPages);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {items.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="grid h-9 w-9 place-items-center text-zinc-500"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-9 min-w-[2.25rem] place-items-center rounded-md px-2 text-sm font-semibold transition ${
              p === page
                ? "bg-brand-500 text-zinc-950"
                : "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="ml-1 inline-flex h-9 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
      >
        Next
        <IconChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
