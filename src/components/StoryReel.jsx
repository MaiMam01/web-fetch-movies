import { memo } from "react";
import { IconPlay, IconEye, formatCompact } from "./Icons.jsx";

function StoryReel({ story, onClick }) {
  // Reel renders at ~160×285px in the grid — prefer the medium variant over
  // maximum/large so thumbnails load 3-5× faster. Trailer thumbs from MAL
  // come from i.ytimg.com which is also cheaper at hqdefault size.
  const thumb =
    story.image ||
    story.trailer?.images?.medium_image_url ||
    story.trailer?.images?.large_image_url ||
    story.trailer?.images?.maximum_image_url ||
    story.fallback_image;

  const title = story.title || "Untitled";
  const subtitle = story.anime_title;
  const views = story.views;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-md bg-zinc-900 text-left ring-1 ring-zinc-800 transition hover:ring-brand-500"
    >
      {thumb ? (
        <img
          src={thumb}
          alt={title}
          loading="lazy"
          decoding="async"
          width="160"
          height="285"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="grid h-full place-items-center text-zinc-700">
          <IconPlay className="h-10 w-10" />
        </div>
      )}

      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-zinc-950/30 opacity-90" />

      {views != null && (
        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">
          <IconEye className="h-3 w-3" />
          {formatCompact(views)}
        </span>
      )}

      <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-500/95 text-zinc-950 shadow-2xl">
          <IconPlay className="h-6 w-6" />
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5">
        <span className="line-clamp-2 text-xs font-bold leading-snug text-zinc-50">
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 line-clamp-1 block text-[10px] text-zinc-300">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

export default memo(
  StoryReel,
  (a, b) => a.story?.id === b.story?.id && a.onClick === b.onClick
);
