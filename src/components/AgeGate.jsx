import { useEffect, useState } from "react";

const STORAGE_KEY = "animedb_age_confirmed_v1";

export default function AgeGate({ children, title = "Mature Content Ahead" }) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setConfirmed(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (confirmed) return children;

  const confirm = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
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
            onClick={confirm}
            className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            I am 18+ — Continue
          </button>
          <a
            href="/"
            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            Go back
          </a>
        </div>
      </div>
    </div>
  );
}
