"use client";

import { useState, useTransition, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePicker, type UploadedImage } from "./ImagePicker";
import { publishListing, saveDraft } from "./actions";
import {
  LISTING_TYPES,
  CONDITIONS,
  type ListingType,
  type Condition,
} from "./validation";

type Category = { id: string; name: string };
type PickupLocation = { id: string; name: string };

type Props = {
  categories: Category[];
  pickupLocations: PickupLocation[];
  defaultPhone: string | null;
};

const FIELD =
  "w-full rounded-xl border border-line bg-surface px-4 text-base text-ink placeholder:text-ink-muted/60 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 h-13";
const LABEL = "mb-2 block text-sm font-semibold text-ink";

const TYPE_LABELS: Record<ListingType, string> = {
  sell: "Sell",
  swap: "Swap",
  rent: "Rent",
  free: "Give away",
  service: "Service",
};

const CONDITION_LABELS: Record<Condition, string> = {
  new: "Brand new",
  like_new: "Like new",
  used: "Used",
  for_parts: "For parts",
};

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="var(--color-line)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function SellForm({ categories, pickupLocations, defaultPhone }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<ListingType>("sell");
  const [condition, setCondition] = useState<Condition | "">("");
  const [price, setPrice] = useState("");
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [phone, setPhone] = useState(defaultPhone ?? "");

  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<string | undefined>();

  const draftTimer = useRef<NodeJS.Timeout | null>(null);

  // Autosave draft 1 second after the last change.
  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      void saveDraft({
        title,
        description,
        categoryId,
        type,
        condition,
        price,
        pickupLocationId,
        phone,
        images,
      });
    }, 1000);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [title, description, categoryId, type, condition, price, pickupLocationId, phone, images]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setErrorField(undefined);

    startTransition(async () => {
      const result = await publishListing({
        title,
        description,
        categoryId,
        type,
        condition: condition || undefined,
        price,
        pickupLocationId,
        phone,
        images: images.map((i) => i.url),
      });

      if (result.ok) {
        router.replace(`/listing/${result.listingId}`);
      } else {
        setError(result.error);
        setErrorField(result.field);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const isSellType = type === "sell";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-32">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-danger-soft p-3.5 text-sm text-danger"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="mt-px shrink-0">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 5v4.5M9 12.2v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Photos */}
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
        <ImagePicker value={images} onChange={setImages} />
      </section>

      {/* Details */}
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-5 text-lg font-bold tracking-tight text-ink">
          What are you listing?
        </h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className={LABEL}>Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="iPhone 12, 128GB, clean"
              maxLength={80}
              className={`${FIELD} ${errorField === "title" ? "border-danger" : ""}`}
            />
          </div>

          <div>
            <label htmlFor="description" className={LABEL}>
              Description <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details that help buyers: age, condition, why you're selling."
              maxLength={1000}
              rows={4}
              className={`${FIELD.replace("h-13", "min-h-28 py-3")} resize-y`}
            />
          </div>

          <div>
            <label htmlFor="category" className={LABEL}>Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${FIELD} ${errorField === "categoryId" ? "border-danger" : ""}`}
            >
              <option value="">Pick a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className={LABEL}>Type</span>
            <div className="flex flex-wrap gap-2">
              {LISTING_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`h-10 rounded-full px-4 text-sm font-semibold transition active:scale-[0.97] ${
                    type === t
                      ? "bg-brand text-on-brand"
                      : "border border-line bg-surface text-ink hover:border-ink-muted/50"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={LABEL}>
              Condition <span className="font-normal text-ink-muted">(optional)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(condition === c ? "" : c)}
                  className={`h-10 rounded-full px-4 text-sm font-semibold transition active:scale-[0.97] ${
                    condition === c
                      ? "bg-ink text-canvas"
                      : "border border-line bg-surface text-ink hover:border-ink-muted/50"
                  }`}
                >
                  {CONDITION_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price & contact */}
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-5 text-lg font-bold tracking-tight text-ink">
          Price and contact
        </h2>

        <div className="space-y-5">
          {isSellType && (
            <div>
              <label htmlFor="price" className={LABEL}>Price (₦)</label>
              <input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="12000"
                className={`${FIELD} ${errorField === "price" ? "border-danger" : ""}`}
              />
            </div>
          )}

          {pickupLocations.length > 0 && (
            <div>
              <label htmlFor="pickup" className={LABEL}>
                Preferred pickup spot <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <select
                id="pickup"
                value={pickupLocationId}
                onChange={(e) => setPickupLocationId(e.target.value)}
                className={FIELD}
              >
                <option value="">Let the buyer suggest</option>
                {pickupLocations.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="phone" className={LABEL}>WhatsApp number</label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              className={`${FIELD} ${errorField === "phone" ? "border-danger" : ""}`}
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Buyers will reach you on WhatsApp. Only people with an account can see this.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky publish bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent text-base font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Spinner />}
            {isPending ? "Publishing…" : "Publish listing"}
          </button>
        </div>
      </div>
    </form>
  );
}