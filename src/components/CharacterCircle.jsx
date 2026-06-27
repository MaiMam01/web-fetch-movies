import { memo } from "react";
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
// Deterministic accent palette for the "no image" fallback — each character
// gets a stable gradient background based on a hash of their name, so the
// rail still looks colorful when avatars are unavailable.
const FALLBACK_GRADIENTS = [
  "from-fuchsia-500 to-violet-600",
  "from-cyan-500 to-sky-700",
  "from-amber-500 to-orange-600",
  "from-lime-500 to-emerald-700",
  "from-rose-500 to-pink-700",
  "from-indigo-500 to-blue-700",
  "from-teal-500 to-cyan-700",
  "from-purple-500 to-fuchsia-700",
];

function hashIdx(str, mod) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

function CharacterCircle({ character, label }) {
  const img =
    character.images?.webp?.image_url ?? character.images?.jpg?.image_url;
  const hoverImg = character._hoverImage;
  const name = label ?? character._label ?? displayFirstName(character.name);
  const initial = (name || character.name || "?").trim().charAt(0).toUpperCase();
  const gradient =
    FALLBACK_GRADIENTS[hashIdx(character.name || name || "", FALLBACK_GRADIENTS.length)];
  return (
    <Link
      to={`/characters/${character.mal_id}`}
      className="group relative flex w-16 shrink-0 flex-col items-center gap-1.5 text-center sm:w-[72px]"
      title={character.name}
    >
      <div className="z-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[2px] transition-transform duration-300 ease-out will-change-transform group-hover:z-20 group-hover:-translate-y-3 group-hover:scale-[1.55] group-hover:shadow-[0_0_28px_-4px_rgba(232,121,249,0.7)]">
        <div className="relative overflow-hidden rounded-full bg-zinc-900">
          {img ? (
            <>
              <img
                src={img}
                alt={character.name}
                loading="lazy"
                decoding="async"
                width="64"
                height="64"
                className={`h-14 w-14 object-cover transition-opacity duration-300 sm:h-16 sm:w-16 ${
                  hoverImg ? "group-hover:opacity-0" : "group-hover:scale-[1.06]"
                }`}
              />
              {hoverImg && (
                <img
                  src={hoverImg}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-14 w-14 scale-110 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-16 sm:w-16"
                />
              )}
            </>
          ) : (
            <div
              aria-hidden
              className={`grid h-14 w-14 place-items-center bg-gradient-to-br ${gradient} text-base font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:h-16 sm:w-16 sm:text-lg`}
            >
              {initial}
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

export default memo(
  CharacterCircle,
  (a, b) =>
    a.character?.mal_id === b.character?.mal_id && a.label === b.label
);

/** Loading placeholder that matches CharacterCircle dimensions. */
export function CharacterCircleSkeleton() {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-[72px]">
      <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-900 ring-1 ring-zinc-800 sm:h-16 sm:w-16" />
      <div className="h-2.5 w-10 animate-pulse rounded bg-zinc-900" />
    </div>
  );
}
