const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

export function IconSearch(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconImage(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function IconPlay(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" />
    </svg>
  );
}

export function IconEye(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconStar(props) {
  return (
    <svg {...baseProps} {...props} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.95 6 6.6.95-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.1 1.13-6.58L2.45 9.45l6.6-.95z" />
    </svg>
  );
}

export function IconStarOutline(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 2.5l2.95 6 6.6.95-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.1 1.13-6.58L2.45 9.45l6.6-.95z" />
    </svg>
  );
}

export function IconHeart(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconFlag(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 22V4" />
      <path d="M4 4h12l-2 4 2 4H4" />
    </svg>
  );
}

export function IconChevronRight(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconChevronDown(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconUser(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconGrid(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconSliders(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" fill="#0a0a0b" />
      <circle cx="16" cy="12" r="2" fill="#0a0a0b" />
      <circle cx="10" cy="18" r="2" fill="#0a0a0b" />
    </svg>
  );
}

export function IconHome(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

export function IconBell(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
    </svg>
  );
}

export function IconShare(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="m8.6 10.6 6.8-3.2" />
      <path d="m8.6 13.4 6.8 3.2" />
    </svg>
  );
}

export function IconTrendUp(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m6 14 6-6 4 4 6-6" />
      <path d="M22 8h-6" />
      <path d="M22 8v6" />
    </svg>
  );
}

export function IconExternalLink(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconMessage(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z" />
    </svg>
  );
}

export function IconMoreVertical(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export function IconThumbsDown(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M17 14V3H7l-4 9v11h10l4-9z" />
      <path d="M21 14h-4V3h4" />
    </svg>
  );
}

export function IconVolumeOn(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M11 5L6 9H2v6h4l5 4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M19 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

export function IconVolumeMute(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M11 5L6 9H2v6h4l5 4z" />
      <path d="M22 9l-6 6M16 9l6 6" />
    </svg>
  );
}

export function IconFullscreen(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function IconLink(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

export function IconGear(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconUserPlus(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="9" cy="8" r="4" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

export function IconThumbsUp(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 10v11h10l4-9V8h-7l1-5-3-1-5 8H3v10h4" />
    </svg>
  );
}

export function IconUpload(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M7 9l5-5 5 5" />
      <path d="M12 4v12" />
    </svg>
  );
}

export function IconGlobe(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
    </svg>
  );
}

export function IconLocation(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconHelp(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9a3 3 0 1 1 5.4 1.5c-.6.9-1.7 1-1.7 2v1" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconRss(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" />
    </svg>
  );
}

export function IconAlert(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function StarRating({ value = 0, max = 5, className = "" }) {
  const filled = Math.round(value);
  return (
    <div className={`flex items-center gap-0.5 text-amber-400 ${className}`}>
      {Array.from({ length: max }).map((_, i) =>
        i < filled ? (
          <IconStar key={i} className="h-4 w-4" />
        ) : (
          <IconStarOutline key={i} className="h-4 w-4 text-zinc-600" />
        )
      )}
    </div>
  );
}

export function formatCompact(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
