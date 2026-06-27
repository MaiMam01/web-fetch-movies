import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAnimeById,
  getEpisodes,
  getCharacters,
  getRecommendations,
  getPictures,
} from "../services/jikan.js";
import scenesData from "../data/scenes.json";
import CharacterCard from "../components/CharacterCard.jsx";
import CharacterRowHeader from "../components/CharacterRowHeader.jsx";
import SceneTile from "../components/SceneTile.jsx";
import FilterPills from "../components/FilterPills.jsx";
import RecommendedRail from "../components/RecommendedRail.jsx";
import TagChips from "../components/TagChips.jsx";
import SceneGalleryModal from "../components/SceneGalleryModal.jsx";
import useLocalToggle from "../hooks/useLocalToggle.js";
import usePageTitle from "../hooks/usePageTitle.js";
import {
  IconImage,
  IconPlay,
  IconEye,
  IconHeart,
  IconAlert,
  IconCheck,
  IconChevronRight,
  StarRating,
  formatCompact,
} from "../components/Icons.jsx";

const TAB_OPTIONS = (counts) => [
  { value: "all", label: "All", count: counts.all },
  { value: "scenes", label: "Scenes", count: counts.scenes },
  { value: "episodes", label: "Episodes", count: counts.episodes },
  { value: "characters", label: "Characters", count: counts.characters },
];

