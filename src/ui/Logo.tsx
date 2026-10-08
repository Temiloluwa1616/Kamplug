type LogoProps = {
  /** Pixel size of the square mark. */
  size?: number;
  /** Set false to show the mark only. */
  wordmark?: boolean;
  className?: string;
};

/** A small plug: two prongs, a body, and an amber cord. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="9" fill="var(--color-brand)" />
      <rect x="11" y="6" width="3" height="7" rx="1.5" fill="#fff" />
      <rect x="18" y="6" width="3" height="7" rx="1.5" fill="#fff" />
      <path d="M9 13h14v3.5a7 7 0 0 1-14 0V13z" fill="#fff" />
      <rect x="14.5" y="23" width="3" height="5" rx="1.5" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ size = 32, wordmark = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {wordmark && (
        <span className="text-[1.15rem] font-bold tracking-tight text-ink">KamPlug</span>
      )}
    </span>
  );
}