import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AnimeCard from "../components/AnimeCard.jsx";
import FeaturedCard from "../components/FeaturedCard.jsx";
import Pagination from "../components/Pagination.jsx";
import useMouseTilt from "../hooks/useMouseTilt.js";

// GSAP is dynamic-imported inside effects below (~35KB gzip off the initial
// bundle). The page renders + becomes interactive without it; entrance
// animations kick in once the chunk arrives ~one frame later.

// Below-the-fold / decorative components â€” defer to a separate chunk so they
// don't block the first paint. Each gets a zero-CLS skeleton fallback so the
// page never jumps when the chunk arrives.
const Hero3DBackdrop = lazy(() =>
  import("../components/Hero3DBackdrop.jsx")
);
const BestOfAllTimeSlider = lazy(() =>
  import("../components/BestOfAllTimeSlider.jsx")
);
const CharacterCircleRail = lazy(() =>
  import("../components/CharacterCircleRail.jsx")
);
// FeatureBento is purely decorative and well below the fold â€” defer its
// ~13kB of JSX + per-card decoration SVGs to a separate chunk so the home
// page's main bundle stays slim.
const FeatureBento = lazy(() => import("../components/FeatureBento.jsx"));
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
import SEED_TOP_MOVIES from "../data/topMovies.json";
import { resolveFromTitles, getTopAnime } from "../services/jikan.js";
import featured from "../data/featuredTitles.json";
import SEED_TOP_ANIME from "../data/topAnimeList.json";

// Synthesise an "editorial-only" anime object so the Landing page can render
// Featured TV / Films instantly from the JSON file â€” no waiting on Jikan.
// The API-enriched object replaces this in-place once the network request
// resolves, but if Jikan is down the user still sees the curated content.
function editorialSeed(entry) {
  const poster = entry.cached_poster ?? null;
  const posterLarge = entry.cached_poster_large ?? poster;
  const hasCached = Boolean(poster);
  return {
    mal_id: entry.mal_id ?? `editorial-${entry.title}`,
    title: entry.cached_title ?? entry.title,
    title_english: entry.cached_title_english ?? entry.title,
    images: {
      webp: { image_url: poster, large_image_url: posterLarge },
      jpg: { image_url: poster, large_image_url: posterLarge },
    },
    score: entry.cached_score ?? null,
    episodes: entry.cached_episodes ?? null,
    year: entry.cached_year ?? null,
    type: entry.cached_type ?? null,
    genres: entry.cached_genres ?? [],
    _editorial: entry,
    _placeholder: !hasCached,
  };
}

const INITIAL_TV = (featured.tv ?? []).map(editorialSeed);
const INITIAL_FILMS = (featured.films ?? []).map(editorialSeed);

