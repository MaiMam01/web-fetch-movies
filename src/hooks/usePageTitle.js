import { useEffect } from "react";

const SITE_NAME = "AnimeDB";
const FALLBACK = "AnimeDB — IMDB for Anime";

/**
 * Set the document title for the current page. Restores the previous title on
 * unmount so when a user navigates between routes the title always reflects
 * the page they're actually viewing.
 *
 * Pass a falsy value while data is still loading — the hook will leave the
 * existing title alone and update once the real title is known.
 *
 * Usage:
 *   usePageTitle(anime?.title);                // "Cowboy Bebop · AnimeDB"
 *   usePageTitle(`Search · "${q}"`);           // "Search · "cowboy" · AnimeDB"
 *   usePageTitle("Characters");                // "Characters · AnimeDB"
 */
export default function usePageTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = `${title} · ${SITE_NAME}`;
    return () => {
      document.title = previous || FALLBACK;
    };
  }, [title]);
}
