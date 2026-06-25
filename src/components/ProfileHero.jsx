import { IconTrendUp, formatCompact } from "./Icons.jsx";

const TREND_COLOR = {
  primary: "text-emerald-400",
  secondary: "text-amber-400",
  tertiary: "text-rose-400",
};

export default function ProfileHero({
  name,
  subtitle,
  cover,
  avatar,
  stats = [],
  badges = [],
}) {
  return (
    <section className="relative mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-800">
        <div className="relative aspect-[5/2] min-h-[180px] w-full bg-zinc-900 sm:min-h-[260px]">
          {cover && (
            <img
              src={cover}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-zinc-950/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/55 via-transparent to-zinc-950/35" />
        </div>

        <div className="absolute inset-0 flex items-end p-4 sm:p-6 lg:p-7">
          <div className="flex w-full items-end gap-4 sm:gap-6">
            {avatar && (
              <img
                src={avatar}
                alt={name}
                className="aspect-square w-24 flex-shrink-0 translate-y-2 rounded-xl object-cover shadow-2xl ring-2 ring-zinc-950/40 sm:w-32 lg:w-40"
              />
            )}

            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-zinc-50 drop-shadow-lg sm:text-3xl lg:text-4xl">
                <span className="line-clamp-1">{name}</span>
                {badges.map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex shrink-0 items-center gap-1 rounded bg-zinc-950/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 ring-1 ring-zinc-800"
                  >
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </h1>
              {subtitle && (
                <p className="mt-1 line-clamp-1 text-sm text-zinc-300 drop-shadow sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="hidden shrink-0 items-end gap-5 sm:flex lg:gap-8">
              {stats.map((s, i) => (
                <StatColumn key={s.label} stat={s} tone={toneByIndex(i)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-around gap-3 sm:hidden">
        {stats.map((s, i) => (
          <StatColumn key={s.label} stat={s} tone={toneByIndex(i)} compact />
        ))}
      </div>
    </section>
  );
}

function StatColumn({ stat, tone, compact = false }) {
  const trend = stat.trend ?? "primary";
  const colorClass = TREND_COLOR[trend] ?? TREND_COLOR.primary;
  const value =
    typeof stat.value === "number" ? formatCompact(stat.value) : stat.value;

  return (
    <div className={`text-center ${compact ? "flex-1" : "min-w-[80px]"}`}>
      <div className="flex items-center justify-center gap-1.5">
        <span
          className={`text-xl font-black tabular-nums text-zinc-50 ${
            compact ? "text-base" : "lg:text-2xl"
          }`}
        >
          {value}
        </span>
        <IconTrendUp className={`h-4 w-4 ${colorClass}`} />
      </div>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:text-[11px]">
        {stat.label}
      </p>
    </div>
  );
}

function toneByIndex(i) {
  return ["primary", "secondary", "tertiary"][i % 3];
}
