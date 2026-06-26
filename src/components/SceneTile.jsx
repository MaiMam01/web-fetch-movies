import { Link } from "react-router-dom";
import { IconPlay, IconImage } from "./Icons.jsx";

const SEVERITY_STYLES = {
  mild: "bg-zinc-700 text-zinc-100",
  moderate: "bg-amber-500 text-zinc-950",
  graphic: "bg-orange-600 text-zinc-50",
  extreme: "bg-red-600 text-zinc-50",
};

export default function SceneTile({ scene, posterFallback, onClick }) {
  const sevClass = SEVERITY_STYLES[scene.severity] ?? SEVERITY_STYLES.moderate;
  const epLabel = `S${scene.season ?? 1}·E${scene.episode}`;
  const isVideo = scene.kind === "video";
  const KindIcon = isVideo ? IconPlay : IconImage;
  const kindLabel = isVideo ? "Video" : "Photo";

  const inner = (
    <>
      {scene.image ? (
        <img
          src={scene.image}
          alt={scene.title}
          loading="lazy"
          decoding="async"
          width="320"
          height="180"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : posterFallback ? (
        <>
          <img
            src={posterFallback}
            alt={scene.anime_title || scene.title}
            loading="lazy"
            decoding="async"
            width="320"
            height="180"
            className="h-full w-full scale-110 object-cover opacity-40 blur-[1.5px] transition duration-500 group-hover:scale-[1.15] group-hover:opacity-55 group-hover:blur-[0.5px]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-950/50 via-transparent to-zinc-950/40" />
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-zinc-950/80 ring-2 ring-zinc-700 transition group-hover:ring-brand-500">
              <KindIcon className="h-5 w-5 text-brand-500" />
            </span>
          </span>
        </>
      ) : (
        <div className="grid h-full place-items-center text-zinc-700">
          <KindIcon className="h-10 w-10" />
        </div>
      )}

      <span
        className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sevClass}`}
      >
        {scene.severity ?? "scene"}
      </span>

      <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-100">
        <KindIcon className="h-2.5 w-2.5 text-brand-500" />
        {kindLabel}
      </span>

      <span className="absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded bg-zinc-950/90 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-100">
        <span className="text-amber-400">{epLabel}</span>
        {scene.timestamp && (
          <>
            <span className="text-zinc-600">·</span>
            <span>{scene.timestamp}</span>
          </>
        )}
      </span>

      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

      <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 px-2 pb-7 text-xs font-semibold text-zinc-100 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <span className="line-clamp-2">{scene.title}</span>
      </span>
    </>
  );

  const className =
    "group relative block aspect-video w-full overflow-hidden rounded-md bg-zinc-900 text-left ring-1 ring-zinc-800 transition hover:ring-brand-500";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={`/scenes/${scene.id}`} className={className}>
      {inner}
    </Link>
  );
}
