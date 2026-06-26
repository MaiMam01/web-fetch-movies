import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import AnimeCard from "../components/AnimeCard.jsx";
import FeaturedCard from "../components/FeaturedCard.jsx";
import Pagination from "../components/Pagination.jsx";
import Hero3DBackdrop from "../components/Hero3DBackdrop.jsx";
import BestOfAllTimeSlider from "../components/BestOfAllTimeSlider.jsx";
import CharacterCircleRail from "../components/CharacterCircleRail.jsx";
import useMouseTilt from "../hooks/useMouseTilt.js";
import {
  IconSearch,
  IconStar,
  IconChevronRight,
  IconPlay,
  IconTrendUp,
  IconHeart,
  IconGrid,
  IconImage,
  IconUser,
  IconRss,
  IconCheck,
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
  const [topPage, setTopPage] = useState(1);
  const [topTotalPages, setTopTotalPages] = useState(1);
  const [topLoading, setTopLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // One-time initial load — Featured TV + Featured Films + first page of Top
  // Rated. Subsequent Top Rated pages are fetched by the effect below.
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

  // Fetch the requested page of the All-Time Top Rated grid. We cap at 10
  // pages × 20 items = 200 entries which is a sensible upper bound for a
  // home page browse experience.
  useEffect(() => {
    let cancelled = false;
    async function loadTop() {
      try {
        setTopLoading(true);
        const { items, pagination } = await getTopAnime(20, topPage);
        if (cancelled) return;
        setTopList(items);
        setTopTotalPages(Math.min(10, pagination?.last_visible_page ?? 1));
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setTopLoading(false);
      }
    }
    loadTop();
    return () => {
      cancelled = true;
    };
  }, [topPage]);

  // Smooth-scroll the section into view when paginating so the user sees the
  // new page without having to scroll back up.
  const topSectionRef = useRef(null);
  const onTopPageChange = (p) => {
    setTopPage(p);
    topSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Hero posters={topList} />

      <QuickJumpChips />

      <CharacterCircleRail />

      <BestOfAllTimeSlider />

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
          viewAllTo="/top?type=tv"
          count={tv.length || 10}
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

      <FeatureBento />

      {showFilms && (
        <Section
          eyebrow="Editor's List"
          eyebrowColor="text-cyan-400"
          title="Top Films"
          subtitle="From Ghibli classics to cyberpunk landmarks."
          viewAllTo="/top?type=movie"
          count={films.length || 6}
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

      <ScenePromoBanner posters={topList} />

      <div ref={topSectionRef}>
        <Section
          eyebrow="Live from MyAnimeList"
          eyebrowColor="text-lime-400"
          title="All-Time Top Rated"
          subtitle="Streamed live via the Jikan API."
          viewAllTo="/top"
          count={topTotalPages > 1 ? `${topPage} / ${topTotalPages}` : null}
        >
          {topLoading ? (
            <SkeletonGrid />
          ) : (
            <Grid>
              {topList.map((a) => (
                <AnimeCard key={a.mal_id} anime={a} />
              ))}
            </Grid>
          )}
          <Pagination
            page={topPage}
            totalPages={topTotalPages}
            onChange={onTopPageChange}
          />
        </Section>
      </div>
    </div>
  );
}

function Hero({ posters = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const heroRef = useRef(null);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // GSAP entrance timeline + count-up on stats.
  useEffect(() => {
    if (!heroRef.current) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tl.from("[data-hero='badge']", { y: 16, opacity: 0, duration: 0.5 })
        .from(
          "[data-hero='title']",
          { y: 24, opacity: 0, duration: 0.9 },
          "-=0.2"
        )
        .from(
          "[data-hero='subtitle']",
          { y: 16, opacity: 0, duration: 0.6 },
          "-=0.5"
        )
        .from(
          "[data-hero='search']",
          { y: 16, opacity: 0, scale: 0.98, duration: 0.6 },
          "-=0.35"
        )
        .from(
          "[data-hero='cta']",
          { y: 14, opacity: 0, stagger: 0.08, duration: 0.5 },
          "-=0.35"
        )
        .from(
          "[data-hero='stat']",
          { y: 18, opacity: 0, stagger: 0.1, duration: 0.5 },
          "-=0.3"
        )
        .from(
          "[data-hero='spotlight']",
          { x: 40, opacity: 0, scale: 0.96, duration: 0.9 },
          "-=0.8"
        );

      // Count-up: animate the dataset.value from 0 to target.
      heroRef.current
        .querySelectorAll("[data-countup]")
        ?.forEach((el) => {
          const target = Number(el.dataset.countup) || 0;
          const suffix = el.dataset.suffix || "";
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            delay: 0.6,
            onUpdate() {
              el.textContent =
                Math.round(obj.val).toLocaleString() + suffix;
            },
          });
        });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative isolate overflow-hidden rounded-2xl ring-1 ring-zinc-800/80 sm:rounded-3xl"
      style={{ perspective: "1400px" }}
    >
      {/* CSS-3D backdrop (rotating wireframe shapes + receding floor grid) */}
      <Hero3DBackdrop />

      {/* Multi-color background blobs */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0f0c1d] to-black" />
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-500/30 blur-[120px] motion-safe:animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 left-1/3 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/20 blur-[140px] motion-safe:animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[120px] motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />
        <div className="absolute right-1/3 -top-16 h-64 w-64 rounded-full bg-amber-400/15 blur-[100px] motion-safe:animate-[pulse_11s_ease-in-out_infinite]" />
        <div className="absolute left-10 bottom-10 h-56 w-56 rounded-full bg-lime-400/10 blur-[100px] motion-safe:animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-500/60 via-cyan-400/60 to-amber-400/60" />
      </div>

      {/* Content grid — text on left, spotlight on right (lg+) */}
      <div className="relative grid gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:gap-12 lg:px-12 lg:py-20 lg:items-center">
        <div className="max-w-2xl">
          <div
            data-hero="badge"
            className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-gradient-to-r from-lime-400/15 via-emerald-400/10 to-cyan-400/10 py-1 pl-1 pr-3 text-[11px] font-semibold text-lime-100 backdrop-blur sm:text-xs"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-lime-200 ring-1 ring-lime-400/40">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-80" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-300" />
              </span>
              Live
            </span>
            <span>Data from MyAnimeList</span>
            <span aria-hidden className="text-zinc-600">·</span>
            <span className="text-zinc-400">Updated just now</span>
          </div>

          <h1
            data-hero="title"
            className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[5.25rem]"
          >
            The{" "}
            <span className="relative inline-block">
              <span className="text-funk-gradient">IMDB</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500 to-cyan-400/0" />
            </span>{" "}
            for{" "}
            <RotatingWord
              words={["Anime.", "Scenes.", "Movies.", "Stories."]}
            />
          </h1>

          <p
            data-hero="subtitle"
            className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300/90 sm:mt-6 sm:text-lg"
          >
            Browse top-rated series, dive into episode-by-episode breakdowns,
            and explore a curated catalog of the medium&apos;s most iconic
            scenes.
          </p>

          <form
            data-hero="search"
            onSubmit={onSearch}
            className="group mt-7 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-1.5 pl-3 shadow-xl shadow-black/40 backdrop-blur transition focus-within:border-fuchsia-400/60 focus-within:ring-2 focus-within:ring-fuchsia-400/20 sm:pl-4"
          >
            <IconSearch className="h-5 w-5 shrink-0 text-zinc-400 transition group-focus-within:text-fuchsia-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime, characters, scenes…"
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:text-base"
            />
            <kbd
              aria-hidden
              className="mr-1 hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 sm:inline-block"
            >
              Enter
            </kbd>
            <button type="submit" className="btn btn-primary shrink-0">
              <span className="hidden sm:inline">Search</span>
              <IconChevronRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            <Link
              data-hero="cta"
              to="/top"
              className="btn group border border-amber-400/40 bg-amber-400/10 text-amber-100 hover:border-amber-400/70 hover:bg-amber-400/20 hover:text-amber-50"
            >
              <IconTrendUp className="h-4 w-4 text-amber-300" />
              Browse Top 100
              <IconChevronRight className="h-4 w-4 -translate-x-0.5 text-amber-300/70 transition group-hover:translate-x-0 group-hover:text-amber-200" />
            </Link>
            <Link
              data-hero="cta"
              to="/scenes"
              className="btn group border border-rose-400/40 bg-rose-500/10 text-rose-100 hover:border-rose-400/70 hover:bg-rose-500/20 hover:text-rose-50"
            >
              <IconPlay className="h-4 w-4 text-rose-300" />
              Scene Catalog
            </Link>
            <Link
              data-hero="cta"
              to="/stories"
              className="btn group border border-cyan-400/40 bg-cyan-400/10 text-cyan-100 hover:border-cyan-400/70 hover:bg-cyan-400/20 hover:text-cyan-50"
            >
              <IconPlay className="h-4 w-4 text-cyan-300" />
              Stories
            </Link>
          </div>

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-800/40 sm:mt-10">
            <Stat
              dataAttr="stat"
              label="Titles indexed"
              target={12500}
              suffix="+"
              accent="text-fuchsia-300"
            />
            <Stat
              dataAttr="stat"
              label="Ratings live"
              target={4000000}
              format="compact"
              suffix="+"
              accent="text-cyan-300"
            />
            <Stat
              dataAttr="stat"
              label="Scenes curated"
              target={820}
              suffix="+"
              accent="text-lime-300"
            />
          </dl>
        </div>

        {/* Right column: featured spotlight (lg+ only) */}
        <div
          data-hero="spotlight"
          className="hidden lg:block"
          style={{ transformStyle: "preserve-3d" }}
        >
          <FeaturedSpotlight items={posters.slice(0, 6)} />
        </div>
      </div>

      {/* Bottom marquee ticker — always visible */}
      <TrendingTicker items={posters} />
    </section>
  );
}

function RotatingWord({ words = [], interval = 2800 }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (words.length <= 1) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % words.length;
        if (ref.current && !reduced) {
          gsap.fromTo(
            ref.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
          );
        }
        return next;
      });
    }, interval);
    return () => clearInterval(t);
  }, [words, interval]);

  return (
    <span
      ref={ref}
      className="inline-block text-funk-warm"
      style={{ willChange: "transform" }}
    >
      {words[idx]}
    </span>
  );
}

