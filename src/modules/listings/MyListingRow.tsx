"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { markAsSold, relist, removeListing } from "./actions";
import type { MyListing } from "./repo";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  sold: "Sold",
  removed: "Removed",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-brand-soft text-brand",
  sold: "bg-accent-soft text-accent",
  removed: "bg-sand text-ink-muted",
};

function formatPrice(priceKobo: number | null, type: string): string {
  if (priceKobo === null) {
    if (type === "free") return "Free";
    if (type === "swap") return "Swap";
    if (type === "service") return "Contact";
    return "";
  }
  return `₦${(priceKobo / 100).toLocaleString("en-NG")}`;
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="var(--color-line)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function MyListingRow({ listing }: { listing: MyListing }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function run(action: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) router.refresh();
    });
  }

  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card sm:gap-4 sm:p-4">
      <Link
        href={`/listing/${listing.id}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand sm:size-24"
      >
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.coverUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-ink-muted">
            No photo
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/listing/${listing.id}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:underline"
          >
            {listing.title}
          </Link>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[listing.status]}`}
          >
            {STATUS_LABEL[listing.status]}
          </span>
        </div>

        <p className="mt-1 text-sm font-bold tabular-nums text-ink">
          {formatPrice(listing.priceKobo, listing.type)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {listing.status === "active" && (
            <>
              <button
                type="button"
                onClick={() => run(() => markAsSold(listing.id))}
                disabled={isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-xs font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? <Spinner /> : null}
                Mark as sold
              </button>
              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-xs font-semibold text-ink-muted"
              >
                Edit (soon)
              </button>
            </>
          )}

          {listing.status === "sold" && (
            <button
              type="button"
              onClick={() => run(() => relist(listing.id))}
              disabled={isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-xs font-bold text-on-accent transition hover:brightness-[1.03] active:scale-[0.98] disabled:opacity-60"
            >
              {isPending ? <Spinner /> : null}
              Relist
            </button>
          )}

          {listing.status === "removed" && (
            <button
              type="button"
              onClick={() => run(() => relist(listing.id))}
              disabled={isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-xs font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98] disabled:opacity-60"
            >
              {isPending ? <Spinner /> : null}
              Restore
            </button>
          )}

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex h-9 items-center rounded-full px-3.5 text-xs font-semibold text-danger transition hover:bg-danger-soft active:scale-[0.98]"
            >
              Delete
            </button>
          ) : (
            <span className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => run(() => removeListing(listing.id))}
                disabled={isPending}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-danger px-3.5 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                {isPending ? <Spinner /> : null}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-xs font-medium text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}