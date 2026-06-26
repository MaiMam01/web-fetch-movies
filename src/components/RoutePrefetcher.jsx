import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { prefetchRoute } from "../hooks/usePrefetchRoute.js";

// Per-route heuristic prewarms. The keys are pathname prefixes and the values
// are the routes most users tend to visit next. We fire these during browser
// idle time so they cost ~nothing on a fast device but win big on a slow one.
const NEXT_ROUTE_HINTS = {
  "/": ["/top", "/scenes", "/characters"],
  "/top": ["/anime", "/categories"],
  "/anime": ["/scenes", "/characters"],
  "/scenes": ["/scenes/1"],
  "/characters": ["/characters/1"],
  "/voice-actors": ["/voice-actors/1"],
  "/categories": ["/categories/1"],
  "/stories": ["/scenes"],
};

/**
 * Mount once at the app root. Listens for `pointerover` / `focusin` on the
 * document and, when the user hovers/focuses any internal anchor, kicks off
 * the dynamic import for the route they're about to visit. The click → render
 * latency drops from "download chunk + parse" to "render" because the chunk
 * is already in the module cache.
 *
 * Non-invasive: works without modifying every <Link> in the app. Idempotent:
 * `prefetchRoute` dedupes per-target so we never download the same chunk twice.
 */
export default function RoutePrefetcher() {
  const { pathname } = useLocation();

  // Idle prewarm: when the current route's bundle has settled, kick off the
  // dynamic imports for the routes users most often navigate to next. This is
  // best-effort and only runs during browser idle time so it never blocks UI.
  useEffect(() => {
    const conn =
      typeof navigator !== "undefined" && "connection" in navigator
        ? navigator.connection
        : null;
    if (conn && (conn.saveData || /(2g|slow-2g)/.test(conn.effectiveType || ""))) {
      return undefined;
    }

    // Find the most specific prefix match for the current route.
    const key =
      Object.keys(NEXT_ROUTE_HINTS)
        .filter((p) => pathname.startsWith(p))
        .sort((a, b) => b.length - a.length)[0] || "/";
    const targets = NEXT_ROUTE_HINTS[key] ?? [];
    if (!targets.length) return undefined;

    let cancelled = false;
    const fire = () => {
      if (cancelled) return;
      targets.forEach((t) => prefetchRoute(t));
    };
    const id = "requestIdleCallback" in window
      ? window.requestIdleCallback(fire, { timeout: 3000 })
      : window.setTimeout(fire, 1500);
    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window && typeof id === "number") {
        window.cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, [pathname]);

  useEffect(() => {
    // Save Data preference / slow connection → don't aggressively prefetch.
    const conn =
      typeof navigator !== "undefined" && "connection" in navigator
        ? navigator.connection
        : null;
    if (conn && (conn.saveData || /(2g|slow-2g)/.test(conn.effectiveType || ""))) {
      return undefined;
    }

    const findHref = (e) => {
      const a = e.target?.closest?.("a[href]");
      if (!a) return null;
      const href = a.getAttribute("href");
      // Only prefetch internal SPA routes — skip external, anchors, mailto, etc.
      if (!href || !href.startsWith("/")) return null;
      if (a.target === "_blank") return null;
      return href;
    };

    const onPointer = (e) => {
      const href = findHref(e);
      if (href) prefetchRoute(href);
    };
    const onFocus = (e) => {
      const href = findHref(e);
      if (href) prefetchRoute(href);
    };

    document.addEventListener("pointerover", onPointer, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerover", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);

  return null;
}
