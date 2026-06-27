import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProfileHero from "../components/ProfileHero.jsx";
import ProfileNavStrip from "../components/ProfileNavStrip.jsx";
import ProfileInfoGrid from "../components/ProfileInfoGrid.jsx";
import SceneTile from "../components/SceneTile.jsx";
import AnimeGroupHeader from "../components/AnimeGroupHeader.jsx";
import SuggestedReels from "../components/SuggestedReels.jsx";
import RecommendedCharactersRail from "../components/RecommendedCharactersRail.jsx";
import SceneGalleryModal from "../components/SceneGalleryModal.jsx";
import {
  IconHeart,
  IconShare,
  IconBell,
  IconHome,
  IconPlay,
  IconImage,
  IconUser,
  IconExternalLink,
  IconCheck,
  IconChevronDown,
} from "../components/Icons.jsx";
import { getCharacterFull, getCharacterPictures } from "../services/jikan.js";
import useLocalToggle from "../hooks/useLocalToggle.js";
import usePageTitle from "../hooks/usePageTitle.js";
import scenesData from "../data/scenes.json";

export default function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [favorited, toggleFav] = useLocalToggle(
    id ? `animedb:fav:character:${id}` : null
  );
  const [following, toggleFollow] = useLocalToggle(
    id ? `animedb:follow:character:${id}` : null
  );

  usePageTitle(character?.name ?? null);

  useEffect(() => {
    let cancelled = false;
    setCharacter(null);
    setPictures([]);
    setError(null);
    setLoading(true);

    async function run() {
      try {
        const data = await getCharacterFull(id);
        if (cancelled) return;
        setCharacter(data);
        getCharacterPictures(id)
          .then((pics) => {
            if (!cancelled) setPictures(pics);
          })
          .catch(() => {});
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const allScenes = scenesData.scenes ?? [];
  const characterScenes = useMemo(() => {
    if (!character?.name) return [];
    return allScenes.filter(
      (s) => s.character?.toLowerCase() === character.name.toLowerCase()
    );
  }, [allScenes, character]);

  const sceneGroups = useMemo(() => {
    const byKey = new Map();
    characterScenes.forEach((s) => {
      const key = s.mal_id;
      if (!byKey.has(key))
        byKey.set(key, { mal_id: key, title: s.anime_title, scenes: [] });
      byKey.get(key).scenes.push(s);
    });
    return Array.from(byKey.values());
  }, [characterScenes]);

  if (loading && !character) return <Skeleton />;
  if (error || !character) {
    return (
      <div className="page-container py-12 text-red-300">
        Could not load this character. {error}
      </div>
    );
  }

  const animeAppearances = character.anime ?? [];
  const topAnime = animeAppearances[0]?.anime;
  const cover =
    topAnime?.images?.webp?.large_image_url ??
    topAnime?.images?.jpg?.large_image_url ??
    character.images?.webp?.image_url;
  const avatar =
    character.images?.webp?.image_url ?? character.images?.jpg?.image_url;
  const japaneseVA = character.voices?.find((v) => v.language === "Japanese");

  const stats = [
    { label: "Favorites", value: character.favorites ?? 0, trend: "primary" },
    {
      label: "Anime",
      value: animeAppearances.length,
      trend: "secondary",
    },
    {
      label: "Scenes",
      value: characterScenes.length,
      trend: "tertiary",
    },
  ];

  const tabs = [
    { value: "overview", label: "Home", icon: <IconHome className="h-5 w-5" /> },
    {
      value: "scenes",
      label: "Scenes",
      icon: <IconPlay className="h-5 w-5" />,
    },
    {
      value: "appearances",
      label: "Anime",
      icon: <IconImage className="h-5 w-5" />,
    },
    {
      value: "voices",
      label: "Voice Cast",
      icon: <IconUser className="h-5 w-5" />,
    },
  ];

  const linksList = japaneseVA?.person?.url
    ? [
        {
          label: `Voiced by ${japaneseVA.person.name}`,
          href: japaneseVA.person.url,
          icon: <IconUser className="h-4 w-4" />,
        },
      ]
    : [];
  if (character.url) {
    linksList.push({
      label: "Open on MyAnimeList",
      href: character.url,
      icon: <IconExternalLink className="h-4 w-4" />,
    });
  }

  const aboutSummary = character.about
    ? character.about.split("\n").slice(0, 3).join("\n")
    : null;

  const metaLeft = [];
  if (character.name_kanji) metaLeft.push(["Kanji", character.name_kanji]);
  if (character.nicknames?.length)
    metaLeft.push(["Also known as", character.nicknames.slice(0, 2).join(", ")]);
  if (japaneseVA?.person?.name)
    metaLeft.push(["Voice (JP)", japaneseVA.person.name]);
  const englishVA = character.voices?.find((v) => v.language === "English");
  if (englishVA?.person?.name)
    metaLeft.push(["Voice (EN)", englishVA.person.name]);

  const mainRoleCount = animeAppearances.filter((a) => a.role === "Main").length;
  const metaRight = [
    ["Total Roles", animeAppearances.length],
    ["Main Roles", mainRoleCount],
    ["Supporting Roles", animeAppearances.length - mainRoleCount],
    [
      "First Appearance",
      animeAppearances[animeAppearances.length - 1]?.anime?.title ?? "—",
    ],
  ];

  const showOverview = tab === "overview";
  const showScenes = tab === "overview" || tab === "scenes";
  const showAppearances = tab === "overview" || tab === "appearances";
  const showVoices = tab === "overview" || tab === "voices";

  // Build gallery list: character pictures + main avatar + per-appearance posters
  const galleryImages = (() => {
    const list = [];
    const seen = new Set();
    const add = (url, caption) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      list.push({ url, caption });
    };
    add(avatar, character.name);
    for (const p of pictures) {
      add(
        p?.webp?.image_url ??
          p?.webp?.large_image_url ??
          p?.jpg?.image_url ??
          p?.jpg?.large_image_url
      );
    }
    for (const a of animeAppearances) {
      add(
        a.anime?.images?.webp?.large_image_url ??
          a.anime?.images?.jpg?.large_image_url,
        a.anime?.title
      );
    }
    return list;
  })();

  return (
    <div className="text-zinc-100">
      <SceneGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={`${character.name} — Gallery`}
        images={galleryImages}
      />

      <ProfileHero
        name={character.name}
        subtitle={character.name_kanji}
        cover={cover}
        avatar={avatar}
        stats={stats}
        badges={[
          {
            label: "Character",
            icon: <IconUser className="h-2.5 w-2.5" />,
          },
        ]}
      />

      <ProfileNavStrip
        tabs={tabs}
        value={tab}
        onChange={setTab}
        actions={
          <>
            <button
              type="button"
              onClick={toggleFav}
              aria-pressed={favorited}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-[0.97] ${
                favorited
                  ? "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700"
                  : "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/30 hover:brightness-110"
              }`}
            >
              {favorited ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  Favorited
                </>
              ) : (
                <>
                  <IconHeart className="h-4 w-4" />
                  Add to Favorites
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const data = {
                  title: character.name,
                  url:
                    typeof window !== "undefined" ? window.location.href : "",
                };
                if (
                  typeof navigator !== "undefined" &&
                  typeof navigator.share === "function"
                ) {
                  navigator.share(data).catch(() => {});
                } else if (
                  typeof navigator !== "undefined" &&
                  navigator.clipboard
                ) {
                  navigator.clipboard.writeText(data.url).catch(() => {});
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
            >
              <IconShare className="h-4 w-4" />
              Share
            </button>
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
              >
                <IconImage className="h-4 w-4" />
                Gallery
                <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-zinc-300 ring-1 ring-zinc-700">
                  {galleryImages.length}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleFollow}
              aria-pressed={following}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-[0.97] ${
                following
                  ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                  : "border border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-fuchsia-400/40 hover:bg-zinc-900"
              }`}
            >
              {following ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <IconBell className="h-4 w-4" />
                  Follow
                </>
              )}
            </button>
          </>
        }
      />

      {showOverview && (
        <ProfileInfoGrid
          aboutTitle={`About ${character.name}`}
          aboutBody={aboutSummary || "No bio available for this character yet."}
          appearedIn={animeAppearances.slice(0, 5).map((a) => a.anime)}
          links={linksList}
          metadataLeft={metaLeft}
          metadataRight={metaRight}
        />
      )}

      <div className="page-container mt-10">
        {showScenes && (
          <section className="mt-2">
            <SectionTitle
              eyebrow="Iconic moments"
              title="Scene Highlights"
              count={characterScenes.length}
              accent="fuchsia"
            />
            {sceneGroups.length === 0 ? (
              <EmptyHint name={character.name} />
            ) : (
              <div className="space-y-10">
                {sceneGroups.map((g) => (
                  <div key={g.mal_id}>
                    <AnimeGroupHeader
                      anime={{
                        mal_id: g.mal_id,
                        title: g.title,
                        type: "TV",
                      }}
                    />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {g.scenes.map((s) => {
                        const sourceAnime = animeAppearances.find(
                          (a) => a.anime.mal_id === s.mal_id
                        )?.anime;
                        const poster =
                          sourceAnime?.images?.webp?.large_image_url ??
                          sourceAnime?.images?.jpg?.large_image_url;
                        return (
                          <SceneTile
                            key={s.id}
                            scene={s}
                            posterFallback={poster}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {showAppearances && animeAppearances.length > 0 && (
          <section className="mt-12">
            <SectionTitle
              eyebrow="Featured in"
              title="Anime Appearances"
              count={animeAppearances.length}
              accent="cyan"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {animeAppearances.map((a) => (
                <AppearanceCard
                  key={`${a.anime.mal_id}-${a.role}`}
                  entry={a}
                />
              ))}
            </div>
          </section>
        )}

        {showVoices && character.voices?.length > 0 && (
          <section className="mt-12">
            <SectionTitle
              eyebrow="Voiced by"
              title="Voice Cast"
              count={character.voices.length}
              accent="amber"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {character.voices
                .filter((v) => v?.person?.mal_id != null)
                .slice(0, 10)
                .map((v) => (
                  <Link
                    key={`${v.person.mal_id}-${v.language}`}
                    to={`/voice-actors/${v.person.mal_id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-2.5 transition hover:-translate-y-0.5 hover:border-fuchsia-400/40 hover:bg-zinc-900"
                  >
                    <img
                      src={
                        v.person.images?.jpg?.image_url ??
                        v.person.images?.webp?.image_url
                      }
                      alt={v.person.name ?? "Voice actor"}
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 flex-shrink-0 rounded-xl object-cover ring-1 ring-zinc-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-zinc-100 group-hover:text-fuchsia-200">
                        {v.person.name ?? "Unknown"}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        {v.language}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {showOverview && character.about && character.about.length > aboutSummary?.length && (
          <section className="mt-12 max-w-3xl">
            <SectionTitle eyebrow="Profile" title="Full Biography" accent="cyan" />
            <details className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-300">
              <summary className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-fuchsia-300 transition hover:text-fuchsia-200">
                Read full bio
                <IconChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 whitespace-pre-line">{character.about}</p>
            </details>
          </section>
        )}
      </div>

      <div className="page-container">
        <RecommendedCharactersRail
          currentId={character.mal_id}
          animeAppearances={animeAppearances}
          title={`Fans of ${character.name} also love`}
          subtitle={`Other faces from ${character.name}'s anime — tap any to jump in.`}
        />
      </div>

      <SuggestedReels
        animeList={animeAppearances}
        title={`Suggested Scenes & Reels`}
        subtitle={`Trailers, OPs, and clips from ${character.name}'s anime appearances`}
      />
    </div>
  );
}

const SECTION_ACCENTS = {
  fuchsia: { dot: "bg-fuchsia-400", text: "text-fuchsia-200", line: "via-fuchsia-500/60" },
  cyan: { dot: "bg-cyan-400", text: "text-cyan-200", line: "via-cyan-400/60" },
  amber: { dot: "bg-amber-400", text: "text-amber-200", line: "via-amber-400/60" },
};

function SectionTitle({ title, count, eyebrow, accent = "fuchsia" }) {
  const a = SECTION_ACCENTS[accent] ?? SECTION_ACCENTS.fuchsia;
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && (
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.18em] ${a.text}`}
            >
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${a.dot} shadow-[0_0_8px_currentColor]`}
            />
            {title}
          </h2>
        </div>
        {count != null && (
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold tabular-nums text-zinc-400 ring-1 ring-zinc-800">
            {count.toLocaleString()}
          </span>
        )}
      </div>
      <div
        aria-hidden
        className={`mt-3 h-px w-full bg-gradient-to-r from-transparent ${a.line} to-transparent`}
      />
    </div>
  );
}

function AppearanceCard({ entry }) {
  const a = entry.anime;
  const img = a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;
  const isMain = entry.role === "Main";
  return (
    <Link
      to={`/anime/${a.mal_id}`}
      className="group block overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:-translate-y-0.5 hover:ring-fuchsia-400/40 hover:shadow-[0_10px_30px_-12px_rgba(232,121,249,0.4)]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        {img && (
          <img
            src={img}
            alt={a.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ${
            isMain
              ? "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-zinc-950 ring-white/30"
              : "bg-zinc-950/80 text-zinc-200 ring-zinc-700 backdrop-blur"
          }`}
        >
          {entry.role}
        </span>
      </div>
      <p className="line-clamp-1 px-2.5 py-2 text-xs font-semibold text-zinc-200 group-hover:text-white">
        {a.title}
      </p>
    </Link>
  );
}

function EmptyHint({ name }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
        <IconImage className="h-6 w-6 text-zinc-500" />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-200">
        No scenes catalogued for{" "}
        <span className="text-fuchsia-300">{name}</span> yet
      </p>
      <p className="mt-1 max-w-xs text-xs text-zinc-500">
        Editorial scenes are curated by hand — check back soon, or browse
        another character.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="page-container mt-6">
      <div className="aspect-[5/2] animate-pulse rounded-2xl bg-zinc-900" />
      <div className="mt-5 flex gap-2 border-b border-zinc-800 pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-20 animate-pulse rounded bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
