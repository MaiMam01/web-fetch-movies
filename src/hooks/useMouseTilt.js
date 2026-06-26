import { useEffect, useRef } from "react";

/**
 * useMouseTilt — applies a mouse-tracked 3D tilt to a container.
 * The container should have `perspective` on a parent and `transform-style: preserve-3d`
 * on the child you want to tilt. Returns a ref to attach to the tilting element.
 *
 * GSAP is dynamic-imported so this hook doesn't drag GSAP into the initial
 * bundle on its own. The tilt simply doesn't engage until the chunk arrives,
 * which is fine because it's a hover-only enhancement.
 *
 * Options:
 *  - max:   maximum rotation in degrees (default 10)
 *  - scale: scale on hover (default 1)
 *  - ease:  GSAP ease (default "power2.out")
 */
export default function useMouseTilt({ max = 10, scale = 1, ease = "power2.out" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    // Skip on touch devices — there's no hover, so the tilt would never engage.
    if (window.matchMedia?.("(hover: none)").matches) return undefined;

    let cleanup = null;
    let cancelled = false;

    import("gsap").then(({ default: gsap }) => {
      if (cancelled || !ref.current) return;
      const elNow = ref.current;
      const qsRotX = gsap.quickTo(elNow, "rotateX", { duration: 0.6, ease });
      const qsRotY = gsap.quickTo(elNow, "rotateY", { duration: 0.6, ease });
      const qsScale = gsap.quickTo(elNow, "scale", { duration: 0.4, ease });

      const handleMove = (e) => {
        const rect = elNow.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        qsRotY(dx * max);
        qsRotX(-dy * max);
      };

      const handleEnter = () => qsScale(scale);
      const handleLeave = () => {
        qsRotX(0);
        qsRotY(0);
        qsScale(1);
      };

      elNow.addEventListener("mousemove", handleMove);
      elNow.addEventListener("mouseenter", handleEnter);
      elNow.addEventListener("mouseleave", handleLeave);
      cleanup = () => {
        elNow.removeEventListener("mousemove", handleMove);
        elNow.removeEventListener("mouseenter", handleEnter);
        elNow.removeEventListener("mouseleave", handleLeave);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [max, scale, ease]);

  return ref;
}
