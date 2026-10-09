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

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">Photos</span>
        <span className="text-xs font-medium text-ink-muted">Up to 3</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SLOTS.map((slotIndex) => {
          const slot = slots[slotIndex];
          const isFilled = slot.status !== "empty";
          return (
            <div key={slotIndex} className="relative aspect-square">
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
                  className="flex size-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-surface transition hover:border-brand/40 active:scale-[0.98]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 6v12M6 12h12"
                      stroke="var(--color-ink-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xs font-medium text-ink-muted">
                    {slotIndex === 0 ? "Cover" : "Add"}
                  </span>
                </button>
              ) : (
                <div className="relative size-full overflow-hidden rounded-2xl bg-sand">
                  {/* Local preview: shows instantly, before upload finishes. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.previewUrl}
                    alt=""
                    className="size-full object-cover"
                  />

                  {(slot.status === "compressing" || slot.status === "uploading") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/60 backdrop-blur-sm">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
                        <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                        <path d="M18 10a8 8 0 0 0-8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-[11px] font-medium text-white">
                        {slot.status === "compressing" ? "Compressing…" : "Uploading…"}
                      </span>
                    </div>
                  )}

                  {slot.status === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-danger/70 p-2 text-center">
                      <span className="text-[11px] font-medium leading-tight text-white">
                        {slot.error ?? "Failed"}
                      </span>
                      <button
                        type="button"
                        onClick={() => inputRefs.current[slotIndex]?.click()}
                        className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink"
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
                      className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-ink/75 text-white backdrop-blur-sm transition active:scale-90"
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

                  {slotIndex === 0 && slot.status === "done" && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      Cover
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
        First photo is your cover. Good light and a plain background sell faster.
      </p>
    </div>
  );
}