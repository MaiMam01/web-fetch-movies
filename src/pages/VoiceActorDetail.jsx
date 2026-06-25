import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProfileHero from "../components/ProfileHero.jsx";
import ProfileNavStrip from "../components/ProfileNavStrip.jsx";
import ProfileInfoGrid from "../components/ProfileInfoGrid.jsx";
import AnimeGroupHeader from "../components/AnimeGroupHeader.jsx";
import SuggestedReels from "../components/SuggestedReels.jsx";
import {
  IconHeart,
  IconShare,
  IconBell,
  IconHome,
  IconPlay,
  IconImage,
  IconUser,
  IconExternalLink,
  IconCalendar,
  IconChevronDown,
} from "../components/Icons.jsx";
import { getPersonFull } from "../services/jikan.js";

export default function VoiceActorDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

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

  const topAnime = voiceRoles[0]?.anime;
  const cover =
    topAnime?.images?.webp?.large_image_url ??
    topAnime?.images?.jpg?.large_image_url ??
    person.images?.jpg?.image_url;
  const avatar =
    person.images?.jpg?.image_url ?? person.images?.webp?.image_url;

  const stats = [
    { label: "Favorites", value: person.favorites ?? 0, trend: "primary" },
    {
      label: "Voice Roles",
      value: voiceRoles.length,
      trend: "secondary",
    },
    {
      label: "Anime",
      value: groupedByAnime.length,
      trend: "tertiary",
    },
  ];

  const tabs = [
    { value: "overview", label: "Home", icon: <IconHome className="h-5 w-5" /> },
    {
      value: "voices",
      label: "Roles",
      icon: <IconPlay className="h-5 w-5" />,
    },
    {
      value: "anime",
      label: "Anime",
      icon: <IconImage className="h-5 w-5" />,
    },
    {
      value: "staff",
      label: "Staff",
      icon: <IconUser className="h-5 w-5" />,
    },
  ];

  const aboutSummary = person.about
    ? person.about.split("\n").slice(0, 5).join("\n")
    : null;

  const linksList = [];
  if (person.website_url) {
    linksList.push({
      label: "Official Site",
      href: person.website_url,
      icon: <IconExternalLink className="h-4 w-4" />,
    });
  }
  if (person.url) {
    linksList.push({
      label: "MyAnimeList",
      href: person.url,
      icon: <IconExternalLink className="h-4 w-4" />,
    });
  }

  const formatBirthday = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.valueOf()) ? null : d.toLocaleDateString();
  };

  const metaLeft = [];
  const birthday = formatBirthday(person.birthday);
  if (birthday) metaLeft.push(["Born", birthday]);
  if (person.given_name) metaLeft.push(["Given Name", person.given_name]);
  if (person.family_name) metaLeft.push(["Family Name", person.family_name]);
  if (person.alternate_names?.length)
    metaLeft.push([
      "Also Known As",
      person.alternate_names.slice(0, 2).join(", "),
    ]);

  const mainRoleCount = voiceRoles.filter((v) => v.role === "Main").length;
  const metaRight = [
    ["Total Voice Roles", voiceRoles.length],
    ["Main Roles", mainRoleCount],
    ["Supporting Roles", voiceRoles.length - mainRoleCount],
    ["Anime Count", groupedByAnime.length],
    ["Staff Credits", animeStaff.length],
  ];

  const showOverview = tab === "overview";
  const showVoices = tab === "overview" || tab === "voices";
  const showAnimeGrid = tab === "anime";
  const showStaff = tab === "overview" || tab === "staff";

  return (
    <div className="text-zinc-100">
      <ProfileHero
        name={person.name}
        subtitle={person.alternate_names?.[0]}
        cover={cover}
        avatar={avatar}
        stats={stats}
        badges={[
          {
            label: "Seiyuu",
            icon: <IconCalendar className="h-2.5 w-2.5" />,
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
          aboutTitle={`About ${person.name}`}
          aboutBody={aboutSummary || "No bio available for this voice actor yet."}
          appearedIn={groupedByAnime
            .slice(0, 5)
            .map((g) => g.anime)
            .filter(Boolean)}
          links={linksList}
          metadataLeft={metaLeft}
          metadataRight={metaRight}
        />
      )}

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        {showVoices && groupedByAnime.length > 0 && (
          <section className="mt-2">
            <SectionTitle title="Voice Roles" count={voiceRoles.length} />
            <div className="space-y-10">
              {groupedByAnime.map((g) => (
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
              ))}
            </div>
          </section>
        )}

        {showAnimeGrid && groupedByAnime.length > 0 && (
          <section className="mt-2">
            <SectionTitle title="Anime" count={groupedByAnime.length} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {groupedByAnime.map(
                (g) =>
                  g.anime && (
                    <Link
                      key={g.anime.mal_id}
                      to={`/anime/${g.anime.mal_id}`}
                      className="group block overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                        <img
                          src={
                            g.anime.images?.webp?.large_image_url ??
                            g.anime.images?.jpg?.large_image_url
                          }
                          alt={g.anime.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="p-2">
                        <p className="line-clamp-1 text-xs font-semibold group-hover:text-brand-500">
                          {g.anime.title}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {g.roles.length} role{g.roles.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                  )
              )}
            </div>
          </section>
        )}

        {showStaff && animeStaff.length > 0 && (
          <section className="mt-12">
            <SectionTitle title="Staff Credits" count={animeStaff.length} />
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

        {showOverview &&
          person.about &&
          person.about.length > (aboutSummary?.length ?? 0) && (
            <section className="mt-12 max-w-3xl">
              <SectionTitle title="Full Biography" />
              <details className="text-sm leading-relaxed text-zinc-300">
                <summary className="mb-3 inline-flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-500">
                  Read full bio
                  <IconChevronDown className="h-3.5 w-3.5" />
                </summary>
                <p className="whitespace-pre-line">{person.about}</p>
              </details>
            </section>
          )}
      </div>

      <SuggestedReels
        animeList={voiceRoles.map((v) => ({ anime: v.anime })).filter((x) => x.anime)}
        title="Suggested Scenes & Reels"
        subtitle={`Trailers, OPs, and clips from anime featuring ${person.name}`}
      />
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
