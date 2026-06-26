import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAnimeById,
  getEpisodes,
  getCharacters,
  getRecommendations,
} from "../services/jikan.js";
import scenesData from "../data/scenes.json";
import CharacterCard from "../components/CharacterCard.jsx";
import CharacterRowHeader from "../components/CharacterRowHeader.jsx";
import SceneTile from "../components/SceneTile.jsx";
import FilterPills from "../components/FilterPills.jsx";
import RecommendedRail from "../components/RecommendedRail.jsx";
import TagChips from "../components/TagChips.jsx";
import useLocalToggle from "../hooks/useLocalToggle.js";
import {
  IconImage,
  IconPlay,
  IconEye,
  IconHeart,
  IconAlert,
  IconCheck,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");

  const allScenes = scenesData.scenes ?? [];
  const animeScenes = useMemo(
    () => allScenes.filter((s) => String(s.mal_id) === String(malId)),
    [allScenes, malId]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const a = await getAnimeById(malId);
        if (cancelled) return;
        setAnime(a);
        const [eps, chars, recs] = await Promise.all([
          getEpisodes(malId).catch(() => []),
          getCharacters(malId).catch(() => []),
          getRecommendations(malId).catch(() => []),
        ]);
        if (cancelled) return;
        setEpisodes(eps);
        setCharacters(chars);
        setRecommendations(recs.slice(0, 12));
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
      <div className="mx-auto max-w-7xl px-4 py-12 text-red-300 sm:px-6 lg:px-8">
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

  const showScenes = tab === "all" || tab === "scenes";
  const showCharacters = tab === "all" || tab === "characters";
  const showEpisodes = tab === "all" || tab === "episodes";

  return (
    <div className="text-zinc-100">
      <Hero anime={anime} sceneCount={animeScenes.length} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <h2 className="mb-4 text-base font-bold text-zinc-100">
              Characters &amp; Voice Cast
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {charsByGroup.map((c) => (
                <CharacterCard
                  key={`${c.character.mal_id}-${c.role ?? "any"}`}
                  character={c}
                />
              ))}
            </div>
          </section>
        )}

        {showEpisodes && episodes.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-base font-bold text-zinc-100">Episodes</h2>
            <ul className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
              {episodes.slice(0, 25).map((ep) => (
                <li
                  key={ep.mal_id}
                  className="flex items-center justify-between gap-4 border-b border-zinc-800/60 px-4 py-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Ep {ep.mal_id} &middot; {ep.title || "Untitled"}
                    </p>
                    {ep.aired && (
                      <p className="text-xs text-zinc-500">
                        Aired {new Date(ep.aired).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {ep.score ? (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-brand-500">
                      ★ {ep.score}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
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

function Hero({ anime, sceneCount }) {
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

  return (
    <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
        {bg && (
          <div
            className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-30 blur-2xl"
            style={{ backgroundImage: `url(${bg})` }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950/70 via-zinc-950/30 to-zinc-950/60" />

        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
          {poster && (
            <img
              src={poster}
              alt={anime.title}
              width="320"
              height="480"
              decoding="async"
              fetchPriority="high"
              className="aspect-[2/3] w-32 flex-shrink-0 rounded-lg object-cover shadow-2xl ring-1 ring-zinc-700 sm:w-40"
            />
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black tracking-tight text-zinc-50 sm:text-4xl">
              {anime.title_english || anime.title}{" "}
              {year && (
                <span className="font-bold text-zinc-300">({year})</span>
              )}
            </h1>
            {anime.title_japanese && (
              <p className="mt-0.5 text-sm text-zinc-400">{anime.title_japanese}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-300 sm:text-sm">
              <Stat icon={<IconImage className="h-4 w-4" />} value={`${anime.episodes ?? "—"} Episodes`} />
              <Stat icon={<IconPlay className="h-4 w-4" />} value={`${sceneCount} Scenes`} />
              <Stat
                icon={<IconEye className="h-4 w-4" />}
                value={`${formatCompact(anime.members)} Members`}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand-500 px-2 py-1 text-sm font-black text-zinc-950">
                  {anime.score ? anime.score.toFixed(1) : "—"}
                </span>
                <StarRating value={Math.round((anime.score ?? 0) / 2)} />
              </div>
              {anime.rank && (
                <span className="text-xs text-zinc-400">
                  #{anime.rank} on MAL
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleFav}
                aria-pressed={favorited}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition active:scale-[0.97] ${
                  favorited
                    ? "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700"
                    : "bg-brand-500 text-zinc-950 hover:bg-amber-400"
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
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                <IconPlay className="h-4 w-4" />
                Browse Scenes
              </Link>
              <a
                href="/feedback"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
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
    <span className="inline-flex items-center gap-1.5 text-zinc-300">
      <span className="text-zinc-400">{icon}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function SortBar() {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800"
      >
        NEWEST
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
        aria-label="Filter"
      >
        ⌕
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
        aria-label="View"
      >
        ▦
      </button>
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
      const va = c.voice_actors?.find((v) => v.language === "Japanese");
      if (va) m.set(c.character.name, va.person.name);
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
        <h2 className="mb-3 text-base font-bold text-zinc-100">Synopsis</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
          {anime.synopsis || "No synopsis available."}
        </p>
        {anime.background && (
          <>
            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-100">
              Background
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {anime.background}
            </p>
          </>
        )}
      </div>
      <aside>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Details
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2">
                <dt className="text-zinc-500">{k}</dt>
                <dd className="col-span-2 text-zinc-200">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-zinc-500">Scenes</dt>
              <dd className="col-span-2 text-amber-400">{sceneCount} catalogued</dd>
            </div>
          </dl>
        </div>
      </aside>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="h-72 animate-pulse rounded-2xl bg-zinc-900" />
      <div className="mt-8 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-zinc-900" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-video animate-pulse rounded-md bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
