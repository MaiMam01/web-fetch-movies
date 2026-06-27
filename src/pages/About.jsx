import { useParams, useLocation, Link } from "react-router-dom";
import {
  IconHome,
  IconGrid,
  IconUser,
  IconPlay,
  IconImage,
  IconBell,
  IconAlert,
  IconHelp,
} from "../components/Icons.jsx";

const COPY_BY_SLUG = {
  about: {
    title: "About AnimeDB",
    eyebrow: "Mission",
    accent: "from-fuchsia-400 via-violet-400 to-cyan-300",
    pill: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
    body: "AnimeDB is a curated index of anime — series, films, characters, voice actors, and the most memorable scenes that define them. Posters, ratings, and cast data come live from MyAnimeList via the open-source Jikan REST API. Scene entries are editorial and added by hand.",
  },
  contact: {
    title: "Contact Us",
    eyebrow: "Get in touch",
    accent: "from-cyan-300 via-sky-400 to-violet-400",
    pill: "bg-cyan-400/15 text-cyan-200 ring-cyan-400/30",
    body: "We don't have an inbox wired up yet, but you can open an issue on the project's GitHub repository — that's the fastest way to reach us during this build.",
  },
  faq: {
    title: "FAQ & Support",
    eyebrow: "Help",
    accent: "from-amber-300 via-orange-400 to-rose-400",
    pill: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
    body: "How do I add an anime to the catalog? It's pulled live from MyAnimeList. How do I add a scene? Edit src/data/scenes.json. How do I report a bug? Open an issue on GitHub.",
  },
  status: {
    title: "System Status",
    eyebrow: "Uptime",
    accent: "from-emerald-300 via-teal-400 to-cyan-400",
    pill: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30",
    body: "All systems normal. This page will eventually show the health of the Jikan API, image CDN, and our own deploy.",
  },
  request: {
    title: "Request Content",
    eyebrow: "Submit",
    accent: "from-rose-300 via-pink-400 to-fuchsia-400",
    pill: "bg-rose-400/15 text-rose-200 ring-rose-400/30",
    body: "Want a specific scene or anime added? Open a request on GitHub with a link to the title's MyAnimeList page and the scene timestamp(s) you'd like documented.",
  },
  feedback: {
    title: "Send Feedback",
    eyebrow: "We're listening",
    accent: "from-fuchsia-400 via-pink-400 to-rose-400",
    pill: "bg-pink-400/15 text-pink-200 ring-pink-400/30",
    body: "Use the GitHub issue tracker — we read everything. UI bugs, design suggestions, scene corrections, all welcome.",
  },
  "cookie-policy": {
    title: "Cookie Policy",
    eyebrow: "Privacy",
    accent: "from-zinc-300 via-zinc-400 to-zinc-500",
    pill: "bg-zinc-400/15 text-zinc-200 ring-zinc-400/30",
    body: "AnimeDB uses session storage to remember your 18+ confirmation across the scene catalog. We do not set tracking cookies and do not run analytics.",
  },
  dmca: {
    title: "DMCA Policy",
    eyebrow: "Legal",
    accent: "from-amber-300 via-orange-400 to-red-400",
    pill: "bg-orange-400/15 text-orange-200 ring-orange-400/30",
    body: "Anime metadata is licensed by MyAnimeList. Posters and images are hosted by MAL/CDNs we link to — we do not re-host them. If you believe content infringes a copyright, please contact MyAnimeList directly or open an issue here.",
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Legal",
    accent: "from-cyan-300 via-blue-400 to-violet-400",
    pill: "bg-blue-400/15 text-blue-200 ring-blue-400/30",
    body: "AnimeDB does not collect personal data. No accounts, no telemetry, no analytics. Your 18+ confirmation lives only in your browser's session storage and is wiped when you close the tab.",
  },
  terms: {
    title: "Terms of Service",
    eyebrow: "Legal",
    accent: "from-violet-300 via-purple-400 to-fuchsia-400",
    pill: "bg-violet-400/15 text-violet-200 ring-violet-400/30",
    body: "AnimeDB is a free, open-source catalog provided as-is. Use of the site implies acceptance of the data licensing terms of MyAnimeList and the Jikan API.",
  },
  safety: {
    title: "Safety Center",
    eyebrow: "Content controls",
    accent: "from-rose-300 via-red-400 to-orange-400",
    pill: "bg-red-400/15 text-red-200 ring-red-400/30",
    body: "The /scenes section catalogs depictions of graphic violence and is gated behind an 18+ confirmation. Severity tags (mild / moderate / graphic / extreme) on every entry let you self-filter before viewing.",
  },
  studios: {
    title: "Browse by Studio",
    eyebrow: "Coming soon",
    accent: "from-amber-300 via-orange-400 to-rose-400",
    pill: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
    body: "Studio browse is in the queue — for now you can find studio names on each anime's detail page, or filter by genre.",
  },
  "a-z": {
    title: "Alphabetical Browse",
    eyebrow: "Coming soon",
    accent: "from-cyan-300 via-sky-400 to-violet-400",
    pill: "bg-cyan-400/15 text-cyan-200 ring-cyan-400/30",
    body: "A-Z browse is coming. While we wire it up, the search bar above and the Categories page already cover most of what you'd want.",
  },
};

