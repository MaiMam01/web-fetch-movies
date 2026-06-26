import { memo } from "react";
import { Link } from "react-router-dom";

function CharacterCard({ character }) {
  const c = character.character;
  const va = character.voice_actors?.find((v) => v.language === "Japanese");

  if (!c) return null;

  return (
    <Link
      to={`/characters/${c.mal_id}`}
      className="group block overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        {c.images?.webp?.image_url ? (
          <img
            src={c.images.webp.image_url}
            alt={c.name}
            loading="lazy"
            decoding="async"
            width="225"
            height="300"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">
            No image
          </div>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-brand-500">
          {c.name}
        </p>
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">
          {character.role}
        </p>
        {va && (
          <p className="line-clamp-1 text-[11px] text-brand-500">
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
