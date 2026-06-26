import { formatCompact } from "./Icons.jsx";

const STAT_ACCENTS = [
  { bar: "from-fuchsia-400 to-violet-500", text: "text-fuchsia-200" },
  { bar: "from-cyan-300 to-sky-500", text: "text-cyan-200" },
  { bar: "from-amber-300 to-orange-500", text: "text-amber-200" },
  { bar: "from-emerald-300 to-teal-500", text: "text-emerald-200" },
];

export default function ProfileHero({
  name,
  subtitle,
  cover,
  avatar,
  stats = [],
  badges = [],
}) {
  return (
    <section className="page-container relative mt-6">
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-zinc-800">
        {/* Backdrop image */}
        <div className="relative aspect-[5/2] min-h-[200px] w-full bg-zinc-900 sm:min-h-[280px]">
          {cover && (
            <img
              src={cover}
              alt=""
              aria-hidden
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-[1px]"
            />
          )}
          {/* Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-zinc-950/40" />
          {/* Subtle grain via radial spots */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, rgba(232,121,249,0.18), transparent 42%), radial-gradient(circle at 82% 60%, rgba(34,211,238,0.16), transparent 42%)",
            }}
          />
        </div>

        {/* Overlay content */}
        <div className="absolute inset-0 flex items-end p-4 sm:p-6 lg:p-8">
          <div className="flex w-full items-end gap-4 sm:gap-6">
            {avatar && (
              <div className="relative shrink-0 translate-y-3">
                <span
                  aria-hidden
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 opacity-70 blur-md"
                />
                <img
                  src={avatar}
                  alt={name}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  width="160"
                  height="160"
                  className="relative aspect-square w-24 rounded-2xl object-cover shadow-2xl ring-2 ring-zinc-950/60 sm:w-32 lg:w-40"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-fuchsia-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-200 ring-1 ring-fuchsia-400/30 backdrop-blur"
                  >
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </div>
              <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
                <span className="line-clamp-1">{name}</span>
              </h1>
              {subtitle && (
                <p className="mt-1 line-clamp-1 text-sm text-zinc-300 drop-shadow sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Desktop stats */}
            <ul className="hidden shrink-0 items-end gap-2 sm:flex lg:gap-3">
              {stats.map((s, i) => (
                <StatTile key={s.label} stat={s} accent={STAT_ACCENTS[i % STAT_ACCENTS.length]} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile stats — below the hero card */}
      <ul className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
        {stats.map((s, i) => (
          <StatTile key={s.label} stat={s} accent={STAT_ACCENTS[i % STAT_ACCENTS.length]} compact />
        ))}
      </ul>
    </section>
  );
}

function StatTile({ stat, accent, compact = false }) {
  const value =
    typeof stat.value === "number" ? formatCompact(stat.value) : stat.value;
  return (
    <li
      className={`relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/70 px-3 backdrop-blur ${
        compact ? "py-2 text-center" : "py-2 text-right lg:px-4"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accent.bar}`}
      />
      <p
        className={`text-[9px] font-bold uppercase tracking-[0.16em] ${accent.text} ${
          compact ? "" : "lg:text-[10px]"
        }`}
      >
        {stat.label}
      </p>
      <p
        className={`mt-0.5 font-black tabular-nums text-white ${
          compact ? "text-base" : "text-lg lg:text-xl"
        }`}
      >
        {value}
      </p>
    </li>
  );
}
