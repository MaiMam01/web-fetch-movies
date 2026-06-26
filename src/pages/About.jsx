import { useParams, useLocation, Link } from "react-router-dom";

const COPY_BY_SLUG = {
  about: {
    title: "About AnimeDB",
    body: "AnimeDB is a curated index of anime — series, films, characters, voice actors, and the most memorable scenes that define them. Posters, ratings, and cast data come live from MyAnimeList via the open-source Jikan REST API. Scene entries are editorial and added by hand."
  },
  contact: {
    title: "Contact Us",
    body: "We don't have an inbox wired up yet, but you can open an issue on the project's GitHub repository — that's the fastest way to reach us during this build."
  },
  faq: {
    title: "FAQ & Support",
    body: "How do I add an anime to the catalog? It's pulled live from MyAnimeList. How do I add a scene? Edit src/data/scenes.json. How do I report a bug? Open an issue on GitHub."
  },
  status: {
    title: "System Status",
    body: "All systems normal. This page will eventually show the health of the Jikan API, image CDN, and our own deploy."
  },
  request: {
    title: "Request Content",
    body: "Want a specific scene or anime added? Open a request on GitHub with a link to the title's MyAnimeList page and the scene timestamp(s) you'd like documented."
  },
  feedback: {
    title: "Send Feedback",
    body: "Use the GitHub issue tracker — we read everything. UI bugs, design suggestions, scene corrections, all welcome."
  },
  "cookie-policy": {
    title: "Cookie Policy",
    body: "AnimeDB uses session storage to remember your 18+ confirmation across the scene catalog. We do not set tracking cookies and do not run analytics."
  },
  dmca: {
    title: "DMCA Policy",
    body: "Anime metadata is licensed by MyAnimeList. Posters and images are hosted by MAL/CDNs we link to — we do not re-host them. If you believe content infringes a copyright, please contact MyAnimeList directly or open an issue here."
  },
  privacy: {
    title: "Privacy Policy",
    body: "AnimeDB does not collect personal data. No accounts, no telemetry, no analytics. Your 18+ confirmation lives only in your browser's session storage and is wiped when you close the tab."
  },
  terms: {
    title: "Terms of Service",
    body: "AnimeDB is a free, open-source catalog provided as-is. Use of the site implies acceptance of the data licensing terms of MyAnimeList and the Jikan API."
  },
  safety: {
    title: "Safety Center",
    body: "The /scenes section catalogs depictions of graphic violence and is gated behind an 18+ confirmation. Severity tags (mild / moderate / graphic / extreme) on every entry let you self-filter before viewing."
  },
  studios: {
    title: "Browse by Studio",
    body: "Studio browse is in the queue — for now you can find studio names on each anime's detail page, or filter by genre."
  },
  "a-z": {
    title: "Alphabetical Browse",
    body: "A-Z browse is coming. While we wire it up, the search bar above and the Categories page already cover most of what you'd want."
  },
};

export default function About() {
  const { slug } = useParams();
  const location = useLocation();

  const key =
    slug ||
    Object.keys(COPY_BY_SLUG).find((k) => location.pathname === `/${k}`) ||
    "about";
  const copy = COPY_BY_SLUG[key] || COPY_BY_SLUG.about;

  return (
    <div className="page-container py-16">
      {/* Inner reading column — body text stays at a comfortable line length
          even when the outer container spans the full viewport. */}
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          AnimeDB
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-zinc-300">{copy.body}</p>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
          Where to next
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {[
            ["Browse top anime", "/"],
            ["Browse categories", "/categories"],
            ["Browse characters", "/characters"],
            ["Browse voice actors", "/voice-actors"],
            ["Watch reels", "/stories"],
            ["Scene catalog", "/scenes"],
          ].map(([label, to]) => (
            <li key={to}>
              <Link
                to={to}
                className="block rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-brand-500 hover:text-brand-500"
              >
                {label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
