import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import REELS from "../data/storyReels.json";
import ANIME_META from "../data/reelAnimeMeta.json";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconExternalLink,
  IconEye,
  IconFlag,
  IconFullscreen,
  IconGear,
  IconGrid,
  IconHeart,
  IconLink,
  IconMessage,
  IconMoreVertical,
  IconPlay,
  IconPlus,
  IconSearch,
  IconShare,
  IconThumbsDown,
  IconThumbsUp,
  IconVolumeMute,
  IconVolumeOn,
} from "./Icons.jsx";

const QUALITY_OPTIONS = ["1080p HD", "720p HD", "480p", "240p"];

const KIND_LABEL = {
  music: "OP / ED",
  promo: "Trailer",
  episode: "Episode",
};

const KIND_ACCENT = {
  music: {
    pill: "bg-cyan-400/15 text-cyan-200 ring-cyan-400/30",
    gradient: "from-cyan-300 via-sky-400 to-violet-400",
  },
  promo: {
    pill: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
    gradient: "from-amber-300 via-orange-400 to-rose-400",
  },
  episode: {
    pill: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
    gradient: "from-fuchsia-400 via-violet-400 to-cyan-300",
  },
};

function formatCount(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function seedFromString(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  return n;
}

export default function StoryPlayer({ stories, index, onClose, onChange }) {
  const story = stories[index];
  const total = stories.length;
  const containerRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [qualitySheetOpen, setQualitySheetOpen] = useState(false);
  const [quality, setQuality] = useState("720p HD");
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [following, setFollowing] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");

  const next = useCallback(() => {
    if (index < total - 1) onChange(index + 1);
  }, [index, total, onChange]);

  const prev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

  // Keyboard nav + body scroll lock
  useEffect(() => {
    function onKey(e) {
      if (qualitySheetOpen) {
        if (e.key === "Escape") setQualitySheetOpen(false);
        return;
      }
      if (menuOpen) {
        if (e.key === "Escape") setMenuOpen(false);
        return;
      }
      // Don't hijack while typing in the search field
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
      if (e.key === "m" || e.key === "M") setMuted((m) => !m);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose, menuOpen, qualitySheetOpen]);

  // Per-reel reset
  useEffect(() => {
    setMenuOpen(false);
    setQualitySheetOpen(false);
    setLiked(false);
    setDisliked(false);
  }, [index]);

  const seed = useMemo(
    () => (story ? seedFromString(story.id) : 0),
    [story]
  );
  const likeCount = 500 + (seed % 8500);
  const commentCount = 30 + (seed % 220);

  const animeMeta = story ? ANIME_META[story.anime_mal_id] : null;

  // Right-rail: more reels from the same anime (full catalog, exclude current)
  const moreFromAnime = useMemo(() => {
    if (!story) return [];
    return REELS.filter(
      (r) => r.anime_mal_id === story.anime_mal_id && r.id !== story.id
    ).slice(0, 8);
  }, [story]);

  // Left-rail: related videos by tag/kind, sorted by view count
  const relatedVideos = useMemo(() => {
    if (!story) return [];
    return REELS.filter((r) => r.kind === story.kind && r.id !== story.id)
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 8);
  }, [story]);

  // Aggregate "creator" stats from all reels by this anime
  const channelStats = useMemo(() => {
    if (!story) return null;
    const own = REELS.filter((r) => r.anime_mal_id === story.anime_mal_id);
    const views = own.reduce((sum, r) => sum + (r.views ?? 0), 0);
    const likes = Math.round(views * 0.062 + (seed % 12000));
    const followers = Math.round(
      (animeMeta?.favorites ?? 5000) * 0.35 + (seed % 4500)
    );
    return {
      videos: own.length,
      views,
      likes,
      followers,
    };
  }, [story, seed, animeMeta]);

  if (!story) return null;

  const youtubeId = story.youtube_id || story.trailer?.youtube_id;
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&mute=${
        muted ? 1 : 0
      }`
    : null;

  const posterImg = story.image;
  const channelAvatar = animeMeta?.poster_small ?? animeMeta?.poster ?? story.image;
  const channelTitle = animeMeta?.title ?? story.anime_title;

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };

  // Build "Related searches" chips that link out to the explore pages
  const relatedSearches = [
    { label: KIND_LABEL[story.kind] ?? "Reels", to: `/stories?type=${story.kind}` },
    { label: "Trending", to: "/stories?sort=trending" },
    { label: "Newest", to: "/stories?sort=newest" },
    channelTitle && {
      label: channelTitle,
      to: `/search?q=${encodeURIComponent(channelTitle)}`,
    },
    animeMeta?.studio && {
      label: animeMeta.studio,
      to: `/search?q=${encodeURIComponent(animeMeta.studio)}`,
    },
    { label: "AMVs", to: `/search?q=${encodeURIComponent("AMV " + (channelTitle || ""))}` },
  ].filter(Boolean);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchDraft.trim();
    if (!q) return;
    onClose();
    // Use a hash-free navigation by setting location
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 text-zinc-100"
      role="dialog"
      aria-modal="true"
    >
      {/* ────── TOP BAR ──────────────────────────────────────────── */}
      <TopBar
        story={story}
        index={index}
        total={total}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        quality={quality}
        onClose={onClose}
        onOpenQuality={() => {
          setMenuOpen(false);
          setQualitySheetOpen(true);
        }}
      />

      {/* ────── 3-COLUMN BODY ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* LEFT: search + related */}
        <LeftSidebar
          relatedSearches={relatedSearches}
          relatedVideos={relatedVideos}
          stories={stories}
          onPickReel={(id) => {
            const i = stories.findIndex((s) => s.id === id);
            if (i >= 0) onChange(i);
          }}
          searchDraft={searchDraft}
          setSearchDraft={setSearchDraft}
          onSubmitSearch={submitSearch}
        />

        {/* CENTER: vertical player + action rail + caption */}
        <CenterPlayer
          story={story}
          embedUrl={embedUrl}
          youtubeId={youtubeId}
          posterImg={posterImg}
          muted={muted}
          setMuted={setMuted}
          liked={liked}
          setLiked={setLiked}
          disliked={disliked}
          setDisliked={setDisliked}
          favorited={favorited}
          setFavorited={setFavorited}
          following={following}
          setFollowing={setFollowing}
          likeCount={likeCount}
          commentCount={commentCount}
          channelAvatar={channelAvatar}
          channelTitle={channelTitle}
          onClose={onClose}
          prev={prev}
          next={next}
          atStart={index === 0}
          atEnd={index >= total - 1}
          toggleFullscreen={toggleFullscreen}
        />

        {/* RIGHT: anime "creator" profile */}
        <RightSidebar
          story={story}
          animeMeta={animeMeta}
          channelTitle={channelTitle}
          channelAvatar={channelAvatar}
          channelStats={channelStats}
          following={following}
          setFollowing={setFollowing}
          moreFromAnime={moreFromAnime}
          stories={stories}
          onPickReel={(id) => {
            const i = stories.findIndex((s) => s.id === id);
            if (i >= 0) onChange(i);
          }}
        />
      </div>

      {qualitySheetOpen && (
        <QualitySheet
          value={quality}
          onChange={setQuality}
          onClose={() => setQualitySheetOpen(false)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   TOP BAR
─────────────────────────────────────────────────────────────────── */

function TopBar({
  story,
  index,
  total,
  menuOpen,
  setMenuOpen,
  quality,
  onClose,
  onOpenQuality,
}) {
  return (
    <header className="relative z-30 flex shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/95 px-3 py-2.5 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          <IconChevronRight className="h-5 w-5 rotate-180" />
        </button>
        <Logo size="xs" to="/" animated={false} onClick={onClose} />
        <span className="ml-1 hidden rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300 ring-1 ring-zinc-800 sm:inline-flex">
          Reel {index + 1} / {total}
        </span>
      </div>

      <div className="relative flex items-center gap-1">
        <button
          type="button"
          aria-label="Report"
          className="grid h-9 w-9 place-items-center rounded-full text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          <IconFlag className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="More options"
          onClick={() => setMenuOpen((s) => !s)}
          className={`grid h-9 w-9 place-items-center rounded-full transition ${
            menuOpen
              ? "bg-zinc-900 text-white"
              : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
          }`}
        >
          <IconMoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <MoreMenu
            quality={quality}
            kind={story.kind}
            onClose={() => setMenuOpen(false)}
            onOpenQuality={onOpenQuality}
          />
        )}
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────
   LEFT SIDEBAR — search, related searches, related videos
─────────────────────────────────────────────────────────────────── */

function LeftSidebar({
  relatedSearches,
  relatedVideos,
  onPickReel,
  searchDraft,
  setSearchDraft,
  onSubmitSearch,
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? relatedSearches : relatedSearches.slice(0, 5);

  return (
    <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-zinc-900 bg-zinc-950 xl:block scrollbar-thin">
      {/* Search */}
      <div className="border-b border-zinc-900 px-4 py-4">
        <form onSubmit={onSubmitSearch} className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search…"
            aria-label="Search the catalog"
            className="w-full rounded-full border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Related Searches */}
      <section className="border-b border-zinc-900 px-4 py-4">
        <h2 className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-100">
          <IconSearch className="h-3.5 w-3.5 text-fuchsia-300" />
          Related Searches
        </h2>
        <ul className="flex flex-wrap gap-1.5">
          {visible.map((s, i) => (
            <li key={`${s.to}-${i}`}>
              <Link
                to={s.to}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 hover:text-white"
              >
                <IconSearch className="h-2.5 w-2.5 text-zinc-500" />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
        {relatedSearches.length > 5 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-300 transition hover:text-fuchsia-200"
          >
            {expanded ? "Show less" : "Show more"}
            <IconChevronDown
              className={`h-3 w-3 transition ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </section>

      {/* Related Videos */}
      <section className="px-4 py-4">
        <h2 className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-100">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_currentColor]" />
          Related Videos
        </h2>
        <ul className="grid grid-cols-2 gap-2">
          {relatedVideos.map((r) => (
            <RelatedTile key={r.id} reel={r} onPick={onPickReel} />
          ))}
        </ul>
      </section>
    </aside>
  );
}

