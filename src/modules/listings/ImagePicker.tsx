"use client";

import { useRef, useState } from "react";
import { compressImage } from "./compress";
import { requestUploadUrl } from "./upload";

export type UploadedImage = {
  url: string;
  slot: number;
};

type SlotState = {
  status: "empty" | "compressing" | "uploading" | "done" | "error";
  previewUrl?: string; // local object URL for immediate preview
  uploadedUrl?: string; // final R2 URL
  error?: string;
};

const SLOTS = [0, 1, 2] as const;

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.1a1 1 0 0 0 .8-.4l.9-1.2a1 1 0 0 1 .8-.4h3.8a1 1 0 0 1 .8.4l.9 1.2a1 1 0 0 0 .8.4h1.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ImagePicker({
  value,
  onChange,
}: {
  value: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
}) {
  const [slots, setSlots] = useState<SlotState[]>(
    SLOTS.map(() => ({ status: "empty" }))
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function updateSlot(index: number, next: Partial<SlotState>) {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...next };
      return copy;
    });
  }

  function commitToParent(index: number, url: string) {
    const others = value.filter((v) => v.slot !== index);
    onChange([...others, { url, slot: index }].sort((a, b) => a.slot - b.slot));
  }

  async function handleFile(index: number, file: File) {
    const localPreview = URL.createObjectURL(file);
    updateSlot(index, {
      status: "compressing",
      previewUrl: localPreview,
      error: undefined,
    });

    try {
      const compressed = await compressImage(file);

      updateSlot(index, { status: "uploading" });

      const presign = await requestUploadUrl({
        contentType: compressed.type,
        size: compressed.size,
        slot: index,
      });

      if (!presign.ok) {
        updateSlot(index, { status: "error", error: presign.error });
        return;
      }

      const res = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: compressed,
        headers: { "Content-Type": compressed.type },
      });

      if (!res.ok) {
        updateSlot(index, {
          status: "error",
          error: "Upload failed. Check your connection.",
        });
        return;
      }

      updateSlot(index, {
        status: "done",
        uploadedUrl: presign.publicUrl,
      });
      commitToParent(index, presign.publicUrl);
    } catch {
      updateSlot(index, {
        status: "error",
        error: "Couldn't process that image.",
      });
    }
  }

  function handleRemove(index: number) {
    const slot = slots[index];
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
    updateSlot(index, {
      status: "empty",
      previewUrl: undefined,
      uploadedUrl: undefined,
      error: undefined,
    });
    onChange(value.filter((v) => v.slot !== index));
  }

  function handleInputChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (file) void handleFile(index, file);
    e.target.value = "";
  }

  const filledCount = slots.filter((s) => s.status !== "empty").length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">Photos</span>
        <span className="text-xs font-medium tabular-nums text-ink-muted">
          {filledCount} of {SLOTS.length}
        </span>
      </div>

      {/* One big cover slot, two small ones stacked beside it */}
      <div className="grid grid-cols-3 gap-3">
        {SLOTS.map((slotIndex) => {
          const slot = slots[slotIndex];
          const isFilled = slot.status !== "empty";
          const isCover = slotIndex === 0;
          return (
            <div
              key={slotIndex}
              className={isCover ? "relative col-span-2 row-span-2" : "relative aspect-square"}
            >
              <input
                ref={(el) => {
                  inputRefs.current[slotIndex] = el;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange(slotIndex, e)}
                className="hidden"
              />

              {!isFilled ? (
                <button
                  type="button"
                  onClick={() => inputRefs.current[slotIndex]?.click()}
                  aria-label={isCover ? "Add cover photo" : `Add photo ${slotIndex + 1}`}
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-center transition active:scale-[0.99] ${
                    isCover
                      ? "border-brand/35 bg-brand-soft/60 hover:border-brand/60"
                      : "border-line bg-surface text-ink-muted hover:border-brand/40"
                  }`}
                >
                  {isCover ? (
                    <>
                      <span className="flex size-12 items-center justify-center rounded-full bg-brand text-on-brand">
                        <CameraIcon />
                      </span>
                      <span className="text-sm font-bold text-ink">Add cover photo</span>
                      <span className="text-xs leading-snug text-ink-muted">
                        Take one or choose from your gallery
                      </span>
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      <span className="text-xs font-medium">Add</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="absolute inset-0 overflow-hidden rounded-2xl bg-sand">
                  {/* Local preview: shows instantly, before upload finishes. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.previewUrl}
                    alt={isCover ? "Cover photo preview" : `Photo ${slotIndex + 1} preview`}
                    className="size-full object-cover"
                  />

                  {(slot.status === "compressing" || slot.status === "uploading") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/60">
                      <Spinner />
                      <span className="text-xs font-semibold text-white">
                        {slot.status === "compressing" ? "Compressing…" : "Uploading…"}
                      </span>
                    </div>
                  )}

                  {slot.status === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/80 p-2 text-center">
                      <span className="text-xs font-medium leading-tight text-white">
                        {slot.error ?? "Failed"}
                      </span>
                      <button
                        type="button"
                        onClick={() => inputRefs.current[slotIndex]?.click()}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink active:scale-95"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {(slot.status === "done" || slot.status === "error") && (
                    <button
                      type="button"
                      onClick={() => handleRemove(slotIndex)}
                      aria-label="Remove image"
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-ink/75 text-white transition active:scale-90"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M4 4l6 6M10 4l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}

                  {isCover && slot.status === "done" && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white">
                      Cover
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        First photo is your cover. Good light and a plain background sell faster.
      </p>
    </div>
  );
}