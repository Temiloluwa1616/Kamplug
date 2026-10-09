import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/identity/session";
import { db } from "@/lib/db";
import { universities, faculties, departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/modules/identity/ProfileForm";

export const metadata = {
  title: "Profile — KamPlug",
};

function VerifiedTick() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" role="img" aria-label="Verified" className="shrink-0">
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

function formatPhone(e164: string | null): string {
  if (!e164) return "";
  if (!e164.startsWith("+234") || e164.length !== 14) return e164;
  const local = "0" + e164.slice(4);
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (!user.onboardingCompleted) redirect("/onboarding");

  const [uni, fac, dept] = await Promise.all([
    user.universityId
      ? db
          .select({ name: universities.name, shortName: universities.shortName })
          .from(universities)
          .where(eq(universities.id, user.universityId))
          .limit(1)
          .then((r) => r[0])
      : null,
    user.facultyId
      ? db
          .select({ name: faculties.name })
          .from(faculties)
          .where(eq(faculties.id, user.facultyId))
          .limit(1)
          .then((r) => r[0])
      : null,
    user.departmentId
      ? db
          .select({ name: departments.name })
          .from(departments)
          .where(eq(departments.id, user.departmentId))
          .limit(1)
          .then((r) => r[0])
      : null,
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <h1 className="sr-only">Profile</h1>

      {/* Identity card */}
      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="relative h-24 overflow-hidden bg-brand sm:h-28" aria-hidden="true">
          <span className="absolute -right-10 -top-20 size-52 rounded-full bg-brand-deep/70" />
          <span className="absolute -bottom-14 left-1/3 size-28 rounded-full bg-accent/25" />
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          {/* relative so the avatar paints above the banner */}
          <div className="relative -mt-9 flex items-end justify-between gap-3">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                width={80}
                height={80}
                referrerPolicy="no-referrer"
                className="size-20 shrink-0 rounded-full object-cover ring-4 ring-surface"
              />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-on-brand ring-4 ring-surface">
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            )}

            {user.username && (
              <Link
                href={`/@${user.username}`}
                className="inline-flex h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-ink-muted/50 active:scale-[0.98]"
              >
                View storefront
              </Link>
            )}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-ink">
            <span className="truncate">{user.displayName}</span>
            {user.isVerified && <VerifiedTick />}
          </p>
          <p className="truncate text-sm text-ink-muted">@{user.username}</p>

          <dl className="mt-5 divide-y divide-line border-t border-line text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink-muted">University</dt>
              <dd className="truncate text-right font-semibold text-ink">
                {uni?.shortName ?? uni?.name ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink-muted">Faculty</dt>
              <dd className="truncate text-right font-semibold text-ink">
                {fac?.name ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink-muted">Department</dt>
              <dd className="truncate text-right font-semibold text-ink">
                {dept?.name ?? "Not set"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 pt-3">
              <dt className="text-ink-muted">Email</dt>
              <dd className="truncate text-right font-semibold text-ink">
                {user.email ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Edit form */}
      <section className="mt-6 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="mb-6 text-lg font-extrabold tracking-tight text-ink">
          Edit your details
        </h2>
        <ProfileForm
          defaultDisplayName={user.displayName}
          defaultBio={user.bio ?? ""}
          defaultPhone={formatPhone(user.phone)}
        />
      </section>

      {/* Sign out */}
      <div className="mt-8">
        <Link
          href="/auth"
          className="flex h-12 w-full items-center justify-center rounded-full border border-line text-sm font-semibold text-ink-muted transition hover:border-danger/40 hover:text-danger active:scale-[0.99]"
        >
          Sign out
        </Link>
      </div>
    </main>
  );
}