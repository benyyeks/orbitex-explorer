// ORBITEX brand mark: a single tilted orbital ellipse with one solid
// satellite node, monochrome via currentColor so it adapts to light/dark.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="16"
        cy="16"
        rx="12.5"
        ry="7.5"
        stroke="currentColor"
        strokeWidth="1.9"
        transform="rotate(-20 16 16)"
      />
      <circle cx="25.3" cy="10.9" r="2.6" fill="currentColor" />
    </svg>
  );
}

export function BrandWord() {
  return (
    <span className="brand-word">
      ORBITE<span>X</span>
    </span>
  );
}
