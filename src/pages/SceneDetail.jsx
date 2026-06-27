import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AgeGate from "../components/AgeGate.jsx";
import Tabs from "../components/Tabs.jsx";
import SceneActionBar from "../components/SceneActionBar.jsx";
import SceneTile from "../components/SceneTile.jsx";
import PersonCard from "../components/PersonCard.jsx";
import SceneUploaderChip from "../components/SceneUploaderChip.jsx";
import SceneGalleryModal from "../components/SceneGalleryModal.jsx";
import {
  IconPlay,
  IconChevronRight,
  IconEye,
  IconImage,
  IconGrid,
  IconFullscreen,
  IconShare,
  IconHeart,
  IconMoreVertical,
  formatCompact,
} from "../components/Icons.jsx";
import {
  getAnimeById,
  getCharacters,
  getAnimeVideos,
  getPictures,
} from "../services/jikan.js";
import useLocalToggle from "../hooks/useLocalToggle.js";
import usePageTitle from "../hooks/usePageTitle.js";
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

  usePageTitle(
    scene ? `${scene.title} · ${scene.anime_title}` : "Scene not found"
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
  const [videos, setVideos] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [tab, setTab] = useState("related");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [theater, setTheater] = useState(false);

  const allScenes = scenesData.scenes ?? [];
  const sameAnime = allScenes.filter(
    (s) => String(s.mal_id) === String(scene.mal_id) && s.id !== scene.id
  );
  const recommended = allScenes
    .filter(
      (s) =>
        String(s.mal_id) !== String(scene.mal_id) &&
        s.severity === scene.severity
    )
    .slice(0, 12);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const [a, chars, vids, pics] = await Promise.all([
          getAnimeById(scene.mal_id).catch(() => null),
          getCharacters(scene.mal_id).catch(() => []),
          getAnimeVideos(scene.mal_id).catch(() => null),
          getPictures(scene.mal_id).catch(() => []),
        ]);
        if (cancelled) return;
        setAnime(a);
        setCharacters(chars);
        setVideos(vids);
        setPictures(pics);
      } catch (e) {
        console.warn("Scene detail fetch failed", e);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [scene.mal_id]);

  const trailer = videos?.promo?.[0]?.trailer ?? anime?.trailer ?? null;

  const featuredCharacters = useMemo(() => {
    if (!scene.character) return [];
    const needle = scene.character.toLowerCase();
    return characters
      .filter((c) => c?.character?.name?.toLowerCase().includes(needle))
      .slice(0, 1);
  }, [characters, scene.character]);

  const recommendedPeople = useMemo(
    () =>
      characters
        .slice(0, 8)
        .map((c) => c?.character)
        .filter(Boolean),
    [characters]
  );

  // Jikan often returns `youtube_id: null` even when a video exists — the
  // real ID lives in `embed_url`. Extract it as a fallback.
  const youtubeId = (() => {
    if (trailer?.youtube_id) return trailer.youtube_id;
    const src = trailer?.embed_url || trailer?.url || "";
    const m = src.match(/embed\/([\w-]{6,})/) || src.match(/[?&]v=([\w-]{6,})/);
    return m ? m[1] : null;
  })();
  const playerImage =
    scene.image ||
    trailer?.images?.maximum_image_url ||
    anime?.images?.webp?.large_image_url ||
    anime?.images?.jpg?.large_image_url;

  // Build a unified gallery: scene stills (same-anime) + anime poster +
  // additional anime pictures + episode video stills + trailer thumbnail.
  const galleryImages = useMemo(() => {
    const out = [];
    if (scene.image)
      out.push({ url: scene.image, caption: scene.title, type: "scene" });
    sameAnime.forEach((s) => {
      if (s.image) out.push({ url: s.image, caption: s.title, type: "scene" });
    });
    if (trailer?.images?.maximum_image_url)
      out.push({
        url: trailer.images.maximum_image_url,
        caption: "Trailer thumbnail",
        type: "video",
      });
    pictures.forEach((p) => {
      const url =
        p?.webp?.large_image_url ||
        p?.jpg?.large_image_url ||
        p?.webp?.image_url ||
        p?.jpg?.image_url;
      if (url) out.push({ url, caption: anime?.title, type: "poster" });
    });
    videos?.episodes?.forEach((ep) => {
      const url = ep?.images?.jpg?.image_url || ep?.images?.webp?.image_url;
      if (url)
        out.push({
          url,
          caption: ep.title ? `Ep ${ep.mal_id} · ${ep.title}` : `Ep ${ep.mal_id}`,
          type: "video",
        });
    });
    videos?.music_videos?.forEach((mv) => {
      const url = mv?.video?.images?.maximum_image_url;
      if (url)
        out.push({
          url,
          caption: mv?.title ? `${mv.title} (MV)` : "Music video",
          type: "video",
        });
    });
    return out;
  }, [scene.image, scene.title, sameAnime, trailer, pictures, videos, anime?.title]);

  return (
    <div className="page-container py-6">
      <Breadcrumbs anime={anime} sceneTitle={scene.title} />

      <div
        className={`grid gap-6 ${
          theater
            ? "grid-cols-1"
            : "lg:grid-cols-[minmax(0,1fr)_320px]"
        }`}
      >
        <div className="min-w-0">
          <Player
            scene={scene}
            youtubeId={youtubeId}
            fallbackImage={playerImage}
          />
          <PlayerToolbar
            sceneId={scene.id}
            galleryCount={galleryImages.length}
            theater={theater}
            onToggleTheater={() => setTheater((t) => !t)}
            onOpenGallery={() => setGalleryOpen(true)}
            scene={scene}
            anime={anime}
          />
        </div>
        {!theater && <SidebarRail anime={anime} sameAnime={sameAnime} />}
      </div>

      <SceneGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={`${anime?.title ?? scene.anime_title} — Gallery`}
        images={galleryImages}
      />

      <ThumbnailStrip scenes={sameAnime.slice(0, 5)} />

      <SceneMeta
        scene={scene}
        anime={anime}
        characters={featuredCharacters}
      />

      <SceneUploaderChip anime={anime} scene={scene} />

      <div id="scene-actions" className="scroll-mt-24">
        <SceneActionBar scene={scene} />
      </div>

      {scene.tags?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {scene.tags.map((t) => (
            <Link
              key={t}
              to={`/scenes?tag=${encodeURIComponent(t)}`}
              className="rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 transition hover:border-fuchsia-400/40 hover:bg-zinc-900 hover:text-fuchsia-200"
            >
              #{t.replace(/\s+/g, "")}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
            Keep watching
          </p>
          <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_currentColor]"
            />
            More from {anime?.title ?? scene.anime_title}
          </h2>
          <div
            aria-hidden
            className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent"
          />
        </div>

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

        <div className="mt-6">
          {tab === "related" ? (
            sameAnime.length === 0 ? (
              <EmptyHint anime={anime?.title ?? scene.anime_title} />
            ) : (
              <SceneGrid scenes={sameAnime} animeTitle={anime?.title} />
            )
          ) : recommended.length === 0 ? (
            <EmptyHint anime="similar severity" />
          ) : (
            <SceneGrid scenes={recommended} />
          )}
        </div>
      </div>

      {recommendedPeople.length > 0 && (
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Featured cast
            </p>
            <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_currentColor]"
              />
              Characters in this title
            </h2>
            <div
              aria-hidden
              className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
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
  const crumbLink =
    "shrink-0 rounded-full bg-zinc-900/60 px-2.5 py-1 text-zinc-400 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-white hover:ring-fuchsia-400/30";
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px] font-semibold"
    >
      <Link to="/" className={crumbLink}>
        Home
      </Link>
      <IconChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
      <Link to="/scenes" className={crumbLink}>
        Scenes
      </Link>
      {anime && (
        <>
          <IconChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
          <Link
            to={`/anime/${anime.mal_id}`}
            className={`${crumbLink} line-clamp-1 max-w-[160px] sm:max-w-xs`}
          >
            {anime.title}
          </Link>
        </>
      )}
      <IconChevronRight className="h-3 w-3 shrink-0 text-fuchsia-400/70" />
      <span
        className="line-clamp-1 max-w-[180px] rounded-full bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10 px-2.5 py-1 text-fuchsia-100 ring-1 ring-fuchsia-400/30 sm:max-w-xs"
        aria-current="page"
      >
        {sceneTitle}
      </span>
    </nav>
  );
}

function Player({ scene, youtubeId, fallbackImage }) {
  const [playing, setPlaying] = useState(false);

  if (playing && youtubeId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-fuchsia-400/40 shadow-[0_0_80px_-20px_rgba(232,121,249,0.7)]">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 via-violet-500/15 to-cyan-400/30 opacity-40 blur-sm"
        />
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={scene.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="relative h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => youtubeId && setPlaying(true)}
      aria-label={youtubeId ? `Play trailer for ${scene.title}` : `${scene.title} (trailer unavailable)`}
      disabled={!youtubeId}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 transition disabled:cursor-default enabled:hover:ring-fuchsia-400/40 enabled:hover:shadow-[0_0_40px_-12px_rgba(232,121,249,0.45)]"
    >
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt={scene.title}
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/10 to-zinc-950/40" />

      {/* Brand badge */}
      <span className="absolute left-3 top-3 rounded-full bg-zinc-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200 ring-1 ring-fuchsia-400/30 backdrop-blur">
        AnimeDB
      </span>
      {scene.severity && (
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ring-1 backdrop-blur ${
            scene.severity === "extreme"
              ? "bg-rose-500/20 text-rose-200 ring-rose-400/40"
              : scene.severity === "graphic"
                ? "bg-orange-500/20 text-orange-200 ring-orange-400/40"
                : scene.severity === "moderate"
                  ? "bg-amber-500/20 text-amber-200 ring-amber-400/40"
                  : "bg-emerald-500/20 text-emerald-200 ring-emerald-400/40"
          }`}
        >
          {SEVERITY_LABEL[scene.severity] ?? scene.severity}
        </span>
      )}

      {/* Play button */}
      <span className="absolute inset-0 grid place-items-center">
        <span className="relative">
          <span
            aria-hidden
            className="absolute -inset-3 rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 opacity-0 blur-xl transition group-enabled:group-hover:opacity-70"
          />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 shadow-2xl ring-1 ring-white/30 transition group-enabled:group-hover:scale-110 sm:h-20 sm:w-20">
            <IconPlay className="h-7 w-7 translate-x-[1px] sm:h-9 sm:w-9" />
          </span>
        </span>
      </span>

      {/* Bottom info bar */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
        <span className="line-clamp-1 text-sm font-bold text-white drop-shadow sm:text-base">
          {scene.title}
        </span>
        {scene.timestamp && (
          <span className="shrink-0 rounded-full bg-zinc-950/70 px-2.5 py-1 text-[10px] font-bold tabular-nums text-zinc-200 ring-1 ring-zinc-700 backdrop-blur">
            {scene.timestamp}
          </span>
        )}
      </span>

      {!youtubeId && (
        <span className="absolute inset-x-0 bottom-12 text-center text-[11px] font-semibold text-zinc-300 sm:bottom-14">
          Trailer unavailable — showing scene still
        </span>
      )}
    </button>
  );
}

function PlayerToolbar({
  sceneId,
  galleryCount,
  theater,
  onToggleTheater,
  onOpenGallery,
  scene,
  anime,
}) {
  const [fav, toggleFav] = useLocalToggle(`scene:fav:${sceneId}`, false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: scene.title,
      text: `Scene from ${anime?.title ?? scene.anime_title} on AnimeDB`,
      url,
    };
    if (navigator?.share) {
      try {
        await navigator.share(data);
      } catch {
        /* user cancelled */
      }
    } else if (navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignored */
      }
    }
  };

  const handleFullscreen = () => {
    const root = document.querySelector("iframe[title]");
    if (root?.requestFullscreen) root.requestFullscreen().catch(() => {});
  };

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-900 bg-zinc-950/60 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <ToolButton
          label={fav ? "Favorited" : "Favorite"}
          active={fav}
          onClick={toggleFav}
          accent="rose"
        >
          <IconHeart className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label={`Gallery${galleryCount ? ` · ${galleryCount}` : ""}`}
          onClick={onOpenGallery}
          disabled={galleryCount === 0}
          accent="fuchsia"
        >
          <IconImage className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label={theater ? "Exit theater" : "Theater mode"}
          active={theater}
          onClick={onToggleTheater}
          accent="cyan"
        >
          <IconGrid className="h-4 w-4" />
        </ToolButton>
      </div>

      <div className="flex items-center gap-1.5">
        <ToolButton label="Share" onClick={handleShare} accent="emerald">
          <IconShare className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Fullscreen"
          onClick={handleFullscreen}
          accent="violet"
        >
          <IconFullscreen className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="More" accent="zinc" as="a" href="#scene-actions">
          <IconMoreVertical className="h-4 w-4" />
        </ToolButton>
      </div>
    </div>
  );
}

const TOOL_ACCENTS = {
  rose: {
    on: "bg-rose-500/15 text-rose-200 ring-rose-400/40",
    off: "text-zinc-300 ring-zinc-800 hover:bg-rose-500/10 hover:text-rose-200",
  },
  fuchsia: {
    on: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/40",
    off: "text-zinc-300 ring-zinc-800 hover:bg-fuchsia-500/10 hover:text-fuchsia-200",
  },
  cyan: {
    on: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/40",
    off: "text-zinc-300 ring-zinc-800 hover:bg-cyan-500/10 hover:text-cyan-200",
  },
  emerald: {
    on: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/40",
    off: "text-zinc-300 ring-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-200",
  },
  violet: {
    on: "bg-violet-500/15 text-violet-200 ring-violet-400/40",
    off: "text-zinc-300 ring-zinc-800 hover:bg-violet-500/10 hover:text-violet-200",
  },
  zinc: {
    on: "bg-zinc-800 text-zinc-100 ring-zinc-700",
    off: "text-zinc-400 ring-zinc-800 hover:bg-zinc-900 hover:text-zinc-100",
  },
};

function ToolButton({
  children,
  label,
  active = false,
  disabled = false,
  onClick,
  accent = "fuchsia",
  as = "button",
  href,
}) {
  const a = TOOL_ACCENTS[accent] ?? TOOL_ACCENTS.fuchsia;
  const cls = `group inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
    active ? a.on : `bg-transparent ${a.off}`
  }`;
  if (as === "a" && href) {
    return (
      <a href={href} className={cls} aria-label={label}>
        {children}
        <span className="hidden sm:inline">{label}</span>
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cls}
      aria-pressed={active}
      aria-label={label}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SidebarRail({ anime, sameAnime }) {
  const items = sameAnime.slice(0, 4);
  return (
    <aside className="hidden flex-col gap-3 lg:flex">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-800">
        {anime?.images?.webp?.large_image_url ? (
          <>
            <img
              src={anime.images.webp.large_image_url}
              alt={anime.title}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-300">
                Source anime
              </p>
              {anime && (
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="mt-1 line-clamp-2 text-sm font-bold text-white hover:text-fuchsia-200"
                >
                  {anime.title}
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="grid aspect-[3/4] place-items-center bg-zinc-900 text-zinc-700">
            <IconPlay className="h-10 w-10" />
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            More from this title
          </p>
          <div className="grid grid-cols-2 gap-2">
            {items.map((s) => (
              <Link
                key={s.id}
                to={`/scenes/${s.id}`}
                className="group relative block aspect-video overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-fuchsia-400/40"
              >
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-zinc-700">
                    <IconPlay className="h-6 w-6" />
                  </div>
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                <span className="absolute inset-x-1 bottom-1 line-clamp-1 text-[10px] font-bold text-white drop-shadow">
                  {s.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function ThumbnailStrip({ scenes }) {
  if (!scenes.length) return null;
  return (
    <div className="-mx-2 mt-4 flex gap-3 overflow-x-auto px-2 pb-1 scrollbar-thin">
      {scenes.map((s) => (
        <Link
          key={s.id}
          to={`/scenes/${s.id}`}
          className="group relative block aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-fuchsia-400/40"
        >
          {s.image ? (
            <img
              src={s.image}
              alt={s.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="grid h-full place-items-center text-zinc-700">
              <IconPlay className="h-6 w-6" />
            </div>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/85 to-transparent p-1.5">
            <span className="line-clamp-1 text-[10px] font-bold text-white drop-shadow">
              {s.title}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function SceneMeta({ scene, anime }) {
  const sevLabel = SEVERITY_LABEL[scene.severity] ?? null;
  const sevColor =
    scene.severity === "extreme"
      ? "bg-rose-500/15 text-rose-200 ring-rose-400/30"
      : scene.severity === "graphic"
        ? "bg-orange-500/15 text-orange-200 ring-orange-400/30"
        : scene.severity === "moderate"
          ? "bg-amber-500/15 text-amber-200 ring-amber-400/30"
          : "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30";

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {sevLabel && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 ${sevColor}`}
          >
            {sevLabel}
          </span>
        )}
        {scene.tags?.[0] && (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300 ring-1 ring-zinc-800">
            {scene.tags[0]}
          </span>
        )}
        {scene.spoiler && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200 ring-1 ring-amber-400/30">
            Spoiler
          </span>
        )}
      </div>

      <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
        {scene.character && (
          <Link
            to={`/search?q=${encodeURIComponent(scene.character)}&tab=characters`}
            className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent hover:underline"
          >
            {scene.character}
          </Link>
        )}
        {scene.character && " — "}
        <span className="text-white">{scene.title}</span>
      </h1>

      <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500">
        Scene in{" "}
        {anime ? (
          <Link
            to={`/anime/${anime.mal_id}`}
            className="font-semibold text-zinc-300 hover:text-fuchsia-300"
          >
            {anime.title}
          </Link>
        ) : (
          <span className="font-semibold text-zinc-300">
            {scene.anime_title}
          </span>
        )}
      </p>

      <ul className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <li className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 ring-1 ring-zinc-800/80">
          <IconEye className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-semibold tabular-nums text-zinc-200">
            {formatCompact(anime?.members ?? 0)}
          </span>
          views
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 font-semibold text-zinc-200 ring-1 ring-zinc-800/80 tabular-nums">
          S{scene.season ?? 1}·E{scene.episode}
        </li>
        {scene.timestamp && (
          <li className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/50 px-2.5 py-1 font-semibold text-zinc-200 ring-1 ring-zinc-800/80 tabular-nums">
            {scene.timestamp}
          </li>
        )}
      </ul>

      {scene.description && (
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
          {scene.description}
        </p>
      )}
    </div>
  );
}

function SceneGrid({ scenes }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {scenes.map((s) => (
        <SceneTile key={s.id} scene={s} />
      ))}
    </div>
  );
}

function EmptyHint({ anime }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
        <IconPlay className="h-6 w-6 text-zinc-500" />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-200">
        No other scenes catalogued for{" "}
        <span className="text-fuchsia-300">{anime}</span> yet
      </p>
      <p className="mt-1 max-w-xs text-xs text-zinc-500">
        Editorial scenes are curated by hand — check back soon.
      </p>
    </div>
  );
}

function NotFoundScene({ id }) {
  return (
    <div className="page-container py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-900 bg-zinc-950/60 p-10 text-center sm:p-14">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
          <IconPlay className="h-7 w-7 text-zinc-500" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl">
          Scene not found
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          No entry with id{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-300">
            {id}
          </code>{" "}
          exists in the catalog yet.
        </p>
        <Link
          to="/scenes"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-[0_0_22px_-6px_rgba(232,121,249,0.6)] ring-1 ring-white/30 transition hover:brightness-110"
        >
          Browse scene catalog
        </Link>
      </div>
    </div>
  );
}
