import { useCallback, useEffect, useState } from "react";

/**
 * Tiny persisted-toggle hook.
 *
 * Used by "Favorite" / "Follow" buttons throughout the site so user
 * preferences survive reloads. State is keyed per-entity via the `key` arg,
 * e.g. `useLocalToggle("animedb:fav:anime:12345")`.
 *
 * Returns `[value, toggle, set]`.
 */
export default function useLocalToggle(key) {
  const [value, setValue] = useState(false);

  // Initialise from storage once we have a key. Done in an effect rather than
  // a lazy initializer so re-keying (e.g. while waiting for async data) works.
  useEffect(() => {
    if (!key) {
      setValue(false);
      return;
    }
    try {
      setValue(localStorage.getItem(key) === "1");
    } catch {
      /* private mode / disabled storage — silently fall back to in-memory */
    }
  }, [key]);

  const set = useCallback(
    (next) => {
      setValue(next);
      if (!key) return;
      try {
        if (next) localStorage.setItem(key, "1");
        else localStorage.removeItem(key);
      } catch {
        /* ignore — in-memory state still reflects the toggle */
      }
    },
    [key]
  );

  const toggle = useCallback(() => set(!value), [set, value]);

  return [value, toggle, set];
}
