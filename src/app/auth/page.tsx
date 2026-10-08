"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Logo } from "@/ui/Logo";

/* ------------------------------------------------------------------ */
/* Decorative campus feed. This is the one memorable thing on the page. */
/* ------------------------------------------------------------------ */

type Tile = {
  title: string;
  price: string;
  tone: string;
  shape: string;
  verified: boolean;
};

const TILES: readonly Tile[] = [
  { title: "Vanilla perfume", price: "₦12,000", tone: "bg-accent-soft", shape: "bg-accent", verified: true },
  { title: "Ankara two-piece", price: "from ₦15,000", tone: "bg-brand-soft", shape: "bg-brand", verified: true },
  { title: "Mini fridge", price: "₦45,000", tone: "bg-sand", shape: "bg-ink-muted", verified: false },
  { title: "Box braids", price: "from ₦8,000", tone: "bg-[#d3e8dd]", shape: "bg-brand-deep", verified: false },
];

function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="var(--color-verified)" />
      <path
        d="M4 7.2l2 2L10 5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListingTile({ tile, index }: { tile: Tile; index: number }) {
  return (
    <div
      className="animate-rise rounded-2xl border border-line bg-surface p-2 shadow-card"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className={`relative aspect-[4/5] overflow-hidden rounded-xl ${tile.tone}`}>
        <span className={`absolute left-[18%] top-[22%] size-[46%] rounded-full opacity-90 ${tile.shape}`} />
        <span className={`absolute bottom-[14%] right-[14%] h-[34%] w-[52%] rounded-lg opacity-30 ${tile.shape}`} />
      </div>
      <div className="px-1 pb-1 pt-2.5">
        <p className="truncate text-[13px] font-medium text-ink">{tile.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold tabular-nums text-ink">
          {tile.price}
          {tile.verified && <Tick />}
        </p>
      </div>
    </div>
  );
}

function FeedPreview({ className = "" }: { className?: string }) {
  const [a, b, c, d] = TILES as [Tile, Tile, Tile, Tile];
  return (
    <div aria-hidden="true" className={`grid grid-cols-2 gap-3 ${className}`}>
      <div className="space-y-3">
        <ListingTile tile={a} index={0} />
        <ListingTile tile={c} index={2} />
      </div>
      <div className="space-y-3 pt-8">
        <ListingTile tile={b} index={1} />
        <ListingTile tile={d} index={3} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="var(--color-line)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If the person taps Back from Google's screen, the browser may restore this
  // page from cache with the button still stuck in its loading state.
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) setLoading(false);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
      if (result?.error) throw new Error(result.error.message);
      // On success the browser is redirected, so we deliberately stay in the loading state.
    } catch {
      setError("We couldn't reach Google. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Left: the sign-in column */}
      <div className="flex flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 lg:px-16">
        <Logo />

        {/* Phones and tablets: a peek at the feed above the fold */}
        <div className="-mx-2 mt-6 h-60 overflow-hidden rounded-3xl bg-brand-soft px-5 pt-5 lg:hidden">
          <div className="h-full [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
            <FeedPreview />
          </div>
        </div>

        <div className="my-auto w-full max-w-sm py-10">
          <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
            Everything students sell, in one place.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Perfumes, fashion, gadgets, tailors and more, listed by students on your campus.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            aria-busy={loading}
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface text-base font-semibold text-ink shadow-card transition hover:border-ink-muted/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Spinner /> : <GoogleIcon />}
            {loading ? "Connecting to Google…" : "Continue with Google"}
          </button>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl bg-danger-soft p-3.5 text-sm text-danger"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="mt-px shrink-0">
                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 5v4.5M9 12.2v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
            <span className="mt-0.5">
              <Tick />
            </span>
            A marketplace for students. Look for the blue tick on verified sellers.
          </p>
        </div>

        <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
          By continuing, you agree to the{" "}
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Right: desktop only */}
      <aside className="relative hidden items-center justify-center overflow-hidden bg-brand lg:flex">
        <div className="absolute -right-28 -top-28 size-[26rem] rounded-full bg-brand-deep/70" />
        <div className="absolute -bottom-36 -left-24 size-80 rounded-full bg-accent/15" />
        <div className="relative w-full max-w-md px-6">
          <FeedPreview className="-rotate-3" />
          <p className="mt-10 max-w-xs text-lg font-semibold leading-snug text-on-brand">
            Find it, message the seller on WhatsApp, pick it up on campus.
          </p>
        </div>
      </aside>
    </main>
  );
}