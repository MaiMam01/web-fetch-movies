import { IconChevronRight } from "./Icons.jsx";

export default function CharacterRowHeader({ va, character, role, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mb-3 inline-flex items-center gap-2 text-left"
    >
      <span className="block h-5 w-1 rounded bg-brand-500" />
      <span className="text-sm font-semibold text-brand-500">{va}</span>
      <span className="text-sm text-zinc-400">: {character}</span>
      {role && (
        <span className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
          {role}
        </span>
      )}
      <IconChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </button>
  );
}
