import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProfileHero from "../components/ProfileHero.jsx";
import ProfileNavStrip from "../components/ProfileNavStrip.jsx";
import ProfileInfoGrid from "../components/ProfileInfoGrid.jsx";
import AnimeGroupHeader from "../components/AnimeGroupHeader.jsx";
import SuggestedReels from "../components/SuggestedReels.jsx";
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
  IconCalendar,
  IconCheck,
  IconChevronDown,
} from "../components/Icons.jsx";
import { getPersonFull, getPersonPictures } from "../services/jikan.js";
import useLocalToggle from "../hooks/useLocalToggle.js";
import usePageTitle from "../hooks/usePageTitle.js";

export default function VoiceActorDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [favorited, toggleFav] = useLocalToggle(
    id ? `animedb:fav:person:${id}` : null
  );
  const [following, toggleFollow] = useLocalToggle(
    id ? `animedb:follow:person:${id}` : null
  );

  usePageTitle(person?.name ?? null);

  useEffect(() => {
    let cancelled = false;
    setPerson(null);
    setPictures([]);
    setError(null);
    setLoading(true);

    async function run() {
      try {
        const data = await getPersonFull(id);
        if (cancelled) return;
        setPerson(data);
        getPersonPictures(id)
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

  const suggestedAnimeList = useMemo(
    () => voiceRoles.map((v) => ({ anime: v.anime })).filter((x) => x.anime),
    [voiceRoles]
  );

  if (loading && !person) return <Skeleton />;
  if (error || !person) {
    return (
      <div className="page-container py-12 text-red-300">
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

  // Build gallery list: portrait + person pictures + character avatars they voice
  const galleryImages = (() => {
    const list = [];
    const seen = new Set();
    const add = (url, caption) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      list.push({ url, caption });
    };
    add(avatar, person.name);
    for (const p of pictures) {
      add(
        p?.webp?.image_url ??
          p?.webp?.large_image_url ??
          p?.jpg?.image_url ??
          p?.jpg?.large_image_url
      );
    }
    for (const v of voiceRoles) {
      add(
        v.character?.images?.webp?.image_url ??
          v.character?.images?.jpg?.image_url,
        v.character?.name
      );
    }
    return list;
  })();

  return (
    <div className="text-zinc-100">
      <SceneGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={`${person.name} — Gallery`}
        images={galleryImages}
      />

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
              onClick={toggleFav}
              aria-pressed={favorited}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-[0.97] ${
                favorited
                  ? "bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700"
                  : "bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 text-zinc-950 shadow-[0_0_18px_-6px_rgba(34,211,238,0.55)] ring-1 ring-white/30 hover:brightness-110"
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
                  title: person.name,
                  url: typeof window !== "undefined" ? window.location.href : "",
                };
                if (
                  typeof navigator !== "undefined" &&
                  typeof navigator.share === "function"
                ) {
                  navigator.share(data).catch(() => {});
                } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(data.url).catch(() => {});
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:border-cyan-400/40 hover:bg-zinc-800"
            >
              <IconShare className="h-4 w-4" />
              Share
            </button>
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:border-cyan-400/40 hover:bg-zinc-800"
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
                  : "border border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-cyan-400/40 hover:bg-zinc-900"
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

      <div className="page-container mt-10">
        {showVoices && groupedByAnime.length > 0 && (
          <section className="mt-2">
            <SectionTitle
              eyebrow="Casting"
              title="Voice Roles"
              count={voiceRoles.length}
              accent="cyan"
            />
            <div className="space-y-10">
              {groupedByAnime.map((g, gi) => (
                <div key={g.anime?.mal_id ?? `group-${gi}`}>
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
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                    {g.roles.map((r, ri) => (
                      <VoiceRoleCard
                        key={`${r.character?.mal_id ?? "x"}-${r.role ?? ""}-${ri}`}
                        role={r}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showAnimeGrid && groupedByAnime.length > 0 && (
          <section className="mt-2">
            <SectionTitle
              eyebrow="Filmography"
              title="Anime"
              count={groupedByAnime.length}
              accent="fuchsia"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
              {groupedByAnime.map(
                (g) =>
                  g.anime && <FilmographyCard key={g.anime.mal_id} group={g} />
              )}
            </div>
          </section>
        )}

        {showStaff && animeStaff.length > 0 && (
          <section className="mt-12">
            <SectionTitle
              eyebrow="Off-screen"
              title="Staff Credits"
              count={animeStaff.length}
              accent="amber"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
              {animeStaff.map((entry) => (
                <StaffCard
                  key={`${entry.anime.mal_id}-${entry.position}`}
                  entry={entry}
                />
              ))}
            </div>
          </section>
        )}

        {showOverview &&
          person.about &&
          person.about.length > (aboutSummary?.length ?? 0) && (
            <section className="mt-12 max-w-3xl">
              <SectionTitle eyebrow="Profile" title="Full Biography" accent="cyan" />
              <details className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-300">
                <summary className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 transition hover:text-cyan-200">
                  Read full bio
                  <IconChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 whitespace-pre-line">{person.about}</p>
              </details>
            </section>
          )}
      </div>

      <SuggestedReels
        animeList={suggestedAnimeList}
        title="Suggested Scenes & Reels"
        subtitle={`Trailers, OPs, and clips from anime featuring ${person.name}`}
      />
    </div>
  );
}

const VA_SECTION_ACCENTS = {
  fuchsia: { dot: "bg-fuchsia-400", text: "text-fuchsia-200", line: "via-fuchsia-500/60" },
  cyan: { dot: "bg-cyan-400", text: "text-cyan-200", line: "via-cyan-400/60" },
  amber: { dot: "bg-amber-400", text: "text-amber-200", line: "via-amber-400/60" },
};

function SectionTitle({ title, count, eyebrow, accent = "fuchsia" }) {
  const a = VA_SECTION_ACCENTS[accent] ?? VA_SECTION_ACCENTS.fuchsia;
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

function VoiceRoleCard({ role }) {
  const c = role.character;
  if (!c) return null;
  const isMain = role.role === "Main";
  return (
    <Link
      to={`/characters/${c.mal_id}`}
      className="group block overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:-translate-y-0.5 hover:ring-cyan-400/40 hover:shadow-[0_10px_30px_-12px_rgba(34,211,238,0.4)]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        {(c.images?.webp?.image_url || c.images?.jpg?.image_url) && (
          <img
            src={c.images?.webp?.image_url ?? c.images?.jpg?.image_url}
            alt={c.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ${
            isMain
              ? "bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 text-zinc-950 ring-white/30"
              : "bg-zinc-950/80 text-zinc-200 ring-zinc-700 backdrop-blur"
          }`}
        >
          {role.role}
        </span>
      </div>
      <div className="p-2.5">
        <p className="line-clamp-1 text-xs font-bold text-zinc-200 group-hover:text-white">
          {c.name}
        </p>
      </div>
    </Link>
  );
}

function FilmographyCard({ group }) {
  const a = group.anime;
  const img = a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;
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
        <span className="absolute right-2 top-2 rounded-full bg-zinc-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-200 ring-1 ring-zinc-700 backdrop-blur">
          {group.roles.length} role{group.roles.length > 1 ? "s" : ""}
        </span>
      </div>
      <p className="line-clamp-1 px-2.5 py-2 text-xs font-bold text-zinc-200 group-hover:text-white">
        {a.title}
      </p>
    </Link>
  );
}

function StaffCard({ entry }) {
  const a = entry.anime;
  const img = a.images?.webp?.large_image_url ?? a.images?.jpg?.large_image_url;
  return (
    <Link
      to={`/anime/${a.mal_id}`}
      className="group block overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:-translate-y-0.5 hover:ring-amber-400/40 hover:shadow-[0_10px_30px_-12px_rgba(251,191,36,0.35)]"
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
      </div>
      <div className="p-2.5">
        <p className="line-clamp-1 text-xs font-bold text-zinc-200 group-hover:text-white">
          {a.title}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
          {entry.position}
        </p>
      </div>
    </Link>
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
