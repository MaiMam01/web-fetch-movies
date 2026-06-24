import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-7xl font-black text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-bold">That page slipped past the firewall.</h1>
      <p className="mt-2 text-sm text-zinc-400">
        The URL you visited doesn&apos;t map to any anime in our catalog.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
      >
        Back to home
      </Link>
    </div>
  );
}
