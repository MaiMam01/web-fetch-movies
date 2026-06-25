import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import FeaturedCard from "../components/FeaturedCard.jsx";
import IconicCharactersSlider from "../components/IconicCharactersSlider.jsx";
import {
  IconSearch,
  IconStar,
  IconChevronRight,
  IconPlay,
  IconTrendUp,
} from "../components/Icons.jsx";
import { resolveFromTitles, getTopAnime } from "../services/jikan.js";
import featured from "../data/featuredTitles.json";

export default function Landing() {
  const [params] = useSearchParams();
  const typeFilter = params.get("type");
  const showTv = !typeFilter || typeFilter === "tv";
  const showFilms = !typeFilter || typeFilter === "movie";
  const [tv, setTv] = useState([]);
  const [films, setFilms] = useState([]);
  const [topList, setTopList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const tvData = await resolveFromTitles(featured.tv ?? []);
        if (cancelled) return;
        setTv(tvData);
        const filmData = await resolveFromTitles(featured.films ?? []);
        if (cancelled) return;
        setFilms(filmData);
        const top = await getTopAnime(20);
        if (cancelled) return;
        setTopList(top);
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
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Hero posters={topList} />

      <IconicCharactersSlider />

      {error && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load anime data: {error}
        </div>
      )}

      {showTv && (
        <Section
          eyebrow="Editor's List"
          eyebrowColor="text-fuchsia-400"
          title="Top 10 TV Series"
          subtitle="Hand-picked entries — every series ranked. Live ratings from MyAnimeList."
        >
          {loading && tv.length === 0 ? (
            <FeaturedSkeletonGrid count={6} />
          ) : (
            <FeaturedGrid>
              {tv.map((a, i) => (
                <FeaturedCard key={a.mal_id} anime={a} rank={i + 1} />
              ))}
            </FeaturedGrid>
          )}
        </Section>
      )}

      {showFilms && (
        <Section
          eyebrow="Editor's List"
          eyebrowColor="text-cyan-400"
          title="Top Films"
          subtitle="From Ghibli classics to cyberpunk landmarks."
        >
          {loading && films.length === 0 ? (
            <FeaturedSkeletonGrid count={4} />
          ) : (
            <FeaturedGrid>
              {films.map((a, i) => (
                <FeaturedCard key={a.mal_id} anime={a} rank={i + 1} />
              ))}
            </FeaturedGrid>
          )}
        </Section>
      )}

      <Section
        eyebrow="Live from MyAnimeList"
        eyebrowColor="text-lime-400"
        title="All-Time Top Rated"
        subtitle="Streamed live via the Jikan API."
      >
        {loading ? (
          <SkeletonGrid />
        ) : (
          <Grid>
            {topList.map((a) => (
              <AnimeCard key={a.mal_id} anime={a} />
            ))}
          </Grid>
        )}
      </Section>
    </div>
  );
}

