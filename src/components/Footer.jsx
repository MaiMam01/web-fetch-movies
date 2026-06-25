import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconHeart,
  IconStar,
  IconPlay,
  IconUser,
  IconImage,
  IconGrid,
  IconChevronRight,
  IconMessage,
  IconRss,
  IconGlobe,
  IconExternalLink,
} from "./Icons.jsx";

const COL_BROWSE = {
  title: "Browse",
  accent: "fuchsia",
  links: [
    ["All Anime", "/top", <IconStar key="i" className="h-3.5 w-3.5" />],
    ["Categories", "/categories", <IconGrid key="i" className="h-3.5 w-3.5" />],
    ["Characters", "/characters", <IconUser key="i" className="h-3.5 w-3.5" />],
    ["Voice Actors", "/voice-actors", <IconUser key="i" className="h-3.5 w-3.5" />],
    ["Studios", "/studios", <IconImage key="i" className="h-3.5 w-3.5" />],
    ["A → Z Index", "/a-z", <IconChevronRight key="i" className="h-3.5 w-3.5" />],
  ],
};

const COL_FEATURED = {
  title: "Featured",
  accent: "cyan",
  links: [
    ["Top of All Time", "/top", <IconStar key="i" className="h-3.5 w-3.5" />],
    ["Top Scenes Catalog", "/scenes", <IconPlay key="i" className="h-3.5 w-3.5" />],
    ["Top Voice Actors", "/voice-actors", <IconUser key="i" className="h-3.5 w-3.5" />],
    ["Top Characters", "/characters", <IconHeart key="i" className="h-3.5 w-3.5" />],
    ["Stories & Reels", "/stories", <IconRss key="i" className="h-3.5 w-3.5" />],
  ],
};

const COL_RESOURCES = {
  title: "Resources",
  accent: "lime",
  links: [
    ["Contact Us", "/contact"],
    ["FAQ & Support", "/faq"],
    ["System Status", "/status"],
    ["Request Content", "/request"],
    ["Send Feedback", "/feedback"],
  ],
};

const COL_LEGAL = {
  title: "Legal",
  accent: "amber",
  links: [
    ["Cookie Policy", "/cookie-policy"],
    ["DMCA Policy", "/dmca"],
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
    ["Safety Center", "/safety"],
  ],
};

const ACCENTS = {
  fuchsia: {
    bar: "bg-fuchsia-400",
    hoverText: "group-hover:text-fuchsia-300",
    hoverDot: "group-hover:bg-fuchsia-400",
  },
  cyan: {
    bar: "bg-cyan-400",
    hoverText: "group-hover:text-cyan-300",
    hoverDot: "group-hover:bg-cyan-400",
  },
  lime: {
    bar: "bg-lime-400",
    hoverText: "group-hover:text-lime-300",
    hoverDot: "group-hover:bg-lime-400",
  },
  amber: {
    bar: "bg-amber-400",
    hoverText: "group-hover:text-amber-300",
    hoverDot: "group-hover:bg-amber-400",
  },
};

