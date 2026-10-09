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
    <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
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
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Profile
        </h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          How buyers and sellers see you
        </p>
      </div>

      {/* Identity card */}
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              width={64}
              height={64}
              referrerPolicy="no-referrer"
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-on-brand">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-lg font-bold text-ink">
              {user.displayName}
              {user.isVerified && <VerifiedTick />}
            </p>
            <p className="truncate text-sm text-ink-muted">
              @{user.username}
            </p>
            {user.username && (
              <Link
                href={`/@${user.username}`}
                className="mt-1 inline-block text-sm font-semibold text-brand hover:underline"
              >
                View public storefront →
              </Link>
            )}
          </div>
        </div>

        <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">University</dt>
            <dd className="truncate text-right font-medium text-ink">
              {uni?.shortName ?? uni?.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Faculty</dt>
            <dd className="truncate text-right font-medium text-ink">
              {fac?.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Department</dt>
            <dd className="truncate text-right font-medium text-ink">
              {dept?.name ?? "Not set"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Email</dt>
            <dd className="truncate text-right font-medium text-ink">
              {user.email ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Edit form */}
      <section className="mt-6 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="mb-5 text-lg font-bold tracking-tight text-ink">
          Edit your details
        </h2>
        <ProfileForm
          defaultDisplayName={user.displayName}
          defaultBio={user.bio ?? ""}
          defaultPhone={formatPhone(user.phone)}
        />
      </section>

      {/* Sign out */}
      <div className="mt-8 text-center">
        <Link
          href="/auth"
          className="text-sm font-medium text-ink-muted hover:text-danger"
        >
          Sign out
        </Link>
      </div>
    </main>
  );
}