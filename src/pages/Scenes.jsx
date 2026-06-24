import { useMemo } from "react";
import { useParams } from "react-router-dom";
import AgeGate from "../components/AgeGate.jsx";
import scenesData from "../data/scenes.json";

const severityStyles = {
  mild: "bg-zinc-700 text-zinc-100",
  moderate: "bg-amber-600 text-zinc-950",
  graphic: "bg-orange-600 text-zinc-950",
  extreme: "bg-red-600 text-zinc-100",
};

export default function Scenes() {
  const { malId } = useParams();
  const scenes = scenesData.scenes ?? [];

  const filtered = useMemo(() => {
    if (!malId) return scenes;
    const id = Number(malId);
    return scenes.filter((s) => s.mal_id === id);
  }, [malId, scenes]);

  return (
    <AgeGate title="Scenes contain depictions of graphic violence">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Scene Catalog
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {malId ? "Notable Scenes" : "All Notable Scenes"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            A curated index of pivotal, often graphic, scenes. Each entry
            includes episode, timestamp, and a short editorial description.
          </p>
        </header>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <SceneCard key={s.id} scene={s} />
            ))}
          </div>
        )}
      </div>
    </AgeGate>
  );
}

function SceneCard({ scene }) {
  const sevClass = severityStyles[scene.severity] ?? severityStyles.moderate;
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      {scene.image && (
        <div className="aspect-video w-full overflow-hidden bg-zinc-800">
          <img
            src={scene.image}
            alt={scene.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded px-2 py-0.5 font-semibold ${sevClass}`}>
            {scene.severity?.toUpperCase()}
          </span>
          <span className="text-zinc-400">
            S{scene.season}·E{scene.episode} &middot; {scene.timestamp}
          </span>
        </div>
        <h3 className="mt-2 text-base font-bold text-zinc-100">{scene.title}</h3>
        <p className="mt-1 text-xs text-zinc-500">{scene.anime_title}</p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          {scene.spoiler ? (
            <details>
              <summary className="cursor-pointer text-amber-400">
                Show description (spoiler)
              </summary>
              <span className="mt-2 block">{scene.description}</span>
            </details>
          ) : (
            scene.description
          )}
        </p>
        {scene.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scene.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
      <p className="text-lg font-semibold text-zinc-200">
        No scenes catalogued yet.
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        Add entries to <code className="text-brand-500">src/data/scenes.json</code>.
        Each entry needs an <code>id</code>, <code>mal_id</code>,{" "}
        <code>season</code>, <code>episode</code>, <code>timestamp</code>,{" "}
        <code>title</code>, <code>description</code>, and <code>severity</code>.
      </p>
    </div>
  );
}
