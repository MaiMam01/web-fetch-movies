import { IconHeart, IconAlert } from "./Icons.jsx";

function IconDownload(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function IconShare(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="m8.6 10.6 6.8-3.2" />
      <path d="m8.6 13.4 6.8 3.2" />
    </svg>
  );
}

export default function SceneActionBar({ onShare }) {
  const onClickShare = () => {
    if (onShare) return onShare();
    if (navigator.share) {
      navigator.share({ url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
      <ActionButton icon={<IconHeart className="h-4 w-4" />} label="Favorite" />
      <ActionButton icon={<IconDownload className="h-4 w-4" />} label="Download" />
      <ActionButton
        icon={<IconShare className="h-4 w-4" />}
        label="Share"
        onClick={onClickShare}
      />
      <ActionButton icon={<IconAlert className="h-4 w-4" />} label="Report" />
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 transition hover:text-brand-500"
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );
}
