/**
 * usePrefetchRoute
 * ----------------
 * Helpers to warm the router's lazy chunks the moment a user signals intent
 * (hovering / focusing a navigation link). Once a chunk is downloaded the
 * actual click → render becomes near-instant.
 *
 * Usage:
 *   const prefetch = useRoutePrefetcher();
 *   <Link to="/scenes" onMouseEnter={() => prefetch("/scenes")} ... />
 */

// Map route paths to the dynamic import they correspond to. Each value is a
// thunk so we don't trigger the network during module evaluation — only when
// the user actually shows intent.
const ROUTE_LOADERS = {
  "/anime": () => import("../pages/AnimeDetail.jsx"),
  "/scenes": () => import("../pages/Scenes.jsx"),
  "/scenes/": () => import("../pages/SceneDetail.jsx"),
  "/characters": () => import("../pages/Characters.jsx"),
  "/characters/": () => import("../pages/CharacterDetail.jsx"),
  "/voice-actors": () => import("../pages/VoiceActors.jsx"),
  "/voice-actors/": () => import("../pages/VoiceActorDetail.jsx"),
  "/categories": () => import("../pages/Categories.jsx"),
  "/categories/": () => import("../pages/CategoryDetail.jsx"),
  "/stories": () => import("../pages/Stories.jsx"),
  "/search": () => import("../pages/Search.jsx"),
  "/community": () => import("../pages/Community.jsx"),
  "/about": () => import("../pages/About.jsx"),
};

// Per-session memo so we never re-trigger the same import.
const triggered = new Set();

export function prefetchRoute(to) {
  if (!to || typeof to !== "string") return;
  if (triggered.has(to)) return;

  // Strip query / hash to find the loader prefix.
  const path = to.split("?")[0].split("#")[0];

  // Exact match first.
  if (ROUTE_LOADERS[path]) {
    triggered.add(to);
    ROUTE_LOADERS[path]().catch(() => {
      // Network failure — drop from triggered so a later attempt can retry.
      triggered.delete(to);
    });
    return;
  }

  // Detail-route prefix match (e.g. "/anime/12345" → ROUTE_LOADERS["/anime"]).
  // Iterate prefixes in length order so deeper routes win.
  const prefixes = Object.keys(ROUTE_LOADERS).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    const trimmed = prefix.endsWith("/") ? prefix : `${prefix}/`;
    if (path.startsWith(trimmed)) {
      triggered.add(to);
      ROUTE_LOADERS[prefix]().catch(() => {
        triggered.delete(to);
      });
      return;
    }
    if (path === prefix) {
      triggered.add(to);
      ROUTE_LOADERS[prefix]().catch(() => {
        triggered.delete(to);
      });
      return;
    }
  }
}

/**
 * Returns a single `{ onMouseEnter, onFocus, onTouchStart }` handler bundle
 * that prefetches the destination once the user shows intent.
 */
export function prefetchHandlers(to) {
  const fire = () => prefetchRoute(to);
  return {
    onMouseEnter: fire,
    onFocus: fire,
    onTouchStart: fire,
  };
}
