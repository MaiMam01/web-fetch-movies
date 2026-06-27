import { useState } from "react";

/**
 * Avatar that "pops out" on hover — it scales beyond the row, translates up,
 * gains a soft glow ring, AND cross-fades to an alternate thumbnail so the
 * user gets a richer preview of the content behind the tile.
 *
 * The hover state has `z-index` raised so the enlarged avatar sits above its
 * neighbours. Children are layered on top of the image (badges, etc).
 *
 * Props:
 *   src        — primary image URL (always shown)
 *   hoverSrc   — alternate image URL faded in on hover (optional)
 *   alt        — accessible label
 *   active     — keeps the popped-out / colored state pinned on (selection)
 *   size       — pixel size of the base circle (default 72)
 *   activeRing — Tailwind ring color when active (default fuchsia)
 *   hoverRing  — Tailwind ring color when hovering (default cyan)
 *   topBadge   — optional element rendered in top-right (e.g. score chip)
 */
export default function HoverPopAvatar({
  src,
  hoverSrc,
  alt = "",
  active = false,
  size = 72,
  activeRing = "ring-fuchsia-400 shadow-[0_0_28px_-6px_rgba(232,121,249,0.6)]",
  hoverRing = "group-hover:ring-cyan-300 group-hover:shadow-[0_0_28px_-6px_rgba(103,232,249,0.55)]",
  topBadge,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: size, width: size }}
      className={`relative inline-grid place-items-center transition-transform duration-300 ease-out will-change-transform ${
        hovered ? "z-20 -translate-y-2 scale-[1.55]" : "z-0"
      }`}
    >
      <span
        className={`relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-zinc-900 ring-2 transition-all duration-300 ${
          active ? activeRing : `ring-zinc-800 ${hoverRing}`
        }`}
      >
        {/* Primary image */}
        {src && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              hovered && hoverSrc ? "opacity-0" : "opacity-100"
            }`}
          />
        )}
        {/* Hover image (cross-fades in) */}
        {hoverSrc && (
          <img
            src={hoverSrc}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full scale-110 object-cover transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {/* Soft inner vignette for legibility of overlays */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {topBadge && (
          <span className="absolute bottom-1 right-1 z-10">{topBadge}</span>
        )}
      </span>
    </span>
  );
}

/**
 * Pull the YouTube ID out of any Jikan embed/trailer URL string so we can
 * use https://i.ytimg.com/vi/{id}/hqdefault.jpg as the hover thumbnail.
 */
export function deriveYoutubeThumb(input) {
  const src =
    typeof input === "string"
      ? input
      : input?.embed_url || input?.url || input?.youtube_id || "";
  if (!src) return null;
  // If it's already a bare ID
  if (/^[\w-]{6,}$/.test(src)) return `https://i.ytimg.com/vi/${src}/hqdefault.jpg`;
  const m =
    src.match(/embed\/([\w-]{6,})/) ||
    src.match(/[?&]v=([\w-]{6,})/) ||
    src.match(/youtu\.be\/([\w-]{6,})/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
}
