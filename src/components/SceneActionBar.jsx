import { useNavigate } from "react-router-dom";
import { IconCheck, IconHeart, IconAlert } from "./Icons.jsx";
import useLocalToggle from "../hooks/useLocalToggle.js";

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

export default function SceneActionBar({ scene, onShare }) {
  const navigate = useNavigate();
  const sceneId = scene?.id;
  const [favorited, toggleFav] = useLocalToggle(
    sceneId ? `animedb:fav:scene:${sceneId}` : null
  );

  const onClickShare = () => {
    if (onShare) return onShare();
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      navigator
        .share({ url: window.location.href, title: scene?.title })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const onClickDownload = () => {
    // We don't host scene media — only metadata. Send users to a save action
    // that's actually useful: bookmarking the page for later.
    if (typeof window === "undefined") return;
    if (typeof window.print === "function") {
      // Most users won't expect "Download" → print, so use it as a fallback
      // only when the bookmark hint can't run inline. Print works everywhere.
      window.print();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton
        icon={
          favorited ? (
            <IconCheck className="h-4 w-4" />
          ) : (
            <IconHeart className="h-4 w-4" />
          )
        }
        label={favorited ? "Favorited" : "Favorite"}
        onClick={toggleFav}
        ariaPressed={favorited}
        active={favorited}
        accentText="hover:text-rose-300"
        accentBorder="hover:border-rose-400/40 hover:bg-rose-500/10"
      />
      <ActionButton
        icon={<IconDownload className="h-4 w-4" />}
        label="Save"
        onClick={onClickDownload}
        accentText="hover:text-cyan-300"
        accentBorder="hover:border-cyan-400/40 hover:bg-cyan-500/10"
      />
      <ActionButton
        icon={<IconShare className="h-4 w-4" />}
        label="Share"
        onClick={onClickShare}
        accentText="hover:text-fuchsia-300"
        accentBorder="hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10"
      />
      <ActionButton
        icon={<IconAlert className="h-4 w-4" />}
        label="Report"
        onClick={() => navigate("/feedback")}
        accentText="hover:text-amber-300"
        accentBorder="hover:border-amber-400/40 hover:bg-amber-500/10"
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  accentText,
  accentBorder,
  ariaPressed,
  active = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
      className={`btn btn-sm backdrop-blur ${
        active
          ? "border border-rose-400/50 bg-rose-500/15 text-rose-200"
          : `border border-zinc-800 bg-zinc-900/60 text-zinc-300 ${accentText} ${accentBorder}`
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );
}
