import { useState, useCallback } from "react";

/**
 * <SafeImage /> — drop-in <img> replacement that swaps to a placeholder when
 * the network image fails (expired Jikan CDN URLs, 404s, blocked hosts, etc.)
 *
 * Behaviour:
 *   - If `src` is falsy on first render, render the placeholder immediately.
 *   - On `onError` the swap happens once and is sticky (no infinite retries).
 *   - Forwards every other prop straight through to <img>.
 *
 * Defaults `loading="lazy"` and `decoding="async"` so it can be used as a
 * straight upgrade without any other plumbing.
 */
export default function SafeImage({
  src,
  alt = "",
  fallback = "/placeholder.svg",
  loading = "lazy",
  decoding = "async",
  onError,
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(
    (e) => {
      if (!failed) setFailed(true);
      onError?.(e);
    },
    [failed, onError]
  );

  const effectiveSrc = !src || failed ? fallback : src;

  return (
    <img
      {...rest}
      src={effectiveSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={handleError}
    />
  );
}
