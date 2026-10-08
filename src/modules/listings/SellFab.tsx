import Link from "next/link";

export function SellFab() {
  return (
    <Link
      href="/sell"
      aria-label="Sell an item"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-accent px-6 font-bold text-on-accent shadow-pop transition hover:brightness-[1.03] active:scale-[0.97] sm:hidden"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 4v12M4 10h12"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      Sell
    </Link>
  );
}