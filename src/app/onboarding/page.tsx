import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/identity/session";
import { listUniversities } from "@/modules/identity/repo";
import { OnboardingForm } from "@/modules/identity/OnboardingForm";
import { Logo } from "@/ui/Logo";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (user.onboardingCompleted) redirect("/");

  const universities = await listUniversities();

  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Logo />

        <div className="my-auto py-10">
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-3xl">
            Set up your profile
          </h1>
          <p className="mt-2 text-base leading-relaxed text-ink-muted">
            Choose your university and pick a username. It takes under a minute, and buyers will
            see your username on your listings and storefront.
          </p>

          <div className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <OnboardingForm universities={universities} />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            Your university, faculty and department are self-declared. You can add your school
            email later to get the blue tick on your listings.
          </p>
        </div>
      </div>
    </main>
  );
}