import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AuthModal({ mode = "signup", onClose, onSwitchMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const isSignup = mode === "signup";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-zinc-900/80 text-zinc-300 backdrop-blur transition hover:bg-zinc-800 hover:text-white"
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

        <div className="relative h-44 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(244,114,32,0.4), rgba(99,102,241,0.4)), radial-gradient(circle at 20% 30%, rgba(244,114,32,0.5), transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.4), transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,0.04) 14px 16px)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 to-transparent pt-12 pb-5 px-6">
            <div className="flex items-center gap-1.5 text-2xl font-extrabold">
              <span className="text-zinc-100">Anime</span>
              <span className="rounded-sm bg-brand-500 px-1.5 text-zinc-950">DB</span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-zinc-50">
              {isSignup ? "Sign Up for Free" : "Welcome Back"}
            </h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-500">
            {isSignup ? "Sign up with" : "Sign in with"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              <GoogleGlyph />
              Google
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              <XGlyph />
              X
            </button>
          </div>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              or
            </span>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full rounded-md bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
            >
              {isSignup ? "Sign up with email and password" : "Sign in with email"}
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-3"
            >
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-md bg-brand-500 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-brand-400"
              >
                {isSignup ? "Create my account" : "Sign in"}
              </button>
              {!isSignup && (
                <Link
                  to="#"
                  onClick={(e) => e.preventDefault()}
                  className="block text-center text-xs font-semibold text-brand-500 hover:underline"
                >
                  Forgot your password? Reset it
                </Link>
              )}
            </form>
          )}

          <p className="mt-4 text-center text-xs text-zinc-500">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={onSwitchMode}
              className="font-bold text-brand-500 hover:underline"
            >
              {isSignup ? "Log in here" : "Sign up here"}
            </button>
          </p>
          <p className="mt-3 text-center text-[10px] leading-relaxed text-zinc-600">
            By {isSignup ? "signing up" : "signing in"}, you agree to our{" "}
            <Link to="/terms" onClick={onClose} className="text-brand-500 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" onClick={onClose} className="text-brand-500 hover:underline">
              Privacy Notice
            </Link>
            , including{" "}
            <Link
              to="/cookie-policy"
              onClick={onClose}
              className="text-brand-500 hover:underline"
            >
              Cookie Use
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
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
