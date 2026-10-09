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

// Status is a dot plus a word, never colour alone.
const STATUS_DOT: Record<string, string> = {
  active: "bg-brand",
  sold: "bg-accent",
  removed: "bg-ink-muted",
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

const BTN =
  "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition active:scale-[0.98] disabled:opacity-60";
const BTN_OUTLINE = `${BTN} border border-line bg-surface text-ink hover:border-ink-muted/50`;

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
    <li className="p-4">
      <div className="flex gap-3.5">
        <Link
          href={`/listing/${listing.id}`}
          className="relative size-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-sand sm:size-24"
        >
          {listing.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.coverUrl}
              alt=""
              className={`size-full object-cover ${listing.status === "active" ? "" : "opacity-60 saturate-50"}`}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-brand-soft px-1 text-center text-xs font-medium text-ink-muted">
              No photo
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/listing/${listing.id}`}
            className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink hover:underline"
          >
            {listing.title}
          </Link>

          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="text-base font-extrabold tabular-nums text-ink">
              {formatPrice(listing.priceKobo, listing.type)}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-ink">
              <span aria-hidden="true" className={`size-2 rounded-full ${STATUS_DOT[listing.status]}`} />
              {STATUS_LABEL[listing.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Actions get the full row so nothing wraps awkwardly */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {confirmingDelete ? (
          <>
            <p className="mr-auto text-[13px] font-semibold text-ink">Delete this listing?</p>
            <button type="button" onClick={() => setConfirmingDelete(false)} className={BTN_OUTLINE}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => run(() => removeListing(listing.id))}
              disabled={isPending}
              className={`${BTN} bg-danger font-bold text-white`}
            >
              {isPending ? <Spinner /> : null}
              Confirm
            </button>
          </>
        ) : (
          <>
            {listing.status === "active" && (
              <>
                <button
                  type="button"
                  onClick={() => run(() => markAsSold(listing.id))}
                  disabled={isPending}
                  className={BTN_OUTLINE}
                >
                  {isPending ? <Spinner /> : null}
                  Mark as sold
                </button>
                <button
                  type="button"
                  disabled
                  className={`${BTN} border border-dashed border-line text-ink-muted`}
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
                className={`${BTN} bg-accent font-bold text-on-accent hover:brightness-[1.03]`}
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
                className={BTN_OUTLINE}
              >
                {isPending ? <Spinner /> : null}
                Restore
              </button>
            )}

            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className={`${BTN} ml-auto text-danger hover:bg-danger-soft`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}