export default function AnimeDetail() {
  const { malId } = useParams();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pictures, setPictures] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");

  const allScenes = scenesData.scenes ?? [];
  const animeScenes = useMemo(
    () => allScenes.filter((s) => String(s.mal_id) === String(malId)),
    [allScenes, malId]
  );

  usePageTitle(anime ? anime.title_english || anime.title : null);

  useEffect(() => {
    let cancelled = false;
    // Wipe prior anime before fetching so we don't render the previous title's
    // hero/poster/episodes while the new fetch is in flight.
    setAnime(null);
    setEpisodes([]);
    setCharacters([]);
    setRecommendations([]);
    setPictures([]);
    setError(null);
    setLoading(true);

    async function run() {
      try {
        const a = await getAnimeById(malId);
        if (cancelled) return;
        setAnime(a);
        const [eps, chars, recs, pics] = await Promise.all([
          getEpisodes(malId).catch(() => []),
          getCharacters(malId).catch(() => []),
          getRecommendations(malId).catch(() => []),
          getPictures(malId).catch(() => []),
        ]);
        if (cancelled) return;
        setEpisodes(eps);
        setCharacters(chars);
        setRecommendations(recs.slice(0, 12));
        setPictures(pics);
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
  }, [malId]);

  if (loading && !anime) {
    return <DetailSkeleton />;
  }
  if (error || !anime) {
    return (
      <div className="page-container py-12 text-red-300">
        Could not load this title. {error}
      </div>
    );
  }

  const counts = {
    all: animeScenes.length + episodes.length + characters.length,
    scenes: animeScenes.length,
    episodes: episodes.length,
    characters: characters.length,
  };

  const mainCharacters = characters.filter((c) => c.role === "Main");
  const supportCharacters = characters.filter((c) => c.role !== "Main");
  const charsByGroup = [...mainCharacters, ...supportCharacters].slice(0, 18);

  // Build the gallery image list from MAL pictures + the cover/trailer images
  const galleryImages = (() => {
    const list = [];
    const seen = new Set();
    const add = (url, caption) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      list.push({ url, caption });
    };
    add(
      anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url,
      "Cover"
    );
    add(anime.trailer?.images?.maximum_image_url, "Trailer");
    for (const p of pictures) {
      add(
        p?.webp?.large_image_url ??
          p?.webp?.image_url ??
          p?.jpg?.large_image_url ??
          p?.jpg?.image_url
      );
    }
    return list;
  })();

  const showScenes = tab === "all" || tab === "scenes";
  const showCharacters = tab === "all" || tab === "characters";
  const showEpisodes = tab === "all" || tab === "episodes";

  return (
    <div className="text-zinc-100">
      <Hero
        anime={anime}
        sceneCount={animeScenes.length}
        galleryCount={galleryImages.length}
        onOpenGallery={() => setGalleryOpen(true)}
      />

      <SceneGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={`${anime.title_english || anime.title} — Gallery`}
        images={galleryImages}
      />

      <HighlightsStrip
        scenes={animeScenes}
        poster={
          anime.images?.webp?.large_image_url ??
          anime.images?.jpg?.large_image_url
        }
      />

      <div className="page-container">
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <FilterPills value={tab} onChange={setTab} options={TAB_OPTIONS(counts)} />
          <SortBar />
        </div>

        {showScenes && (
          <SectionGrouped
            title="Scenes"
            empty={animeScenes.length === 0}
            emptyHint={
              <ScenesEmptyHint malId={malId} animeTitle={anime.title_english || anime.title} />
            }
          >
            <ScenesGroupedGrid scenes={animeScenes} characters={characters} />
          </SectionGrouped>
        )}

        {showCharacters && charsByGroup.length > 0 && (
          <section className="mt-12">
            <SectionHeader
              eyebrow="Cast"
              title="Characters & Voice Cast"
              accent="fuchsia"
              count={charsByGroup.length}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
              {charsByGroup
                .filter((c) => c?.character?.mal_id != null)
                .map((c) => (
                  <CharacterCard
                    key={`${c.character.mal_id}-${c.role ?? "any"}`}
                    character={c}
                  />
                ))}
            </div>
          </section>
        )}

        {showEpisodes && episodes.length > 0 && (
          <section id="episodes" className="mt-12 scroll-mt-24">
            <SectionHeader
              eyebrow="Run order"
              title="Episodes"
              accent="cyan"
              count={episodes.length}
            />
            <ul className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
              {episodes.slice(0, 25).map((ep, i) => {
                const epScenesCount = animeScenes.filter(
                  (s) => Number(s.episode) === Number(ep.mal_id)
                ).length;
                return (
                  <li key={ep.mal_id} className="border-b border-zinc-800/60 last:border-b-0">
                    <Link
                      to={`/anime/${malId}/episode/${ep.mal_id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-900/70 sm:gap-4"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-900 text-[11px] font-black tabular-nums text-zinc-300 ring-1 ring-zinc-800 transition group-hover:bg-gradient-to-br group-hover:from-fuchsia-400 group-hover:via-violet-400 group-hover:to-cyan-300 group-hover:text-zinc-950 group-hover:ring-white/30">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white">
                          {ep.title || "Untitled"}
                        </p>
                        {ep.aired && (
                          <p className="text-xs text-zinc-500">
                            Aired {new Date(ep.aired).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {epScenesCount > 0 && (
                        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-200 ring-1 ring-fuchsia-400/30 sm:inline-flex">
                          <IconPlay className="h-2.5 w-2.5" />
                          {epScenesCount} {epScenesCount === 1 ? "scene" : "scenes"}
                        </span>
                      )}
                      {ep.score ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                          ★ {ep.score}
                        </span>
                      ) : null}
                      <IconChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            {episodes.length > 25 && (
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                Showing first 25 of {episodes.length} episodes
              </p>
            )}
          </section>
        )}

        {tab === "all" && (
          <SynopsisAndDetails anime={anime} sceneCount={animeScenes.length} />
        )}

        <RecommendedRail items={recommendations} />

        <TagChips
          tags={Array.from(
            new Set([
              ...(anime.genres ?? []).map((g) => g.name),
              ...(anime.themes ?? []).map((t) => t.name),
              ...(anime.demographics ?? []).map((d) => d.name),
              ...(anime.studios ?? []).map((s) => s.name),
            ])
          )}
        />
      </div>
    </div>
  );
}

function Hero({ anime, sceneCount, galleryCount = 0, onOpenGallery }) {
  const poster =
    anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;
  const bg =
    anime.trailer?.images?.maximum_image_url ||
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url;
  const year = anime.year || anime.aired?.prop?.from?.year;
  const [favorited, toggleFav] = useLocalToggle(
    `animedb:fav:anime:${anime.mal_id}`
  );

  // Score-driven tone: 9+ = fuchsia/violet, 8+ = cyan, 7+ = amber, < 7 = zinc
  const score = anime.score ?? 0;
  const scoreTone =
    score >= 9
      ? { ring: "ring-fuchsia-400/40", chip: "from-fuchsia-400 via-violet-400 to-cyan-300", text: "text-fuchsia-200" }
      : score >= 8
        ? { ring: "ring-cyan-400/40", chip: "from-cyan-300 via-sky-400 to-violet-400", text: "text-cyan-200" }
        : score >= 7
          ? { ring: "ring-amber-400/40", chip: "from-amber-300 via-orange-400 to-rose-400", text: "text-amber-200" }
          : { ring: "ring-zinc-700", chip: "from-zinc-400 to-zinc-500", text: "text-zinc-300" };

  return (
    <section className="page-container mt-6">
      <div
        className={`relative isolate overflow-hidden rounded-3xl bg-zinc-900 ring-1 ${scoreTone.ring}`}
      >
        {bg && (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-30 blur-2xl"
            style={{ backgroundImage: `url(${bg})` }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-950/85 via-zinc-950/45 to-zinc-950/85"
        />

        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-stretch sm:gap-7 sm:p-7">
          {poster && (
            <div className="relative shrink-0">
              <span
                aria-hidden
                className={`absolute -inset-1 -z-10 rounded-xl bg-gradient-to-br ${scoreTone.chip} opacity-50 blur-md`}
              />
              <img
                src={poster}
                alt={anime.title}
                width="320"
                height="480"
                decoding="async"
                fetchPriority="high"
                className="aspect-[2/3] w-32 rounded-xl object-cover shadow-2xl ring-1 ring-zinc-800 sm:w-44"
              />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {anime.type && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300 ring-1 ring-zinc-800">
                    {anime.type}
                  </span>
                )}
                {anime.status && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ${
                      anime.status === "Currently Airing"
                        ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
                        : "bg-zinc-900/80 text-zinc-400 ring-zinc-800"
                    }`}
                  >
                    {anime.status === "Currently Airing" && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                    )}
                    {anime.status}
                  </span>
                )}
                {anime.rank && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${scoreTone.chip} px-2.5 py-0.5 text-[10px] font-black text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)]`}
                  >
                    #{anime.rank} on MAL
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                {anime.title_english || anime.title}{" "}
                {year && (
                  <span className="font-bold text-zinc-400">({year})</span>
                )}
              </h1>
              {anime.title_japanese && (
                <p className="mt-1 text-sm text-zinc-500">
                  {anime.title_japanese}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-300 sm:text-sm">
                <Stat
                  icon={<IconImage className="h-4 w-4" />}
                  value={`${anime.episodes ?? "—"} Episodes`}
                />
                <Stat
                  icon={<IconPlay className="h-4 w-4" />}
                  value={`${sceneCount} Scenes`}
                />
                <Stat
                  icon={<IconEye className="h-4 w-4" />}
                  value={`${formatCompact(anime.members)} Members`}
                />
                {anime.favorites != null && (
                  <Stat
                    icon={<IconHeart className="h-4 w-4" />}
                    value={`${formatCompact(anime.favorites)} Favorites`}
                  />
                )}
              </div>

              {anime.score && (
                <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2 pr-4 backdrop-blur">
                  <span
                    className={`grid h-10 min-w-[2.5rem] place-items-center rounded-xl bg-gradient-to-br ${scoreTone.chip} px-2 text-sm font-black text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/30`}
                  >
                    {anime.score.toFixed(2)}
                  </span>
                  <div className="flex flex-col">
                    <StarRating value={Math.round((anime.score ?? 0) / 2)} />
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      {anime.scored_by
                        ? `${formatCompact(anime.scored_by)} votes`
                        : "MyAnimeList score"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={toggleFav}
                aria-pressed={favorited}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.97] ${
                  favorited
                    ? "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700"
                    : `bg-gradient-to-r ${scoreTone.chip} text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/30 hover:brightness-110`
                }`}
              >
                {favorited ? (
                  <>
                    <IconCheck className="h-4 w-4" />
                    Favorited
                  </>
                ) : (
                  <>
                    <IconHeart className="h-4 w-4" />
                    Add to Favorites
                  </>
                )}
              </button>
              <Link
                to={`/anime/${anime.mal_id}/scenes`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
              >
                <IconPlay className="h-4 w-4" />
                Browse Scenes
              </Link>
              {galleryCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenGallery}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
                >
                  <IconImage className="h-4 w-4" />
                  Gallery
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold tabular-nums text-zinc-300 ring-1 ring-zinc-700">
                    {galleryCount}
                  </span>
                </button>
              )}
              <a
                href="/feedback"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
              >
                <IconAlert className="h-3.5 w-3.5" />
                Report content issue
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 ring-1 ring-zinc-800/80">
      <span className="text-zinc-400">{icon}</span>
      <span className="font-semibold text-zinc-200">{value}</span>
    </span>
  );
}

