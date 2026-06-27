import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import useModalA11y from "../hooks/useModalA11y.js";

export default function AuthModal({ mode = "signup", onClose, onSwitchMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);
  useModalA11y({
    open: true,
    containerRef,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const isSignup = mode === "signup";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 focus:outline-none"
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-title"
    >
      {/* Scrim — clickable to dismiss, but hidden from screen readers since the
          explicit Close button below covers the same affordance. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(232,121,249,0.35)]"
        style={{ animation: "authPop 0.28s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Rainbow top edge */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-violet-500 via-cyan-400 to-lime-400"
        />

        {/* Close */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-zinc-900/80 text-zinc-300 ring-1 ring-zinc-800 backdrop-blur transition hover:bg-zinc-800 hover:text-white hover:ring-fuchsia-400/40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Cosmic header */}
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 25%, rgba(232,121,249,0.55), transparent 55%), radial-gradient(circle at 85% 15%, rgba(34,211,238,0.45), transparent 55%), radial-gradient(circle at 65% 90%, rgba(163,230,53,0.35), transparent 55%), linear-gradient(135deg, #1a0b2e 0%, #0a0814 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,0.06) 14px 16px)",
            }}
          />
          {/* Floating sparkles */}
          <span aria-hidden className="absolute left-10 top-6 text-fuchsia-300/60 text-xl">✦</span>
          <span aria-hidden className="absolute right-14 top-10 text-cyan-300/60 text-sm">✧</span>
          <span aria-hidden className="absolute left-1/2 top-3 text-amber-300/60 text-xs">✦</span>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent px-6 pb-5 pt-14">
            <Logo size="md" to="" />
            <h2
              id="auth-title"
              className="mt-2 text-2xl font-black uppercase tracking-tight text-white"
            >
              {isSignup ? "Join the community" : "Welcome back"}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              {isSignup
                ? "Save your watchlist, rate scenes, follow voice actors."
                : "Pick up right where you left off."}
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {isSignup ? "Sign up with" : "Sign in with"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-800 hover:shadow-[0_0_18px_-6px_rgba(234,67,53,0.55)] active:scale-[0.98]"
            >
              <GoogleGlyph />
              Google
            </button>
            <button
              type="button"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-800 hover:shadow-[0_0_18px_-6px_rgba(255,255,255,0.55)] active:scale-[0.98]"
            >
              <XGlyph />
              X
            </button>
          </div>

          {/* OR divider */}
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-zinc-800" />
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ring-1 ring-zinc-800">
              or
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-800 to-zinc-800" />
          </div>

          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:ring-fuchsia-400/40 active:scale-[0.99]"
            >
              <MailGlyph className="h-4 w-4 text-fuchsia-300 transition group-hover:scale-110" />
              {isSignup ? "Sign up with email" : "Sign in with email"}
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-3"
            >
              <Field
                id="auth-email"
                label="Email"
                icon={<MailGlyph className="h-4 w-4" />}
              >
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
              </Field>
              <Field
                id="auth-password"
                label="Password"
                icon={<LockGlyph className="h-4 w-4" />}
                action={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition hover:text-fuchsia-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              >
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
              </Field>

              {!isSignup && (
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="grid h-4 w-4 place-items-center rounded border border-zinc-700 bg-zinc-900 transition peer-checked:border-fuchsia-400 peer-checked:bg-gradient-to-br peer-checked:from-fuchsia-500 peer-checked:to-violet-500 peer-focus-visible:ring-2 peer-focus-visible:ring-fuchsia-400/60">
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-3 w-3 text-white transition ${
                          remember ? "opacity-100" : "opacity-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <span className="font-semibold text-zinc-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      /* Reset-password flow lives behind a feature flag for now.
                         This button stays clickable so the affordance reads as
                         interactive, but doesn't navigate to a non-existent route. */
                    }}
                    className="font-semibold text-fuchsia-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-full">
                {isSignup ? "Create my account" : "Sign in"}
              </button>

              {isSignup && (
                <p className="text-center text-[10px] text-zinc-500">
                  We&rsquo;ll send you a verification link — no password reset needed
                  later.
                </p>
              )}
            </form>
          )}

          <p className="mt-5 text-center text-xs text-zinc-500">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={onSwitchMode}
              className="font-bold text-funk-gradient hover:opacity-90"
            >
              {isSignup ? "Log in here" : "Sign up here"}
            </button>
          </p>
          <p className="mt-3 text-center text-[10px] leading-relaxed text-zinc-600">
            By {isSignup ? "signing up" : "signing in"}, you agree to our{" "}
            <Link to="/terms" onClick={onClose} className="text-fuchsia-300 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" onClick={onClose} className="text-cyan-300 hover:underline">
              Privacy Notice
            </Link>
            , including{" "}
            <Link
              to="/cookie-policy"
              onClick={onClose}
              className="text-lime-300 hover:underline"
            >
              Cookie Use
            </Link>
            .
          </p>
        </div>
      </div>

      <style>{`
        @keyframes authPop {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-modal="true"] > div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ id, label, icon, action, children }) {
  return (
    <label htmlFor={id} className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </span>
        {action}
      </div>
      <div className="group flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 ring-0 transition focus-within:border-fuchsia-400/60 focus-within:ring-2 focus-within:ring-fuchsia-400/20">
        <span className="text-zinc-500 transition group-focus-within:text-fuchsia-300">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 3.2 14.7 2.2 12 2.2 6.5 2.2 2 6.7 2 12.2s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
      />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-100" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.5 3H21l-7.4 8.5L22 21h-6.8l-5.3-6.6L3.6 21H.2l8-9.1L0 3h7l4.8 6 5.7-6zm-2.4 16h2L7.1 5H5l10.1 14z"
      />
    </svg>
  );
}

function MailGlyph(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function LockGlyph(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
