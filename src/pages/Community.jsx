import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SortDropdown from "../components/SortDropdown.jsx";
import {
  IconCheck,
  IconHeart,
  IconMessage,
  IconPlus,
  IconStar,
  IconSearch,
} from "../components/Icons.jsx";

const TABS = [
  { id: "feed", label: "Community Feed" },
  { id: "members", label: "Discover Members" },
  { id: "search", label: "Advanced Search" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Activity" },
  { value: "review", label: "Reviews & Ratings" },
  { value: "comment", label: "Comments" },
  { value: "scene", label: "Scene Picks" },
  { value: "list", label: "Watchlists" },
];

const FEED_ACTIVITY = [
  {
    id: "a1",
    user: "vinland_drifter",
    avatarHue: 14,
    action: "rated",
    target: "Vinland Saga · Season 2",
    targetTo: "/search?q=Vinland%20Saga",
    rating: 9.4,
    minutesAgo: 1,
    body:
      "Season 2 is the bravest pivot a shonen has pulled in years. Trading swords for ploughs and somehow keeping every episode tense — masterpiece pacing.",
    kind: "review",
  },
  {
    id: "a2",
    user: "kira_apologist",
    avatarHue: 200,
    action: "commented on",
    target: "Death Note",
    targetTo: "/search?q=Death%20Note",
    minutesAgo: 3,
    body:
      "The potato chip scene still slaps. People sleep on how funny early Death Note is before the L vs Light chess match locks in.",
    kind: "comment",
  },
  {
    id: "a3",
    user: "studio_pierrot_w",
    avatarHue: 340,
    action: "added a scene to",
    target: "Hunter x Hunter (2011)",
    targetTo: "/search?q=Hunter%20x%20Hunter",
    minutesAgo: 5,
    body:
      "Chimera Ant arc · Episode 131 — the moment Meruem and Komugi share their final game. Twelve minutes of pure animation discipline.",
    kind: "scene",
  },
  {
    id: "a4",
    user: "monsterfan_tenma",
    avatarHue: 280,
    action: "started a watchlist",
    target: "Slow Burns That Earned It",
    targetTo: "/categories",
    minutesAgo: 8,
    body:
      "Building a list of anime that take 8+ episodes to click and then never let go — Monster, Steins;Gate, Vinland, 86, Babylon. Drop your picks.",
    kind: "list",
  },
  {
    id: "a5",
    user: "code_geass_chess",
    avatarHue: 50,
    action: "rated",
    target: "Code Geass · Lelouch of the Rebellion",
    targetTo: "/search?q=Code%20Geass",
    rating: 9.1,
    minutesAgo: 12,
    body:
      "Still the gold standard for political mecha. The R2 finale recontextualizes the entire show — every rewatch I catch new groundwork from the very first arc.",
    kind: "review",
  },
  {
    id: "a6",
    user: "perfect_blue_rewind",
    avatarHue: 320,
    action: "commented on",
    target: "Perfect Blue",
    targetTo: "/search?q=Perfect%20Blue",
    minutesAgo: 18,
    body:
      "Satoshi Kon predicted parasocial idol culture by twenty years. The mirror scene still rewires my brain every single rewatch.",
    kind: "comment",
  },
  {
    id: "a7",
    user: "cowboy_bebop_ost",
    avatarHue: 30,
    action: "added a scene to",
    target: "Cowboy Bebop",
    targetTo: "/search?q=Cowboy%20Bebop",
    minutesAgo: 24,
    body:
      "Session 5 · Ballad of Fallen Angels — the cathedral fall, Yoko Kanno screaming through the brass, no dialogue needed. The blueprint.",
    kind: "scene",
  },
  {
    id: "a8",
    user: "ghibli_archivist",
    avatarHue: 140,
    action: "rated",
    target: "Princess Mononoke",
    targetTo: "/search?q=Princess%20Mononoke",
    rating: 9.0,
    minutesAgo: 41,
    body:
      "Twenty-seven years old and still the cleanest argument cinema has against the human vs nature binary. No villains, only consequences.",
    kind: "review",
  },
];

const FEATURED_MEMBERS = [
  { name: "rei_archivist", role: "Reviewer", anime: 412, hue: 200, avatar: 1 },
  { name: "ghibli_curator", role: "Curator", anime: 287, hue: 140, avatar: 2 },
  { name: "shonen_scribe", role: "Reviewer", anime: 534, hue: 14, avatar: 3 },
  { name: "kon_devotee", role: "Critic", anime: 198, hue: 320, avatar: 4 },
  { name: "trigger_loyal", role: "Curator", anime: 256, hue: 50, avatar: 5 },
  { name: "mappa_observer", role: "Reviewer", anime: 365, hue: 280, avatar: 6 },
];

const COMMUNITY_STATS = [
  { label: "Members", value: "184,920" },
  { label: "Reviews this week", value: "12,408" },
  { label: "Scenes catalogued", value: "3,127" },
  { label: "Watchlists shared", value: "47,200" },
];

const KIND_BADGES = {
  review: { label: "Review", color: "bg-amber-500/15 text-amber-400" },
  comment: { label: "Comment", color: "bg-sky-500/15 text-sky-400" },
  scene: { label: "Scene", color: "bg-rose-500/15 text-rose-400" },
  list: { label: "Watchlist", color: "bg-emerald-500/15 text-emerald-400" },
};

function timeAgo(min) {
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Derive the active tab directly from the URL so there's a single source
  // of truth — no useState, no sync useEffect, no risk of the two drifting
  // apart on back/forward navigation.
  const urlTab = searchParams.get("tab");
  const tab = TABS.some((t) => t.id === urlTab) ? urlTab : "feed";
  const [filter, setFilter] = useState("all");

  const handleTab = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === "feed") {
      next.delete("tab");
    } else {
      next.set("tab", id);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredFeed = useMemo(() => {
    if (filter === "all") return FEED_ACTIVITY;
    return FEED_ACTIVITY.filter((a) => a.kind === filter);
  }, [filter]);

  return (
    <div className="page-container py-8 sm:py-10">
      <CommunityHero />

      <CommunityTabs tab={tab} onTab={handleTab} />

      {tab === "feed" && (
          <div className="grid gap-6 pt-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-base font-bold text-zinc-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_currentColor]" />
                  All Activity
                </h2>
                <SortDropdown
                  label="Filter"
                  value={filter}
                  onChange={setFilter}
                  options={FILTER_OPTIONS}
                />
              </div>

              <ul className="space-y-3">
                {filteredFeed.map((item) => (
                  <FeedCard key={item.id} item={item} />
                ))}
                {filteredFeed.length === 0 && (
                  <li className="rounded-lg border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                    No activity yet for this filter.
                  </li>
                )}
              </ul>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2 text-xs font-bold uppercase tracking-widest text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800 hover:text-fuchsia-200"
                >
                  Load more activity
                </button>
              </div>
            </div>

            <aside className="space-y-5">
              <CommunityStatsCard />
              <FeaturedMembersCard />
              <TrendingTopicsCard />
            </aside>
          </div>
        )}

        {tab === "members" && <MembersTab />}
        {tab === "search" && <AdvancedSearchTab />}
    </div>
  );
}

const HERO_ACCENT = "from-fuchsia-400 via-violet-400 to-cyan-300";

function CommunityHero() {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950/60 px-6 py-10 sm:px-10 sm:py-12">
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-gradient-to-br ${HERO_ACCENT} opacity-[0.14] blur-3xl`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr ${HERO_ACCENT} opacity-[0.08] blur-3xl`}
      />

      <div className="relative flex flex-col items-center justify-center text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-fuchsia-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200 ring-1 ring-fuchsia-400/30">
          <span aria-hidden className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
          </span>
          Anime fans · everywhere
        </p>
        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          The{" "}
          <span
            className={`bg-gradient-to-r ${HERO_ACCENT} bg-clip-text text-transparent`}
          >
            AnimeDB
          </span>{" "}
          Community Wants You
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Rate seasons, post takes on iconic scenes, build watchlists, and find
          the reviewers whose taste actually matches yours.
        </p>

        {/* Inline stat strip */}
        <ul className="mt-6 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
          {COMMUNITY_STATS.map((s, i) => (
            <li
              key={s.label}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-3 py-2.5 text-left"
            >
              <span
                aria-hidden
                className={`block h-[2px] w-8 rounded-full bg-gradient-to-r ${
                  ["from-fuchsia-400 to-violet-500", "from-cyan-300 to-sky-500", "from-amber-300 to-orange-500", "from-emerald-300 to-teal-500"][i % 4]
                }`}
              />
              <p className="mt-1.5 text-lg font-black tabular-nums text-white">
                {s.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {s.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${HERO_ACCENT} px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-[0_0_22px_-6px_rgba(232,121,249,0.6)] ring-1 ring-white/30 transition hover:brightness-110 active:scale-[0.97]`}
          >
            <IconPlus className="h-4 w-4" />
            Create an account
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-bold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-800"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}

function CommunityTabs({ tab, onTab }) {
  return (
    <div className="mt-6 -mx-1 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-900/70 p-1 backdrop-blur scrollbar-thin">
      {TABS.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTab(t.id)}
            aria-pressed={active}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
              active
                ? `bg-gradient-to-r ${HERO_ACCENT} text-zinc-950 shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] ring-1 ring-white/40`
                : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Avatar({ name, hue, size = "md" }) {
  const initial = name.replace(/[^a-z]/gi, "").charAt(0).toUpperCase() || "?";
  const dim = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-zinc-950 ring-2 ring-zinc-950 ${dim}`}
      style={{ backgroundColor: `hsl(${hue}, 70%, 55%)` }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function FeedCard({ item }) {
  const badge = KIND_BADGES[item.kind];
  return (
    <li className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]">
      <div className="flex items-start gap-3">
        <Avatar name={item.user} hue={item.avatarHue} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Link
              to={`/community/${item.user}`}
              className="font-bold text-brand-500 hover:underline"
            >
              @{item.user}
            </Link>
            <span className="text-zinc-400">{item.action}</span>
            <Link
              to={item.targetTo}
              className="font-semibold text-zinc-100 hover:text-brand-500"
            >
              {item.target}
            </Link>
            {item.rating != null && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-bold text-amber-400">
                <IconStar className="h-3 w-3" />
                {item.rating.toFixed(1)}
              </span>
            )}
            {badge && (
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">{timeAgo(item.minutesAgo)}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">
            {item.body}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition hover:text-rose-400"
            >
              <IconHeart className="h-3.5 w-3.5" />
              <span>Like</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition hover:text-brand-500"
            >
              <IconMessage className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition hover:text-zinc-200"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function CommunityStatsCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        Community at a glance
      </h3>
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {COMMUNITY_STATS.map((s) => (
          <li key={s.label}>
            <p className="text-lg font-bold text-zinc-50 tabular-nums">{s.value}</p>
            <p className="text-[11px] text-zinc-500">{s.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturedMembersCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Featured Verified Members
        </h3>
        <Link
          to="/community?tab=members"
          className="text-[11px] font-bold text-brand-500 hover:underline"
        >
          View all
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {FEATURED_MEMBERS.map((m) => (
          <li key={m.name}>
            <Link
              to={`/community/${m.name}`}
              className="group block text-center"
            >
              <div className="relative mx-auto">
                <Avatar name={m.name} hue={m.hue} size="lg" />
                <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-sky-500 ring-2 ring-zinc-950">
                  <IconCheck className="h-3 w-3 text-zinc-950" />
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-bold text-zinc-100 group-hover:text-brand-500">
                @{m.name}
              </p>
              <p className="text-[10px] text-zinc-500">{m.anime} anime · {m.role}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrendingTopicsCard() {
  const topics = [
    "Chainsaw Man S2",
    "Frieren Ending",
    "Solo Leveling Hype",
    "Best 2024 OPs",
    "Underrated Seinen",
    "Studio Ghibli Ranking",
    "Time Loop Anime",
  ];
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        Trending in the community
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <li key={t}>
            <Link
              to={`/search?q=${encodeURIComponent(t)}`}
              className="inline-block rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-brand-500"
            >
              #{t.replace(/\s+/g, "")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MembersTab() {
  const list = Array.from({ length: 18 }).map((_, i) => {
    const seed = FEATURED_MEMBERS[i % FEATURED_MEMBERS.length];
    return {
      ...seed,
      name: `${seed.name}_${i + 1}`,
      anime: seed.anime + i * 7,
      hue: (seed.hue + i * 17) % 360,
    };
  });

  return (
    <div className="py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-zinc-50">Discover Verified Members</h2>
        <SortDropdown
          label="Sort"
          value="reviews"
          onChange={() => {}}
          options={[
            { value: "reviews", label: "Most Reviews" },
            { value: "followers", label: "Most Followers" },
            { value: "newest", label: "Newest" },
          ]}
        />
      </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
        {list.map((m) => (
          <li
            key={m.name}
            className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-4 text-center transition hover:border-zinc-800 hover:bg-zinc-900/60"
          >
            <div className="relative mx-auto inline-block">
              <Avatar name={m.name} hue={m.hue} size="lg" />
              <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-sky-500 ring-2 ring-zinc-950">
                <IconCheck className="h-3 w-3 text-zinc-950" />
              </span>
            </div>
            <p className="mt-3 line-clamp-1 text-sm font-bold text-zinc-100">
              @{m.name}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {m.anime} anime · {m.role}
            </p>
            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-200 transition hover:border-brand-500 hover:text-brand-500"
            >
              <IconPlus className="h-3 w-3" />
              Follow
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdvancedSearchTab() {
  return (
    <div className="py-6">
      <h2 className="text-xl font-bold text-zinc-50">Advanced Member Search</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Find reviewers by taste, completion count, or favorite studios.
      </p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-5 grid gap-4 rounded-lg border border-zinc-900 bg-zinc-900/40 p-5 md:grid-cols-2"
      >
        <Field label="Username">
          <input
            type="text"
            placeholder="e.g. ghibli_curator"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none"
          />
        </Field>
        <Field label="Favorite anime contains">
          <input
            type="text"
            placeholder="e.g. Vinland Saga"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none"
          />
        </Field>
        <Field label="Minimum anime completed">
          <input
            type="number"
            placeholder="100"
            min="0"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none"
          />
        </Field>
        <Field label="Role">
          <select className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-brand-500 focus:outline-none">
            <option value="">Any role</option>
            <option value="reviewer">Reviewer</option>
            <option value="curator">Curator</option>
            <option value="critic">Critic</option>
          </select>
        </Field>
        <Field label="Verified only" inline>
          <input type="checkbox" className="h-4 w-4 accent-brand-500" />
        </Field>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="btn btn-primary"
          >
            <IconSearch className="h-4 w-4" />
            Search members
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, inline = false }) {
  return (
    <label className={inline ? "flex items-center gap-2" : "block"}>
      <span
        className={`text-[11px] font-bold uppercase tracking-widest text-zinc-500 ${
          inline ? "" : "mb-1 block"
        }`}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
