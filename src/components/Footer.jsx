export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-zinc-500 sm:px-6 lg:px-8">
        <p>
          AnimeDB &middot; Data from{" "}
          <a
            href="https://jikan.moe"
            target="_blank"
            rel="noreferrer"
            className="text-brand-500 hover:underline"
          >
            Jikan (MyAnimeList)
          </a>
          . Scene descriptions are editorial and curated.
        </p>
      </div>
    </footer>
  );
}
