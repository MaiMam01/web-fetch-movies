import { IconPlay, IconImage } from "./Icons.jsx";

const SEVERITY_STYLES = {
  mild: "bg-zinc-700 text-zinc-100",
  moderate: "bg-amber-500 text-zinc-950",
  graphic: "bg-orange-600 text-zinc-50",
  extreme: "bg-red-600 text-zinc-50",
};

export default function SceneTile({ scene, onClick }) {
  const sevClass = SEVERITY_STYLES[scene.severity] ?? SEVERITY_STYLES.moderate;
  const epLabel = `S${scene.season ?? 1}·E${scene.episode}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block aspect-video w-full overflow-hidden rounded-md bg-zinc-900 text-left ring-1 ring-zinc-800 transition hover:ring-brand-500"
    >
      {scene.image ? (
        <img
          src={scene.image}
          alt={scene.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grid h-full place-items-center text-zinc-700">
          {scene.kind === "video" ? (
            <IconPlay className="h-10 w-10" />
          ) : (
            <IconImage className="h-10 w-10" />
          )}
        </div>
      )}

      <span
        className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sevClass}`}
      >
        {scene.severity ?? "scene"}
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
    </button>
  );
}