function Hero({ posters = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const collage = posters.slice(0, 5);

  return (
    <section className="relative isolate overflow-hidden rounded-2xl ring-1 ring-zinc-800/80 sm:rounded-3xl">
      {/* Funky multi-color background */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0f0c1d] to-black" />
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/30 blur-[120px] motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 left-1/3 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/20 blur-[140px] motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[120px] motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute right-1/3 -top-16 h-64 w-64 rounded-full bg-amber-400/15 blur-[100px] motion-safe:animate-[pulse_11s_ease-in-out_infinite]" />
        <div className="absolute left-10 bottom-10 h-56 w-56 rounded-full bg-lime-400/10 blur-[100px] motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-500/60 via-cyan-400/60 to-amber-400/60" />
      </div>

      {/* Decorative poster collage — bleeds into hero bg on the right (lg+) */}
      <PosterCollage posters={collage} />

      {/* Gradient veil over the right side so text remains readable on top of posters */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgb(9 9 11 / 0.95) 0%, rgb(9 9 11 / 0.85) 40%, rgb(9 9 11 / 0.35) 65%, rgb(9 9 11 / 0) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-[11px] font-medium text-lime-200 backdrop-blur sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
            </span>
            Live data from MyAnimeList
          </div>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            The{" "}
            <span className="relative inline-block">
              <span className="text-funk-gradient">IMDB</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500 to-cyan-400/0" />
            </span>{" "}
            for{" "}
            <span className="text-funk-warm">Anime.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300/90 sm:mt-6 sm:text-lg">
            Browse top-rated series, dive into episode-by-episode breakdowns,
            and explore a curated catalog of the medium&apos;s most iconic
            scenes.
          </p>

          <form
            onSubmit={onSearch}
            className="group mt-7 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-1.5 pl-3 shadow-xl shadow-black/40 backdrop-blur transition focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/20 sm:pl-4"
          >
            <IconSearch className="h-5 w-5 shrink-0 text-zinc-400 transition group-focus-within:text-amber-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime, characters, scenes…"
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:text-base"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:opacity-90 sm:px-4"
            >
              <span className="hidden sm:inline">Search</span>
              <IconChevronRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            <Link
              to="/top"
              className="group inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-sm font-semibold text-amber-100 backdrop-blur transition hover:border-amber-400/70 hover:bg-amber-400/20 sm:px-4 sm:py-2.5"
            >
              <IconTrendUp className="h-4 w-4 text-amber-300" />
              Browse Top 100
              <IconChevronRight className="h-4 w-4 -translate-x-0.5 text-amber-300/70 transition group-hover:translate-x-0 group-hover:text-amber-200" />
            </Link>
            <Link
              to="/scenes"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3.5 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-400/70 hover:bg-rose-500/20 sm:px-4 sm:py-2.5"
            >
              <IconPlay className="h-4 w-4 text-rose-300" />
              Scene Catalog
            </Link>
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/70 hover:bg-cyan-400/20 sm:px-4 sm:py-2.5"
            >
              <IconPlay className="h-4 w-4 text-cyan-300" />
              Stories
            </Link>
          </div>

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-800/40 sm:mt-10">
            <Stat label="Titles indexed" value="12K+" accent="text-fuchsia-300" />
            <Stat label="Ratings live" value="4M+" accent="text-cyan-300" />
            <Stat label="Scenes curated" value="800+" accent="text-lime-300" />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="bg-zinc-950/60 px-3 py-3 text-center backdrop-blur sm:px-6 sm:py-4">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[11px]">
        {label}
      </dt>
      <dd className={`mt-0.5 text-lg font-bold sm:mt-1 sm:text-2xl ${accent}`}>
        {value}
      </dd>
    </div>
  );
}

function PosterCollage({ posters }) {
  // Absolutely positioned within the hero. Hidden below lg so the hero text gets full width on mobile/tablet.
  const slots = [
    { cls: "right-[26%] top-[8%] w-36 xl:w-40 -rotate-6 z-10", ring: "ring-amber-400/30" },
    { cls: "right-[4%] top-[14%] w-44 xl:w-52 rotate-3 z-30", ring: "ring-white/20" },
    { cls: "right-[36%] top-[44%] w-32 xl:w-36 rotate-3 z-20", ring: "ring-fuchsia-400/30" },
    { cls: "right-[8%] bottom-[6%] w-40 xl:w-44 -rotate-3 z-40", ring: "ring-rose-400/30" },
    { cls: "right-[30%] bottom-[10%] w-28 xl:w-32 rotate-6 z-20", ring: "ring-emerald-400/30" },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <div className="absolute right-[18%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-amber-500/20 blur-3xl" />
      {slots.map((slot, i) => {
        const a = posters[i];
        const img =
          a?.images?.webp?.large_image_url ||
          a?.images?.jpg?.large_image_url ||
          a?.images?.webp?.image_url ||
          a?.images?.jpg?.image_url;
        return (
          <div
            key={i}
            className={`absolute ${slot.cls} pointer-events-auto aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ${slot.ring} transition duration-500 hover:z-50 hover:scale-105 hover:rotate-0`}
          >
            {img ? (
              <img
                src={img}
                alt={a?.title || ""}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
            )}
            {a?.score ? (
              <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-white/10 backdrop-blur">
                <IconStar className="h-3 w-3 fill-amber-400 text-amber-400" />
                {Number(a.score).toFixed(1)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Section({ eyebrow, eyebrowColor = "text-brand-500", title, subtitle, children }) {
  return (
    <section className="mt-14">
      <div className="mb-6">
        {eyebrow && (
          <p
            className={`text-xs font-semibold uppercase tracking-widest ${eyebrowColor}`}
          >
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function FeaturedGrid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {children}
    </div>
  );
}

function FeaturedSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl bg-zinc-900/60 p-4 ring-1 ring-zinc-800"
        >
          <div className="aspect-[2/3] w-24 animate-pulse rounded-lg bg-zinc-800 sm:w-28" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-800" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800"
        >
          <div className="aspect-[2/3] w-full animate-pulse bg-zinc-800" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
