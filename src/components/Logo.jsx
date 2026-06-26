import { useId } from "react";
import { Link } from "react-router-dom";

/**
 * AnimeDB logo
 *
 * Anatomy:
 *   [mark]  Anime DB    ← optional mark + wordmark "Anime" + gradient pill "DB"
 *           tagline     ← optional small line under the wordmark
 *
 * Props:
 *   size       "xs" | "sm" | "md" | "lg" | "xl"  (default "md")
 *   variant    "default" | "iconOnly" | "wordmarkOnly"
 *   tagline    optional string rendered under the wordmark
 *   to         when provided, wraps the whole thing in a <Link>; pass `to=""` to render as static
 *   animated   subtly pulse the mark every few seconds (default true)
 *   className  extra classes for the outer element
 */
export default function Logo({
  size = "md",
  variant = "default",
  tagline,
  to = "/",
  animated = true,
  onClick,
  className = "",
}) {
  const s = SIZE[size] ?? SIZE.md;

  const showMark = variant !== "wordmarkOnly";
  const showWord = variant !== "iconOnly";

  const inner = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {showMark && <LogoMark size={s.mark} animated={animated} />}
      {showWord && (
        <span className="inline-flex flex-col leading-none">
          <span className={`flex items-baseline ${s.wordGap} font-black tracking-tight`}>
            <span className={`text-funk-gradient ${s.word}`}>Anime</span>
            <span
              className={`rounded-md bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_4px_18px_-6px_rgba(232,121,249,0.55)] ${s.pill}`}
            >
              DB
            </span>
          </span>
          {tagline && (
            <span className={`mt-1 text-zinc-500 ${s.tag}`}>{tagline}</span>
          )}
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-label="AnimeDB — Home"
        className="group inline-flex items-center transition active:scale-[0.98]"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

const SIZE = {
  xs: { mark: 18, word: "text-sm",  pill: "px-1 py-0",       gap: "gap-1.5", wordGap: "gap-[2px]", tag: "text-[9px]"  },
  sm: { mark: 22, word: "text-base", pill: "px-1.5 py-0.5",   gap: "gap-2",   wordGap: "gap-[3px]", tag: "text-[10px]" },
  md: { mark: 28, word: "text-lg",   pill: "px-1.5 py-0.5",   gap: "gap-2",   wordGap: "gap-1",     tag: "text-[10px]" },
  lg: { mark: 36, word: "text-2xl",  pill: "px-2 py-0.5",     gap: "gap-2.5", wordGap: "gap-1",     tag: "text-xs"     },
  xl: { mark: 48, word: "text-4xl",  pill: "px-2.5 py-1",     gap: "gap-3",   wordGap: "gap-1.5",   tag: "text-sm"     },
};

/**
 * The AnimeDB logo mark — a gradient-tinted "play" diamond with a sparkle accent.
 *
 * - Diamond shape (rotated rounded square) suggests a play-button + a gemstone.
 * - Inset play triangle reinforces "media / scenes".
 * - Sparkle in the corner echoes the "funky" cosmic theme used across the site.
 * - Soft fuchsia drop-shadow on the SVG root for a glow.
 */
export function LogoMark({ size = 28, animated = true }) {
  // useId gives each LogoMark instance its own gradient ids so multiple
  // logos on the same page (Header + Footer + AuthModal + StoryPlayer)
  // don't share — and accidentally break — the SVG <linearGradient> refs.
  const reactId = useId();
  const id = `animedb-logo-grad-${reactId}`;
  const id2 = `animedb-logo-grad-2-${reactId}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 drop-shadow-[0_4px_14px_rgba(232,121,249,0.5)] transition duration-300 group-hover:rotate-6 group-hover:scale-[1.06] ${
        animated ? "animate-logo-pulse" : ""
      }`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={id2} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
      </defs>

      {/* Rounded diamond (rotated square) */}
      <g transform="rotate(45 20 20)">
        <rect
          x="6"
          y="6"
          width="28"
          height="28"
          rx="7"
          fill={`url(#${id})`}
        />
        {/* Inner highlight stripe */}
        <rect
          x="6"
          y="6"
          width="28"
          height="14"
          rx="7"
          fill="white"
          fillOpacity="0.18"
        />
      </g>

      {/* Play triangle (centered, white) */}
      <path
        d="M16.5 13.5 L28 20 L16.5 26.5 Z"
        fill="white"
        fillOpacity="0.96"
      />

      {/* Sparkle accent (top-right) */}
      <g transform="translate(30 9)">
        <circle r="3.2" fill={`url(#${id2})`} />
        <path
          d="M0 -2.2 V2.2 M-2.2 0 H2.2"
          stroke="white"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>
    </svg>
  );
}
