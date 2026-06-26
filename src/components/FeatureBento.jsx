import { Link } from "react-router-dom";
import {
  IconPlay,
  IconTrendUp,
  IconUser,
  IconRss,
  IconCheck,
  IconStar,
  IconChevronRight,
} from "./Icons.jsx";

// Static Tailwind class lookups (JIT-safe) per feature accent.
const BENTO_ACCENTS = {
  fuchsia: {
    ring: "hover:ring-fuchsia-400/60",
    glow: "from-fuchsia-500/25 via-fuchsia-500/0",
    iconBg:
      "bg-gradient-to-br from-fuchsia-500/25 to-fuchsia-500/5 text-fuchsia-200 ring-fuchsia-400/40 shadow-[0_8px_30px_-12px_rgba(232,121,249,0.55)]",
    eyebrow: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
    statRing: "ring-fuchsia-400/30",
    statText: "text-fuchsia-100",
    cta: "text-fuchsia-200 group-hover:text-fuchsia-100",
    underline: "bg-gradient-to-r from-fuchsia-400 via-fuchsia-300 to-fuchsia-400",
    cornerGrad: "from-fuchsia-500/30 to-transparent",
  },
  cyan: {
    ring: "hover:ring-cyan-400/60",
    glow: "from-cyan-400/25 via-cyan-400/0",
    iconBg:
      "bg-gradient-to-br from-cyan-400/25 to-cyan-400/5 text-cyan-200 ring-cyan-400/40 shadow-[0_8px_30px_-12px_rgba(34,211,238,0.55)]",
    eyebrow: "bg-cyan-400/15 text-cyan-200 ring-cyan-400/30",
    statRing: "ring-cyan-400/30",
    statText: "text-cyan-100",
    cta: "text-cyan-200 group-hover:text-cyan-100",
    underline: "bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400",
    cornerGrad: "from-cyan-400/30 to-transparent",
  },
  lime: {
    ring: "hover:ring-lime-400/60",
    glow: "from-lime-400/25 via-lime-400/0",
    iconBg:
      "bg-gradient-to-br from-lime-400/25 to-lime-400/5 text-lime-200 ring-lime-400/40 shadow-[0_8px_30px_-12px_rgba(163,230,53,0.5)]",
    eyebrow: "bg-lime-400/15 text-lime-200 ring-lime-400/30",
    statRing: "ring-lime-400/30",
    statText: "text-lime-100",
    cta: "text-lime-200 group-hover:text-lime-100",
    underline: "bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400",
    cornerGrad: "from-lime-400/30 to-transparent",
  },
  amber: {
    ring: "hover:ring-amber-400/60",
    glow: "from-amber-400/25 via-amber-400/0",
    iconBg:
      "bg-gradient-to-br from-amber-400/25 to-amber-400/5 text-amber-200 ring-amber-400/40 shadow-[0_8px_30px_-12px_rgba(251,191,36,0.5)]",
    eyebrow: "bg-amber-400/15 text-amber-200 ring-amber-400/30",
    statRing: "ring-amber-400/30",
    statText: "text-amber-100",
    cta: "text-amber-200 group-hover:text-amber-100",
    underline: "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400",
    cornerGrad: "from-amber-400/30 to-transparent",
  },
};

