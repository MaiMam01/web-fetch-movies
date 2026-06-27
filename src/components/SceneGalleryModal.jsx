import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconClose,
  IconChevronRight,
  IconPlay,
  IconImage,
  IconGrid,
} from "./Icons.jsx";
import useModalA11y from "../hooks/useModalA11y.js";

/**
 * Image gallery modal with contact-sheet mosaic + cinematic lightbox.
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  ×   Gallery · Title     [−] 12 [+] [▦]  34 images           │  toolbar
 *  ├─────────────────────────────────────────────────────────────┤
 *  │  ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢                                    │  mosaic
 *  │  ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢                                    │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * Lightbox:
 *   - All thumbnails repeat as a dimmed wallpaper behind the focused image
 *   - ← → arrows, Esc closes, click image to toggle "fit" / "actual" zoom
 *   - Click backdrop closes
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   title: string (e.g. "Attack on Titan — Gallery")
 *   images: Array<{ url: string, caption?: string, type?: string }>
 */
export default function SceneGalleryModal({ open, onClose, title, images }) {
  const [active, setActive] = useState(null); // index of image in lightbox
  const [density, setDensity] = useState(10); // columns target (controls cell size)
  const [zoom, setZoom] = useState(false); // lightbox zoom-to-actual toggle

  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);
  useModalA11y({
    open,
    containerRef,
    initialFocusRef: closeButtonRef,
  });

  const unique = useMemo(() => {
    const seen = new Set();
    return (images || []).filter((img) => {
      if (!img?.url || seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
  }, [images]);

  const close = useCallback(() => {
    setActive(null);
    setZoom(false);
    onClose?.();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        if (active !== null) {
          setActive(null);
          setZoom(false);
        } else close();
      }
      if (active === null) return;
      if (e.key === "ArrowRight") {
        setActive((i) => (i === null ? null : (i + 1) % unique.length));
        setZoom(false);
      }
      if (e.key === "ArrowLeft") {
        setActive((i) =>
          i === null ? null : (i - 1 + unique.length) % unique.length
        );
        setZoom(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active, unique.length, close]);

  if (!open) return null;

  // Density → tailwind column counts (3 → 20)
  const colClass =
    density <= 4
      ? "grid-cols-3 sm:grid-cols-4"
      : density <= 6
        ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
        : density <= 8
          ? "grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8"
          : density <= 10
            ? "grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10"
            : density <= 12
              ? "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
              : density <= 16
                ? "grid-cols-7 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16"
                : "grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-950/95 backdrop-blur focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* ─── TOOLBAR ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-zinc-900 bg-zinc-950/90 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
              Gallery
            </p>
            <h2 className="line-clamp-1 text-sm font-bold text-white sm:text-base">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Density adjuster (per-row target) */}
          <div className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-1 py-1 ring-1 ring-zinc-800">
            <button
              type="button"
              onClick={() => setDensity((d) => Math.max(3, d - 1))}
              aria-label="Fewer per row"
              className="grid h-7 w-7 place-items-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              −
            </button>
            <span className="min-w-[26px] text-center text-xs font-bold tabular-nums text-zinc-200">
              {density}
            </span>
            <button
              type="button"
              onClick={() => setDensity((d) => Math.min(20, d + 1))}
              aria-label="More per row"
              className="grid h-7 w-7 place-items-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDensity((d) => (d >= 16 ? 8 : 16))}
            aria-label="Toggle contact sheet"
            title={density >= 16 ? "Switch to cards" : "Switch to contact sheet"}
            className={`hidden h-9 w-9 place-items-center rounded-full ring-1 transition sm:grid ${
              density >= 16
                ? "bg-fuchsia-500/20 text-fuchsia-200 ring-fuchsia-400/40"
                : "bg-zinc-900 text-zinc-300 ring-zinc-800 hover:bg-zinc-800"
            }`}
          >
            <IconGrid className="h-4 w-4" />
          </button>

          <span className="hidden rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-zinc-300 ring-1 ring-zinc-800 sm:inline-flex">
            {unique.length} images
          </span>
        </div>
      </header>

      {/* ─── MOSAIC ───────────────────────────────────────────────────── */}
      {unique.length === 0 ? (
        <div className="grid flex-1 place-items-center p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <IconImage className="h-7 w-7 text-zinc-500" />
          </div>
          <p className="mt-4 text-sm font-semibold text-zinc-200">
            No gallery images available for this title yet
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
          <ul className={`grid gap-1 sm:gap-1.5 ${colClass}`}>
            {unique.map((img, i) => (
              <li key={img.url}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setZoom(false);
                  }}
                  className="group relative block aspect-video w-full overflow-hidden rounded-md bg-zinc-900 ring-1 ring-zinc-900 transition hover:ring-fuchsia-400/50"
                >
                  <img
                    src={img.url}
                    alt={img.caption ?? "Gallery image"}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                  {img.type === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-zinc-950/30">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-950/80 ring-1 ring-white/20">
                        <IconPlay className="h-3.5 w-3.5 text-white" />
                      </span>
                    </span>
                  )}
                  {img.caption && density <= 10 && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                      <span className="line-clamp-1 text-[10px] font-bold text-white">
                        {img.caption}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── LIGHTBOX ─────────────────────────────────────────────────── */}
      {active !== null && unique[active] && (
        <Lightbox
          image={unique[active]}
          index={active}
          total={unique.length}
          images={unique}
          zoom={zoom}
          onToggleZoom={() => setZoom((z) => !z)}
          onClose={() => {
            setActive(null);
            setZoom(false);
          }}
          onPrev={() => {
            setActive((i) => (i - 1 + unique.length) % unique.length);
            setZoom(false);
          }}
          onNext={() => {
            setActive((i) => (i + 1) % unique.length);
            setZoom(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Cinematic lightbox: focused image sits over a dimmed wallpaper formed by
 * tiling every thumbnail in the set. Mimics the reference of "the gallery
 * peeks through behind the slide you're on".
 */
function Lightbox({
  image,
  index,
  total,
  images,
  zoom,
  onToggleZoom,
  onClose,
  onPrev,
  onNext,
}) {
  const tileRef = useRef(null);

  // Pick a representative slice of thumbnails so the wallpaper is dense
  // without DOM-bombing pages that have hundreds of images.
  const wallpaper = useMemo(() => {
    if (!images || images.length === 0) return [];
    const stride = Math.max(1, Math.ceil(images.length / 96));
    const sampled = [];
    for (let i = 0; i < images.length; i += stride) sampled.push(images[i]);
    // Repeat the slice a couple of times so big screens stay tiled
    return sampled.concat(sampled).slice(0, 120);
  }, [images]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-zinc-950/85"
      onClick={onClose}
    >
      {/* Tiled wallpaper of every thumbnail in the gallery */}
      <div
        ref={tileRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-0 opacity-30 blur-[1px]"
      >
        {wallpaper.map((img, i) => (
          <span
            key={`${img.url}-${i}`}
            className="block aspect-video bg-cover bg-center"
            style={{ backgroundImage: `url(${img.url})` }}
          />
        ))}
        <span className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/30 to-zinc-950/70" />
      </div>

      {/* Top-left close */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close image"
        className="absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-zinc-900/85 text-white ring-1 ring-zinc-800 backdrop-blur transition hover:bg-zinc-800"
      >
        <IconClose className="h-4 w-4" />
      </button>

      {/* Top-right counter */}
      <span className="absolute right-4 top-4 z-10 rounded-full bg-zinc-900/85 px-3 py-1.5 text-xs font-bold tabular-nums text-zinc-200 ring-1 ring-zinc-800 backdrop-blur">
        {index + 1} / {total}
      </span>

      {/* Arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-zinc-900/85 text-white ring-1 ring-zinc-800 backdrop-blur transition hover:bg-zinc-800"
      >
        <IconChevronRight className="h-5 w-5 rotate-180" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next image"
        className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-zinc-900/85 text-white ring-1 ring-zinc-800 backdrop-blur transition hover:bg-zinc-800"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>

      {/* Focused image (click to toggle fit/actual zoom) */}
      <div
        className={`relative z-[5] flex items-center justify-center ${
          zoom ? "h-full w-full overflow-auto" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.caption ?? "Gallery image"}
          decoding="async"
          onClick={onToggleZoom}
          className={
            zoom
              ? "block max-w-none cursor-zoom-out object-contain"
              : "max-h-[80vh] max-w-[90vw] cursor-zoom-in rounded-lg object-contain shadow-[0_0_60px_-12px_rgba(232,121,249,0.45)] ring-1 ring-zinc-700"
          }
        />
      </div>

      {/* Caption pill */}
      {image.caption && (
        <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 max-w-[80vw] -translate-x-1/2 rounded-full bg-zinc-950/85 px-4 py-2 text-center text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 backdrop-blur">
          {image.caption}
        </p>
      )}
    </div>
  );
}
