import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconChevronDown,
  IconCheck,
  IconClose,
  IconSearch,
} from "./Icons.jsx";

/**
 * Catalog of supported languages — flag emoji + native name + ISO code.
 * Order roughly follows the screenshot the user provided (alphabetical by
 * native name, then non-latin scripts at the end).
 */
const LANGUAGES = [
  { code: "en", flag: "🇺🇸", native: "English" },
  { code: "cs", flag: "🇨🇿", native: "Čeština" },
  { code: "da", flag: "🇩🇰", native: "Danske" },
  { code: "de", flag: "🇩🇪", native: "Deutsch" },
  { code: "et", flag: "🇪🇪", native: "Eesti keel" },
  { code: "es", flag: "🇪🇸", native: "Español" },
  { code: "fr", flag: "🇫🇷", native: "Français" },
  { code: "ga", flag: "🇮🇪", native: "Gaeilge" },
  { code: "hr", flag: "🇭🇷", native: "Hrvatski" },
  { code: "it", flag: "🇮🇹", native: "Italiano" },
  { code: "lv", flag: "🇱🇻", native: "Latviešu" },
  { code: "lt", flag: "🇱🇹", native: "Lietuvių" },
  { code: "hu", flag: "🇭🇺", native: "Magyar" },
  { code: "mt", flag: "🇲🇹", native: "Malti" },
  { code: "nl", flag: "🇳🇱", native: "Nederlandse" },
  { code: "no", flag: "🇳🇴", native: "Norsk" },
  { code: "pl", flag: "🇵🇱", native: "Polskie" },
  { code: "pt", flag: "🇵🇹", native: "Português" },
  { code: "ro", flag: "🇷🇴", native: "Română" },
  { code: "sk", flag: "🇸🇰", native: "Slovenčina" },
  { code: "sl", flag: "🇸🇮", native: "Slovenščina" },
  { code: "fi", flag: "🇫🇮", native: "Suomen kieli" },
  { code: "sv", flag: "🇸🇪", native: "Svenska" },
  { code: "vi", flag: "🇻🇳", native: "Tiếng Việt" },
  { code: "tr", flag: "🇹🇷", native: "Türkçe" },
  { code: "el", flag: "🇬🇷", native: "Ελληνική" },
  { code: "bg", flag: "🇧🇬", native: "Български" },
  { code: "ru", flag: "🇷🇺", native: "Русский" },
  { code: "he", flag: "🇮🇱", native: "עברית" },
  { code: "ar", flag: "🇸🇦", native: "العربية" },
  { code: "hi", flag: "🇮🇳", native: "हिन्दी" },
  { code: "zh", flag: "🇨🇳", native: "中文" },
  { code: "ja", flag: "🇯🇵", native: "日本語" },
];

const STORAGE_KEY = "animedb_lang";
const DEFAULT_CODE = "en";

/**
 * Read/write the current language to localStorage so the choice persists
 * across page loads and the AccountDropdown's Language row can stay in sync.
 */
export function getStoredLanguage() {
  if (typeof window === "undefined") return DEFAULT_CODE;
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

export function findLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/**
 * Header language picker with searchable list.
 *
 * Props:
 *   align       "left" | "right"  panel alignment (default "right")
 *   compact     when true, trigger shows flag-only (good for tight headers)
 *   className   extra classes for the outer wrapper
 */
export default function LanguageDropdown({
  align = "right",
  compact = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [code, setCode] = useState(getStoredLanguage);
  const ref = useRef(null);
  const searchRef = useRef(null);

  const current = findLanguage(code);

  // Persist selection + broadcast so other instances of this component update.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* quota / privacy mode — ignore */
    }
    window.dispatchEvent(new CustomEvent("animedb:lang", { detail: code }));
  }, [code]);

  // Listen to other tabs / components changing the language, and to remote
  // "open me" requests from elsewhere in the app (e.g. the AccountDropdown).
  useEffect(() => {
    const onLang = (e) => {
      const next = e.detail ?? getStoredLanguage();
      if (next && next !== code) setCode(next);
    };
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue !== code) {
        setCode(e.newValue);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("animedb:lang", onLang);
    window.addEventListener("storage", onStorage);
    window.addEventListener("animedb:lang:open", onOpen);
    return () => {
      window.removeEventListener("animedb:lang", onLang);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("animedb:lang:open", onOpen);
    };
  }, [code]);

  // Click-outside + Escape to close, autofocus search when opening.
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    // Autofocus the search field after the panel mount animation settles.
    const id = setTimeout(() => searchRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      clearTimeout(id);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [query]);

  const panelAlign = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((s) => !s);
          setQuery("");
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={`group inline-flex items-center gap-2 rounded-md border bg-zinc-900 font-semibold transition active:scale-[0.98] ${
          compact ? "h-9 w-9 justify-center" : "h-9 px-3 text-xs"
        } ${
          open
            ? "border-fuchsia-400/50 text-white shadow-[0_0_18px_-6px_rgba(232,121,249,0.55)]"
            : "border-zinc-800 text-zinc-300 hover:border-fuchsia-400/30 hover:bg-zinc-800 hover:text-white"
        }`}
      >
        <span className="flag" aria-hidden>
          {current.flag}
        </span>
        {!compact && (
          <>
            <span className="text-zinc-500">Language:</span>
            <span className="text-funk-gradient">{current.native}</span>
          </>
        )}
        <IconChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition ${
            open ? "rotate-180 text-fuchsia-300" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`dropdown-panel absolute ${panelAlign} top-11 z-50 w-[min(94vw,300px)]`}
          role="listbox"
          aria-label="Language"
        >
          {/* Header */}
          <div className="relative z-[2] flex items-center justify-between border-b border-zinc-900/80 px-3 py-2.5">
            <h3 className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_currentColor]" />
              Choose language
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid h-6 w-6 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
            >
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative z-[2] px-3 pt-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 focus-within:border-fuchsia-400/60 focus-within:ring-2 focus-within:ring-fuchsia-400/20">
              <IconSearch className="h-3.5 w-3.5 text-zinc-500" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search language…"
                aria-label="Search language"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear"
                  className="text-zinc-500 transition hover:text-white"
                >
                  <IconClose className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <ul className="relative z-[2] max-h-[60vh] overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-zinc-500">
                No matches.
              </li>
            )}
            {filtered.map((l) => {
              const active = l.code === code;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setCode(l.code);
                      setOpen(false);
                    }}
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-gradient-to-r from-fuchsia-500/20 via-violet-500/15 to-cyan-400/15 text-white ring-1 ring-fuchsia-400/30"
                        : "text-zinc-200 hover:bg-zinc-900/70 hover:text-white"
                    }`}
                  >
                    <span
                      className="flag text-base leading-none"
                      aria-hidden
                    >
                      {l.flag}
                    </span>
                    <span className="flex-1 truncate">{l.native}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">
                      {l.code}
                    </span>
                    {active && (
                      <IconCheck className="h-3.5 w-3.5 text-fuchsia-300" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export { LANGUAGES };