function RelatedTile({ reel, onPick }) {
  const seed = seedFromString(reel.id);
  const heartCount = 20 + (seed % 320);
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(reel.id)}
        className="group block w-full text-left"
      >
        <div className="relative aspect-[9/12] w-full overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition group-hover:ring-fuchsia-400/40">
          {reel.image ? (
            <img
              src={reel.image}
              alt={reel.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center text-zinc-700">
              <IconPlay className="h-5 w-5" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/85 to-transparent p-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-white drop-shadow">
              <span className="inline-flex items-center gap-0.5 tabular-nums">
                <IconPlay className="h-2.5 w-2.5" />
                {formatCount(reel.views ?? 0)}
              </span>
              <span className="inline-flex items-center gap-0.5 tabular-nums">
                <IconHeart className="h-2.5 w-2.5" />
                {heartCount}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight text-zinc-300 group-hover:text-white">
          {reel.title}
        </p>
      </button>
    </li>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CENTER PLAYER
─────────────────────────────────────────────────────────────────── */

function CenterPlayer({
  story,
  embedUrl,
  youtubeId,
  posterImg,
  muted,
  setMuted,
  liked,
  setLiked,
  disliked,
  setDisliked,
  favorited,
  setFavorited,
  following,
  setFollowing,
  likeCount,
  commentCount,
  channelAvatar,
  channelTitle,
  onClose,
  prev,
  next,
  atStart,
  atEnd,
  toggleFullscreen,
}) {
  const accent = KIND_ACCENT[story.kind] ?? KIND_ACCENT.episode;

  return (
    <main className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
      {/* Vertical 9:16 frame */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative h-full w-full sm:aspect-[9/16] sm:max-h-full sm:w-auto">
          {embedUrl ? (
            <iframe
              key={`${youtubeId}-${muted ? "m" : "u"}`}
              src={embedUrl}
              title={story.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full bg-black"
            />
          ) : (
            <div className="relative h-full w-full overflow-hidden">
              {posterImg && (
                <img
                  src={posterImg}
                  alt={story.title}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[2px]"
                />
              )}
              <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-zinc-300">
                No playable video for this entry.
              </div>
            </div>
          )}

          {/* Prev / next navigation arrows (also work via keyboard) */}
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            aria-label="Previous reel"
            className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-zinc-100 backdrop-blur transition hover:bg-black/75 disabled:opacity-25"
          >
            <IconChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            aria-label="Next reel"
            className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-zinc-100 backdrop-blur transition hover:bg-black/75 disabled:opacity-25"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>

          {/* ────── ACTION RAIL ──────────────────────────────────────────
              Minimalist outline icons (no backdrop circles) floating on
              the right edge of the 9:16 frame. Matches the TikTok-style
              reference. Fullscreen lives on the opposite corner now. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-3 pb-32 sm:pr-4 sm:pb-36">
            <div className="pointer-events-auto flex flex-col items-center gap-5">
              {/* Avatar + colored "+" follow tag */}
              <div className="relative">
                {story.anime_mal_id ? (
                  <Link
                    to={`/anime/${story.anime_mal_id}`}
                    onClick={onClose}
                    aria-label={channelTitle}
                  >
                    <Avatar img={channelAvatar} alt={channelTitle} />
                  </Link>
                ) : (
                  <Avatar img={channelAvatar} alt={story.title} />
                )}
                <button
                  type="button"
                  onClick={() => setFollowing((s) => !s)}
                  aria-label={following ? "Following" : "Follow"}
                  className={`absolute -bottom-2 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-md transition active:scale-95 ${
                    following
                      ? "bg-emerald-500 text-zinc-950"
                      : `bg-gradient-to-r ${accent.gradient} text-zinc-950 shadow-[0_0_14px_-2px_rgba(232,121,249,0.65)]`
                  }`}
                >
                  {following ? (
                    <IconCheck className="h-3 w-3" />
                  ) : (
                    <IconPlus className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Thumbs up (with count) */}
              <RailButton
                icon={
                  <IconThumbsUp
                    className={`h-7 w-7 transition ${
                      liked
                        ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.7)]"
                        : "text-white"
                    }`}
                    strokeWidth={liked ? 2.4 : 1.8}
                  />
                }
                label={formatCount(likeCount + (liked ? 1 : 0))}
                onClick={() => {
                  setLiked((s) => !s);
                  if (disliked) setDisliked(false);
                }}
              />

              {/* Thumbs down (no count) */}
              <RailButton
                icon={
                  <IconThumbsDown
                    className={`h-7 w-7 transition ${
                      disliked
                        ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.65)]"
                        : "text-white"
                    }`}
                    strokeWidth={disliked ? 2.4 : 1.8}
                  />
                }
                onClick={() => {
                  setDisliked((s) => !s);
                  if (liked) setLiked(false);
                }}
              />

              {/* Share */}
              <RailButton
                icon={<IconShare className="h-7 w-7 text-white" strokeWidth={1.8} />}
              />

              {/* Heart (favorite) */}
              <RailButton
                icon={
                  <IconHeart
                    className={`h-7 w-7 transition ${
                      favorited
                        ? "scale-105 fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]"
                        : "text-white"
                    }`}
                    strokeWidth={favorited ? 0 : 1.8}
                  />
                }
                onClick={() => setFavorited((s) => !s)}
              />

              {/* Mute / unmute */}
              <RailButton
                icon={
                  muted ? (
                    <IconVolumeMute
                      className="h-7 w-7 text-white"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <IconVolumeOn
                      className="h-7 w-7 text-white"
                      strokeWidth={1.8}
                    />
                  )
                }
                onClick={() => setMuted((s) => !s)}
              />
            </div>
          </div>

          {/* ────── BOTTOM CAPTION ─────────────────────────────────────── */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent pb-4 pt-16 sm:pb-5">
            <div className="pointer-events-auto px-4 pr-16 sm:px-5 sm:pr-20">
              {story.anime_mal_id ? (
                <Link
                  to={`/anime/${story.anime_mal_id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-base font-bold text-white hover:underline"
                >
                  <span className="line-clamp-1">{channelTitle}</span>
                  <span
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-500"
                    aria-label="Verified"
                  >
                    <IconCheck className="h-2.5 w-2.5 text-zinc-950" />
                  </span>
                </Link>
              ) : (
                <span className="text-base font-bold text-white">
                  {channelTitle}
                </span>
              )}

              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-200 drop-shadow">
                <span
                  className={`mr-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ${accent.pill}`}
                >
                  {KIND_LABEL[story.kind] ?? "Reel"}
                </span>
                {story.title}
              </p>

              {story.anime_mal_id && (
                <Link
                  to={`/anime/${story.anime_mal_id}`}
                  onClick={onClose}
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${accent.gradient} px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-[0_0_20px_-6px_rgba(232,121,249,0.6)] ring-1 ring-white/30 transition hover:brightness-110 active:scale-[0.97]`}
                >
                  More of {channelTitle?.split(":")[0] ?? "this anime"}
                  <IconExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* ────── FULLSCREEN (bottom-right corner, off the rail) ────── */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="absolute bottom-4 right-3 z-20 grid h-9 w-9 place-items-center rounded-md text-white/90 transition hover:bg-white/10 sm:bottom-5 sm:right-4"
          >
            <IconFullscreen className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────────
   RIGHT SIDEBAR — anime "creator" profile
─────────────────────────────────────────────────────────────────── */

function RightSidebar({
  story,
  animeMeta,
  channelTitle,
  channelAvatar,
  channelStats,
  following,
  setFollowing,
  moreFromAnime,
  onPickReel,
}) {
  return (
    <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-zinc-900 bg-zinc-950 lg:block scrollbar-thin">
      {/* Header */}
      <div className="border-b border-zinc-900 px-4 py-4">
        <h2 className="line-clamp-1 text-base font-bold text-white">
          {channelTitle}
        </h2>
      </div>

      <div className="px-4 py-4">
        <p className="text-sm font-bold text-white">
          {channelTitle}:{" "}
          <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
            Free anime reels
          </span>
        </p>

        {/* Avatar + stat row */}
        <div className="mt-3 flex items-center gap-3">
          {story.anime_mal_id ? (
            <Link to={`/anime/${story.anime_mal_id}`} className="relative shrink-0">
              <span
                aria-hidden
                className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 opacity-70 blur-[3px]"
              />
              <Avatar img={channelAvatar} alt={channelTitle} size="lg" />
            </Link>
          ) : (
            <span className="relative shrink-0">
              <span
                aria-hidden
                className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 opacity-70 blur-[3px]"
              />
              <Avatar img={channelAvatar} alt={channelTitle} size="lg" />
            </span>
          )}

          {channelStats && (
            <ul className="grid flex-1 grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <StatRow label="Videos" value={channelStats.videos} />
              <StatRow label="Likes" value={formatCount(channelStats.likes)} />
              <StatRow label="Views" value={formatCount(channelStats.views)} />
              <StatRow label="Followers" value={formatCount(channelStats.followers)} />
            </ul>
          )}
        </div>

        {/* Follow + Share */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFollowing((s) => !s)}
            aria-pressed={following}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-[0.97] ${
              following
                ? "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700"
                : "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/30 hover:brightness-110"
            }`}
          >
            {following ? (
              <>
                <IconCheck className="h-3.5 w-3.5" />
                Following
              </>
            ) : (
              <>
                <IconPlus className="h-3.5 w-3.5" />
                Follow
              </>
            )}
          </button>
          <button
            type="button"
            aria-label="Share channel"
            className="grid h-8 w-8 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-fuchsia-400/40 hover:text-white"
          >
            <IconShare className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        {animeMeta?.synopsis && (
          <p className="mt-4 text-[12px] leading-relaxed text-zinc-400">
            {animeMeta.synopsis}
          </p>
        )}

        {/* Meta row */}
        {animeMeta && (
          <ul className="mt-4 flex flex-wrap gap-1.5 text-[10px]">
            {animeMeta.score && (
              <li className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-200 ring-1 ring-amber-400/30">
                ★ {animeMeta.score.toFixed(2)}
              </li>
            )}
            {animeMeta.episodes && (
              <li className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-bold text-zinc-300 ring-1 ring-zinc-800">
                {animeMeta.episodes} eps
              </li>
            )}
            {animeMeta.year && (
              <li className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-bold text-zinc-300 ring-1 ring-zinc-800">
                {animeMeta.year}
              </li>
            )}
            {animeMeta.type && (
              <li className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-bold text-zinc-300 ring-1 ring-zinc-800">
                {animeMeta.type}
              </li>
            )}
          </ul>
        )}
      </div>

      {/* More from this anime */}
      {moreFromAnime.length > 0 && (
        <section className="border-t border-zinc-900 px-4 py-4">
          <h3 className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-100">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_currentColor]" />
            More from {channelTitle}
          </h3>
          <ul className="grid grid-cols-2 gap-2">
            {moreFromAnime.map((r) => (
              <RelatedTile key={r.id} reel={r} onPick={onPickReel} />
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

function StatRow({ label, value }) {
  return (
    <li className="flex items-baseline justify-between gap-2 border-b border-zinc-900/80 pb-1 last:border-b-0">
      <span className="font-black tabular-nums text-white">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
    </li>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SHARED HELPERS
─────────────────────────────────────────────────────────────────── */

function slugify(s = "") {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

function Avatar({ img, alt, size = "md" }) {
  const dim = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-900 ring-2 ring-zinc-100/80 ${dim}`}
    >
      {img ? (
        <img
          src={img}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-bold text-zinc-100">
          {(alt ?? "?").charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function RailButton({ icon, label, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className="group flex flex-col items-center gap-1 transition active:scale-95"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] transition group-hover:scale-110 group-hover:text-fuchsia-200">
        {icon}
      </span>
      {label && (
        <span className="text-[12px] font-black tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {label}
        </span>
      )}
    </button>
  );
}

function MoreMenu({ quality, kind, onClose, onOpenQuality }) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
      />
      <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl bg-zinc-900 p-1.5 shadow-2xl ring-1 ring-zinc-800">
        <MenuRow
          icon={<IconGrid className="h-4 w-4" />}
          label={KIND_LABEL[kind] ?? "Genre"}
          trailing={<IconChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
        />
        <MenuRow
          icon={<IconGear className="h-4 w-4" />}
          label={quality}
          onClick={onOpenQuality}
        />
        <Link
          to="/feedback"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          <IconMessage className="h-4 w-4 text-zinc-400" />
          Feedback
        </Link>
        <Link
          to="/dmca"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          <IconFlag className="h-4 w-4 text-zinc-400" />
          Content Removal
        </Link>
        <Link
          to="/about"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          <IconLink className="h-4 w-4 text-zinc-400" />
          Additional Links
        </Link>
      </div>
    </>
  );
}

function MenuRow({ icon, label, onClick, trailing }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
    >
      <span className="text-zinc-400">{icon}</span>
      <span className="flex-1">{label}</span>
      {trailing}
    </button>
  );
}

function QualitySheet({ value, onChange, onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-zinc-900 p-6 shadow-2xl ring-1 ring-zinc-800">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <IconClose className="h-4 w-4" />
        </button>
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-zinc-700" />
        <h3 className="text-xl font-extrabold text-zinc-50">Quality</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUALITY_OPTIONS.map((q) => {
            const active = q === value;
            return (
              <button
                key={q}
                type="button"
                onClick={() => {
                  onChange(q);
                  onClose();
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 ring-1 ring-white/30"
                    : "bg-zinc-800 text-zinc-200 ring-1 ring-zinc-700 hover:text-white hover:ring-zinc-600"
                }`}
              >
                {q}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
