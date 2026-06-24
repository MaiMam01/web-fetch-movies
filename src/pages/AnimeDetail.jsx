import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAnimeById, getEpisodes, getCharacters } from "../services/jikan.js";

export default function AnimeDetail() {
  const { malId } = useParams();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const a = await getAnimeById(malId);
        if (cancelled) return;
        setAnime(a);
        const [eps, chars] = await Promise.all([
          getEpisodes(malId).catch(() => []),
          getCharacters(malId).catch(() => []),
        ]);
        if (cancelled) return;
        setEpisodes(eps);
        setCharacters(chars.slice(0, 12));
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
  }, [malId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-zinc-400 sm:px-6 lg:px-8">
        Loading…
      </div>
    );
  }
  if (error || !anime) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-red-300 sm:px-6 lg:px-8">
        Could not load this title. {error}
      </div>
    );
  }

  const poster =
    anime.images?.webp?.large_image_url ?? anime.images?.jpg?.large_image_url;

  return (
    <div className="text-zinc-100">
      <Hero anime={anime} poster={poster} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold">Synopsis</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
            {anime.synopsis || "No synopsis available."}
          </p>

          {episodes.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold">Episodes</h2>
              <ul className="mt-4 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/40">
                {episodes.slice(0, 25).map((ep) => (
                  <li
                    key={ep.mal_id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Ep {ep.mal_id} &middot; {ep.title || "Untitled"}
                      </p>
                      {ep.aired && (
                        <p className="text-xs text-zinc-500">
                          Aired {new Date(ep.aired).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {ep.score ? (
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-brand-500">
                        ★ {ep.score}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {characters.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold">Main Characters</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {characters.map((c) => (
                  <div
                    key={c.character.mal_id}
                    className="overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800"
                  >
                    <img
                      src={c.character.images?.webp?.image_url}
                      alt={c.character.name}
                      className="aspect-[3/4] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-2">
                      <p className="line-clamp-1 text-xs font-semibold">
                        {c.character.name}
                      </p>
                      <p className="text-xs text-zinc-500">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <InfoCard anime={anime} />
          <Link
            to={`/anime/${malId}/scenes`}
            className="block rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 transition hover:bg-amber-500/10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Scene Catalog
            </p>
            <p className="mt-1 text-lg font-bold text-amber-100">
              Notable Scenes →
            </p>
            <p className="mt-1 text-xs text-amber-200/70">
              Curated breakdowns of pivotal violent or intense scenes (18+).
            </p>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Hero({ anime, poster }) {
  const bg =
    anime.trailer?.images?.maximum_image_url ||
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url;
  return (
    <div className="relative isolate overflow-hidden border-b border-zinc-800">
      {bg && (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-25 blur-md"
          style={{ backgroundImage: `url(${bg})` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/40 via-zinc-950/80 to-zinc-950" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
        {poster && (
          <img
            src={poster}
            alt={anime.title}
            className="w-44 flex-shrink-0 rounded-xl ring-1 ring-zinc-800 sm:w-56"
          />
        )}
        <div className="flex flex-col justify-end">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            {anime.type || "TV Series"} &middot; {anime.status || "—"}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
            {anime.title_english || anime.title}
          </h1>
          {anime.title_japanese && (
            <p className="mt-1 text-sm text-zinc-400">{anime.title_japanese}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            {anime.score && (
              <span className="rounded bg-brand-500/15 px-2 py-0.5 font-semibold text-brand-500">
                ★ {anime.score} ({anime.scored_by?.toLocaleString()} ratings)
              </span>
            )}
            {anime.rank && <span>#{anime.rank} on MAL</span>}
            {anime.episodes && <span>{anime.episodes} eps</span>}
            {anime.duration && <span>{anime.duration}</span>}
            {anime.rating && <span>{anime.rating}</span>}
          </div>
          {anime.genres?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span
                  key={g.mal_id}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ anime }) {
  const rows = [
    ["Aired", anime.aired?.string],
    ["Season", anime.season ? `${anime.season} ${anime.year}` : null],
    ["Studios", anime.studios?.map((s) => s.name).join(", ")],
    ["Source", anime.source],
    ["Demographic", anime.demographics?.map((d) => d.name).join(", ")],
    ["Themes", anime.themes?.map((t) => t.name).join(", ")],
  ].filter(([, v]) => Boolean(v));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
        Details
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-2">
            <dt className="text-zinc-500">{k}</dt>
            <dd className="col-span-2 text-zinc-200">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
