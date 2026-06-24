import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PersonHero, { makeStats } from "../components/PersonHero.jsx";
import FilterPills from "../components/FilterPills.jsx";
import SceneTile from "../components/SceneTile.jsx";
import AnimeGroupHeader from "../components/AnimeGroupHeader.jsx";
import {
  IconHeart,
  IconChevronDown,
  IconPlay,
  IconImage,
} from "../components/Icons.jsx";
import { getCharacterFull } from "../services/jikan.js";
import scenesData from "../data/scenes.json";

export default function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");

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
      if (!byKey.has(key)) byKey.set(key, { mal_id: key, title: s.anime_title, scenes: [] });
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
  const japaneseVA = character.voices?.find((v) => v.language === "Japanese");
  const counts = {
    all: characterScenes.length + animeAppearances.length,
    scenes: characterScenes.length,
    appearances: animeAppearances.length,
  };

  const stats = makeStats({
    anime: animeAppearances.length,
    scenes: characterScenes.length,
    favorites: character.favorites,
  });

  const meta = [];
  if (japaneseVA) meta.push(["Voice", japaneseVA.person.name]);
  if (character.nicknames?.length)
    meta.push(["Also known as", character.nicknames.slice(0, 3).join(", ")]);

  return (
    <div className="text-zinc-100">
      <PersonHero
        person={character}
        kind="character"
        subtitle={character.name_kanji}
        stats={stats}
        meta={meta}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <FilterPills
            value={tab}
            onChange={setTab}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "scenes", label: "Scenes", count: counts.scenes },
              {
                value: "appearances",
                label: "Appearances",
                count: counts.appearances,
              },
            ]}
          />
          <SortBar />
        </div>

        {(tab === "all" || tab === "scenes") && (
          <section className="mt-8">
            <h2 className="sr-only">Scenes</h2>
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

        {(tab === "all" || tab === "appearances") && animeAppearances.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-base font-bold text-zinc-100">
              Anime Appearances
            </h2>
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

        {character.about && tab === "all" && (
          <section className="mt-12 max-w-3xl">
            <h2 className="mb-3 text-base font-bold text-zinc-100">About</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {character.about}
            </p>
          </section>
        )}

        {character.voices?.length > 0 && tab === "all" && (
          <section className="mt-12">
            <h2 className="mb-4 text-base font-bold text-zinc-100">
              Voice Cast
            </h2>
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
      </div>
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

function SortBar() {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800"
      >
        NEWEST
        <IconChevronDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
      >
        ▦
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
      >
        ⌕
      </button>
    </div>
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
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}
