// Star toggle used to bookmark satellites across the tracker pages.
export function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.6l6.1-.8z" />
    </svg>
  );
}

export function FavButton({
  isFav,
  name,
  onToggle,
}: {
  isFav: boolean;
  name: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`fav-toggle${isFav ? " is-fav" : ""}`}
      aria-pressed={isFav}
      aria-label={isFav ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
      onClick={onToggle}
    >
      <StarIcon filled={isFav} />
    </button>
  );
}
