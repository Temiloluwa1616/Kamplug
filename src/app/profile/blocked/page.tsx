import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/identity/session";
import { listBlockedUsers } from "@/modules/trust/actions";
import { BlockedUserRow } from "@/modules/trust/BlockedUserRow";

export const metadata = {
  title: "Blocked accounts — KamPlug",
};

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l8 3v5.5c0 4.5-3.4 8.5-8 9.5-4.6-1-8-5-8-9.5V6l8-3z"
        stroke="var(--color-brand)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12l2.5 2.5 4.5-5"
        stroke="var(--color-brand)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function BlockedAccountsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (!user.onboardingCompleted) redirect("/onboarding");

  const blocked = await listBlockedUsers();
  const count = blocked.length;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-6">
        <Link
          href="/profile"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M9.5 4L5.5 8l4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Profile
        </Link>

        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
          Blocked accounts
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {count === 0
            ? "No blocked accounts"
            : `${count} ${count === 1 ? "account" : "accounts"} blocked`}
        </p>
      </div>

      {count > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {blocked.map((u) => (
            <BlockedUserRow key={u.id} user={u} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft">
            <ShieldIcon />
          </span>
          <p className="mt-4 text-base font-bold text-ink">
            You haven&apos;t blocked anyone
          </p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-muted">
            When you block someone, their listings stop showing up in your
            feed. They&apos;ll appear here so you can unblock them anytime.
          </p>
        </div>
      )}
    </main>
  );
}