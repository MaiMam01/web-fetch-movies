// Static palette (Tailwind JIT-safe) cycled across non-highlight chips so a long
// tag list reads like a colourful spectrum instead of a wall of zinc.
const PALETTE = [
  { bg: "bg-fuchsia-500/10", text: "text-fuchsia-200", ring: "ring-fuchsia-400/30", hoverText: "hover:text-fuchsia-100", hoverBg: "hover:bg-fuchsia-500/20" },
  { bg: "bg-violet-500/10",  text: "text-violet-200",  ring: "ring-violet-400/30",  hoverText: "hover:text-violet-100",  hoverBg: "hover:bg-violet-500/20"  },
  { bg: "bg-cyan-400/10",    text: "text-cyan-200",    ring: "ring-cyan-400/30",    hoverText: "hover:text-cyan-100",    hoverBg: "hover:bg-cyan-400/20"    },
  { bg: "bg-sky-400/10",     text: "text-sky-200",     ring: "ring-sky-400/30",     hoverText: "hover:text-sky-100",     hoverBg: "hover:bg-sky-400/20"     },
  { bg: "bg-emerald-400/10", text: "text-emerald-200", ring: "ring-emerald-400/30", hoverText: "hover:text-emerald-100", hoverBg: "hover:bg-emerald-400/20" },
  { bg: "bg-lime-400/10",    text: "text-lime-200",    ring: "ring-lime-400/30",    hoverText: "hover:text-lime-100",    hoverBg: "hover:bg-lime-400/20"    },
  { bg: "bg-amber-400/10",   text: "text-amber-200",   ring: "ring-amber-400/30",   hoverText: "hover:text-amber-100",   hoverBg: "hover:bg-amber-400/20"   },
  { bg: "bg-rose-400/10",    text: "text-rose-200",    ring: "ring-rose-400/30",    hoverText: "hover:text-rose-100",    hoverBg: "hover:bg-rose-400/20"    },
];

// Deterministic accent picker so the same tag string always lands on the same
// colour — keeps the palette stable across renders and routes.
function hashIndex(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE.length;
}

export default function TagChips({ tags = [], highlight = null }) {
  if (!tags.length) return null;
  return (
    <div className="mt-10 flex flex-wrap gap-2">
      {tags.map((t, i) => {
        const isHighlight = highlight ? t === highlight : i === 0;
        if (isHighlight) {
          return (
            <span
              key={`${t}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.6)] ring-1 ring-fuchsia-300/50"
            >
              <span aria-hidden className="opacity-90">✦</span>
              {t}
            </span>
          );
        }
        const c = PALETTE[hashIndex(String(t))];
        return (
          <span
            key={`${t}-${i}`}
            className={`group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${c.bg} ${c.text} ${c.ring} ${c.hoverText} ${c.hoverBg}`}
          >
            <span aria-hidden className="text-[10px] opacity-60 transition group-hover:opacity-90">#</span>
            {t}
          </span>
        );
      })}
    </div>
  );
}
