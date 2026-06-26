import { useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "animedb_age_confirmed_v1";

function readConfirmed() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private mode / disabled storage — fall back to gating each session.
    return false;
  }
}

export default function AgeGate({ children, title = "Mature Content Ahead" }) {
  // Lazy initialiser reads sessionStorage synchronously on mount so users who
  // already confirmed don't see the gate flash on every Scenes navigation.
  const [confirmed, setConfirmed] = useState(readConfirmed);

  if (confirmed) return children;

  const confirm = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage disabled — confirmation will reset next reload */
    }
    setConfirmed(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-amber-200">{title}</h2>
        <p className="mt-3 text-sm text-amber-100/80">
          This section catalogs depictions of graphic violence and other intense
          content from anime. It is intended for viewers aged{" "}
          <span className="font-semibold">18 and over</span>. By continuing you
          confirm that you meet the age requirement in your jurisdiction.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={confirm}
            className="btn btn-lg bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-zinc-950 shadow-[0_8px_24px_-6px_rgba(251,146,60,0.45)] hover:brightness-110"
          >
            I am 18+ — Continue
          </button>
          <Link to="/" className="btn btn-secondary btn-lg">
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
