import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * useMouseTilt — applies a mouse-tracked 3D tilt to a container.
 * The container should have `perspective` on a parent and `transform-style: preserve-3d`
 * on the child you want to tilt. Returns a ref to attach to the tilting element.
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
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia?.("(hover: none)").matches) return; // skip on touch devices

    const qsRotX = gsap.quickTo(el, "rotateX", { duration: 0.6, ease });
    const qsRotY = gsap.quickTo(el, "rotateY", { duration: 0.6, ease });
    const qsScale = gsap.quickTo(el, "scale", { duration: 0.4, ease });

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
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

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [max, scale, ease]);

  return ref;
}