function Stat({ label, target, suffix = "", format, accent = "text-white", dataAttr }) {
  // Pre-render with the final value so non-animated visitors (or reduced-motion)
  // still see the numbers immediately. The GSAP timeline replaces textContent.
  const display =
    format === "compact"
      ? new Intl.NumberFormat("en", { notation: "compact" }).format(target) + suffix
      : Number(target).toLocaleString() + suffix;
  return (
    <div
      data-hero={dataAttr}
      className="bg-zinc-950/60 px-3 py-3 text-center backdrop-blur sm:px-6 sm:py-4"
    >
      <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-[11px]">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-lg font-bold tabular-nums sm:mt-1 sm:text-2xl ${accent}`}
        data-countup={target}
        data-suffix={suffix}
      >
        {display}
      </dd>
    </div>
  );
}

function FeaturedSpotlight({ items = [] }) {
  const [idx, setIdx] = useState(0);
  const tiltRef = useMouseTilt({ max: 10 });

  // Auto-advance every 5s. Pause when document is hidden to save power.
  useEffect(() => {
    if (items.length <= 1) return undefined;
    const advance = () => setIdx((i) => (i + 1) % items.length);
    const t = setInterval(() => {
      if (!document.hidden) advance();
    }, 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-zinc-900/60 ring-1 ring-zinc-800" />
    );
  }

  const a = items[idx];
  const img =
    a?.images?.webp?.large_image_url ??
    a?.images?.jpg?.large_image_url ??
    a?.images?.webp?.image_url ??
    a?.images?.jpg?.image_url;
  const score = a?.score ? Number(a.score).toFixed(1) : null;
  const rank = a?.rank;
  const year = a?.year || a?.aired?.prop?.from?.year;
  const type = a?.type || "TV";

  return (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      {/* Glow halo behind card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 scale-110 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/30 blur-3xl"
      />
      <div
        ref={tiltRef}
        className="relative overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ring-white/10"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Editor's pick label */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/50 bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-fuchsia-200 backdrop-blur"
        >
          <IconStar className="h-3 w-3 fill-fuchsia-300 text-fuchsia-300" />
          Now Featured
        </div>

        {/* Poster — keyed by idx so React unmounts & remounts for a clean swap */}
        <Link
          key={a.mal_id}
          to={`/anime/${a.mal_id}`}
          className="block aspect-[3/4] w-full"
        >
          {img && (
            <img
              src={img}
              alt={a.title || ""}
              loading="eager"
              decoding="async"
              fetchpriority="high"
              width="420"
              height="560"
              className="h-full w-full object-cover animate-[fadeIn_700ms_ease-out]"
            />
          )}
        </Link>

        {/* Bottom info gradient overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {rank && (
              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-bold text-amber-300 ring-1 ring-amber-500/40">
                #{rank}
              </span>
            )}
            {score && (
              <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-500/20 px-1.5 py-0.5 font-bold text-fuchsia-200 ring-1 ring-fuchsia-500/40">
                <IconStar className="h-3 w-3 fill-fuchsia-300 text-fuchsia-300" />
                {score}
              </span>
            )}
            <span className="rounded-md bg-cyan-500/15 px-1.5 py-0.5 font-bold text-cyan-200 ring-1 ring-cyan-500/30">
              {type}
            </span>
            {year && (
              <span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 font-bold text-zinc-300 ring-1 ring-zinc-700">
                {year}
              </span>
            )}
          </div>
          <Link
            to={`/anime/${a.mal_id}`}
            className="mt-2 line-clamp-2 block text-lg font-black leading-tight text-white hover:text-fuchsia-300 sm:text-xl"
          >
            {a.title_english || a.title}
          </Link>
          {a.genres?.[0]?.name && (
            <p className="mt-1 text-[11px] text-zinc-400">
              {a.genres
                .slice(0, 3)
                .map((g) => g.name)
                .join(" · ")}
            </p>
          )}
        </div>

        {/* Rotation indicator dots */}
        <div
          aria-hidden
          className="absolute right-4 top-4 z-20 flex flex-col gap-1.5"
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Show featured ${i + 1}`}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === idx
                  ? "h-4 bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]"
                  : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function TrendingTicker({ items = [] }) {
  if (!items.length) return null;
  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...items, ...items];
  return (
    <div className="relative border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-zinc-950 to-transparent" />
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-rose-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-300 ring-1 ring-rose-500/30">
          <span aria-hidden>🔥</span> Trending
        </span>
        <div className="relative flex-1 overflow-hidden">
          <ul className="hero-marquee flex w-max items-center gap-6">
            {loop.map((a, i) => {
              const img =
                a.images?.webp?.image_url ?? a.images?.jpg?.image_url;
              return (
                <li key={`${a.mal_id}-${i}`}>
                  <Link
                    to={`/anime/${a.mal_id}`}
                    className="group inline-flex items-center gap-2 text-xs"
                  >
                    {img && (
                      <span className="h-7 w-7 shrink-0 overflow-hidden rounded-md ring-1 ring-zinc-800">
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width="28"
                          height="28"
                          className="h-full w-full object-cover"
                        />
                      </span>
                    )}
                    <span className="whitespace-nowrap font-semibold text-zinc-200 transition group-hover:text-fuchsia-300">
                      {a.title_english || a.title}
                    </span>
                    {a.score && (
                      <span className="inline-flex items-center gap-0.5 text-amber-400">
                        <IconStar className="h-3 w-3 fill-current" />
                        {Number(a.score).toFixed(1)}
                      </span>
                    )}
                    <span aria-hidden className="text-zinc-700">·</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <style>{`
        @keyframes heroMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-marquee {
          animation: heroMarquee 45s linear infinite;
          will-change: transform;
        }
        .hero-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hero-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Section({
  eyebrow,
  eyebrowColor = "text-brand-500",
  title,
  subtitle,
  viewAllTo,
  count,
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.from(entry.target.querySelectorAll("[data-reveal]"), {
            y: 24,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
          });
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pull the accent name out of e.g. "text-fuchsia-400" so we can theme the divider line.
  const accentName = eyebrowColor.replace(/^text-/, "").split("-")[0];
  const dividerVia = {
    fuchsia: "via-fuchsia-500/60",
    cyan: "via-cyan-400/60",
    lime: "via-lime-400/60",
    amber: "via-amber-400/60",
    violet: "via-violet-500/60",
    rose: "via-rose-400/60",
  }[accentName] ?? "via-zinc-700/60";
  // Static class lookup (Tailwind JIT can't read dynamic strings) for the count badge.
  const countBadge = {
    fuchsia: "bg-fuchsia-500/15 ring-fuchsia-400/30",
    cyan: "bg-cyan-400/15 ring-cyan-400/30",
    lime: "bg-lime-400/15 ring-lime-400/30",
    amber: "bg-amber-400/15 ring-amber-400/30",
    violet: "bg-violet-500/15 ring-violet-400/30",
    rose: "bg-rose-400/15 ring-rose-400/30",
  }[accentName] ?? "bg-zinc-800/80 ring-zinc-700";

  return (
    <section ref={ref} className="mt-14 sm:mt-20">
      <div
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
        data-reveal
      >
        <div className="min-w-0">
          {eyebrow && (
            <p
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${eyebrowColor} ${countBadge}`}
            >
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
              </span>
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2 flex flex-wrap items-baseline gap-2 text-2xl font-bold text-white sm:text-3xl">
            {title}
            {count != null && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${countBadge} ${eyebrowColor}`}
              >
                {typeof count === "number" ? count.toLocaleString() : count}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full border border-zinc-700/80 bg-zinc-900/70 px-4 py-2 text-xs font-bold text-zinc-200 backdrop-blur transition hover:border-fuchsia-400/50 hover:bg-zinc-800 hover:text-white hover:shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.97]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
            <span className="relative">View all</span>
            <IconChevronRight className="relative h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" />
          </Link>
        )}
      </div>
      <div
        aria-hidden
        className={`mb-6 h-px w-full bg-gradient-to-r from-transparent ${dividerVia} to-transparent`}
        data-reveal
      />
      <div data-reveal>{children}</div>
    </section>
  );
}

function QuickJumpChips() {
  // Static, full class strings only — Tailwind's JIT can't expand interpolated
  // class names, so each chip carries its own complete set of utilities.
  const chips = [
    {
      label: "Top 100",
      to: "/top",
      icon: <IconStar className="h-3.5 w-3.5" />,
      cls:
        "ring-amber-400/30 text-amber-200 bg-amber-400/10 hover:bg-amber-400/15 hover:ring-amber-400/60 hover:shadow-[0_0_18px_-6px_rgba(251,191,36,0.55)] focus-visible:ring-amber-400/70",
    },
    {
      label: "Movies",
      to: "/top?type=movie",
      icon: <IconImage className="h-3.5 w-3.5" />,
      cls:
        "ring-cyan-400/30 text-cyan-200 bg-cyan-400/10 hover:bg-cyan-400/15 hover:ring-cyan-400/60 hover:shadow-[0_0_18px_-6px_rgba(34,211,238,0.55)] focus-visible:ring-cyan-400/70",
    },
    {
      label: "Scenes",
      to: "/scenes",
      icon: <IconPlay className="h-3.5 w-3.5" />,
      cls:
        "ring-rose-400/30 text-rose-200 bg-rose-400/10 hover:bg-rose-400/15 hover:ring-rose-400/60 hover:shadow-[0_0_18px_-6px_rgba(251,113,133,0.55)] focus-visible:ring-rose-400/70",
    },
    {
      label: "Stories",
      to: "/stories",
      icon: <IconPlay className="h-3.5 w-3.5" />,
      cls:
        "ring-fuchsia-400/30 text-fuchsia-200 bg-fuchsia-400/10 hover:bg-fuchsia-400/15 hover:ring-fuchsia-400/60 hover:shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)] focus-visible:ring-fuchsia-400/70",
    },
    {
      label: "Characters",
      to: "/characters",
      icon: <IconUser className="h-3.5 w-3.5" />,
      cls:
        "ring-violet-400/30 text-violet-200 bg-violet-400/10 hover:bg-violet-400/15 hover:ring-violet-400/60 hover:shadow-[0_0_18px_-6px_rgba(167,139,250,0.55)] focus-visible:ring-violet-400/70",
    },
    {
      label: "Voice Actors",
      to: "/voice-actors",
      icon: <IconUser className="h-3.5 w-3.5" />,
      cls:
        "ring-sky-400/30 text-sky-200 bg-sky-400/10 hover:bg-sky-400/15 hover:ring-sky-400/60 hover:shadow-[0_0_18px_-6px_rgba(56,189,248,0.55)] focus-visible:ring-sky-400/70",
    },
    {
      label: "Categories",
      to: "/categories",
      icon: <IconGrid className="h-3.5 w-3.5" />,
      cls:
        "ring-lime-400/30 text-lime-200 bg-lime-400/10 hover:bg-lime-400/15 hover:ring-lime-400/60 hover:shadow-[0_0_18px_-6px_rgba(163,230,53,0.55)] focus-visible:ring-lime-400/70",
    },
    {
      label: "Community",
      to: "/community",
      icon: <IconHeart className="h-3.5 w-3.5" />,
      cls:
        "ring-pink-400/30 text-pink-200 bg-pink-400/10 hover:bg-pink-400/15 hover:ring-pink-400/60 hover:shadow-[0_0_18px_-6px_rgba(244,114,182,0.55)] focus-visible:ring-pink-400/70",
    },
  ];
  return (
    <nav
      aria-label="Quick navigation"
      className="-mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
        {chips.map((c) => (
          <li key={c.label}>
            <Link
              to={c.to}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold ring-1 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${c.cls}`}
            >
              {c.icon}
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------------
 *  FeatureBento
 *  -----------
 *  Editorial-style bento grid that sells what AnimeDB actually does. Each card
 *  is themed end-to-end (icon, eyebrow chip, stat strip, decorative graphic,
 *  CTA) and the layout breaks out of the 4-equal-column rhythm on lg+ into a
 *  proper bento: wide / narrow / narrow / wide.
 *
 *  Performance: all decorations are pure CSS / inline SVG, no images, no JS
 *  runtime cost. Respects `prefers-reduced-motion` via the CSS rules below.
 * ----------------------------------------------------------------------- */

// Per-accent static class strings — Tailwind's JIT can't see template-built
// class names, so every variant has to spell out the full class up front.
const BENTO_ACCENTS = {
  fuchsia: {
    ring: "hover:ring-fuchsia-400/60",
    glow:
      "from-fuchsia-500/25 via-fuchsia-500/0",
    iconBg:
      "bg-gradient-to-br from-fuchsia-500/25 to-fuchsia-500/5 text-fuchsia-200 ring-fuchsia-400/40 shadow-[0_8px_30px_-12px_rgba(232,121,249,0.55)]",
    eyebrow:
      "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
    statRing: "ring-fuchsia-400/30",
    statText: "text-fuchsia-100",
    cta: "text-fuchsia-200 group-hover:text-fuchsia-100",
    underline:
      "bg-gradient-to-r from-fuchsia-400 via-fuchsia-300 to-fuchsia-400",
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
    underline:
      "bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400",
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
    underline:
      "bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400",
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
    underline:
      "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400",
    cornerGrad: "from-amber-400/30 to-transparent",
  },
};

function FeatureBento() {
  const features = [
    {
      key: "scenes",
      eyebrow: "01 · Catalog",
      title: "Curated scene catalog",
      desc:
        "Hand-picked iconic moments — fights, plot twists, animation showcases — every entry tagged with episode, timestamp, and severity.",
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
      desc:
        "Scores, ranks, and member counts stream live from the Jikan API — never stale, never seeded by hand.",
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
      desc:
        "Every character and every voice actor, deep-linked back to the anime they appear in.",
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
      desc:
        "Opening themes, EDs, music videos and promos — TikTok-style vertical player baked right in.",
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
      {/* Section header */}
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

      {/* Bento grid — 12-col on lg gives true asymmetry (7/5, 5/7) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {features.map((f) => (
          <BentoCard key={f.key} feature={f} />
        ))}
      </div>

      {/* Card-local CSS — keeps decorations off the main bundle's hot path */}
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
      {/* Soft corner glow that brightens on hover */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${a.cornerGrad} blur-3xl transition duration-500 group-hover:scale-125`}
      />
      {/* Faint rainbow rim revealed on hover */}
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

      {/* Per-card themed decoration */}
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

/* -------------------------------------------------------------------------
 *  Per-card decorative graphics
 *  ----------------------------
 *  Each one is themed to the feature it sits on:
 *    • SceneDeco   — scene-row chips with severity dots + a scrubber timeline
 *    • RatingsDeco — animated sparkline + live score badge
 *    • CastDeco    — overlapping circular avatar gradients
 *    • ReelsDeco   — TikTok-style 9:16 phone frame with play overlay
 * ----------------------------------------------------------------------- */

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
      {/* Scrubber timeline */}
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
  // Hand-crafted sparkline polyline — gentle uphill drift to suggest "trending"
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
        {/* Faint grid */}
        <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,0.04)" />
        <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.04)" />
        {/* Area under curve */}
        <path
          d="M0,46 L20,42 L40,44 L60,36 L80,38 L100,30 L120,26 L140,22 L160,18 L180,12 L200,8 L200,60 L0,60 Z"
          fill="url(#bento-spark-fill)"
        />
        {/* Line */}
        <path
          d="M0,46 L20,42 L40,44 L60,36 L80,38 L100,30 L120,26 L140,22 L160,18 L180,12 L200,8"
          fill="none"
          stroke="#67e8f9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pulse dot at tip */}
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
  // Overlapping circular gradient avatars — fake but charismatic.
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
  // 9:16 phone mockup with progress bars + play CTA
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[92px] w-[58px] shrink-0 overflow-hidden rounded-[14px] bg-gradient-to-br from-zinc-800 to-zinc-950 ring-2 ring-zinc-700 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]">
        {/* Reel "video" gradient with a play glyph */}
        <div
          aria-hidden
          className="absolute inset-1 rounded-[10px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.55), transparent 55%), radial-gradient(circle at 70% 70%, rgba(232,121,249,0.45), transparent 55%), linear-gradient(160deg, #1a0b2e, #0a0814)",
          }}
        />
        {/* Notch */}
        <span className="absolute left-1/2 top-1 h-1 w-6 -translate-x-1/2 rounded-full bg-zinc-700" />
        {/* Play */}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            <IconPlay className="h-3 w-3 text-zinc-900" />
          </span>
        </span>
        {/* Progress segment bar (TikTok-style story dots) */}
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
              className={`bento-bar block h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500`}
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

function ScenePromoBanner({ posters = [] }) {
  const sample = posters.slice(0, 4);
  return (
    <section className="mt-16 sm:mt-20">
      <div className="relative isolate overflow-hidden rounded-2xl ring-1 ring-zinc-800 sm:rounded-3xl">
        {/* Background */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950/60 via-zinc-950 to-fuchsia-950/60" />
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-500/30 blur-[100px]" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-[100px]" />
        </div>

        {/* Decorative side posters */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 lg:block"
        >
          {sample.map((a, i) => {
            const img =
              a.images?.webp?.large_image_url ??
              a.images?.jpg?.large_image_url;
            const styles = [
              "right-8 top-6 w-32 -rotate-6",
              "right-32 top-16 w-36 rotate-3 z-10",
              "right-4 bottom-6 w-32 -rotate-3 z-20",
              "right-44 bottom-12 w-28 rotate-6",
            ];
            return (
              <div
                key={a.mal_id ?? i}
                className={`absolute ${styles[i]} aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ring-white/10`}
              >
                {img && (
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="160"
                    height="240"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="relative max-w-2xl px-6 py-10 sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-300">
            <span aria-hidden>●</span> 18+ Scene Catalog
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Every iconic moment,{" "}
            <span className="text-funk-warm">timestamped</span>.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
            From fight choreography to plot-shifting reveals — our curated
            archive tags each scene with episode, timestamp, severity, and an
            editorial blurb. Click any entry to jump to the trailer.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/scenes"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:opacity-95"
            >
              <IconPlay className="h-4 w-4" />
              Open Scene Catalog
            </Link>
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
            >
              Watch Reels
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
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
          className="relative flex gap-3 overflow-hidden rounded-2xl bg-zinc-900/60 p-3 ring-1 ring-zinc-800 sm:gap-4 sm:p-4"
        >
          <span
            aria-hidden
            className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-zinc-700 via-zinc-600 to-zinc-700 opacity-50"
          />
          <div className="aspect-[2/3] w-24 animate-pulse rounded-lg bg-zinc-800 sm:w-28" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="mt-1 flex gap-1.5">
              <div className="h-4 w-14 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-4 w-14 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-4 w-10 animate-pulse rounded-md bg-zinc-800" />
            </div>
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800" />
            <div className="mt-auto h-3 w-24 animate-pulse rounded bg-zinc-800" />
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
