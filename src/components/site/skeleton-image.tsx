import { useCallback, useState } from "react";

type SkeletonImageProps = {
  /** Remote image URL. When null, the neutral placeholder renders directly. */
  src: string | null | undefined;
  /** Sizing class applied to the frame (e.g. news-img, next-launch-img, launch-thumb). */
  className?: string;
  /** Alt text. Leave empty for decorative imagery (the default). */
  alt?: string;
  /** Load eagerly instead of lazily, for above-the-fold hero imagery. */
  eager?: boolean;
};

/**
 * Fixed-frame image with a shimmer skeleton while loading and a neutral
 * placeholder tile when the source is missing or fails. The frame always
 * reserves its final dimensions, so cards never shift layout as feeds load.
 */
export function SkeletonImage({ src, className = "", alt = "", eager = false }: SkeletonImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  );

  // Cached images can finish loading before React attaches onLoad; check
  // completion when the element mounts.
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete) {
      setStatus(el.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  return (
    <div className={`skel-img ${className} ${status === "loaded" ? "loaded" : ""}`} aria-hidden={alt === ""}>
      {status === "loading" ? <div className="skel-shimmer" /> : null}
      {src && status !== "error" ? (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      ) : null}
      {status === "error" ? (
        <div className="skel-fallback" role={alt ? "img" : undefined} aria-label={alt || undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <circle cx="12" cy="12" r="6.4" />
            <ellipse cx="12" cy="12" rx="6.4" ry="2.5" transform="rotate(28 12 12)" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
