import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "./Icons.jsx";

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
    size === "sm" ? "h-8 px-2.5 text-[11px]" : "h-9 px-3 text-xs";
  const panelAlign = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 font-semibold text-zinc-200 transition hover:bg-zinc-800 ${triggerSize}`}
      >
        <span className="text-zinc-400">{label}:</span>
        <span className="italic text-zinc-100">{current?.label}</span>
        <IconChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute ${panelAlign} top-11 z-30 min-w-[200px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl`}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-bold transition ${
                    active
                      ? "bg-brand-500 text-zinc-950"
                      : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.hint && (
                    <span
                      className={`text-[10px] font-semibold ${
                        active ? "text-zinc-900/70" : "text-zinc-500"
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
