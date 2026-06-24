import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PersonHero, { makeStats } from "../components/PersonHero.jsx";
import FilterPills from "../components/FilterPills.jsx";
import AnimeGroupHeader from "../components/AnimeGroupHeader.jsx";
import { getPersonFull } from "../services/jikan.js";
import { IconChevronDown } from "../components/Icons.jsx";

export default function VoiceActorDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const data = await getPersonFull(id);
        if (cancelled) return;
        setPerson(data);
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

  const voiceRoles = person?.voices ?? [];
  const animeStaff = person?.anime ?? [];

  const groupedByAnime = useMemo(() => {
    const m = new Map();
    voiceRoles.forEach((v) => {
      const key = v.anime?.mal_id ?? "_";
      if (!m.has(key)) m.set(key, { anime: v.anime, roles: [] });
      m.get(key).roles.push(v);
    });
    return Array.from(m.values());
  }, [voiceRoles]);

  if (loading && !person) return <Skeleton />;
  if (error || !person) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-red-300 sm:px-6 lg:px-8">
        Could not load this voice actor. {error}
      </div>
    );
  }

  const totalCharacters = voiceRoles.length;
  const totalAnime = groupedByAnime.length;

  const stats = makeStats({
    anime: totalAnime,
    characters: totalCharacters,
    favorites: person.favorites,
  });

  const meta = [];
  if (person.birthday) {
    const d = new Date(person.birthday);
    if (!isNaN(d.valueOf())) meta.push(["Born", d.toLocaleDateString()]);
  }
  if (person.given_name) meta.push(["Given name", person.given_name]);
  if (person.family_name) meta.push(["Family name", person.family_name]);
  if (person.alternate_names?.length)
    meta.push(["Also known as", person.alternate_names.slice(0, 2).join(", ")]);

  return (
    <div className="text-zinc-100">
      <PersonHero
        person={person}
        kind="voice-actor"
        subtitle={person.alternate_names?.[0]}
        stats={stats}
        meta={meta}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <FilterPills
            value={tab}
            onChange={setTab}
            options={[
              { value: "all", label: "All", count: totalCharacters + animeStaff.length },
              { value: "voices", label: "Voice Roles", count: totalCharacters },
              { value: "staff", label: "Staff Roles", count: animeStaff.length },
            ]}
          />
          <SortBar />
        </div>

        {(tab === "all" || tab === "voices") && (
          <section className="mt-8 space-y-10">
            {groupedByAnime.length === 0 ? (
              <p className="text-sm text-zinc-500">No voice roles found.</p>
            ) : (
              groupedByAnime.map((g) => (
                <div key={g.anime?.mal_id ?? Math.random()}>
                  {g.anime && (
                    <AnimeGroupHeader
                      anime={{
                        mal_id: g.anime.mal_id,
                        title: g.anime.title,
                        type: "TV",
                      }}
                      role={g.roles[0]?.role}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {g.roles.map((r) => (
                      <VoiceRoleCard key={r.character?.mal_id} role={r} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {(tab === "all" || tab === "staff") && animeStaff.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-base font-bold text-zinc-100">
              Staff Credits
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {animeStaff.map((entry) => (
                <Link
                  key={`${entry.anime.mal_id}-${entry.position}`}
                  to={`/anime/${entry.anime.mal_id}`}
                  className="group block overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                    <img
                      src={
                        entry.anime.images?.webp?.large_image_url ??
                        entry.anime.images?.jpg?.large_image_url
                      }
                      alt={entry.anime.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-xs font-semibold group-hover:text-brand-500">
                      {entry.anime.title}
                    </p>
                    <p className="text-[10px] uppercase text-zinc-500">
                      {entry.position}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {person.about && tab === "all" && (
          <section className="mt-12 max-w-3xl">
            <h2 className="mb-3 text-base font-bold text-zinc-100">About</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {person.about}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function VoiceRoleCard({ role }) {
  const c = role.character;
  if (!c) return null;
  return (
    <Link
      to={`/characters/${c.mal_id}`}
      className="group block overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        <img
          src={c.images?.webp?.image_url ?? c.images?.jpg?.image_url}
          alt={c.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute right-1.5 top-1.5 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-bold text-brand-500">
          {role.role}
        </span>
      </div>
      <div className="space-y-0.5 p-2">
        <p className="line-clamp-1 text-xs font-semibold group-hover:text-brand-500">
          {c.name}
        </p>
      </div>
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
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
    </div>
  );
}