export default function FeatureBento() {
  const features = [
    {
      key: "scenes",
      eyebrow: "01 · Catalog",
      title: "Curated scene catalog",
      desc: "Hand-picked iconic moments — fights, plot twists, animation showcases — every entry tagged with episode, timestamp, and severity.",
      icon: <IconPlay className="h-5 w-5" />,
      to: "/scenes",
      cta: "Browse scenes",
      stat: "800+ scenes",
      accent: "fuchsia",
      span: "lg:col-span-7",
      deco: <SceneDeco />,
    },
    {
      key: "ratings",
      eyebrow: "02 · Live data",
      title: "Live MAL ratings",
      desc: "Scores, ranks, and member counts stream live from the Jikan API — never stale, never seeded by hand.",
      icon: <IconTrendUp className="h-5 w-5" />,
      to: "/top",
      cta: "See top 100",
      stat: "Streaming live",
      accent: "cyan",
      span: "lg:col-span-5",
      deco: <RatingsDeco />,
    },
    {
      key: "cast",
      eyebrow: "03 · Cast",
      title: "Full cast & crew",
      desc: "Every character and every voice actor, deep-linked back to the anime they appear in.",
      icon: <IconUser className="h-5 w-5" />,
      to: "/voice-actors",
      cta: "Browse VAs",
      stat: "5K+ profiles",
      accent: "lime",
      span: "lg:col-span-5",
      deco: <CastDeco />,
    },
    {
      key: "reels",
      eyebrow: "04 · Reels",
      title: "Stories & reels",
      desc: "Opening themes, EDs, music videos and promos — TikTok-style vertical player baked right in.",
      icon: <IconRss className="h-5 w-5" />,
      to: "/stories",
      cta: "Watch reels",
      stat: "Fresh daily",
      accent: "amber",
      span: "lg:col-span-7",
      deco: <ReelsDeco />,
    },
  ];

  return (
    <section className="mt-16 sm:mt-20">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200 ring-1 ring-violet-400/30">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
            </span>
            Why AnimeDB
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            Built for fans, by{" "}
            <span className="text-funk-gradient">fans</span>.
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-zinc-400 sm:text-[15px]">
            Four obsessions, one catalog — spend more time watching, less time
            hunting.
          </p>
        </div>
        <div className="hidden flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:flex">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/70 px-2.5 py-1 ring-1 ring-zinc-800">
            <IconCheck className="h-3 w-3 text-lime-400" />
            No ads
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/70 px-2.5 py-1 ring-1 ring-zinc-800">
            <IconCheck className="h-3 w-3 text-lime-400" />
            No tracking
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/70 px-2.5 py-1 ring-1 ring-zinc-800">
            <IconCheck className="h-3 w-3 text-lime-400" />
            Open source
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {features.map((f) => (
          <BentoCard key={f.key} feature={f} />
        ))}
      </div>

      <style>{`
        @keyframes bento-sparkle {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes bento-drift {
          0%   { transform: translateX(0) }
          50%  { transform: translateX(6px) }
          100% { transform: translateX(0) }
        }
        @keyframes bento-pulse-bar {
          0%, 100% { transform: scaleY(0.45); }
          50%      { transform: scaleY(1); }
        }
        .bento-spark { animation: bento-sparkle 3.6s ease-in-out infinite; }
        .bento-drift { animation: bento-drift  6s ease-in-out infinite; }
        .bento-bar   { transform-origin: bottom; animation: bento-pulse-bar 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bento-spark, .bento-drift, .bento-bar { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

function BentoCard({ feature: f }) {
  const a = BENTO_ACCENTS[f.accent];
  return (
    <Link
      to={f.to}
      aria-label={`${f.title} — ${f.cta}`}
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-950/80 p-5 ring-1 ring-zinc-800 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:ring-2 sm:p-6 ${a.ring} sm:col-span-2 ${f.span}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${a.cornerGrad} blur-3xl transition duration-500 group-hover:scale-125`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(232,121,249,0.06), rgba(34,211,238,0.06), rgba(163,230,53,0.06)) border-box",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition duration-300 group-hover:scale-105 group-hover:rotate-3 ${a.iconBg}`}
        >
          {f.icon}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-zinc-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ring-1 backdrop-blur ${a.statRing} ${a.statText}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          {f.stat}
        </span>
      </div>

      <div className="relative mt-5">{f.deco}</div>

      <p
        className={`relative mt-5 text-[10px] font-bold uppercase tracking-[0.22em] ${a.statText} opacity-80`}
      >
        {f.eyebrow}
      </p>
      <h3 className="relative mt-1.5 text-lg font-black tracking-tight text-white sm:text-xl">
        {f.title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">
        {f.desc}
      </p>

      <span
        className={`relative mt-5 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] transition ${a.cta}`}
      >
        <span className="relative">
          {f.cta}
          <span
            aria-hidden
            className={`absolute inset-x-0 -bottom-1 block h-px scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 ${a.underline}`}
          />
        </span>
        <IconChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function SceneDeco() {
  const rows = [
    { ep: "S1·E12", title: "Lightning blade", sev: "graphic", color: "bg-orange-500" },
    { ep: "S2·E04", title: "Cathedral fall", sev: "moderate", color: "bg-amber-400" },
    { ep: "S3·E18", title: "Final stand", sev: "extreme", color: "bg-rose-500" },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div
          key={r.ep}
          className="flex items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-2.5 py-1.5 text-[11px] backdrop-blur transition group-hover:border-fuchsia-400/30"
          style={{ opacity: 1 - i * 0.18 }}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${r.color} shadow-[0_0_8px_currentColor]`} />
          <span className="font-bold text-zinc-300">{r.ep}</span>
          <span className="line-clamp-1 flex-1 text-zinc-400">{r.title}</span>
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            {r.sev}
          </span>
        </div>
      ))}
      <div className="!mt-3 flex items-center gap-2 text-[10px] font-bold text-zinc-500">
        <span>0:00</span>
        <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <span className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400" />
          <span className="absolute top-1/2 left-2/3 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(232,121,249,0.9)] ring-2 ring-fuchsia-400/60" />
        </span>
        <span className="text-fuchsia-300">24:00</span>
      </div>
    </div>
  );
}

function RatingsDeco() {
  return (
    <div className="relative h-[88px] overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 backdrop-blur">
      <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-black text-cyan-200 ring-1 ring-cyan-400/40">
        <IconStar className="h-3 w-3" />
        9.21
        <span className="ml-1 text-[9px] font-bold text-emerald-300">+0.04</span>
      </div>
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className="h-full w-full bento-drift"
        aria-hidden
      >
        <defs>
          <linearGradient id="bento-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,0.04)" />
        <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.04)" />
        <path
          d="M0,46 L20,42 L40,44 L60,36 L80,38 L100,30 L120,26 L140,22 L160,18 L180,12 L200,8 L200,60 L0,60 Z"
          fill="url(#bento-spark-fill)"
        />
        <path
          d="M0,46 L20,42 L40,44 L60,36 L80,38 L100,30 L120,26 L140,22 L160,18 L180,12 L200,8"
          fill="none"
          stroke="#67e8f9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="200" cy="8" r="3" fill="#22d3ee" className="bento-spark" />
      </svg>
      <div className="absolute inset-x-3 bottom-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        <span>30 days</span>
        <span className="inline-flex items-center gap-1 text-emerald-300">
          <IconTrendUp className="h-3 w-3" />
          Live
        </span>
      </div>
    </div>
  );
}

function CastDeco() {
  const palettes = [
    "from-fuchsia-500 to-violet-500",
    "from-cyan-400 to-sky-500",
    "from-lime-400 to-emerald-500",
    "from-amber-400 to-orange-500",
    "from-rose-500 to-pink-500",
  ];
  const initials = ["RS", "KT", "MN", "AS", "+12K"];
  return (
    <div className="relative">
      <div className="flex items-center">
        {palettes.map((p, i) => (
          <span
            key={i}
            className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${p} text-[10px] font-black text-white ring-2 ring-zinc-950 transition group-hover:translate-y-[-2px] sm:h-11 sm:w-11 sm:text-[11px] ${
              i > 0 ? "-ml-3" : ""
            }`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {initials[i]}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-md bg-lime-400/15 px-1.5 py-0.5 text-[10px] font-bold text-lime-200 ring-1 ring-lime-400/30">
          <span className="h-1 w-1 rounded-full bg-lime-300" />
          24 main · 312 supporting
        </span>
      </div>
    </div>
  );
}

function ReelsDeco() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[92px] w-[58px] shrink-0 overflow-hidden rounded-[14px] bg-gradient-to-br from-zinc-800 to-zinc-950 ring-2 ring-zinc-700 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]">
        <div
          aria-hidden
          className="absolute inset-1 rounded-[10px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.55), transparent 55%), radial-gradient(circle at 70% 70%, rgba(232,121,249,0.45), transparent 55%), linear-gradient(160deg, #1a0b2e, #0a0814)",
          }}
        />
        <span className="absolute left-1/2 top-1 h-1 w-6 -translate-x-1/2 rounded-full bg-zinc-700" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            <IconPlay className="h-3 w-3 text-zinc-900" />
          </span>
        </span>
        <span className="absolute inset-x-1.5 bottom-1.5 flex gap-0.5">
          <span className="h-0.5 flex-1 rounded-full bg-white" />
          <span className="h-0.5 flex-1 rounded-full bg-white/40" />
          <span className="h-0.5 flex-1 rounded-full bg-white/20" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {[40, 70, 55].map((w, i) => (
          <span
            key={i}
            className="block h-2 rounded-full bg-zinc-800"
            style={{ width: `${w}%` }}
          >
            <span
              className="bento-bar block h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          </span>
        ))}
        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-200 ring-1 ring-amber-400/30">
          <IconPlay className="h-2.5 w-2.5" />
          OP · ED · Promo
        </span>
      </div>
    </div>
  );
}
