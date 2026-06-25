import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProfileHero from "../components/ProfileHero.jsx";
import ProfileNavStrip from "../components/ProfileNavStrip.jsx";
import ProfileInfoGrid from "../components/ProfileInfoGrid.jsx";
import SceneTile from "../components/SceneTile.jsx";
import AnimeGroupHeader from "../components/AnimeGroupHeader.jsx";
import {
  IconHeart,
  IconShare,
  IconBell,
  IconHome,
  IconPlay,
  IconImage,
  IconUser,
  IconExternalLink,
  IconChevronDown,
} from "../components/Icons.jsx";
import { getCharacterFull } from "../services/jikan.js";
import scenesData from "../data/scenes.json";

export default function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const data = await getCharacterFull(id);
        if (cancelled) return;
        setCharacter(data);
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
      <div className="mx-auto max-w-7xl px-4 py-12 text-red-300 sm:px-6 lg:px-8">
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

  const linksList = japaneseVA
    ? [
        {
          label: `Voiced by ${japaneseVA.person.name}`,
          href: japaneseVA.person.url ?? "#",
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
  if (japaneseVA) metaLeft.push(["Voice (JP)", japaneseVA.person.name]);
  const englishVA = character.voices?.find((v) => v.language === "English");
  if (englishVA) metaLeft.push(["Voice (EN)", englishVA.person.name]);

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

  return (
    <div className="text-zinc-100">
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
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-3.5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-amber-400"
            >
              <IconHeart className="h-4 w-4" />
              Add to Favorites
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800"
            >
              <IconShare className="h-4 w-4" />
              Share
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-bold text-zinc-100 transition hover:bg-zinc-900"
            >
              <IconBell className="h-4 w-4" />
              Follow
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

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        {showScenes && (
          <section className="mt-2">
            <SectionTitle title="Scene Highlights" count={characterScenes.length} />
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
                      {g.scenes.map((s) => (
                        <SceneTile key={s.id} scene={s} />
                      ))}
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
              title="Anime Appearances"
              count={animeAppearances.length}
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
            <SectionTitle title="Voice Cast" count={character.voices.length} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {character.voices.slice(0, 10).map((v) => (
                <Link
                  key={v.person.mal_id}
                  to={`/voice-actors/${v.person.mal_id}`}
                  className="group flex items-center gap-3 rounded-lg bg-zinc-900/50 p-2 ring-1 ring-zinc-800 transition hover:ring-brand-500"
                >
                  <img
                    src={
                      v.person.images?.jpg?.image_url ??
                      v.person.images?.webp?.image_url
                    }
                    alt={v.person.name}
                    loading="lazy"
                    className="h-14 w-14 flex-shrink-0 rounded-md object-cover ring-1 ring-zinc-800"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold group-hover:text-brand-500">
                      {v.person.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">{v.language}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {showOverview && character.about && character.about.length > aboutSummary?.length && (
          <section className="mt-12 max-w-3xl">
            <SectionTitle title="Full Biography" />
            <details className="text-sm leading-relaxed text-zinc-300">
              <summary className="mb-3 inline-flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-500">
                Read full bio
                <IconChevronDown className="h-3.5 w-3.5" />
              </summary>
              <p className="whitespace-pre-line">{character.about}</p>
            </details>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, count }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <h2 className="text-base font-bold text-zinc-100">{title}</h2>
      {count != null && (
        <span className="text-xs text-zinc-500">{count.toLocaleString()}</span>
      )}
    </div>
  );
}

function AppearanceCard({ entry }) {
  const a = entry.anime;
  const img = a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;
  return (
    <Link
      to={`/anime/${a.mal_id}`}
      className="group block overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        {img && (
          <img
            src={img}
            alt={a.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        )}
        <span className="absolute right-1.5 top-1.5 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-bold text-brand-500">
          {entry.role}
        </span>
      </div>
      <p className="line-clamp-1 px-2 py-2 text-xs font-semibold group-hover:text-brand-500">
        {a.title}
      </p>
    </Link>
  );
}

function EmptyHint({ name }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
      <p className="text-sm font-semibold text-zinc-200">
        No scenes catalogued for{" "}
        <span className="text-brand-500">{name}</span> yet.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Add entries to{" "}
        <code className="text-brand-500">src/data/scenes.json</code> with{" "}
        <code>character: "{name}"</code> to surface them here.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="aspect-[5/2] animate-pulse rounded-2xl bg-zinc-900" />
      <div className="mt-5 flex gap-2 border-b border-zinc-800 pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-20 animate-pulse rounded bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
