import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StoryReel from "../components/StoryReel.jsx";
import StoryPlayer from "../components/StoryPlayer.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import REELS from "../data/storyReels.json";

const TYPE_TABS = [
  { value: "all", label: "All" },
  { value: "music", label: "OP & ED" },
  { value: "promo", label: "Promos & Trailers" },
];

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title A → Z" },
];

// Each navbar dropdown entry navigates to a different (type, sort) combination
// of this page. The mapping below drives the page header so users always see
// a clear "what am I looking at" eyebrow / title.
const PAGE_VARIANTS = [
  {
    match: (type, sort) => type === "music",
    eyebrow: "Music videos",
    title: ["OP & ED", "Themes"],
    subtitle:
      "Every opening, ending, and character song we have on file — vibe-checked and ready to play.",
  },
  {
    match: (type, sort) => type === "promo",
    eyebrow: "Trailers",
    title: ["Promos &", "Trailers"],
    subtitle:
      "Official previews, teasers, and PVs straight from each title's video reel.",
  },
  {
    match: (type, sort) => sort === "trending" && type === "all",
    eyebrow: "What fans are watching",
    title: ["Trending", "Reels"],
    subtitle:
      "Sorted by member count — the most-watched titles bubble up first.",
  },
  {
    match: () => true, // fallback
    eyebrow: "Vertical reels",
    title: ["Stories at", "AnimeDB"],
    subtitle:
      "OP/ED snippets, music videos, and promos pulled from each title's video reel. Click any tile to play.",
  },
];

export default function Stories() {
  const [params, setParams] = useSearchParams();
  // URL params drive the filter state directly (`/stories?type=music`,
  // `/stories?sort=trending`, etc.) so the four navbar entries each act as
  // first-class pages. Updating filters writes back to the URL so the
  // browser's back button + bookmarks behave intuitively.
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

  // Reels are baked from Jikan via `scripts/precompute-stories.mjs` and ship
  // with the bundle, so the grid is fully populated on first paint — no API
  // calls, no skeleton, no flaky 504s.
  const [stories] = useState(REELS);
  const [playerId, setPlayerId] = useState(null);

  const variant = PAGE_VARIANTS.find((v) => v.match(tab, sort)) ?? PAGE_VARIANTS[PAGE_VARIANTS.length - 1];

  const filtered = useMemo(() => {
    let list = stories;
    if (tab !== "all") list = list.filter((s) => s.kind === tab);
    if (sort === "title") {
      list = [...list].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else if (sort === "newest") {
      // Reels arrived in API order (top anime first). Reverse so the latest
      // additions visually come first — gives users a usable "Newest" option.
      list = [...list].reverse();
    } else if (sort === "trending") {
      // Higher member count on the source anime → more "trending".
      list = [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    return list;
  }, [stories, tab, sort]);

  return (
    <div className="page-container py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            {variant.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
            {variant.title[0]} <span className="text-funk-gradient">{variant.title[1]}</span>
          </h1>
          <p className="mt-1 max-w-prose text-sm text-zinc-400">
            {variant.subtitle}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span className="text-zinc-200">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "reel" : "reels"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1 text-xs">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={`rounded px-3 py-1.5 font-semibold transition ${
                  tab === t.value
                    ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.55)] ring-1 ring-fuchsia-300/50"
                    : "text-zinc-300 hover:text-zinc-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
          No reels match this filter — try a different tab or sort.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
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
