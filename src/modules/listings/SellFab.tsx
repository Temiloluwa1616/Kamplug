"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Screens where a floating Sell button would be redundant or in the way. */
const HIDDEN_ON = ["/auth", "/onboarding", "/sell", "/admin", "/legal"];

export function SellFab() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <Link
      href="/sell"
      aria-label="Sell an item"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-accent pl-5 pr-6 text-base font-bold text-on-accent shadow-pop transition hover:brightness-[1.03] active:scale-[0.97] sm:hidden"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      Sell
    </Link>
  );
}