function SortBar() {
  return null; // Tabs above already drive the view; redundant placeholders removed.
}

const SECTION_ACCENT = {
  fuchsia: { dot: "bg-fuchsia-400", text: "text-fuchsia-200", line: "via-fuchsia-500/60" },
  cyan: { dot: "bg-cyan-400", text: "text-cyan-200", line: "via-cyan-400/60" },
  amber: { dot: "bg-amber-400", text: "text-amber-200", line: "via-amber-400/60" },
  emerald: { dot: "bg-emerald-400", text: "text-emerald-200", line: "via-emerald-400/60" },
};

function SectionHeader({ eyebrow, title, accent = "fuchsia", count }) {
  const a = SECTION_ACCENT[accent] ?? SECTION_ACCENT.fuchsia;
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${a.text}`}>
            {eyebrow}
          </p>
          <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${a.dot} shadow-[0_0_8px_currentColor]`}
            />
            {title}
          </h2>
        </div>
        {count != null && (
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold tabular-nums text-zinc-400 ring-1 ring-zinc-800">
            {count.toLocaleString()}
          </span>
        )}
      </div>
      <div
        aria-hidden
        className={`mt-3 h-px w-full bg-gradient-to-r from-transparent ${a.line} to-transparent`}
      />
    </div>
  );
}

