import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StoryReel from "../components/StoryReel.jsx";
import StoryPlayer from "../components/StoryPlayer.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import REELS from "../data/storyReels.json";
import {
  IconPlay,
  IconStar,
  IconHeart,
  IconImage,
  IconTrendUp,
} from "../components/Icons.jsx";

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title A → Z" },
];

// Each navbar dropdown entry navigates to a different (type, sort) combination
// of this page. The variant gives the page header a unique colour + label.
// Static Tailwind classes (no string interpolation) so the JIT compiler picks
// them up.
const PAGE_VARIANTS = {
  music: {
    eyebrow: "Music videos",
    eyebrowIcon: IconStar,
    title: ["OP & ED", "Themes"],
    subtitle:
      "Every opening, ending, and character song we have on file — vibe-checked and ready to play.",
    accent: {
      pill: "bg-cyan-400/15 text-cyan-200 ring-cyan-400/30",
      gradient: "from-cyan-300 via-sky-300 to-violet-300",
      glow: "shadow-[0_0_28px_-8px_rgba(34,211,238,0.55)]",
    },
  },
  promo: {
    eyebrow: "Trailers",
    eyebrowIcon: IconTrendUp,
    title: ["Promos &", "Trailers"],
    subtitle:
      "Official previews, teasers, and PVs straight from each title's video reel.",
    accent: {
      pill: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
      gradient: "from-amber-300 via-orange-300 to-rose-300",
      glow: "shadow-[0_0_28px_-8px_rgba(251,191,36,0.55)]",
    },
  },
  trending: {
    eyebrow: "What fans are watching",
    eyebrowIcon: IconHeart,
    title: ["Trending", "Reels"],
    subtitle:
      "Sorted by member count — the most-watched titles bubble up first.",
    accent: {
      pill: "bg-rose-400/15 text-rose-200 ring-rose-400/30",
      gradient: "from-rose-300 via-pink-300 to-fuchsia-300",
      glow: "shadow-[0_0_28px_-8px_rgba(244,114,182,0.55)]",
    },
  },
  all: {
    eyebrow: "Vertical reels",
    eyebrowIcon: IconPlay,
    title: ["Stories at", "AnimeDB"],
    subtitle:
      "OP/ED snippets, music videos, and promos pulled from each title's video reel. Click any tile to play.",
    accent: {
      pill: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
      gradient: "from-fuchsia-400 via-violet-400 to-cyan-300",
      glow: "shadow-[0_0_28px_-8px_rgba(232,121,249,0.55)]",
    },
  },
};

function resolveVariant(type, sort) {
  if (type === "music") return PAGE_VARIANTS.music;
  if (type === "promo") return PAGE_VARIANTS.promo;
  if (sort === "trending" && type === "all") return PAGE_VARIANTS.trending;
  return PAGE_VARIANTS.all;
}

