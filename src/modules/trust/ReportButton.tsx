"use client";

import { useState, useTransition, type ReactNode } from "react";
import { submitReport, type ReportReason } from "./actions";

const REASONS: { value: ReportReason; label: string; help: string }[] = [
  { value: "scam", label: "Scam or fraud", help: "Seller or item isn't real" },
  { value: "prohibited", label: "Prohibited item", help: "Weapons, drugs, stolen goods" },
  { value: "wrong_category", label: "Wrong category", help: "Posted in the wrong place" },
  { value: "offensive", label: "Offensive content", help: "Abusive or inappropriate" },
  { value: "other", label: "Something else", help: "Tell us what's wrong" },
];

function FlagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5v15M4.5 3.5h10.2a.8.8 0 0 1 .6 1.3l-2.6 3.2 2.6 3.2a.8.8 0 0 1-.6 1.3H4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="var(--color-brand)" />
      <path
        d="M6 10.3l2.8 2.8L14 7.6"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReportButton({
  listingId,
  reportedUserId,
  variant = "text",
  children,
}: {
  listingId?: string;
  reportedUserId?: string;
  variant?: "text" | "menu";
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setReason(null);
    setDetails("");
    setError("");
    setDone(false);
  }

  function submit() {
    if (!reason) return;
    setError("");
    startTransition(async () => {
      const result = await submitReport({
        listingId,
        reportedUserId,
        reason,
        details: details.trim() || undefined,
      });
      if (result.ok) {
        setDone(true);
        setTimeout(close, 1800);
      } else {
        setError(result.error);
      }
    });
  }

  const trigger =
    variant === "menu" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-danger hover:bg-danger-soft"
      >
        {children ?? (
          <>
            <FlagIcon />
            Report
          </>
        )}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-danger"
      >
        <FlagIcon />
        {children ?? "Report"}
      </button>
    );

  return (
    <>
      {trigger}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-md rounded-t-3xl border border-line bg-surface p-5 shadow-pop sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckIcon />
                <h2 className="mt-3 text-lg font-bold text-ink">Report submitted</h2>
                <p className="mt-1 max-w-xs text-sm text-ink-muted">
                  Thanks. We&apos;ll review this and take action if needed.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h2 id="report-title" className="text-lg font-bold text-ink">
                    Report
                  </h2>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="flex size-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-sand active:scale-90"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M4 4l10 10M14 4l-10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <p className="mb-4 text-sm text-ink-muted">
                  Why are you reporting this?
                </p>

                <div className="space-y-1.5">
                  {REASONS.map((r) => {
                    const selected = reason === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setReason(r.value)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-brand bg-brand-soft"
                            : "border-line bg-surface hover:border-ink-muted/40"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-brand bg-brand" : "border-line"
                          }`}
                        >
                          {selected && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                              <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink">{r.label}</p>
                          <p className="text-xs text-ink-muted">{r.help}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {reason === "other" && (
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Tell us what's wrong"
                    maxLength={500}
                    rows={3}
                    className="mt-4 w-full resize-y rounded-xl border border-line bg-surface p-3 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                  />
                )}

                {error && (
                  <p role="alert" className="mt-4 text-sm text-danger">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={!reason || isPending}
                  aria-busy={isPending}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-danger text-base font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Submitting…" : "Submit report"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}