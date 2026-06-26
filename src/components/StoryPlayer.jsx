import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconFlag,
  IconFullscreen,
  IconGear,
  IconGrid,
  IconHeart,
  IconLink,
  IconMessage,
  IconMoreVertical,
  IconPlus,
  IconShare,
  IconThumbsDown,
  IconThumbsUp,
  IconVolumeMute,
  IconVolumeOn,
} from "./Icons.jsx";

const QUALITY_OPTIONS = ["1080p HD", "720p HD", "480p", "240p"];

const KIND_GENRES = {
  music: "OP / ED",
  promo: "Trailer",
  episode: "Episode",
};

function formatCount(n) {
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

  const next = useCallback(() => {
    if (index < total - 1) onChange(index + 1);
  }, [index, total, onChange]);

  const prev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

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

  useEffect(() => {
    setMenuOpen(false);
    setQualitySheetOpen(false);
    setLiked(false);
    setDisliked(false);
  }, [index]);

  const likeCount = useMemo(() => {
    if (!story) return 0;
    return 500 + (seedFromString(story.id) % 8500);
  }, [story]);

  if (!story) return null;

  const youtubeId = story.youtube_id || story.trailer?.youtube_id;
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&mute=${
        muted ? 1 : 0
      }`
    : null;

  const posterImg = story.image || story.fallback_image;
  const avatarImg = story.fallback_image || story.image;

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex bg-black"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-100 transition hover:bg-white/10"
          >
            <IconChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <Logo size="xs" to="/" animated={false} onClick={onClose} />
          <span className="ml-2 hidden rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-200 sm:inline-block">
            Reels · {index + 1} / {total}
          </span>
        </div>

        <div className="relative flex items-center gap-1">
          <button
            type="button"
            aria-label="Report"
            className="grid h-9 w-9 place-items-center rounded-full text-zinc-100 transition hover:bg-white/10"
          >
            <IconFlag className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="More options"
            onClick={() => setMenuOpen((s) => !s)}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              menuOpen
                ? "bg-white/15 text-white"
                : "text-zinc-100 hover:bg-white/10"
            }`}
          >
            <IconMoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <MoreMenu
              quality={quality}
              kind={story.kind}
              onClose={() => setMenuOpen(false)}
              onOpenQuality={() => {
                setMenuOpen(false);
                setQualitySheetOpen(true);
              }}
            />
          )}
        </div>
      </div>

      <div className="relative mx-auto flex h-full w-full items-center justify-center">
        <div
          className="relative h-full w-full sm:aspect-[9/16] sm:max-h-screen sm:w-auto"
          style={{ maxWidth: "100vw" }}
        >
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
                  className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[2px]"
                />
              )}
              <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-zinc-300">
                No playable video for this entry.
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous reel"
            className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-zinc-100 backdrop-blur transition hover:bg-black/60 disabled:opacity-25"
          >
            <IconChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index >= total - 1}
            aria-label="Next reel"
            className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-zinc-100 backdrop-blur transition hover:bg-black/60 disabled:opacity-25"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-2 sm:pr-4">
        <div className="pointer-events-auto flex flex-col items-center gap-4">
          <div className="relative">
            {story.anime_mal_id ? (
              <Link
                to={`/anime/${story.anime_mal_id}`}
                onClick={onClose}
                aria-label={story.anime_title}
              >
                <Avatar img={avatarImg} alt={story.anime_title} />
              </Link>
            ) : (
              <Avatar img={avatarImg} alt={story.title} />
            )}
            <button
              type="button"
              onClick={() => setFollowing((s) => !s)}
              aria-label={following ? "Following" : "Follow"}
              className={`absolute -bottom-1.5 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full ring-2 ring-zinc-950 transition ${
                following
                  ? "bg-emerald-500 text-zinc-950"
                  : "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_18px_-4px_rgba(232,121,249,0.55)] ring-1 ring-fuchsia-300/50 hover:from-fuchsia-400 hover:to-cyan-300"
              }`}
            >
              {following ? (
                <IconCheck className="h-3 w-3" />
              ) : (
                <IconPlus className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <RailButton
            icon={
              <IconThumbsUp
                className={`h-6 w-6 ${liked ? "text-brand-500" : "text-zinc-100"}`}
              />
            }
            label={formatCount(likeCount + (liked ? 1 : 0))}
            onClick={() => {
              setLiked((s) => !s);
              if (disliked) setDisliked(false);
            }}
          />

          <RailButton
            icon={
              <IconThumbsDown
                className={`h-6 w-6 ${
                  disliked ? "text-brand-500" : "text-zinc-100"
                }`}
              />
            }
            onClick={() => {
              setDisliked((s) => !s);
              if (liked) setLiked(false);
            }}
          />

          <RailButton
            icon={<IconShare className="h-6 w-6 text-zinc-100" />}
            label="Share"
          />

          <RailButton
            icon={
              <IconHeart
                className={`h-6 w-6 ${
                  favorited ? "text-rose-500" : "text-zinc-100"
                }`}
              />
            }
            onClick={() => setFavorited((s) => !s)}
          />

          <RailButton
            icon={
              muted ? (
                <IconVolumeMute className="h-6 w-6 text-zinc-100" />
              ) : (
                <IconVolumeOn className="h-6 w-6 text-zinc-100" />
              )
            }
            onClick={() => setMuted((s) => !s)}
          />

          <RailButton
            icon={<IconFullscreen className="h-5 w-5 text-zinc-100" />}
            onClick={toggleFullscreen}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent pb-5 pt-16">
        <div className="pointer-events-auto mx-auto max-w-3xl px-5 pr-20 sm:pr-28">
          {story.anime_title && (
            <div className="flex items-center gap-1.5">
              {story.anime_mal_id ? (
                <Link
                  to={`/anime/${story.anime_mal_id}`}
                  onClick={onClose}
                  className="text-sm font-bold text-zinc-100 hover:underline"
                >
                  {story.anime_title}
                </Link>
              ) : (
                <span className="text-sm font-bold text-zinc-100">
                  {story.anime_title}
                </span>
              )}
              <span
                className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-500"
                aria-label="Verified"
              >
                <IconCheck className="h-2.5 w-2.5 text-zinc-950" />
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-200">
                {KIND_GENRES[story.kind] ?? "Reel"}
              </span>
            </div>
          )}
          <p className="mt-1 line-clamp-2 text-sm font-semibold uppercase tracking-wide text-zinc-100">
            {story.title}
          </p>
        </div>
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

function Avatar({ img, alt }) {
  return (
    <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-zinc-900 ring-2 ring-zinc-100/80">
      {img ? (
        <img
          src={img}
          alt={alt}
          loading="lazy"
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
      className="group flex flex-col items-center gap-0.5"
    >
      <span className="grid h-11 w-11 place-items-center rounded-full transition group-hover:bg-white/10">
        {icon}
      </span>
      {label && (
        <span className="text-[11px] font-bold text-zinc-100 drop-shadow">
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
      <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-lg bg-zinc-900 p-1.5 shadow-2xl ring-1 ring-zinc-800">
        <MenuRow
          icon={<IconGrid className="h-4 w-4" />}
          label={KIND_GENRES[kind] ?? "Genre"}
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
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          <IconMessage className="h-4 w-4 text-zinc-400" />
          Feedback
        </Link>
        <Link
          to="/dmca"
          onClick={onClose}
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
          <IconFlag className="h-4 w-4 text-zinc-400" />
          Content Removal
        </Link>
        <Link
          to="/about"
          onClick={onClose}
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
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
      className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
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
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative w-full max-w-md rounded-t-2xl bg-zinc-900 p-6 shadow-2xl ring-1 ring-zinc-800">
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
                    ? "bg-zinc-900 text-brand-500 ring-2 ring-brand-500"
                    : "bg-zinc-800 text-zinc-200 ring-1 ring-zinc-700 hover:ring-zinc-600 hover:text-white"
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
