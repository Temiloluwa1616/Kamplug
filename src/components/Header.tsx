"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Logo } from "@/ui/Logo";

/** Screens that have their own full-page layout and don't need the header. */
const HIDDEN_ON = ["/auth", "/onboarding"];

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  if (image) {
    return (
      // Plain <img>: Google avatar hosts aren't configured for next/image.
      // no-referrer stops Google from rejecting the request.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        width={36}
        height={36}
        referrerPolicy="no-referrer"
        className="size-9 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
      {getInitials(name)}
    </span>
  );
}

const MENU_LINK =
  "flex h-11 items-center rounded-xl px-3 text-[15px] font-medium text-ink hover:bg-sand";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu on outside tap or Escape (and return focus to the button).
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/auth");
      router.refresh();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="KamPlug home" className="rounded-lg">
          <Logo size={30} />
        </Link>

        <div className="flex items-center gap-3">
          {isPending ? (
            // Reserve the space so the header doesn't jump when the session loads.
            <span className="size-9 animate-pulse rounded-full bg-line" aria-hidden="true" />
          ) : session ? (
            <>
              <Link
                href="/sell"
                className="hidden h-9 items-center rounded-full bg-accent px-4 text-sm font-bold text-on-accent transition active:scale-[0.98] sm:inline-flex"
              >
                Sell an item
              </Link>

              <div ref={menuRef} className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={open}
                  aria-controls="account-menu"
                  className={`rounded-full ring-2 transition ${open ? "ring-brand" : "ring-transparent"}`}
                >
                  <Avatar name={session.user.name} image={session.user.image} />
                </button>

                {open && (
                  <div
                    id="account-menu"
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-pop"
                  >
                    <div className="px-3 pb-2.5 pt-2">
                      <p className="truncate text-sm font-semibold text-ink">{session.user.name}</p>
                      <p className="truncate text-xs text-ink-muted">{session.user.email}</p>
                    </div>
                    <div className="border-t border-line pt-1.5">
                      <Link href="/profile" onClick={() => setOpen(false)} className={MENU_LINK}>
                        Profile
                      </Link>
                      <Link href="/profile/listings" onClick={() => setOpen(false)} className={MENU_LINK}>
                        My listings
                      </Link>
                      <Link href="/saved" onClick={() => setOpen(false)} className={MENU_LINK}>
                        Saved
                      </Link>
                    </div>
                    <div className="mt-1.5 border-t border-line pt-1.5">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className={`${MENU_LINK} w-full text-left disabled:opacity-60`}
                      >
                        {signingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-on-brand transition active:scale-[0.98]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}