import { memo } from "react";
import { Link } from "react-router-dom";
import { IconPlay, IconImage, IconHeart, formatCompact } from "./Icons.jsx";

const SEVERITY_STYLES = {
  mild: {
    badge: "bg-emerald-500 text-zinc-950",
    glow: "from-emerald-500/60",
  },
  moderate: {
    badge: "bg-amber-500 text-zinc-950",
    glow: "from-amber-500/60",
  },
  graphic: {
    badge: "bg-orange-600 text-zinc-50",
    glow: "from-orange-500/60",
  },
  extreme: {
    badge: "bg-red-600 text-zinc-50",
    glow: "from-red-500/70",
  },
};

function relativeFromYear(year) {
  if (!year) return null;
  const diff = new Date().getFullYear() - year;
  if (diff <= 0) return "new";
  if (diff === 1) return "1y";
  return `${diff}y`;
}

/**
 * Synthesize a "views" + "likes" pair from the source anime's stats so each
 * tile gets stable, plausible engagement numbers without us inventing a
 * tracking backend. We derive a per-scene factor from a hash of the scene's
 * id so two scenes from the same anime show different (but stable) counts.
 */
function hash(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deriveEngagement(scene, anime) {
  if (!anime) return { views: null, likes: null };
  const seed = hash(scene.id);
  const viewsFactor = 0.18 + ((seed % 100) / 100) * 0.25; // 18–43% of members
  const likesFactor = 0.008 + ((seed % 73) / 73) * 0.014; // 0.8–2.2% of members
  const views = Math.round((anime.members ?? 0) * viewsFactor) || null;
  const likes =
    Math.round((anime.favorites ?? anime.members ?? 0) * likesFactor) || null;
  return { views, likes };
}

function SceneTile({ scene, posterFallback, anime, onClick }) {
  const sev = SEVERITY_STYLES[scene.severity] ?? SEVERITY_STYLES.moderate;
  const epLabel = `S${scene.season ?? 1}·E${scene.episode}`;
  const isVideo = scene.kind === "video";
  const KindIcon = isVideo ? IconPlay : IconImage;

  const avatar =
    anime?.images?.webp?.small_image_url ||
    anime?.images?.jpg?.small_image_url ||
    posterFallback;
  const animeTitle = anime?.title_english || anime?.title || scene.anime_title;
  const { views, likes } = deriveEngagement(scene, anime);
  const ago = relativeFromYear(anime?.year ?? anime?.aired?.prop?.from?.year);

  const Wrap = onClick ? "button" : Link;
  const wrapProps = onClick
    ? { type: "button", onClick }
    : { to: `/scenes/${scene.id}` };

  return (
    <Wrap
      {...wrapProps}
      className="group relative block w-full text-left focus:outline-none"
    >
      {/* ─── THUMBNAIL ─────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800/80 transition-all duration-300 group-hover:ring-fuchsia-400/40 group-hover:shadow-[0_18px_40px_-18px_rgba(232,121,249,0.55)]">
        {scene.image ? (
          <img
            src={scene.image}
            alt={scene.title}
            loading="lazy"
            decoding="async"
            width="320"
            height="180"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : posterFallback ? (
          <>
            <img
              src={posterFallback}
              alt={animeTitle}
              loading="lazy"
              decoding="async"
              width="320"
              height="180"
              className="h-full w-full scale-110 object-cover opacity-50 blur-[1.5px] transition duration-500 group-hover:scale-[1.15] group-hover:opacity-60 group-hover:blur-[0.5px]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-950/55 via-transparent to-zinc-950/45" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-950/80 ring-1 ring-zinc-700 transition group-hover:ring-fuchsia-400/60">
                <KindIcon className="h-4 w-4 text-fuchsia-300" />
              </span>
            </span>
          </>
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">
            <KindIcon className="h-10 w-10" />
          </div>
        )}

        {/* Severity accent strip on the left edge */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${sev.glow} to-transparent opacity-80`}
        />

        {/* Top-left severity badge (subtle) */}
        {scene.severity && (
          <span
            className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] shadow-sm ${sev.badge}`}
          >
            {scene.severity}
          </span>
        )}

        {/* Top-right kind chip */}
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-100 backdrop-blur">
          <KindIcon className="h-2.5 w-2.5 text-fuchsia-300" />
          {isVideo ? "Video" : "Photo"}
        </span>

        {/* Bottom-right duration / episode badge */}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-zinc-950/90 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-zinc-100 backdrop-blur">
          <span className="text-amber-300">{epLabel}</span>
          {scene.timestamp && (
            <>
              <span className="text-zinc-600">·</span>
              <span>{scene.timestamp}</span>
            </>
          )}
        </span>

        {/* Spoiler veil */}
        {scene.spoiler && (
          <span className="pointer-events-none absolute left-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-rose-200 ring-1 ring-rose-400/40 backdrop-blur">
            Spoiler
          </span>
        )}
      </div>

      {/* ─── META BLOCK ────────────────────────────────────────────── */}
      <div className="mt-3 flex items-start gap-2.5">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-zinc-800"
          />
        ) : (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-zinc-600 ring-1 ring-zinc-800">
            <KindIcon className="h-3.5 w-3.5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[11px] font-semibold text-zinc-400">
            {animeTitle}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-zinc-100 transition group-hover:text-fuchsia-100">
            {scene.title}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
            {views != null && (
              <span className="font-semibold tabular-nums text-zinc-300">
                {formatCompact(views)}
              </span>
            )}
            {ago && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="tabular-nums">{ago}</span>
              </>
            )}
            {likes != null && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <IconHeart className="h-3 w-3 text-rose-400" />
                  {formatCompact(likes)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </Wrap>
  );
}

export default memo(
  SceneTile,
  (a, b) =>
    a.scene?.id === b.scene?.id &&
    a.posterFallback === b.posterFallback &&
    a.anime?.mal_id === b.anime?.mal_id &&
    a.onClick === b.onClick
);
