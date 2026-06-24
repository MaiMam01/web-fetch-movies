import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight, IconGrid } from "./Icons.jsx";

export default function StoryPlayer({ stories, index, onClose, onChange }) {
  const story = stories[index];
  const total = stories.length;

  const next = useCallback(() => {
    if (index < total - 1) onChange(index + 1);
  }, [index, total, onChange]);

  const prev = useCallback(() => {
    if (index > 0) onChange(index - 1);
  }, [index, onChange]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  if (!story) return null;

  const youtubeId = story.youtube_id || story.trailer?.youtube_id;
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-zinc-900/80 text-2xl text-zinc-200 hover:bg-zinc-800"
      >
        ×
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        disabled={index === 0}
        aria-label="Previous"
        className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-zinc-900/70 text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 sm:left-8"
      >
        <IconChevronRight className="h-6 w-6 rotate-180" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        disabled={index >= total - 1}
        aria-label="Next"
        className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-zinc-900/70 text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 sm:right-8"
      >
        <IconChevronRight className="h-6 w-6" />
      </button>

      <div
        className="relative flex h-[88vh] max-h-[900px] w-[min(94vw,520px)] flex-col overflow-hidden rounded-xl bg-black ring-1 ring-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {embedUrl ? (
          <iframe
            key={youtubeId}
            src={embedUrl}
            title={story.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-500">
            No playable video for this entry.
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-zinc-950/95 to-transparent p-4 pt-10">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-bold text-zinc-50">
              {story.title}
            </p>
            {story.anime_mal_id && story.anime_title && (
              <Link
                to={`/anime/${story.anime_mal_id}`}
                onClick={onClose}
                className="mt-0.5 line-clamp-1 block text-xs font-semibold text-brand-500 hover:underline"
              >
                {story.anime_title}
              </Link>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-300">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded bg-zinc-900/80 px-2 py-1 hover:bg-zinc-800"
            >
              <IconGrid className="h-3.5 w-3.5" />
              More Videos
            </button>
            <span className="rounded bg-zinc-900/80 px-2 py-1 font-semibold">
              {index + 1} of {total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