export default function Stories() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("type") ?? "all";
  const sort = params.get("sort") ?? "trending";

  const setTab = (value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("type");
    else next.set("type", value);
    setParams(next, { replace: true });
  };
  const setSort = (value) => {
    const next = new URLSearchParams(params);
    if (value === "trending") next.delete("sort");
    else next.set("sort", value);
    setParams(next, { replace: true });
  };

  const [stories] = useState(REELS);
  const [playerId, setPlayerId] = useState(null);

  const variant = resolveVariant(tab, sort);
  const VariantIcon = variant.eyebrowIcon;

  // Aggregate stats once — used in tab counts and the hero stat strip.
  const stats = useMemo(() => {
    const counts = { all: stories.length, music: 0, promo: 0 };
    const titles = new Set();
    stories.forEach((s) => {
      if (s.kind in counts) counts[s.kind] += 1;
      if (s.anime_mal_id) titles.add(s.anime_mal_id);
    });
    return { ...counts, uniqueAnime: titles.size };
  }, [stories]);

  const TYPE_TABS = [
    { value: "all", label: "All", count: stats.all },
    { value: "music", label: "OP & ED", count: stats.music },
    { value: "promo", label: "Promos & Trailers", count: stats.promo },
  ];

  const filtered = useMemo(() => {
    let list = stories;
    if (tab !== "all") list = list.filter((s) => s.kind === tab);
    if (sort === "title") {
      list = [...list].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else if (sort === "newest") {
      list = [...list].reverse();
    } else if (sort === "trending") {
      list = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    return list;
  }, [stories, tab, sort]);

  return (
    <div className="page-container py-8 sm:py-10">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950/60 px-6 py-8 sm:px-10 sm:py-10">
        {/* Decorative gradient blobs */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br ${variant.accent.gradient} opacity-[0.12] blur-3xl`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-tr ${variant.accent.gradient} opacity-[0.08] blur-3xl`}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${variant.accent.pill}`}
            >
              <VariantIcon className="h-3 w-3" />
              {variant.eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {variant.title[0]}{" "}
              <span
                className={`bg-gradient-to-r ${variant.accent.gradient} bg-clip-text text-transparent`}
              >
                {variant.title[1]}
              </span>
            </h1>
            <p className="mt-3 max-w-prose text-sm text-zinc-400 sm:text-base">
              {variant.subtitle}
            </p>
          </div>

          {/* Stat tiles */}
          <ul className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Reels" value={stats.all} accent="fuchsia" />
            <StatTile label="OP / ED" value={stats.music} accent="cyan" />
            <StatTile label="Trailers" value={stats.promo} accent="amber" />
            <StatTile
              label="Series"
              value={stats.uniqueAnime}
              accent="emerald"
            />
          </ul>
        </div>
      </header>

      {/* ─── FILTER BAR ───────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="-mx-1 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-900/70 p-1 backdrop-blur scrollbar-thin">
          {TYPE_TABS.map((t) => {
            const isActive = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                aria-pressed={isActive}
                className={`group inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                  isActive
                    ? `bg-gradient-to-r ${variant.accent.gradient} text-zinc-950 ${variant.accent.glow} ring-1 ring-white/40`
                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`inline-flex min-w-[1.75rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                    isActive
                      ? "bg-zinc-950/30 text-zinc-950"
                      : "bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-700/80 group-hover:text-zinc-200"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-[11px] font-semibold uppercase tracking-widest text-zinc-500 sm:block">
            Showing{" "}
            <span className="text-zinc-200 tabular-nums">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "reel" : "reels"}
          </p>
          <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>
      </div>

      {/* ─── GRID / EMPTY ─────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <IconImage className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-200">
            No reels match this filter
          </p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Try a different tab or sort, or reset to view all reels.
          </p>
          <button
            type="button"
            onClick={() => {
              setTab("all");
              setSort("trending");
            }}
            className="mt-5 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-zinc-100 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
          {filtered.map((s) => (
            <StoryReel key={s.id} story={s} onClick={() => setPlayerId(s.id)} />
          ))}
        </div>
      )}

      {(() => {
        if (playerId == null || filtered.length === 0) return null;
        const idx = filtered.findIndex((s) => s.id === playerId);
        if (idx < 0) return null;
        return (
          <StoryPlayer
            stories={filtered}
            index={idx}
            onClose={() => setPlayerId(null)}
            onChange={(nextIdx) => {
              const nextStory = filtered[nextIdx];
              if (nextStory) setPlayerId(nextStory.id);
            }}
          />
        );
      })()}
    </div>
  );
}

const STAT_ACCENTS = {
  fuchsia: {
    bar: "from-fuchsia-400 to-violet-500",
    text: "text-fuchsia-200",
  },
  cyan: {
    bar: "from-cyan-300 to-sky-500",
    text: "text-cyan-200",
  },
  amber: {
    bar: "from-amber-300 to-orange-500",
    text: "text-amber-200",
  },
  emerald: {
    bar: "from-emerald-300 to-teal-500",
    text: "text-emerald-200",
  },
};

function StatTile({ label, value, accent = "fuchsia" }) {
  const a = STAT_ACCENTS[accent] ?? STAT_ACCENTS.fuchsia;
  return (
    <li className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-3 py-2.5 transition hover:border-zinc-700 hover:bg-zinc-900/80">
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${a.bar} opacity-70 transition group-hover:opacity-100`}
      />
      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${a.text}`}>
        {label}
      </p>
      <p className="mt-0.5 text-xl font-black tabular-nums text-white sm:text-2xl">
        {value.toLocaleString()}
      </p>
    </li>
  );
}
