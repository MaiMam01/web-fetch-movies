import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconCheck } from "./Icons.jsx";

export default function SortDropdown({
  value,
  onChange,
  options = [],
  label = "Sort By",
  align = "right",
  size = "md",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerSize =
    size === "sm" ? "h-8 px-3 text-[11px]" : "h-9 px-3.5 text-xs";
  const panelAlign = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group inline-flex items-center gap-2 rounded-full border bg-zinc-900/70 font-semibold backdrop-blur transition active:scale-[0.98] ${triggerSize} ${
          open
            ? "border-fuchsia-400/50 text-white shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)]"
            : "border-zinc-800 text-zinc-200 hover:border-fuchsia-400/30 hover:bg-zinc-800/80 hover:text-white"
        }`}
      >
        <span className="text-zinc-500 group-hover:text-zinc-400">{label}:</span>
        <span className="text-funk-gradient">{current?.label}</span>
        <IconChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition ${
            open ? "rotate-180 text-fuchsia-300" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className={`dropdown-panel absolute ${panelAlign} top-11 z-30 min-w-[220px] p-2 pt-3`}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} className="relative z-[2]">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-[0_0_14px_-4px_rgba(232,121,249,0.6)]"
                      : "text-zinc-200 hover:bg-zinc-900/70 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {active && <IconCheck className="h-3.5 w-3.5" />}
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span
                      className={`text-[10px] font-semibold ${
                        active ? "text-white/80" : "text-zinc-500"
                      }`}
                    >
                      {opt.hint}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
