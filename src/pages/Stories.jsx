import { useEffect, useMemo, useState } from "react";
import StoryReel from "../components/StoryReel.jsx";
import StoryPlayer from "../components/StoryPlayer.jsx";
import SortDropdown from "../components/SortDropdown.jsx";
import { getTopAnime, getAnimeVideos } from "../services/jikan.js";

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

const SEED_LIMIT = 12;

export default function Stories() {
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("trending");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const top = await getTopAnime(SEED_LIMIT);
        if (cancelled) return;

        const collected = [];
        for (const a of top) {
          try {
            const v = await getAnimeVideos(a.mal_id);
            if (cancelled) return;
            const fallback =
              a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;

            (v?.music_videos ?? []).forEach((mv) => {
              const yt = mv.video?.youtube_id;
              if (!yt) return;
              collected.push({
                id: `mv-${a.mal_id}-${yt}`,
                kind: "music",
                title: mv.meta?.title || mv.title || "Music Video",
                anime_title: a.title,
                anime_mal_id: a.mal_id,
                youtube_id: yt,
                image: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
                fallback_image: fallback,
                views: a.members,
              });
            });

            (v?.promo ?? []).forEach((p, i) => {
              const yt = p.trailer?.youtube_id;
              if (!yt) return;
              collected.push({
                id: `pr-${a.mal_id}-${yt}-${i}`,
                kind: "promo",
                title: p.title || "Promo",
                anime_title: a.title,
                anime_mal_id: a.mal_id,
                youtube_id: yt,
                image:
                  p.trailer?.images?.maximum_image_url ??
                  p.trailer?.images?.large_image_url ??
                  `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
                fallback_image: fallback,
                views: a.members,
              });
            });

            await new Promise((r) => setTimeout(r, 350));
          } catch (e) {
            console.warn(`videos lookup failed for ${a.mal_id}`, e);
          }
        }

        if (!cancelled) setStories(collected);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = stories;
    if (tab !== "all") list = list.filter((s) => s.kind === tab);
    if (sort === "title")
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [stories, tab, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Vertical reels
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
            Stories at <span className="text-brand-500">AnimeDB</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            OP/ED snippets, music videos, and promos — pulled live from each
            title&apos;s official video reel. Click any tile to play.
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
                    ? "bg-brand-500 text-zinc-950"
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

      {error && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && stories.length === 0 ? (
        <Skeleton />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {filtered.map((s, i) => (
            <StoryReel key={s.id} story={s} onClick={() => setPlayerIndex(i)} />
          ))}
        </div>
      )}

      {loading && stories.length > 0 && (
        <p className="mt-6 text-center text-xs text-zinc-500">
          Streaming in more reels…
        </p>
      )}

      {playerIndex != null && (
        <StoryPlayer
          stories={filtered}
          index={Math.min(playerIndex, filtered.length - 1)}
          onClose={() => setPlayerIndex(null)}
          onChange={setPlayerIndex}
        />
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[9/16] animate-pulse rounded-md bg-zinc-900"
        />
      ))}
    </div>
  );
}
