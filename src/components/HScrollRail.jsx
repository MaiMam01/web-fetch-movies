import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronRight } from "./Icons.jsx";

/**
 * Generic horizontally-scrollable rail with prev/next overflow arrows that
 * fade in only when the content actually overflows. Tracks position so the
 * arrows enable/disable correctly when the user reaches an edge.
 *
 * Children are rendered inside a `<ul>` so callers should pass `<li>` items
 * (or wrap their own buttons). The rail itself only handles layout +
 * scrolling — styling of individual tiles is up to the consumer.
 */
export default function HScrollRail({
  children,
  ariaLabel,
  className = "",
  itemGap = "gap-3",
  edgeFade = true,
}) {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const recompute = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < max);
  }, []);

  useEffect(() => {
    recompute();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", recompute, { passive: true });
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", recompute);
      ro.disconnect();
    };
  }, [recompute, children]);

  const scrollBy = (delta) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={`group relative ${className}`}>
      {edgeFade && (
        <>
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-zinc-950 to-transparent transition-opacity duration-200 ${
              canPrev ? "opacity-100" : "opacity-0"
            }`}
          />
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-zinc-950 to-transparent transition-opacity duration-200 ${
              canNext ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-400)}
        disabled={!canPrev}
        className={`absolute left-1 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-zinc-950/85 text-white ring-1 ring-zinc-800 backdrop-blur transition group-hover:grid hover:bg-zinc-900 disabled:hidden`}
      >
        <IconChevronRight className="h-4 w-4 rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(400)}
        disabled={!canNext}
        className={`absolute right-1 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-zinc-950/85 text-white ring-1 ring-zinc-800 backdrop-blur transition group-hover:grid hover:bg-zinc-900 disabled:hidden`}
      >
        <IconChevronRight className="h-4 w-4" />
      </button>

      <ul
        ref={scrollerRef}
        aria-label={ariaLabel}
        className={`-mx-2 flex overflow-x-auto px-2 pb-1 scrollbar-thin ${itemGap}`}
      >
        {children}
      </ul>
    </div>
  );
}
