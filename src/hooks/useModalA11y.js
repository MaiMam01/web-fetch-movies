import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useModalA11y — accessibility plumbing shared by every dialog/lightbox on the
 * site. While `open` is true it:
 *
 *   1. Locks `document.body` scroll
 *   2. Stores `document.activeElement` so the close handler can return focus
 *   3. Moves focus into the dialog (preferred element via the `initialFocusRef`,
 *      otherwise the first focusable inside the container)
 *   4. Traps Tab / Shift+Tab so keyboard users can't escape to the page behind
 *
 * Usage:
 *
 *   const containerRef = useRef(null);
 *   const closeRef = useRef(null);
 *   useModalA11y({ open, containerRef, initialFocusRef: closeRef });
 *
 *   return open ? (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <button ref={closeRef} onClick={onClose}>×</button>
 *       ...
 *     </div>
 *   ) : null;
 */
export default function useModalA11y({ open, containerRef, initialFocusRef }) {
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // 1) lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2) snapshot focus
    restoreRef.current =
      typeof document !== "undefined" ? document.activeElement : null;

    // 3) move focus into the dialog
    const focusInitial = () => {
      const node =
        initialFocusRef?.current ??
        containerRef.current?.querySelector(FOCUSABLE) ??
        containerRef.current;
      try {
        node?.focus({ preventScroll: true });
      } catch {
        node?.focus();
      }
    };
    // wait one frame so the dialog is in the DOM
    const raf = requestAnimationFrame(focusInitial);

    // 4) trap Tab
    function onKey(e) {
      if (e.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;
      const nodes = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      // return focus to the element that opened the dialog
      const target = restoreRef.current;
      if (target && typeof target.focus === "function") {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    };
  }, [open, containerRef, initialFocusRef]);
}