export default function Landing() {
  const [params] = useSearchParams();
  const typeFilter = params.get("type");
  const showTv = !typeFilter || typeFilter === "tv";
  const showFilms = !typeFilter || typeFilter === "movie";
  // Seed with editorial-only entries so the cards paint on first render even
  // before Jikan responds (or if it's completely down). The async fetch below
  // replaces these with API-enriched copies as data arrives.
  const [tv, setTv] = useState(INITIAL_TV);
  const [films, setFilms] = useState(INITIAL_FILMS);
  // Seed the "Top Rated" grid from the baked JSON so it paints instantly on
  // first visit. The live API still fires below and replaces page 1 with
  // fresh data; other pages do a real fetch with a loading state.
  const [topList, setTopList] = useState(SEED_TOP_ANIME);
  const [topPage, setTopPage] = useState(1);
  const [topTotalPages, setTopTotalPages] = useState(10);
  const [topLoading, setTopLoading] = useState(false);
  // `loading` here means "still waiting on the first enrichment pass" â€” the
  // sections themselves are already visible. We only show skeleton placeholders
  // for the parts that depend purely on the live API (e.g. Top Rated grid).
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // One-time initial load â€” enrich the seeded Featured TV + Films with live
  // Jikan data (posters, scores, episode counts, genres). Failures fall back
  // to the seed objects so cards never disappear.
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const [tvData, filmData] = await Promise.all([
          resolveFromTitles(featured.tv ?? []),
          resolveFromTitles(featured.films ?? []),
        ]);
        if (cancelled) return;
        if (tvData.length) setTv(tvData);
        if (filmData.length) setFilms(filmData);
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
  // pages × 20 items = 200 entries — a sensible upper bound for the home
  // page browse experience.
  useEffect(() => {
    let cancelled = false;
    // Page 1 is pre-seeded so we can refresh silently. For any other page
    // (or when returning to page 1 after viewing page 2+) we must reset the
    // list before fetching so users don't see the previous page's tiles
    // briefly mislabelled as page N.
    if (topPage === 1) {
      setTopList(SEED_TOP_ANIME);
    } else {
      setTopList([]);
      setTopLoading(true);
    }

    async function loadTop() {
      try {
        const { items, pagination } = await getTopAnime(20, topPage);
        if (cancelled) return;
        if (items && items.length) setTopList(items);
        if (pagination?.last_visible_page) {
          setTopTotalPages(Math.min(10, pagination.last_visible_page));
        }
      } catch (e) {
        if (!cancelled && topPage !== 1) setError(e.message);
      } finally {
        if (!cancelled && topPage !== 1) setTopLoading(false);
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
    <div className="page-container py-10">
      <Hero posters={topList} />

      <QuickJumpChips />

      <TopMovieChips />

      <Suspense
        fallback={
          <div
            aria-hidden
            className="mt-12 h-32 animate-pulse rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-900"
          />
        }
      >
        <CharacterCircleRail />
      </Suspense>

      <Suspense
        fallback={
          <div
            aria-hidden
            className="mt-12 h-72 animate-pulse rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-900"
          />
        }
      >
        <BestOfAllTimeSlider />
      </Suspense>

      {/* Only show the error banner when we have nothing at all to display.
          The Jikan service falls back to stale cache on 429/network errors,
          so partial data is the common case and shouldn't alarm the user. */}
      {error && tv.length === 0 && films.length === 0 && topList.length === 0 && (
        <div
          role="alert"
          className="mt-8 flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
        >
          <span>
            <strong className="font-bold">Couldn&apos;t reach MyAnimeList just now.</strong>{" "}
            <span className="text-amber-200/80">{error}</span>
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shrink-0 rounded-md border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-50 transition hover:bg-amber-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {showTv && (
        <Section
          eyebrow="Editor's List"
          eyebrowColor="text-fuchsia-400"
          title="Top 10 TV Series"
          subtitle="Hand-picked entries â€” every series ranked. Live ratings from MyAnimeList."
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

      <Suspense
        fallback={
          <div
            aria-hidden
            className="mt-16 h-96 animate-pulse rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-900 sm:mt-20"
          />
        }
      >
        <FeatureBento />
      </Suspense>

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

const HERO_QUICK_SEARCHES = [
  "One Piece",
  "Demon Slayer",
  "Frieren",
  "Jujutsu Kaisen",
  "Chainsaw Man",
];

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

  // GSAP entrance timeline + count-up on stats. GSAP is dynamic-imported so
  // it doesn't block the initial render â€” the page is interactive first and
  // the entrance animation kicks in once the chunk arrives.
  useEffect(() => {
    if (!heroRef.current) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    let ctx;
    let cancelled = false;
    import("gsap").then(({ default: gsap }) => {
      if (cancelled || !heroRef.current) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.8 },
        });
        // Use fromTo() (not from()) so that the explicit END state always
        // wins â€” otherwise React 18's strict-mode double-invoke can call
        // ctx.revert() mid-tween and leave elements stuck at opacity:0.
        tl.fromTo(
            "[data-hero='badge']",
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 }
          )
          .fromTo(
            "[data-hero='title']",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9 },
            "-=0.2"
          )
          .fromTo(
            "[data-hero='subtitle']",
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            "-=0.5"
          )
          .fromTo(
            "[data-hero='search']",
            { y: 16, opacity: 0, scale: 0.98 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6 },
            "-=0.35"
          )
          .fromTo(
            "[data-hero='cta']",
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 },
            "-=0.35"
          )
          .fromTo(
            "[data-hero='stat']",
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
            "-=0.3"
          )
          .fromTo(
            "[data-hero='spotlight']",
            { x: 40, opacity: 0, scale: 0.96 },
            { x: 0, opacity: 1, scale: 1, duration: 0.9 },
            "-=0.8"
          );

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
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative isolate overflow-hidden rounded-2xl ring-1 ring-zinc-800/80 sm:rounded-3xl"
      style={{ perspective: "1400px" }}
    >
      {/* CSS-3D backdrop (rotating wireframe shapes + receding floor grid).
          Loaded lazily â€” purely decorative, so it can pop in after first paint. */}
      <Suspense fallback={null}>
        <Hero3DBackdrop />
      </Suspense>

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

      {/* Content grid â€” text on left, spotlight on right (lg+).
          On bigger viewports the spotlight column grows so it doesn't look
          marooned in a sea of headline whitespace. */}
      <div className="relative grid gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_minmax(0,440px)] lg:gap-12 lg:px-12 lg:py-20 lg:items-center xl:grid-cols-[1.15fr_minmax(0,500px)] 2xl:grid-cols-[1.2fr_minmax(0,620px)]">
        <div className="max-w-2xl">
          {/* Top status strip â€” two pills side by side: live data + this week */}
          <div
            data-hero="badge"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-gradient-to-r from-lime-400/15 via-emerald-400/10 to-cyan-400/10 py-1 pl-1 pr-3 text-[11px] font-semibold text-lime-100 backdrop-blur sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-lime-200 ring-1 ring-lime-400/40">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-300" />
                </span>
                Live
              </span>
              <span>Data from MyAnimeList</span>
              <span aria-hidden className="text-zinc-600">Â·</span>
              <span className="text-zinc-400">Updated just now</span>
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-bold text-fuchsia-100 backdrop-blur sm:inline-flex">
              <IconTrendUp className="h-3 w-3 text-fuchsia-300" />
              <span>
                <span className="text-fuchsia-200">+183</span>{" "}
                <span className="text-zinc-400">new this week</span>
              </span>
            </span>
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
            className="group mt-7 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-1.5 pl-3 shadow-xl shadow-black/40 backdrop-blur transition focus-within:-translate-y-0.5 focus-within:border-fuchsia-400/60 focus-within:shadow-[0_20px_50px_-20px_rgba(232,121,249,0.45)] focus-within:ring-2 focus-within:ring-fuchsia-400/20 sm:pl-4"
          >
            <IconSearch className="h-5 w-5 shrink-0 text-zinc-400 transition group-focus-within:text-fuchsia-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime, characters, scenesâ€¦"
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:text-base"
            />
            <kbd
              aria-hidden
              className="mr-1 hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 sm:inline-block"
            >
              Enter
            </kbd>
            <button
              type="submit"
              className="btn btn-primary shrink-0"
              aria-label="Search"
            >
              <span className="hidden sm:inline">Search</span>
              <IconChevronRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick-search suggestions â€” click to populate */}
          <div
            data-hero="search"
            className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]"
          >
            <span className="font-bold uppercase tracking-[0.16em] text-zinc-500">
              Try
            </span>
            {HERO_QUICK_SEARCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  navigate(`/search?q=${encodeURIComponent(s)}`);
                }}
                className="rounded-full bg-zinc-900/60 px-2.5 py-1 font-semibold text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-fuchsia-200 hover:ring-fuchsia-400/40"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
            <Link
              data-hero="cta"
              to="/top"
              className="btn btn-primary group relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(232,121,249,0.6)]"
            >
              <IconTrendUp className="h-4 w-4" />
              Browse Top 100
              <IconChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition duration-700 group-hover:left-full group-hover:opacity-100"
              />
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
              <IconRss className="h-4 w-4 text-cyan-300" />
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
              accentBar="bg-fuchsia-400"
            />
            <Stat
              dataAttr="stat"
              label="Ratings live"
              target={4000000}
              format="compact"
              suffix="+"
              accent="text-cyan-300"
              accentBar="bg-cyan-400"
            />
            <Stat
              dataAttr="stat"
              label="Scenes curated"
              target={820}
              suffix="+"
              accent="text-lime-300"
              accentBar="bg-lime-400"
            />
          </dl>

          {/* Compact poster strip â€” mobile only (lg- hides the big spotlight) */}
          <div data-hero="stat" className="mt-8 lg:hidden">
            <MobileSpotlightRail items={posters.slice(0, 8)} />
          </div>
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

      {/* Bottom marquee ticker â€” always visible */}
      <TrendingTicker items={posters} />
    </section>
  );
}

function RotatingWord({ words = [], interval = 2800 }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const gsapRef = useRef(null);

  // Cache the GSAP module after first dynamic import so re-rotations are sync.
  useEffect(() => {
    if (words.length <= 1) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    if (!reduced && !gsapRef.current) {
      import("gsap").then(({ default: gsap }) => {
        if (!cancelled) gsapRef.current = gsap;
      });
    }

    const t = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % words.length;
        const gsap = gsapRef.current;
        if (ref.current && !reduced && gsap) {
          gsap.fromTo(
            ref.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
          );
        }
        return next;
      });
    }, interval);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [words, interval]);

  // aria-live so screen readers hear each rotation as the headline updates.
  return (
    <span
      ref={ref}
      aria-live="polite"
      aria-atomic="true"
      className="inline-block text-funk-warm"
      style={{ willChange: "transform" }}
    >
      {words[idx]}
    </span>
  );
}

