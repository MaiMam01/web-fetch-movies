import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import scenesData from "../data/scenes.json";
import { getAnimeById, getEpisode, getEpisodes } from "../services/jikan.js";
import SceneTile from "../components/SceneTile.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import {
  IconChevronRight,
  IconImage,
  IconPlay,
  IconStar,
  IconCalendar,
  IconClose,
  StarRating,
} from "../components/Icons.jsx";

export default function EpisodeDetail() {
  const { malId, epNum } = useParams();
  const epNumber = Number(epNum);

  const [anime, setAnime] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allScenes = scenesData.scenes ?? [];

  usePageTitle(
    anime
      ? `${anime.title_english || anime.title} · Ep ${epNumber}`
      : null
  );

  // Scenes for this episode (and adjacent episodes, used for "More from
  // this anime" when the current ep has none catalogued yet).
  const episodeScenes = useMemo(
    () =>
      allScenes.filter(
        (s) =>
          String(s.mal_id) === String(malId) &&
          Number(s.episode) === epNumber
      ),
    [allScenes, malId, epNumber]
  );

  const otherSceneEpisodes = useMemo(() => {
    const map = new Map();
    allScenes
      .filter(
        (s) =>
          String(s.mal_id) === String(malId) &&
          Number(s.episode) !== epNumber
      )
      .forEach((s) => {
        const key = `${s.season ?? 1}-${s.episode}`;
        if (!map.has(key)) map.set(key, { key, season: s.season ?? 1, episode: s.episode, scenes: [] });
        map.get(key).scenes.push(s);
      });
    return Array.from(map.values()).sort(
      (a, b) => a.season - b.season || a.episode - b.episode
    );
  }, [allScenes, malId, epNumber]);

  // Grouped scene list — declared up here so it isn't called after an early
  // return below (Rules of Hooks).
  const sceneGroups = useMemo(() => {
    const map = new Map();
    episodeScenes.forEach((s) => {
      const key = s.character || "Notable moments";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });
    return Array.from(map.entries());
  }, [episodeScenes]);

  useEffect(() => {
    let cancelled = false;
    // Reset prior episode state immediately so we never flash stale title
    // metadata when navigating between episodes/anime.
    setAnime(null);
    setEpisode(null);
    setSiblings([]);
    setError(null);
    setLoading(true);

    async function run() {
      try {
        const [a, ep, list] = await Promise.all([
          getAnimeById(malId).catch(() => null),
          getEpisode(malId, epNumber).catch(() => null),
          getEpisodes(malId).catch(() => []),
        ]);
        if (cancelled) return;
        setAnime(a);
        setEpisode(ep);
        setSiblings(list);
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
  }, [malId, epNumber]);

  if (loading) {
    return <EpisodeSkeleton />;
  }

  // True 404: neither the anime nor the episode itself resolved. The catalogue
  // returned nothing, so the user followed an invalid /anime/:malId/episode/:epNum
  // URL — render a dedicated not-found state with recovery links.
  if (!anime && !episode) {
    return <EpisodeNotFound malId={malId} epNumber={epNumber} />;
  }

  if (error && !anime) {
    return (
      <div className="page-container py-12">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Could not load this episode. {error}
        </div>
      </div>
    );
  }

  const prevEp = siblings.find((e) => e.mal_id === epNumber - 1);
  const nextEp = siblings.find((e) => e.mal_id === epNumber + 1);
  const epTitle = episode?.title || `Episode ${epNumber}`;
  const epAired = episode?.aired
    ? new Date(episode.aired).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const animeTitle = anime?.title_english || anime?.title || "Anime";
  const poster =
    anime?.images?.webp?.large_image_url ??
    anime?.images?.jpg?.large_image_url;

  return (
    <div className="page-container py-8 sm:py-10">
      {/* ─── BREADCRUMB ────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold"
      >
        <Link
          to="/"
          className="rounded-full bg-zinc-900/60 px-2.5 py-1 text-zinc-400 ring-1 ring-zinc-800 transition hover:text-white"
        >
          Home
        </Link>
        <IconChevronRight className="h-3 w-3 text-zinc-600" />
        <Link
          to={`/anime/${malId}`}
          className="line-clamp-1 max-w-[200px] rounded-full bg-zinc-900/60 px-2.5 py-1 text-zinc-400 ring-1 ring-zinc-800 transition hover:text-white sm:max-w-xs"
        >
          {animeTitle}
        </Link>
        <IconChevronRight className="h-3 w-3 text-zinc-600" />
        <Link
          to={`/anime/${malId}#episodes`}
          className="rounded-full bg-zinc-900/60 px-2.5 py-1 text-zinc-400 ring-1 ring-zinc-800 transition hover:text-white"
        >
          Episodes
        </Link>
        <IconChevronRight className="h-3 w-3 text-fuchsia-400/70" />
        <span
          className="rounded-full bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10 px-2.5 py-1 text-fuchsia-100 ring-1 ring-fuchsia-400/30"
          aria-current="page"
        >
          Ep {epNumber}
        </span>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950/60 px-5 py-6 sm:px-8 sm:py-8">
        {poster && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-20 blur-2xl"
            style={{ backgroundImage: `url(${poster})` }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-950/80 via-zinc-950/40 to-zinc-950/80" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-300 opacity-[0.12] blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6">
          {poster && (
            <Link to={`/anime/${malId}`} className="relative shrink-0">
              <span
                aria-hidden
                className="absolute -inset-1 rounded-xl bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 opacity-50 blur-md"
              />
              <img
                src={poster}
                alt={animeTitle}
                width="220"
                height="330"
                decoding="async"
                fetchPriority="high"
                className="relative aspect-[2/3] w-28 rounded-xl object-cover shadow-2xl ring-1 ring-zinc-800 sm:w-36"
              />
            </Link>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-200 ring-1 ring-fuchsia-400/30">
                  Episode {epNumber}
                </span>
                {episode?.filler && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200 ring-1 ring-amber-400/30">
                    Filler
                  </span>
                )}
                {episode?.recap && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300 ring-1 ring-zinc-700">
                    Recap
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300 ring-1 ring-zinc-800">
                  S{episode?.season ?? 1}·E{epNumber}
                </span>
              </div>

              <Link
                to={`/anime/${malId}`}
                className="mt-2 inline-block text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-fuchsia-300"
              >
                {animeTitle}
              </Link>

              <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                {epTitle}
              </h1>
              {episode?.title_japanese && (
                <p className="mt-1 text-sm text-zinc-500">
                  {episode.title_japanese}
                </p>
              )}

              <ul className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                {epAired && (
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 ring-1 ring-zinc-800/80">
                    <IconCalendar className="h-3.5 w-3.5 text-zinc-500" />
                    Aired {epAired}
                  </li>
                )}
                {episode?.duration && (
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 ring-1 ring-zinc-800/80">
                    <IconPlay className="h-3.5 w-3.5 text-zinc-500" />
                    {Math.round(episode.duration / 60)} min
                  </li>
                )}
                <li className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 ring-1 ring-zinc-800/80">
                  <IconImage className="h-3.5 w-3.5 text-zinc-500" />
                  {episodeScenes.length} {episodeScenes.length === 1 ? "scene" : "scenes"}
                </li>
              </ul>

              {episode?.score && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2 pr-4 backdrop-blur">
                  <span className="grid h-9 min-w-[2.25rem] place-items-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 px-2 text-xs font-black text-zinc-950 ring-1 ring-white/30">
                    {episode.score.toFixed(2)}
                  </span>
                  <div className="flex flex-col">
                    <StarRating value={Math.round(episode.score / 2)} />
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Episode rating
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Episode navigation */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <EpisodeNavBtn
                to={prevEp ? `/anime/${malId}/episode/${prevEp.mal_id}` : null}
                label="Previous"
                direction="prev"
                hint={prevEp?.title}
              />
              <EpisodeNavBtn
                to={nextEp ? `/anime/${malId}/episode/${nextEp.mal_id}` : null}
                label="Next"
                direction="next"
                hint={nextEp?.title}
              />
              <Link
                to={`/anime/${malId}`}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
              >
                <IconClose className="h-3.5 w-3.5" />
                Back to anime
              </Link>
            </div>
          </div>
        </div>

        {episode?.synopsis && (
          <p className="relative mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
            {episode.synopsis}
          </p>
        )}
      </header>

      {/* ─── SCENES FOR THIS EPISODE ──────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
            Episode highlights
          </p>
          <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_currentColor]"
            />
            Scenes from this episode
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-bold tabular-nums text-zinc-400 ring-1 ring-zinc-800">
              {episodeScenes.length}
            </span>
          </h2>
          <div
            aria-hidden
            className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent"
          />
        </div>

        {episodeScenes.length === 0 ? (
          <NoScenesYet animeTitle={animeTitle} malId={malId} epNumber={epNumber} />
        ) : (
          <div className="space-y-8">
            {sceneGroups.map(([character, scenes]) => (
              <div key={character}>
                <div className="mb-3 flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-0.5 rounded-full bg-fuchsia-400"
                  />
                  <h3 className="text-sm font-bold text-zinc-100">
                    {character}
                  </h3>
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                  {scenes.map((s) => (
                    <SceneTile
                      key={s.id}
                      scene={s}
                      posterFallback={poster}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── OTHER EPISODES WITH SCENES ───────────────────────────── */}
      {otherSceneEpisodes.length > 0 && (
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Across the season
            </p>
            <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_currentColor]"
              />
              Other episodes with catalogued scenes
            </h2>
            <div
              aria-hidden
              className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
            />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherSceneEpisodes.map((g) => (
              <li key={g.key}>
                <Link
                  to={`/anime/${malId}/episode/${g.episode}`}
                  className="group flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 transition hover:-translate-y-0.5 hover:border-fuchsia-400/40 hover:bg-zinc-900"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-xs font-black text-zinc-300 ring-1 ring-zinc-800 group-hover:text-white">
                    E{g.episode}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-100 group-hover:text-white">
                      Episode {g.episode}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {g.scenes.length} catalogued{" "}
                      {g.scenes.length === 1 ? "scene" : "scenes"}
                    </p>
                  </div>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EpisodeNavBtn({ to, label, direction, hint }) {
  const disabled = !to;
  const className = `inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
    disabled
      ? "cursor-not-allowed border border-zinc-900 bg-zinc-950 text-zinc-700"
      : "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-fuchsia-400/40 hover:bg-zinc-800"
  }`;
  const inner = (
    <>
      {direction === "prev" && (
        <IconChevronRight className="h-3.5 w-3.5 rotate-180" />
      )}
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        {hint && (
          <span className="line-clamp-1 max-w-[140px] text-xs font-bold text-zinc-200">
            {hint}
          </span>
        )}
      </span>
      {direction === "next" && <IconChevronRight className="h-3.5 w-3.5" />}
    </>
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled>
        {inner}
      </span>
    );
  }
  return (
    <Link to={to} className={className}>
      {inner}
    </Link>
  );
}

function NoScenesYet({ animeTitle, malId, epNumber }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
        <IconStar className="h-6 w-6 text-zinc-500" />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-200">
        No scenes catalogued for{" "}
        <span className="text-fuchsia-300">
          {animeTitle} · Episode {epNumber}
        </span>{" "}
        yet
      </p>
      <p className="mt-1 max-w-sm text-xs text-zinc-500">
        Editorial scene entries are curated by hand. Add an entry to{" "}
        <code className="rounded bg-zinc-900 px-1 py-0.5 text-fuchsia-300">
          src/data/scenes.json
        </code>{" "}
        with{" "}
        <code className="rounded bg-zinc-900 px-1 py-0.5 text-fuchsia-300">
          mal_id: {malId}
        </code>{" "}
        and{" "}
        <code className="rounded bg-zinc-900 px-1 py-0.5 text-fuchsia-300">
          episode: {epNumber}
        </code>{" "}
        to surface it here.
      </p>
      <Link
        to={`/anime/${malId}`}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-zinc-100 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
      >
        <IconChevronRight className="h-3.5 w-3.5 rotate-180" />
        Back to {animeTitle}
      </Link>
    </div>
  );
}

function EpisodeNotFound({ malId, epNumber }) {
  return (
    <div className="page-container py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950/40 p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
          <IconClose className="h-7 w-7 text-zinc-500" />
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
          Episode not found
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
          We couldn't find episode {epNumber}
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          The episode may have been renumbered, removed, or the link is wrong.
          Try jumping back to the anime page or browse from the home page.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            to={`/anime/${malId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-4 py-2 text-xs font-bold text-zinc-950 ring-1 ring-white/30 transition hover:brightness-110"
          >
            <IconChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to anime
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function EpisodeSkeleton() {
  return (
    <div className="page-container py-10">
      <div className="h-6 w-72 animate-pulse rounded bg-zinc-900" />
      <div className="mt-4 h-60 animate-pulse rounded-3xl bg-zinc-900/60" />
      <div className="mt-8 h-4 w-48 animate-pulse rounded bg-zinc-900" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video animate-pulse rounded-md bg-zinc-900"
          />
        ))}
      </div>
    </div>
  );
}
