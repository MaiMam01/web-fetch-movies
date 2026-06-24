export default function CharacterCard({ character }) {
  const c = character.character;
  const va = character.voice_actors?.find((v) => v.language === "Japanese");

  return (
    <div className="group overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800 transition hover:ring-brand-500">
      <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        {c.images?.webp?.image_url ? (
          <img
            src={c.images.webp.image_url}
            alt={c.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">No image</div>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-100">
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
    </div>
  );
}
