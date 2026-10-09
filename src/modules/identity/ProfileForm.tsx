"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

type Props = {
  defaultDisplayName: string;
  defaultBio: string;
  defaultPhone: string;
};

const FIELD =
  "w-full h-13 rounded-xl border border-line bg-surface px-4 text-base text-ink placeholder:text-ink-muted/60 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15";
const LABEL = "mb-2 block text-sm font-semibold text-ink";

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProfileForm({
  defaultDisplayName,
  defaultBio,
  defaultPhone,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [bio, setBio] = useState(defaultBio);
  const [phone, setPhone] = useState(defaultPhone);

  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  const dirty =
    displayName !== defaultDisplayName ||
    bio !== defaultBio ||
    phone !== defaultPhone;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setErrorField(undefined);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProfile({ displayName, bio, phone });
      if (result.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.error);
        setErrorField(result.field);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {saved && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl bg-brand-soft p-3.5 text-sm font-medium text-brand"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5.5 9.2l2.4 2.4L12.5 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Profile saved</p>
        </div>
      )}

      <div>
        <label htmlFor="displayName" className={LABEL}>
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name"
          maxLength={60}
          className={`${FIELD} ${errorField === "displayName" ? "border-danger" : ""}`}
        />
      </div>

      <div>
        <label htmlFor="bio" className={LABEL}>
          Bio <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell buyers a little about yourself"
          maxLength={300}
          rows={3}
          className={`${FIELD.replace("h-13", "min-h-24 py-3")} resize-y ${errorField === "bio" ? "border-danger" : ""}`}
        />
        <p className="mt-1.5 text-xs text-ink-muted">
          {bio.length}/300
        </p>
      </div>

      <div>
        <label htmlFor="phone" className={LABEL}>
          WhatsApp number
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0801 234 5678"
          className={`${FIELD} ${errorField === "phone" ? "border-danger" : ""}`}
        />
        <p className="mt-1.5 text-xs text-ink-muted">
          Buyers reach you on WhatsApp. Only people with an account can see this.
        </p>
      </div>

      <button
        type="submit"
        disabled={!dirty || isPending}
        aria-busy={isPending}
        className="flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent text-base font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-muted disabled:shadow-none"
      >
        {isPending && <Spinner />}
        {isPending ? "Saving…" : dirty ? "Save changes" : "Nothing to save"}
      </button>
    </form>
  );
}