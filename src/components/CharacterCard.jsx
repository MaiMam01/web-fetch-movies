import { memo } from "react";
import { Link } from "react-router-dom";

function CharacterCard({ character }) {
  const c = character.character;
  const va = character.voice_actors?.find((v) => v.language === "Japanese");

  if (!c) return null;

  const img = c.images?.webp?.image_url || c.images?.jpg?.image_url;
  const vaImg =
    va?.person?.images?.webp?.image_url || va?.person?.images?.jpg?.image_url;

  return (
    <Link
      to={`/characters/${c.mal_id}`}
      className="group relative block focus:outline-none"
    >
      <div className="relative z-0 aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800 transition-all duration-300 ease-out will-change-transform group-hover:z-20 group-hover:-translate-y-2 group-hover:scale-[1.08] group-hover:ring-2 group-hover:ring-fuchsia-400/70 group-hover:shadow-[0_18px_40px_-10px_rgba(232,121,249,0.55)]">
        {img ? (
          <>
            <img
              src={img}
              alt={c.name}
              loading="lazy"
              decoding="async"
              width="225"
              height="300"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                vaImg ? "group-hover:opacity-0" : "group-hover:scale-[1.05]"
              }`}
            />
            {vaImg && (
              <img
                src={vaImg}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full scale-[1.08] object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">
            No image
          </div>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {vaImg && (
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-zinc-950/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-200 opacity-0 ring-1 ring-fuchsia-400/40 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            CV
          </span>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-100 transition group-hover:text-fuchsia-200">
          {c.name}
        </p>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
          {character.role}
        </p>
        {va && (
          <p className="line-clamp-1 text-[11px] text-fuchsia-300/80">
            CV: {va.person.name}
          </p>
        )}
      </div>
    </Link>
  );
}

export default memo(
  CharacterCard,
  (a, b) => a.character?.character?.mal_id === b.character?.character?.mal_id
);