// Quick-jump grid shown at the bottom of every static page.
const QUICK_LINKS = [
  { label: "Home", to: "/", icon: IconHome, accent: "fuchsia" },
  { label: "Categories", to: "/categories", icon: IconGrid, accent: "cyan" },
  { label: "Characters", to: "/characters", icon: IconUser, accent: "amber" },
  { label: "Voice Actors", to: "/voice-actors", icon: IconUser, accent: "emerald" },
  { label: "Stories", to: "/stories", icon: IconPlay, accent: "rose" },
  { label: "Scenes", to: "/scenes", icon: IconImage, accent: "violet" },
];

const ACCENT_HOVER = {
  fuchsia: "hover:border-fuchsia-400/40 group-hover:text-fuchsia-300",
  cyan: "hover:border-cyan-400/40 group-hover:text-cyan-300",
  amber: "hover:border-amber-400/40 group-hover:text-amber-300",
  emerald: "hover:border-emerald-400/40 group-hover:text-emerald-300",
  rose: "hover:border-rose-400/40 group-hover:text-rose-300",
  violet: "hover:border-violet-400/40 group-hover:text-violet-300",
};

const RELATED_GROUPS = {
  legal: [
    { slug: "privacy", label: "Privacy" },
    { slug: "terms", label: "Terms" },
    { slug: "cookie-policy", label: "Cookies" },
    { slug: "dmca", label: "DMCA" },
  ],
  support: [
    { slug: "contact", label: "Contact" },
    { slug: "faq", label: "FAQ" },
    { slug: "request", label: "Request content" },
    { slug: "feedback", label: "Feedback" },
    { slug: "status", label: "Status" },
  ],
  policies: [
    { slug: "safety", label: "Safety" },
    { slug: "about", label: "About" },
  ],
};

function groupOf(slug) {
  if (RELATED_GROUPS.legal.some((x) => x.slug === slug)) return "legal";
  if (RELATED_GROUPS.support.some((x) => x.slug === slug)) return "support";
  return "policies";
}

const GROUP_ICON = {
  legal: IconAlert,
  support: IconHelp,
  policies: IconBell,
};

export default function About() {
  const { slug } = useParams();
  const location = useLocation();

  const key =
    slug ||
    Object.keys(COPY_BY_SLUG).find((k) => location.pathname === `/${k}`) ||
    "about";
  const copy = COPY_BY_SLUG[key] || COPY_BY_SLUG.about;

  const group = groupOf(key);
  const relatedItems = RELATED_GROUPS[group].filter((r) => r.slug !== key);
  const GroupIcon = GROUP_ICON[group];

  return (
    <div className="page-container py-8 sm:py-10">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950/60 px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br ${copy.accent} opacity-[0.14] blur-3xl`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-tr ${copy.accent} opacity-[0.08] blur-3xl`}
        />

        <div className="relative mx-auto max-w-3xl">
          <p
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${copy.pill}`}
          >
            <GroupIcon className="h-3 w-3" />
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-300 sm:text-lg">
            {copy.body}
          </p>
        </div>
      </header>

      {/* ─── RELATED IN THIS GROUP ────────────────────────────────────── */}
      {relatedItems.length > 0 && (
        <div className="mx-auto mt-8 max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            More in this section
          </p>
          <ul className="flex flex-wrap gap-2">
            {relatedItems.map((r) => (
              <li key={r.slug}>
                <Link
                  to={`/${r.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-zinc-900 hover:text-white"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── QUICK LINKS GRID ─────────────────────────────────────────── */}
      <section className="mt-10 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-100">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_currentColor]" />
            Where to next
          </h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Browse the catalog
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map((l) => {
            const Icon = l.icon;
            const hover = ACCENT_HOVER[l.accent] ?? ACCENT_HOVER.fuchsia;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`group flex items-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-3 text-sm font-bold text-zinc-200 transition ${hover.split(" ")[0]} hover:bg-zinc-900`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-900 ring-1 ring-zinc-800 transition group-hover:ring-zinc-700">
                    <Icon className={`h-4 w-4 text-zinc-400 transition ${hover.split(" ").slice(1).join(" ")}`} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{l.label}</span>
                  <span className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ─── FOOTER NOTE ──────────────────────────────────────────────── */}
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-zinc-600">
        AnimeDB is an open-source project. Metadata via{" "}
        <a
          href="https://jikan.moe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-fuchsia-400 underline-offset-2 hover:underline"
        >
          Jikan
        </a>
        , an unofficial MyAnimeList API.
      </p>
    </div>
  );
}
