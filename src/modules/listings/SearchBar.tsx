"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Inner component. Parent re-mounts this with a `key` when the URL changes. */
function SearchBarInner({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const q = value.trim();
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function clear() {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={submit} role="search" className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search phones, textbooks, services…"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search listings"
        className="h-13 w-full rounded-2xl border border-line bg-surface pl-11 pr-11 text-base text-ink placeholder:text-ink-muted/70 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-sand active:scale-95"
        >
          <CloseIcon />
        </button>
      )}
    </form>
  );
}

/**
 * Outer wrapper: reads the current ?q= from the URL and passes it as the
 * initial value. React's `key` prop re-mounts the inner component when the
 * query changes, so state stays in sync without an effect.
 */
export function SearchBar() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  return <SearchBarInner key={initial} initialQuery={initial} />;
}