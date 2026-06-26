import { Link } from "react-router-dom";

export default function ProfileInfoGrid({
  aboutTitle,
  aboutBody,
  appearedIn,
  linksTitle = "Related Links",
  links = [],
  metadataLeft = [],
  metadataRight = [],
}) {
  return (
    <section className="page-container mt-8">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {aboutTitle && (
            <h3 className="text-sm font-bold text-zinc-100">{aboutTitle}</h3>
          )}
          {aboutBody && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {aboutBody}
            </p>
          )}
          {appearedIn && appearedIn.length > 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              <span className="text-zinc-400">Appeared in: </span>
              {appearedIn.map((a, i) => (
                <span key={a.mal_id}>
                  <Link
                    to={`/anime/${a.mal_id}`}
                    className="text-brand-500 hover:underline"
                  >
                    {a.title}
                  </Link>
                  {i < appearedIn.length - 1 && (
                    <span className="text-zinc-600"> · </span>
                  )}
                </span>
              ))}
            </p>
          )}
        </div>

        {links.length > 0 && (
          <div className="lg:col-span-3">
            <h3 className="sr-only">{linksTitle}</h3>
            <ul className="space-y-2 text-sm">
              {links
                .filter(
                  (l) => l && l.href && l.href !== "#" && /^https?:/i.test(l.href)
                )
                .map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2.5 text-zinc-300 transition hover:text-brand-500"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded text-zinc-400 group-hover:text-brand-500">
                        {l.icon}
                      </span>
                      <span className="font-semibold">{l.label}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <MetaColumn rows={metadataLeft} />
        <MetaColumn rows={metadataRight} />
      </div>
    </section>
  );
}

function MetaColumn({ rows = [] }) {
  if (!rows.length) return null;
  return (
    <dl className="space-y-1.5 text-xs lg:col-span-2">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="font-bold text-zinc-100">{k}:</dt>
          <dd className="text-zinc-400">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
