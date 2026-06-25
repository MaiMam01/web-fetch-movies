import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AgeGate from "../components/AgeGate.jsx";
import FilterPills from "../components/FilterPills.jsx";
import SceneTile from "../components/SceneTile.jsx";
import CharacterRowHeader from "../components/CharacterRowHeader.jsx";
import { IconAlert, IconChevronRight, IconHeart } from "../components/Icons.jsx";
import { getAnimeById, getCharacters } from "../services/jikan.js";
import scenesData from "../data/scenes.json";

const SEVERITY_FILTERS = (counts) => [
  { value: "all", label: "All", count: counts.all },
  { value: "mild", label: "Mild", count: counts.mild },
  { value: "moderate", label: "Moderate", count: counts.moderate },
  { value: "graphic", label: "Graphic", count: counts.graphic },
  { value: "extreme", label: "Extreme", count: counts.extreme },
];

const KIND_FILTERS = (counts) => [
  { value: "all", label: "All", count: counts.all },
  { value: "image", label: "Photo", count: counts.image },
  { value: "video", label: "Video", count: counts.video },
];

function getKind(s) {
  return s.kind === "video" ? "video" : "image";
}

export default function Scenes() {
  const { malId } = useParams();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [posters, setPosters] = useState({});
  const [sevFilter, setSevFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");

  const all = scenesData.scenes ?? [];
  const baseScenes = useMemo(
    () => (malId ? all.filter((s) => String(s.mal_id) === String(malId)) : all),
    [all, malId]
  );

  const severityCounts = useMemo(() => {
    const c = { all: baseScenes.length, mild: 0, moderate: 0, graphic: 0, extreme: 0 };
    baseScenes.forEach((s) => {
      if (s.severity && c[s.severity] != null) c[s.severity] += 1;
    });
    return c;
  }, [baseScenes]);

  const kindCounts = useMemo(() => {
    const c = { all: baseScenes.length, image: 0, video: 0 };
    baseScenes.forEach((s) => {
      c[getKind(s)] += 1;
    });
    return c;
  }, [baseScenes]);

  const scenes = useMemo(() => {
    let list = baseScenes;
    if (kindFilter !== "all") list = list.filter((s) => getKind(s) === kindFilter);
    if (sevFilter !== "all") list = list.filter((s) => s.severity === sevFilter);
    return list;
  }, [baseScenes, sevFilter, kindFilter]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!malId) return;
      const [a, chars] = await Promise.all([
        getAnimeById(malId).catch(() => null),
        getCharacters(malId).catch(() => []),
      ]);
      if (cancelled) return;
      setAnime(a);
      setCharacters(chars);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [malId]);

  useEffect(() => {
    let cancelled = false;
    const uniqueIds = Array.from(
      new Set(baseScenes.map((s) => s.mal_id).filter(Boolean))
    );
    if (uniqueIds.length === 0) return undefined;
    Promise.all(
      uniqueIds.map((id) =>
        getAnimeById(id)
          .then((a) => [id, a])
          .catch(() => [id, null])
      )
    ).then((entries) => {
      if (cancelled) return;
      const next = {};
      for (const [id, a] of entries) {
        if (!a) continue;
        next[id] =
          a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;
      }
      setPosters(next);
    });
    return () => {
      cancelled = true;
    };
  }, [baseScenes]);

  const grouped = useMemo(() => {
    const byKey = new Map();
    scenes.forEach((s) => {
      const key = malId
        ? s.character || "Notable Scenes"
        : s.anime_title || "Unknown";
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(s);
    });
    return Array.from(byKey.entries());
  }, [scenes, malId]);

  const vaByCharacter = useMemo(() => {
    const m = new Map();
    characters.forEach((c) => {
      const va = c.voice_actors?.find((v) => v.language === "Japanese");
      if (va) m.set(c.character.name, va.person.name);
    });
    return m;
  }, [characters]);

  return (
    <AgeGate title="Scenes contain depictions of graphic violence">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {malId && anime ? (
          <SceneHero anime={anime} count={baseScenes.length} />
        ) : (
          <CatalogHero count={all.length} />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <KindFilterPills
            value={kindFilter}
            onChange={setKindFilter}
            options={KIND_FILTERS(kindCounts)}
          />
          <SortBar />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Severity
          </span>
          <FilterPills
            value={sevFilter}
            onChange={setSevFilter}
            options={SEVERITY_FILTERS(severityCounts)}
          />
        </div>

        {scenes.length === 0 ? (
          <EmptyState malId={malId} />
        ) : (
          <div className="mt-8 space-y-10">
            {grouped.map(([key, group]) => (
              <div key={key}>
                {malId ? (
                  <CharacterRowHeader
                    va={vaByCharacter.get(key) || "Various"}
                    character={key}
                    role={group[0]?.role}
                  />
                ) : (
                  <AnimeRowHeader title={key} malId={group[0]?.mal_id} />
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {group.map((s) => (
                    <SceneTile
                      key={s.id}
                      scene={s}
                      posterFallback={posters[s.mal_id]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AgeGate>
  );
}

function SceneHero({ anime, count }) {
  const poster =
    anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;
  const bg = anime.images?.webp?.large_image_url ?? poster;
  const year = anime.year || anime.aired?.prop?.from?.year;
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
      {bg && (
        <div
          className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-25 blur-2xl"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950/70 via-zinc-950/30 to-zinc-950/60" />
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {poster && (
          <img
            src={poster}
            alt={anime.title}
            className="aspect-[2/3] w-24 flex-shrink-0 rounded-lg object-cover ring-1 ring-zinc-700 sm:w-28"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Scene Catalog
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">
            {anime.title_english || anime.title}{" "}
            {year && <span className="font-bold text-zinc-300">({year})</span>}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {count} scenes catalogued · curated editorial breakdowns of pivotal
            moments
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={`/anime/${anime.mal_id}`}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              View anime page
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
            >
              <IconHeart className="h-3.5 w-3.5" />
              Favorite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogHero({ count }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/30 p-7 ring-1 ring-zinc-800">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
        Editor's Catalog
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
        Notable Scenes Across Anime
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        A curated index of pivotal, often graphic, scenes — grouped by series.
        Each entry includes episode, timestamp, severity, and an editorial
        description.{" "}
        <span className="text-zinc-300">{count} entries</span> and growing.
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-3 py-1 text-xs text-amber-300">
        <IconAlert className="h-3.5 w-3.5" />
        18+ content gated · mature themes throughout
      </div>
    </div>
  );
}

function AnimeRowHeader({ title, malId }) {
  return (
    <Link
      to={`/anime/${malId}`}
      className="group mb-3 inline-flex items-center gap-2"
    >
      <span className="block h-5 w-1 rounded bg-brand-500" />
      <span className="text-sm font-semibold text-brand-500">{title}</span>
      <IconChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  );
}

function KindFilterPills({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              active
                ? "bg-brand-500 text-zinc-950 shadow-[0_0_0_3px_rgba(244,114,32,0.18)]"
                : "bg-zinc-900 text-zinc-200 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-white"
            }`}
            aria-pressed={active}
          >
            <span>{opt.label}</span>
            <span
              className={`text-xs tabular-nums ${
                active ? "text-zinc-950/80" : "text-zinc-500"
              }`}
            >
              {opt.count}
            </span>
          </button>
        );
      })}
    </div>
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
        aria-label="View"
      >
        ▦
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
        aria-label="Filter"
      >
        ⌕
      </button>
    </div>
  );
}

function EmptyState({ malId }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
      <p className="text-lg font-semibold text-zinc-200">
        No scenes match this filter yet.
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        Add entries to{" "}
        <code className="text-brand-500">src/data/scenes.json</code>. Required
        fields per entry:{" "}
        <code>id, mal_id, anime_title, season, episode, timestamp, title, description, severity</code>
        {malId && (
          <>
            . Match <code>mal_id: {malId}</code> to surface them on this page.
          </>
        )}
      </p>
    </div>
  );
}
