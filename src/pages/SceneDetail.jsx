import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AgeGate from "../components/AgeGate.jsx";
import Tabs from "../components/Tabs.jsx";
import SceneActionBar from "../components/SceneActionBar.jsx";
import SceneTile from "../components/SceneTile.jsx";
import PersonCard from "../components/PersonCard.jsx";
import {
  IconPlay,
  IconChevronRight,
  IconEye,
  formatCompact,
} from "../components/Icons.jsx";
import {
  getAnimeById,
  getCharacters,
  getAnimeVideos,
} from "../services/jikan.js";
import scenesData from "../data/scenes.json";

const SEVERITY_LABEL = {
  mild: "Mild",
  moderate: "Moderate",
  graphic: "Graphic",
  extreme: "Extreme",
};

export default function SceneDetail() {
  const { id } = useParams();
  const allScenes = scenesData.scenes ?? [];
  const scene = useMemo(
    () => allScenes.find((s) => s.id === id),
    [allScenes, id]
  );

  return (
    <AgeGate title="This page contains a depiction of graphic content">
      {scene ? <SceneDetailBody scene={scene} /> : <NotFoundScene id={id} />}
    </AgeGate>
  );
}

function SceneDetailBody({ scene }) {
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [tab, setTab] = useState("related");

  const allScenes = scenesData.scenes ?? [];
  const sameAnime = allScenes.filter(
    (s) => s.mal_id === scene.mal_id && s.id !== scene.id
  );
  const recommended = allScenes
    .filter(
      (s) => s.mal_id !== scene.mal_id && s.severity === scene.severity
    )
    .slice(0, 12);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [a, chars, videos] = await Promise.all([
          getAnimeById(scene.mal_id).catch(() => null),
          getCharacters(scene.mal_id).catch(() => []),
          getAnimeVideos(scene.mal_id).catch(() => null),
        ]);
        if (cancelled) return;
        setAnime(a);
        setCharacters(chars);
        setTrailer(
          videos?.promo?.[0]?.trailer ??
            (a?.trailer?.youtube_id ? a.trailer : null)
        );
      } catch (e) {
        console.warn("Scene detail fetch failed", e);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [scene.mal_id]);

  const featuredCharacters = useMemo(() => {
    if (!scene.character) return [];
    return characters
      .filter((c) =>
        c.character.name.toLowerCase().includes(scene.character.toLowerCase())
      )
      .slice(0, 1);
  }, [characters, scene.character]);

  const recommendedPeople = useMemo(
    () => characters.slice(0, 8).map((c) => c.character),
    [characters]
  );

  const youtubeId = trailer?.youtube_id;
  const playerImage =
    scene.image ||
    trailer?.images?.maximum_image_url ||
    anime?.images?.webp?.large_image_url ||
    anime?.images?.jpg?.large_image_url;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs anime={anime} sceneTitle={scene.title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Player
          scene={scene}
          youtubeId={youtubeId}
          fallbackImage={playerImage}
        />
        <SidebarRail anime={anime} sameAnime={sameAnime} />
      </div>

      <ThumbnailStrip scenes={sameAnime.slice(0, 5)} />

      <SceneMeta
        scene={scene}
        anime={anime}
        characters={featuredCharacters}
      />

      <SceneActionBar />

      {scene.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {scene.tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
          More from {anime?.title ?? scene.anime_title}
        </p>
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: "related", label: "Related", count: sameAnime.length },
            {
              value: "recommended",
              label: "Recommended",
              count: recommended.length,
            },
          ]}
        />

        <div className="mt-5">
          {tab === "related" ? (
            sameAnime.length === 0 ? (
              <EmptyHint anime={anime?.title ?? scene.anime_title} />
            ) : (
              <SceneGrid scenes={sameAnime} animeTitle={anime?.title} />
            )
          ) : recommended.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No similar-severity scenes catalogued yet.
            </p>
          ) : (
            <SceneGrid scenes={recommended} />
          )}
        </div>
      </div>

      {recommendedPeople.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-base font-bold text-zinc-100">
            Recommended Characters
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {recommendedPeople.map((c) => (
              <PersonCard
                key={c.mal_id}
                person={c}
                to={`/characters/${c.mal_id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Breadcrumbs({ anime, sceneTitle }) {
  return (
    <nav className="mb-3 flex items-center gap-1 text-xs text-zinc-500">
      <Link to="/" className="hover:text-zinc-300">
        Home
      </Link>
      <IconChevronRight className="h-3 w-3" />
      <Link to="/scenes" className="hover:text-zinc-300">
        Scenes
      </Link>
      {anime && (
        <>
          <IconChevronRight className="h-3 w-3" />
          <Link to={`/anime/${anime.mal_id}`} className="hover:text-zinc-300">
            {anime.title}
          </Link>
        </>
      )}
      <IconChevronRight className="h-3 w-3" />
      <span className="line-clamp-1 max-w-xs text-zinc-300">{sceneTitle}</span>
    </nav>
  );
}

function Player({ scene, youtubeId, fallbackImage }) {
  const [playing, setPlaying] = useState(false);

  if (playing && youtubeId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-zinc-800">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={scene.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => youtubeId && setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800"
    >
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt={scene.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
      <span className="absolute right-3 top-3 rounded bg-zinc-950/80 px-2 py-0.5 text-[11px] font-bold text-zinc-100">
        ANIMEDB
      </span>
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-500/95 text-zinc-950 shadow-2xl transition group-hover:scale-110">
          <IconPlay className="h-8 w-8" />
        </span>
      </span>
      {!youtubeId && (
        <span className="absolute inset-x-0 bottom-3 text-center text-[11px] text-zinc-300">
          Trailer unavailable — showing scene still
        </span>
      )}
    </button>
  );
}

function SidebarRail({ anime, sameAnime }) {
  const items = sameAnime.slice(0, 4);
  return (
    <aside className="hidden flex-col gap-3 lg:flex">
      <div className="overflow-hidden rounded-xl ring-1 ring-zinc-800">
        {anime?.images?.webp?.large_image_url && (
          <img
            src={anime.images.webp.large_image_url}
            alt={anime.title}
            className="aspect-[3/4] w-full object-cover"
          />
        )}
      </div>
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {items.map((s) => (
            <Link
              key={s.id}
              to={`/scenes/${s.id}`}
              className="group block aspect-video overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 hover:ring-brand-500"
            >
              {s.image ? (
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="grid h-full place-items-center text-zinc-700">
                  <IconPlay className="h-6 w-6" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}

function ThumbnailStrip({ scenes }) {
  if (!scenes.length) return null;
  return (
    <div className="scrollbar-thin mt-3 flex gap-3 overflow-x-auto pb-1">
      {scenes.map((s) => (
        <Link
          key={s.id}
          to={`/scenes/${s.id}`}
          className="group relative block aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 hover:ring-brand-500"
        >
          {s.image ? (
            <img
              src={s.image}
              alt={s.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center text-zinc-700">
              <IconPlay className="h-6 w-6" />
            </div>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-1.5 text-[10px] font-semibold text-zinc-100">
            {s.title}
          </span>
        </Link>
      ))}
    </div>
  );
}

function SceneMeta({ scene, anime, characters }) {
  const sevLabel = SEVERITY_LABEL[scene.severity] ?? "Scene";
  return (
    <div className="mt-6 space-y-1.5">
      <h1 className="text-lg font-bold sm:text-xl">
        {scene.character && (
          <Link
            to={`/characters?q=${encodeURIComponent(scene.character)}`}
            className="text-brand-500 hover:underline"
          >
            {scene.character}
          </Link>
        )}
        {scene.character && " — "}
        <span className="text-zinc-100">
          {sevLabel} {scene.tags?.[0] ? `· ${scene.tags[0]}` : ""} Scene in
        </span>{" "}
        {anime ? (
          <Link
            to={`/anime/${anime.mal_id}`}
            className="text-brand-500 hover:underline"
          >
            {anime.title}
          </Link>
        ) : (
          <span className="text-zinc-100">{scene.anime_title}</span>
        )}
      </h1>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <IconEye className="h-3.5 w-3.5" />
          {formatCompact(anime?.members ?? 0)} Views
        </span>
        <span className="text-zinc-700">|</span>
        <span>S{scene.season ?? 1}·E{scene.episode} · {scene.timestamp}</span>
        {scene.spoiler && (
          <>
            <span className="text-zinc-700">|</span>
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-300">
              SPOILER
            </span>
          </>
        )}
      </p>
      {scene.description && (
        <p className="max-w-3xl pt-3 text-sm leading-relaxed text-zinc-300">
          {scene.description}
        </p>
      )}
    </div>
  );
}

function SceneGrid({ scenes }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {scenes.map((s) => (
        <SceneTile key={s.id} scene={s} />
      ))}
    </div>
  );
}

function EmptyHint({ anime }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-400">
      No other scenes catalogued for{" "}
      <span className="text-zinc-200">{anime}</span> yet.
    </div>
  );
}

function NotFoundScene({ id }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-black text-zinc-100">Scene not found</h1>
      <p className="mt-2 text-sm text-zinc-400">
        No entry with id <code className="text-brand-500">{id}</code> exists in
        the catalog yet.
      </p>
      <Link
        to="/scenes"
        className="mt-6 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400"
      >
        Browse scene catalog
      </Link>
    </div>
  );
}
