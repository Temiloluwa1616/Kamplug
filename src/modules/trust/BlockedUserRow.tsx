"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleBlock } from "./actions";

export function BlockedUserRow({
  user,
}: {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    universityShortName: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  function unblock() {
    setRemoved(true); // hide immediately
    startTransition(async () => {
      const result = await toggleBlock(user.id);
      if (!result.ok) {
        setRemoved(false); // revert on failure
        return;
      }
      router.refresh();
    });
  }

  if (removed) return null;

  return (
    <li className="flex items-center gap-3 p-4">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          width={48}
          height={48}
          referrerPolicy="no-referrer"
          className="size-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-on-brand">
          {user.displayName.charAt(0).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <Link
          href={`/@${user.username}`}
          className="block truncate text-[15px] font-semibold text-ink hover:underline"
        >
          {user.displayName}
        </Link>
        <p className="truncate text-sm text-ink-muted">
          @{user.username} · {user.universityShortName}
        </p>
      </div>

      <button
        type="button"
        onClick={unblock}
        disabled={isPending}
        className="inline-flex h-10 shrink-0 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "…" : "Unblock"}
      </button>
    </li>
  );
}