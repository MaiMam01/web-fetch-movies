import { Link } from "react-router-dom";

const COL_RESOURCES = [
  ["Contact Us", "/contact"],
  ["FAQ & Support", "/faq"],
  ["System Status", "/status"],
  ["Request Content", "/request"],
  ["Send Feedback", "/feedback"],
  ["Cookie Policy", "/cookie-policy"],
  ["DMCA Policy", "/dmca"],
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
  ["Safety Center", "/safety"],
];

const COL_BROWSE = [
  ["All Anime", "/a-z"],
  ["Top 100 Series", "/top?type=tv"],
  ["Top 100 Films", "/top?type=movie"],
  ["By Genre", "/categories"],
  ["By Studio", "/studios"],
];

const COL_FEATURED = [
  ["Top 100 Scenes of all Time", "/scenes/top"],
  ["Top 100 Voice Actors", "/voice-actors/top"],
  ["Top 100 Characters", "/characters/top"],
  ["Top 100 Anime of all Time", "/top"],
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-900 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight">
              <span className="text-zinc-100">Anime</span>
              <span className="rounded-sm bg-brand-500 px-1 text-zinc-950">DB</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-zinc-500">
            AnimeDB has a mission to catalog notable scenes from anime — from
            unforgettable fight choreography to pivotal narrative moments. Our
            platform is a curated archive that highlights the artistic and
            cultural significance of standout moments across series and films.
          </p>
        </div>

        <FooterColumn title="Resources" links={COL_RESOURCES} />
        <FooterColumn title="Browse" links={COL_BROWSE} />
        <FooterColumn title="Featured" links={COL_FEATURED} />
      </div>

      <div className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="grid h-7 w-7 place-items-center rounded-full border border-zinc-800 hover:bg-zinc-900"
            >
              <span className="text-[10px] font-black">X</span>
            </a>
            <span>© 2026 — AnimeDB</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded border border-zinc-800 px-2 py-0.5 font-semibold">
              18+
            </span>
            <span>Data via Jikan / MyAnimeList</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-zinc-400 transition hover:text-zinc-100">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
