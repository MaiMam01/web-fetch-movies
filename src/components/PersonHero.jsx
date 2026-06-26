import {
  IconHeart,
  IconAlert,
  IconImage,
  IconPlay,
  IconEye,
  StarRating,
  formatCompact,
} from "./Icons.jsx";

export default function PersonHero({
  person,
  kind = "character",
  subtitle,
  stats = [],
  meta = [],
  rating = null,
  ctas = null,
}) {
  const img =
    person.images?.webp?.image_url ??
    person.images?.jpg?.image_url ??
    person.images?.webp?.large_image_url ??
    person.images?.jpg?.large_image_url;
  const bg = img;

  return (
    <section className="page-container mt-6">
      <div className="relative isolate overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
        {bg && (
          <div
            className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-25 blur-2xl"
            style={{ backgroundImage: `url(${bg})` }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950/70 via-zinc-950/30 to-zinc-950/60" />

        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
          {img && (
            <img
              src={img}
              alt={person.name}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width="176"
              height="176"
              className="aspect-square w-32 flex-shrink-0 rounded-lg object-cover shadow-2xl ring-1 ring-zinc-700 sm:w-44"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500">
              {kind === "voice-actor" ? "Voice Actor" : "Character"}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-50 sm:text-4xl">
              {person.name}
              {person.name_kanji && (
                <span className="ml-2 text-base font-semibold text-zinc-400 sm:text-xl">
                  {person.name_kanji}
                </span>
              )}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>
            )}

            {stats.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-300 sm:text-sm">
                {stats.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-zinc-300"
                  >
                    <span className="text-zinc-400">{s.icon}</span>
                    <span className="font-semibold">{s.value}</span>
                  </span>
                ))}
              </div>
            )}

            {meta.length > 0 && (
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 sm:text-sm">
                {meta.map(([k, v], i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <dt className="text-zinc-500">{k}:</dt>
                    <dd className="font-semibold text-brand-500">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {rating != null && (
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded bg-brand-500 px-2 py-1 text-sm font-black text-zinc-950">
                  {rating}
                </span>
                <StarRating value={rating} />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {ctas || (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-400"
                >
                  <IconHeart className="h-4 w-4" />
                  Add to Favorites
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                <IconAlert className="h-3.5 w-3.5" />
                Report content issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function makeStats({ anime, characters, scenes, favorites }) {
  const arr = [];
  if (anime != null)
    arr.push({
      icon: <IconImage className="h-4 w-4" />,
      value: `${anime} Anime`,
    });
  if (characters != null)
    arr.push({
      icon: <IconPlay className="h-4 w-4" />,
      value: `${characters} Characters`,
    });
  if (scenes != null)
    arr.push({
      icon: <IconPlay className="h-4 w-4" />,
      value: `${scenes} Scenes`,
    });
  if (favorites != null)
    arr.push({
      icon: <IconEye className="h-4 w-4" />,
      value: `${formatCompact(favorites)} Favorites`,
    });
  return arr;
}