function SectionGrouped({ title, empty, emptyHint, children }) {
  return (
    <section className="mt-8">
      <h2 className="sr-only">{title}</h2>
      {empty ? emptyHint : children}
    </section>
  );
}

function ScenesGroupedGrid({ scenes, characters }) {
  const groups = useMemo(() => {
    const byKey = new Map();
    scenes.forEach((s) => {
      const key = s.character || "Notable Scenes";
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(s);
    });
    return Array.from(byKey.entries());
  }, [scenes]);

  const vaByCharacter = useMemo(() => {
    const m = new Map();
    characters.forEach((c) => {
      const va = c?.voice_actors?.find((v) => v.language === "Japanese");
      const cName = c?.character?.name;
      const pName = va?.person?.name;
      if (cName && pName) m.set(cName, pName);
    });
    return m;
  }, [characters]);

  return (
    <div className="space-y-8">
      {groups.map(([characterName, sceneGroup]) => (
        <div key={characterName}>
          <CharacterRowHeader
            va={vaByCharacter.get(characterName) || "Various"}
            character={characterName}
            role={sceneGroup[0]?.role}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {sceneGroup.map((s) => (
              <SceneTile key={s.id} scene={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScenesEmptyHint({ malId, animeTitle }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
      <p className="text-sm font-semibold text-zinc-200">
        No scenes catalogued for <span className="text-brand-500">{animeTitle}</span> yet.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Add entries to <code className="text-brand-500">src/data/scenes.json</code> using
        the documented schema. Match <code>mal_id: {malId}</code> to link them here.
      </p>
    </div>
  );
}

function SynopsisAndDetails({ anime, sceneCount }) {
  const rows = [
    ["Aired", anime.aired?.string],
    ["Season", anime.season ? `${anime.season} ${anime.year}` : null],
    ["Studios", anime.studios?.map((s) => s.name).join(", ")],
    ["Source", anime.source],
    ["Type", anime.type],
    ["Status", anime.status],
    ["Duration", anime.duration],
    ["Rating", anime.rating],
    ["Demographics", anime.demographics?.map((d) => d.name).join(", ")],
    ["Themes", anime.themes?.map((t) => t.name).join(", ")],
  ].filter(([, v]) => Boolean(v));

  return (
    <section className="mt-12 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionHeader eyebrow="Story" title="Synopsis" accent="fuchsia" />
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
          {anime.synopsis || "No synopsis available."}
        </p>
        {anime.background && (
          <>
            <div className="mt-8">
              <SectionHeader
                eyebrow="Behind the scenes"
                title="Background"
                accent="cyan"
              />
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              {anime.background}
            </p>
          </>
        )}
      </div>
      <aside>
        <div className="sticky top-20 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-400 via-violet-500 to-cyan-400"
          />
          <h3 className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_currentColor]" />
            Details
          </h3>
          <dl className="mt-3 space-y-2.5 text-sm">
            {rows.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-3 gap-2 border-b border-zinc-800/60 pb-2 last:border-b-0 last:pb-0"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {k}
                </dt>
                <dd className="col-span-2 text-zinc-100">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Scenes
              </dt>
              <dd className="col-span-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                  {sceneCount} catalogued
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </section>
  );
}

function HighlightsStrip({ scenes, poster }) {
  if (!scenes || scenes.length === 0) return null;
  // Surface up to 12 highlights; sort by spoiler-free first so the strip
  // can be browsed without giving away the show's biggest moments.
  const ordered = [...scenes].sort(
    (a, b) => Number(!!a.spoiler) - Number(!!b.spoiler)
  );
  const visible = ordered.slice(0, 12);

  return (
    <section
      aria-label="Scene highlights"
      className="page-container mt-4"
    >
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_currentColor]"
          />
          Scene highlights
          <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-zinc-400 ring-1 ring-zinc-800">
            {scenes.length}
          </span>
        </h2>
      </div>
      <ul className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 scrollbar-thin sm:gap-3">
        {visible.map((s) => (
          <li key={s.id} className="w-40 shrink-0 sm:w-48">
            <SceneTile scene={s} posterFallback={poster} />
            <p className="mt-1.5 line-clamp-1 text-[11px] font-semibold text-zinc-300">
              {s.character ? (
                <span className="text-fuchsia-300">{s.character}: </span>
              ) : null}
              <span>{s.title}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="page-container mt-6">
      <div className="h-72 animate-pulse rounded-2xl bg-zinc-900" />
      <div className="mt-8 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-zinc-900" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-video animate-pulse rounded-md bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
