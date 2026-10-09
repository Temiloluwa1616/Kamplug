import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/identity/session";
import { listCategories } from "@/modules/listings/repo";
import { listPickupLocations } from "@/modules/listings/repo";
import { SellForm } from "@/modules/listings/SellForm";

export const metadata = {
  title: "Sell an item — KamPlug",
};

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (!user.onboardingCompleted) redirect("/onboarding");

  const [categories, pickupLocations] = await Promise.all([
    listCategories(),
    listPickupLocations(user.universityId!),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Sell an item
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Takes under a minute. Buyers see it instantly.
        </p>
      </div>

      <SellForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        pickupLocations={pickupLocations}
        defaultPhone={user.phone}
      />
    </main>
  );
}