function Stat({
  label,
  target,
  suffix = "",
  format,
  accent = "text-white",
  accentBar = "bg-zinc-700",
  dataAttr,
}) {
  // Pre-render with the final value so non-animated visitors (or reduced-motion)
  // still see the numbers immediately. The GSAP timeline replaces textContent.
  const display =
    format === "compact"
      ? new Intl.NumberFormat("en", { notation: "compact" }).format(target) + suffix
      : Number(target).toLocaleString() + suffix;
  return (
    <div
      data-hero={dataAttr}
      className="group relative bg-zinc-950/60 px-3 py-3 text-center backdrop-blur transition hover:bg-zinc-950/80 sm:px-6 sm:py-4"
    >
      {/* Thin colored bar at top â€” a tiny tactile detail per-stat */}
      <span
        aria-hidden
        className={`absolute inset-x-3 top-0 h-0.5 rounded-b-full opacity-60 transition group-hover:opacity-100 ${accentBar}`}
      />
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

const SPOTLIGHT_INTERVAL_MS = 5500;

function FeaturedSpotlight({ items = [] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const tiltRef = useMouseTilt({ max: 10 });

  // Auto-advance every ~5.5s. Pause when document is hidden, when the user
  // hovers the spotlight, or when they're using a reduced-motion preference.
  useEffect(() => {
    if (items.length <= 1 || paused) return undefined;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;
    const advance = () => setIdx((i) => (i + 1) % items.length);
    const t = setInterval(() => {
      if (!document.hidden) advance();
    }, SPOTLIGHT_INTERVAL_MS);
    return () => clearInterval(t);
  }, [items.length, paused]);

  if (items.length === 0) {
    return (
      <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-zinc-900/60 ring-1 ring-zinc-800" />
    );
  }

  const a = items[idx];
  const next = items[(idx + 1) % items.length];
  const prev = items[(idx - 1 + items.length) % items.length];

  const pickImg = (x) =>
    x?.images?.webp?.large_image_url ??
    x?.images?.jpg?.large_image_url ??
    x?.images?.webp?.image_url ??
    x?.images?.jpg?.image_url;
  const img = pickImg(a);
  const nextImg = pickImg(next);
  const prevImg = pickImg(prev);

  const score = a?.score ? Number(a.score).toFixed(1) : null;
  const rank = a?.rank;
  const year = a?.year || a?.aired?.prop?.from?.year;
  const type = a?.type || "TV";

  return (
    <div
      className="relative"
      style={{ transformStyle: "preserve-3d" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glow halo behind card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 scale-110 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/30 blur-3xl"
      />

      {/* Back posters â€” collage cards peeking behind the main one. Pure
          decoration: not clickable, hidden from a11y tree. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-8 top-6 hidden h-[88%] w-[68%] rotate-[-7deg] overflow-hidden rounded-3xl opacity-60 shadow-2xl shadow-black/70 ring-1 ring-white/5 transition-transform duration-700 ease-out lg:block"
        style={{ transform: "translateZ(-40px) rotate(-7deg)" }}
      >
        {prevImg && (
          <img
            src={prevImg}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover blur-[1px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/70 via-zinc-950/30 to-transparent" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-2 hidden h-[78%] w-[58%] rotate-[6deg] overflow-hidden rounded-3xl opacity-55 shadow-2xl shadow-black/70 ring-1 ring-white/5 transition-transform duration-700 ease-out lg:block"
        style={{ transform: "translateZ(-60px) rotate(6deg)" }}
      >
        {nextImg && (
          <img
            src={nextImg}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover blur-[1px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-500/10 via-zinc-950/40 to-zinc-950/70" />
      </div>

      {/* Main card */}
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

        {/* Poster â€” keyed so React unmounts & remounts for a clean fade swap */}
        <Link
          key={a.mal_id}
          to={`/anime/${a.mal_id}`}
          className="group/poster block aspect-[3/4] w-full"
          aria-label={`Open ${a.title_english || a.title}`}
        >
          {img && (
            <img
              src={img}
              alt={a.title || ""}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width="420"
              height="560"
              className="h-full w-full object-cover transition-transform duration-700 ease-out animate-[fadeIn_700ms_ease-out] group-hover/poster:scale-[1.04]"
            />
          )}
        </Link>

        {/* Bottom info gradient overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"
        />

        {/* Hover-revealed quick action â€” sits above the gradient, below the meta */}
        <div className="pointer-events-none absolute inset-x-5 bottom-[7.5rem] z-10 flex translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            to={`/anime/${a.mal_id}`}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-zinc-900 shadow-lg shadow-black/40 ring-1 ring-white/30 transition hover:bg-fuchsia-300"
          >
            <IconPlay className="h-3.5 w-3.5" />
            Open details
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

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
                .join(" Â· ")}
            </p>
          )}
        </div>

        {/* Progress + rotation dots â€” top right. Progress key forces a restart
            of the keyframe animation each time idx (or paused state) changes. */}
        <div
          className="absolute right-3 top-3 z-20 flex flex-col items-center gap-2"
        >
          <div className="relative h-9 w-9">
            <svg
              viewBox="0 0 36 36"
              className="h-9 w-9 -rotate-90"
              aria-hidden
            >
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="rgba(9,9,11,0.55)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <circle
                key={`${idx}-${paused}`}
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="rgb(232 121 249)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15.5}
                strokeDashoffset={2 * Math.PI * 15.5}
                className={
                  paused || items.length <= 1
                    ? ""
                    : "hero-spot-progress"
                }
              />
            </svg>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % items.length)}
              aria-label="Next featured"
              className="absolute inset-0 flex items-center justify-center rounded-full text-fuchsia-200 transition hover:text-white"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Show featured ${i + 1}`}
                aria-current={i === idx ? "true" : undefined}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === idx
                    ? "h-4 bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]"
                    : "bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroSpotProgress {
          from { stroke-dashoffset: ${2 * Math.PI * 15.5}px; }
          to   { stroke-dashoffset: 0; }
        }
        .hero-spot-progress {
          animation: heroSpotProgress ${SPOTLIGHT_INTERVAL_MS}ms linear forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-spot-progress { animation: none; }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact horizontal rail of upcoming featured posters â€” shown on small
 * screens where the big spotlight column is hidden. Gives mobile users
 * the same "what's hot now" visual entry point.
 */
function MobileSpotlightRail({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="-mx-1">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-200 ring-1 ring-fuchsia-400/30">
          <IconStar className="h-3 w-3 fill-fuchsia-300 text-fuchsia-300" />
          Featured now
        </span>
        <Link
          to="/top"
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-fuchsia-300 hover:underline"
        >
          See all
          <IconChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((a) => {
          const img =
            a.images?.webp?.image_url ??
            a.images?.jpg?.image_url ??
            a.images?.webp?.large_image_url;
          return (
            <li key={a.mal_id} className="snap-start shrink-0">
              <Link
                to={`/anime/${a.mal_id}`}
                aria-label={a.title_english || a.title}
                className="group block w-28 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-fuchsia-400/50 active:scale-[0.98]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {img && (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width="112"
                      height="149"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  {a.score && (
                    <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded bg-zinc-950/80 px-1 py-0.5 text-[10px] font-extrabold text-amber-300 ring-1 ring-amber-500/40 backdrop-blur">
                      <IconStar className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                      {Number(a.score).toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 px-2 py-1.5 text-[11px] font-semibold text-zinc-200 group-hover:text-fuchsia-200">
                  {a.title_english || a.title}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
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
          <span aria-hidden>ðŸ”¥</span> Trending
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
                    <span aria-hidden className="text-zinc-700">Â·</span>
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
    if (!ref.current) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const el = ref.current;
    let gsapMod = null;
    let cancelled = false;
    import("gsap").then(({ default: gsap }) => {
      if (!cancelled) gsapMod = gsap;
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // If gsap hasn't arrived yet, just unobserve â€” the elements remain
          // in their default visible state. Better than throwing.
          if (gsapMod) {
            gsapMod.fromTo(
              entry.target.querySelectorAll("[data-reveal]"),
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.06,
              }
            );
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
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
  // Static, full class strings only â€” Tailwind's JIT can't expand interpolated
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

// ─── TopMovieChips ───────────────────────────────────────────────────────
// Horizontal slider of the top anime movies. Each chip carries a tiny
// poster + title and links straight to the anime detail page. Seeded from
// the precomputed src/data/topMovies.json so it paints instantly.

function TopMovieChips() {
  if (!SEED_TOP_MOVIES?.length) return null;
  return (
    <section
      aria-label="Top anime movies"
      className="-mx-4 mt-4 px-4 sm:mx-0 sm:px-0"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          <IconImage className="h-3 w-3" />
          Top anime movies
        </p>
        <Link
          to="/top?type=movie"
          className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300 hover:text-cyan-200"
        >
          See all →
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <ul className="flex w-max items-center gap-2 pb-1">
          {SEED_TOP_MOVIES.map((m, idx) => {
            const poster =
              m.images?.webp?.small_image_url ||
              m.images?.jpg?.small_image_url ||
              m.images?.webp?.image_url ||
              "/placeholder.svg";
            const isTop3 = idx < 3;
            return (
              <li key={m.mal_id}>
                <Link
                  to={`/anime/${m.mal_id}`}
                  className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-zinc-900/70 py-1 pl-1 pr-3.5 text-xs font-bold ring-1 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
                    isTop3
                      ? "ring-fuchsia-400/40 text-fuchsia-100 hover:ring-fuchsia-400/70 hover:bg-fuchsia-500/10 hover:shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)]"
                      : "ring-zinc-800 text-zinc-200 hover:ring-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-100"
                  }`}
                  title={m.title}
                >
                  <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700">
                    <img
                      src={poster}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  </span>
                  <span className="line-clamp-1 max-w-[160px] sm:max-w-none">
                    {m.title}
                  </span>
                  {m.score && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-zinc-950/70 px-1.5 py-0.5 text-[9px] font-black tabular-nums text-amber-300 ring-1 ring-amber-400/30">
                      <IconStar className="h-2 w-2" />
                      {m.score.toFixed(1)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
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
            // Decorative side posters render at 112â€“144px wide â€” small variant
            // is plenty of resolution and saves ~3Ã— the bytes per poster.
            const img =
              a.images?.webp?.image_url ??
              a.images?.jpg?.image_url ??
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
            <span aria-hidden>â—</span> 18+ Scene Catalog
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Every iconic moment,{" "}
            <span className="text-funk-warm">timestamped</span>.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
            From fight choreography to plot-shifting reveals â€” our curated
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
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
