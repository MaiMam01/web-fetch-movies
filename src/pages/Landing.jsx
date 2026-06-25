import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import FeaturedCard from "../components/FeaturedCard.jsx";
import IconicCharactersSlider from "../components/IconicCharactersSlider.jsx";
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
      <Hero />

      <IconicCharactersSlider />

      {error && (
        <div className="mt-8 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load anime data: {error}
        </div>
      )}

      {showTv && (
        <Section
          eyebrow="Editor's List"
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

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 px-6 py-16 ring-1 ring-zinc-800 sm:px-10 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          AnimeDB
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
          The IMDB for Anime.
        </h1>
        <p className="mt-5 text-lg text-zinc-300">
          Browse top-rated series, dive into episode-by-episode breakdowns, and
          explore a curated catalog of the medium&apos;s most intense scenes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/top"
            className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Browse Top 100
          </Link>
          <Link
            to="/scenes"
            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            Scene Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}

function Section({ eyebrow, title, subtitle, children }) {
  return (
    <section className="mt-14">
      <div className="mb-6">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
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
