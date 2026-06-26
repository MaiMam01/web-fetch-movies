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
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
        className="btn btn-secondary btn-sm btn-icon"
      >
        <IconChevronRight className="h-4 w-4 -scale-x-100" />
      </button>
      {items.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="grid h-9 w-9 place-items-center text-zinc-500"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Go to page ${p}`}
            className={`btn btn-sm min-w-[2.25rem] !rounded-md ${
              p === page
                ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_14px_-4px_rgba(232,121,249,0.6)] ring-1 ring-fuchsia-300/50"
                : "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
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
        aria-label="Next page"
        className="btn btn-secondary btn-sm btn-icon"
      >
        <IconChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