const SOCIALS = [
  { label: "X", href: "https://x.com", glyph: "X", color: "hover:text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-400/10" },
  { label: "Discord", href: "https://discord.com", glyph: "D", color: "hover:text-violet-300 hover:border-violet-400/60 hover:bg-violet-400/10" },
  { label: "YouTube", href: "https://youtube.com", glyph: "▶", color: "hover:text-rose-300 hover:border-rose-400/60 hover:bg-rose-400/10" },
  { label: "Reddit", href: "https://reddit.com", glyph: "R", color: "hover:text-orange-300 hover:border-orange-400/60 hover:bg-orange-400/10" },
  { label: "GitHub", href: "https://github.com", glyph: "G", color: "hover:text-lime-300 hover:border-lime-400/60 hover:bg-lime-400/10" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className="relative isolate mt-16 overflow-hidden border-t border-zinc-800/80">
      {/* Rainbow edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-violet-500 via-cyan-400 to-lime-400"
      />

      {/* Cosmic background glow */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute -left-32 top-0 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute -right-24 top-1/3 h-[20rem] w-[20rem] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[18rem] w-[18rem] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* Newsletter / CTA banner */}
      <div className="border-b border-zinc-800/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-fuchsia-300">
              <span aria-hidden>★</span> The Weekly Drop
            </div>
            <h3 className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl">
              New scenes, every <span className="text-funk-gradient">Friday</span>.
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Curated picks, episode breakdowns, and what's airing — straight to
              your inbox. No spam, unsubscribe anytime.
            </p>
          </div>

          <form
            onSubmit={onSubscribe}
            className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1.5 pl-4 shadow-xl shadow-black/40 backdrop-blur focus-within:border-fuchsia-400/60 focus-within:ring-2 focus-within:ring-fuchsia-400/20"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@watchparty.io"
              aria-label="Email address"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:opacity-90"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
              {!subscribed && <IconChevronRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Brand block */}
        <div className="space-y-5 sm:col-span-2 lg:col-span-4">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-funk-gradient">Anime</span>
              <span className="ml-0.5 rounded-md bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 px-1.5 py-0.5 text-zinc-950 shadow-lg shadow-fuchsia-500/30">
                DB
              </span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
            A curated archive cataloging notable scenes from anime — fight
            choreography, pivotal narrative beats, and the medium's most iconic
            moments. Built for fans, by fans.
          </p>

          {/* Mini-stats */}
          <ul className="grid max-w-sm grid-cols-3 gap-px overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-800/40">
            <MiniStat label="Titles" value="12K+" color="text-fuchsia-300" />
            <MiniStat label="Scenes" value="800+" color="text-cyan-300" />
            <MiniStat label="Updated" value="Daily" color="text-lime-300" />
          </ul>

          {/* Socials */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Follow the chaos
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className={`grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-300 backdrop-blur transition ${s.color}`}
                >
                  <span className="text-xs font-black">{s.glyph}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <FooterColumn data={COL_BROWSE} className="lg:col-span-2" />
        <FooterColumn data={COL_FEATURED} className="lg:col-span-2" />
        <FooterColumn data={COL_RESOURCES} className="lg:col-span-2" />
        <FooterColumn data={COL_LEGAL} className="lg:col-span-2" />
      </div>

      {/* Bottom strip */}
      <div className="border-t border-zinc-800/60 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 — AnimeDB</span>
            <span className="text-zinc-700">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]"
                aria-hidden
              />
              All systems normal
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-300">
              18+
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconGlobe className="h-3.5 w-3.5" /> English
            </span>
            <span className="text-zinc-700">·</span>
            <a
              href="https://jikan.moe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-cyan-300"
            >
              Data via Jikan / MyAnimeList
              <IconExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ data, className = "" }) {
  const accent = ACCENTS[data.accent] ?? ACCENTS.fuchsia;
  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-100">
        <span className={`block h-3.5 w-1 rounded-full ${accent.bar}`} />
        {data.title}
      </h3>
      <ul className="mt-4 space-y-1.5 text-sm">
        {data.links.map(([label, to, icon]) => (
          <li key={label}>
            <Link
              to={to}
              className="group inline-flex items-center gap-2 text-zinc-400 transition hover:text-zinc-100"
            >
              {icon ? (
                <span className={`text-zinc-600 transition ${accent.hoverText}`}>
                  {icon}
                </span>
              ) : (
                <span
                  className={`h-1 w-1 rounded-full bg-zinc-700 transition ${accent.hoverDot}`}
                  aria-hidden
                />
              )}
              <span className="line-clamp-1">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <li className="bg-zinc-950/60 px-3 py-2.5 text-center backdrop-blur">
      <p className={`text-sm font-black ${color}`}>{value}</p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </li>
  );
}
