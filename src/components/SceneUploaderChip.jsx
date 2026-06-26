import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconCheck,
  IconPlus,
  IconUser,
  IconHeart,
  IconExternalLink,
  formatCompact,
} from "./Icons.jsx";

/**
 * Hash a string into a stable integer for deterministic pseudo-random numbers.
 * Used so the same studio always shows the same follower delta across reloads.
 */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Derive a believable follower count for a studio. We can't fetch real
 * studio follower data, so blend the anime's favorites and members with a
 * small studio-specific bonus (deterministic by studio name).
 */
function deriveFollowers({ anime, studioName }) {
  const fav = anime?.favorites ?? 0;
  const members = anime?.members ?? 0;
  const base = Math.round(fav * 0.6 + members * 0.0015);
  const bonus = studioName ? (hash(studioName) % 8000) + 1200 : 0;
  return Math.max(900, base + bonus);
}

/**
 * Scene uploader / source chip — modelled on the "channel pill" pattern
 * (avatar, display name, followers, follow button) seen on most video sites.
 * On our site the "uploader" is the studio that produced the anime; the
 * avatar falls back to the anime poster when a studio image isn't available.
 */
export default function SceneUploaderChip({ anime, scene }) {
  const studio = anime?.studios?.[0];
  const producer = anime?.producers?.[0];
  const source = studio ?? producer;

  const studioName = source?.name ?? anime?.title ?? "AnimeDB Studio";
  const studioUrl = source?.url;
  const handle =
    studioName
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 18) || "ANIMEDB";

  const avatar =
    anime?.images?.webp?.large_image_url ?? anime?.images?.jpg?.large_image_url;

  const followers = deriveFollowers({ anime, studioName });
  const views = anime?.members ?? 0;
  const likes = anime?.favorites ?? 0;

  // Persist follow state per studio so it survives navigation/reloads.
  const storageKey = source?.mal_id
    ? `animedb:follow:studio:${source.mal_id}`
    : `animedb:follow:studio:${studioName}`;
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    try {
      setFollowing(localStorage.getItem(storageKey) === "1");
    } catch {
      /* localStorage may be unavailable */
    }
  }, [storageKey]);

  const toggleFollow = () => {
    setFollowing((cur) => {
      const next = !cur;
      try {
        if (next) localStorage.setItem(storageKey, "1");
        else localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const followerDisplay = following ? followers + 1 : followers;
  const studioLink = source?.mal_id ? `/categories?producer=${source.mal_id}` : null;

  return (
    <section
      aria-label="Scene source"
      className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur"
    >
      {/* Top attribution strip — mirrors the "FANSLY.COM › HANDLE · views · likes" line. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-800/80 px-4 py-2.5 text-[12px] text-zinc-400">
        <span
          aria-hidden
          className="grid h-4 w-4 place-items-center rounded-full bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40"
        >
          <Globe className="h-2.5 w-2.5" />
        </span>
        <span className="font-bold uppercase tracking-wider text-cyan-300">
          ANIMEDB.COM
        </span>
        <span className="text-zinc-600">›</span>
        {studioLink ? (
          <Link
            to={studioLink}
            className="font-bold uppercase tracking-wider text-cyan-300 hover:text-cyan-200 hover:underline"
          >
            {handle}
          </Link>
        ) : (
          <span className="font-bold uppercase tracking-wider text-cyan-300">
            {handle}
          </span>
        )}
        <span className="text-zinc-700">·</span>
        <span className="tabular-nums">{formatCompact(views)}</span>
        <span className="text-zinc-700">·</span>
        <span className="tabular-nums">{formatCompact(likes)} Likes</span>
        {studioUrl && (
          <a
            href={studioUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${studioName} on MyAnimeList`}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-zinc-500 hover:text-fuchsia-300"
          >
            Source
            <IconExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Uploader profile row — avatar + name + followers + follow button. */}
      <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4">
        <div className="relative shrink-0">
          <div className="rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[2px] transition group-hover:scale-[1.04]">
            <div className="overflow-hidden rounded-full bg-zinc-900">
              {avatar ? (
                <img
                  src={avatar}
                  alt={studioName}
                  loading="lazy"
                  decoding="async"
                  width="56"
                  height="56"
                  className="h-12 w-12 object-cover sm:h-14 sm:w-14"
                />
              ) : (
                <div className="grid h-12 w-12 place-items-center text-zinc-600 sm:h-14 sm:w-14">
                  <IconUser className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
          {/* Tiny verified-style badge */}
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 ring-2 ring-zinc-900"
          >
            <IconCheck className="h-2.5 w-2.5 text-white" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {studioLink ? (
            <Link
              to={studioLink}
              className="block truncate text-sm font-bold text-white hover:text-fuchsia-200 sm:text-base"
            >
              {studioName}
            </Link>
          ) : (
            <p className="truncate text-sm font-bold text-white sm:text-base">
              {studioName}
            </p>
          )}
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400 sm:text-xs">
            <span className="tabular-nums">
              {formatCompact(followerDisplay)}
            </span>
            <span>Followers</span>
            {scene?.studio_note && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="truncate">{scene.studio_note}</span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleFollow}
          aria-pressed={following}
          aria-label={following ? "Unfollow studio" : "Follow studio"}
          className={`group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold transition active:scale-95 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-xs ${
            following
              ? "bg-zinc-800 text-zinc-200 ring-1 ring-zinc-700 hover:bg-zinc-700"
              : "bg-white text-zinc-950 shadow-[0_6px_20px_-6px_rgba(255,255,255,0.35)] hover:bg-zinc-100"
          }`}
        >
          {following ? (
            <>
              <IconCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Following</span>
            </>
          ) : (
            <>
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Follow</span>
            </>
          )}
        </button>

        <button
          type="button"
          aria-label="Like this scene"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-rose-300 hover:ring-rose-400/40 active:scale-95 sm:inline-flex"
        >
          <IconHeart className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function Globe(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
    </svg>
  );
}
