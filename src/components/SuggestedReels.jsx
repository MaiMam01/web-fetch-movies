import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconEye, IconPlay } from "./Icons.jsx";
import { getAnimeVideos } from "../services/jikan.js";

const KIND_LABELS = {
  promo: "Trailer",
  music: "OP / ED",
  episode: "Episode",
};

export default function SuggestedReels({
  animeList = [],
  title = "Suggested Scenes & Reels",
  subtitle,
  limit = 12,
  viewAllTo = "/stories",
}) {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (animeList.length === 0) {
        setLoading(false);
        setTiles([]);
        return;
      }
      setLoading(true);

      const sources = animeList
        .map((entry) => entry.anime ?? entry)
        .filter((a) => a && a.mal_id)
        .slice(0, 4);

      const responses = await Promise.all(
        sources.map((a) =>
          getAnimeVideos(a.mal_id)
            .then((v) => ({ anime: a, videos: v }))
            .catch(() => ({ anime: a, videos: null }))
        )
      );

      if (cancelled) return;

      const collected = [];
      for (const { anime, videos } of responses) {
        if (!videos) continue;

        (videos.promo ?? []).forEach((p, i) => {
          if (!p.trailer?.image_url) return;
          collected.push({
            id: `${anime.mal_id}-promo-${i}`,
            kind: "promo",
            title: p.title || `Trailer ${i + 1}`,
            thumbnail: p.trailer.image_url,
            youtubeId: p.trailer.youtube_id,
            anime,
          });
        });

        (videos.music_videos ?? []).forEach((m, i) => {
          if (!m.video?.image_url) return;
          collected.push({
            id: `${anime.mal_id}-music-${i}`,
            kind: "music",
            title: m.title || m.meta?.title || `Music Video ${i + 1}`,
            thumbnail: m.video.image_url,
            youtubeId: m.video.youtube_id,
            anime,
          });
        });

        (videos.episodes ?? []).slice(0, 2).forEach((ep, i) => {
          const thumb =
            ep.images?.jpg?.image_url ?? ep.images?.webp?.image_url;
          if (!thumb) return;
          collected.push({
            id: `${anime.mal_id}-ep-${i}`,
            kind: "episode",
            title: ep.title || `Episode ${ep.episode ?? i + 1}`,
            thumbnail: thumb,
            episodeUrl: ep.url,
            anime,
          });
        });
      }

      const interleaved = interleaveBySource(collected);
      setTiles(interleaved.slice(0, limit));
      setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [animeList, limit]);

  if (!loading && tiles.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-100">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="text-xs font-bold text-brand-500 hover:underline"
          >
            View all reels
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
        {loading &&
          tiles.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonTile key={i} />)}
        {tiles.map((tile) => (
          <SuggestionTile key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}

function SuggestionTile({ tile }) {
  const animeHref = `/anime/${tile.anime.mal_id}`;
  const watchHref = tile.youtubeId
    ? `https://www.youtube.com/watch?v=${tile.youtubeId}`
    : tile.episodeUrl;
  const playable = Boolean(watchHref);

  // We render the thumbnail and the title/anime row as siblings (not nested)
  // so we don't end up with <a> inside <a> when a tile both plays externally
  // *and* exposes a link to the anime detail page.
  const Thumbnail = (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition group-hover:ring-brand-500">
      {tile.thumbnail && (
        <img
          src={tile.thumbnail}
          alt={tile.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 transition group-hover:bg-zinc-950/40">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-950/80 opacity-0 ring-1 ring-zinc-700 transition group-hover:opacity-100">
          <IconPlay className="h-4 w-4 text-brand-500" />
        </span>
      </div>
      <span className="absolute right-1.5 top-1.5 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-bold text-zinc-100">
        {KIND_LABELS[tile.kind] ?? "Reel"}
      </span>
      {tile.anime.score && (
        <span className="absolute left-1.5 bottom-1.5 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-bold text-brand-500">
          ★ {tile.anime.score.toFixed(1)}
        </span>
      )}
    </div>
  );

  return (
    <div className="group">
      {playable ? (
        <a
          href={watchHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Play ${tile.title}`}
          className="block"
        >
          {Thumbnail}
        </a>
      ) : (
        <Link to={animeHref} aria-label={tile.title} className="block">
          {Thumbnail}
        </Link>
      )}
      <div className="mt-2 flex items-center gap-1 text-[11px]">
        <Link
          to={animeHref}
          className="line-clamp-1 font-bold text-brand-500 hover:underline"
        >
          {tile.anime.title}
        </Link>
        <span
          className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-sky-500"
          aria-label="Verified"
        >
          <IconCheck className="h-2 w-2 text-zinc-950" />
        </span>
        {tile.anime.members != null && (
          <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-zinc-500">
            <IconEye className="h-3 w-3" />
            {formatCount(tile.anime.members)}
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 text-xs font-semibold text-zinc-100 transition group-hover:text-brand-500">
        {tile.title}
      </p>
    </div>
  );
}

function SkeletonTile() {
  return (
    <div>
      <div className="aspect-video w-full animate-pulse rounded-md bg-zinc-900" />
      <div className="mt-2 h-2.5 w-2/3 animate-pulse rounded bg-zinc-900" />
      <div className="mt-1.5 h-3 w-3/4 animate-pulse rounded bg-zinc-900" />
    </div>
  );
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function interleaveBySource(items) {
  const buckets = new Map();
  for (const it of items) {
    const key = it.anime.mal_id;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(it);
  }
  const out = [];
  let any = true;
  while (any) {
    any = false;
    for (const arr of buckets.values()) {
      const next = arr.shift();
      if (next) {
        out.push(next);
        any = true;
      }
    }
  }
  return out;
}
