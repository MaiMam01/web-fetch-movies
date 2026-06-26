import { Link } from "react-router-dom";

/**
 * Pull the first comma-separated piece (so "Uzumaki, Naruto" → "Naruto"
 * because MAL stores names as "Family, Given").
 */
export function displayFirstName(name) {
  if (!name) return "";
  if (name.includes(",")) {
    const [family, given] = name.split(",").map((s) => s.trim());
    return given || family;
  }
  return name.split(" ")[0];
}

/**
 * A single circular character avatar (gradient ring + name label) used by
 * CharacterCircleRail and RecommendedCharactersRail. Pass an optional
 * `label` override to control the name shown beneath the circle.
 */
export default function CharacterCircle({ character, label }) {
  const img =
    character.images?.webp?.image_url ?? character.images?.jpg?.image_url;
  const name = label ?? character._label ?? displayFirstName(character.name);
  return (
    <Link
      to={`/characters/${character.mal_id}`}
      className="group flex w-16 shrink-0 flex-col items-center gap-1.5 text-center sm:w-[72px]"
      title={character.name}
    >
      <div className="rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[2px] transition duration-300 group-hover:scale-[1.08] group-hover:shadow-[0_0_18px_-4px_rgba(232,121,249,0.7)]">
        <div className="overflow-hidden rounded-full bg-zinc-900">
          {img ? (
            <img
              src={img}
              alt={character.name}
              loading="lazy"
              decoding="async"
              width="64"
              height="64"
              className="h-14 w-14 object-cover transition duration-500 group-hover:scale-[1.06] sm:h-16 sm:w-16"
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center text-xs text-zinc-600 sm:h-16 sm:w-16">
              ?
            </div>
          )}
        </div>
      </div>
      <p className="line-clamp-1 w-full text-[10px] font-semibold text-zinc-300 transition group-hover:text-fuchsia-200 sm:text-[11px]">
        {name}
      </p>
    </Link>
  );
}

/** Loading placeholder that matches CharacterCircle dimensions. */
export function CharacterCircleSkeleton() {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-[72px]">
      <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-900 ring-1 ring-zinc-800 sm:h-16 sm:w-16" />
      <div className="h-2.5 w-10 animate-pulse rounded bg-zinc-900" />
    </div>
  );
}
