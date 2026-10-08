"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  completeOnboarding,
  checkUsernameAvailable,
  fetchFaculties,
  fetchDepartments,
} from "./actions";

type University = { id: string; name: string; shortName: string };
type Faculty = { id: string; name: string };
type Department = { id: string; name: string };

type Props = {
  universities: University[];
};

function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
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

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="var(--color-line)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const FIELD =
  "w-full h-12 rounded-xl border border-line bg-surface px-4 text-base text-ink placeholder:text-ink-muted/60 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

const LABEL = "block text-sm font-semibold text-ink mb-2";

export function OnboardingForm({ universities }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "ok" | "error"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const checkRef = useRef(0);

  const [universityId, setUniversityId] = useState("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [error, setError] = useState("");

  // Username check: debounced, cancelled on stale results.
  useEffect(() => {
    if (!username) return;
    const id = ++checkRef.current;
    const t = setTimeout(async () => {
      setUsernameStatus("checking");
      const result = await checkUsernameAvailable(username);
      if (checkRef.current !== id) return;
      if (result.available) {
        setUsernameStatus("ok");
        setUsernameMessage("Available");
      } else {
        setUsernameStatus("error");
        setUsernameMessage(result.reason ?? "Unavailable");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username]);

  // Handlers reset dependent state instead of using effects.
  function handleUsernameChange(raw: string) {
    const next = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(next);
    if (!next) {
      setUsernameStatus("idle");
      setUsernameMessage("");
    }
  }

  function handleUniversityChange(next: string) {
    setUniversityId(next);
    setFacultyId("");
    setFaculties([]);
    setDepartmentId("");
    setDepartments([]);
    if (!next) return;
    setLoadingFaculties(true);
    startTransition(async () => {
      const list = await fetchFaculties(next);
      setFaculties(list);
      setLoadingFaculties(false);
    });
  }

  function handleFacultyChange(next: string) {
    setFacultyId(next);
    setDepartmentId("");
    setDepartments([]);
    if (!next) return;
    setLoadingDepartments(true);
    startTransition(async () => {
      const list = await fetchDepartments(next);
      setDepartments(list);
      setLoadingDepartments(false);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (usernameStatus === "error") {
      setError("Fix your username before continuing");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboarding({
        username,
        universityId,
        facultyId,
        departmentId,
      });
      if (result.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  const canSubmit =
    username.length > 0 &&
    usernameStatus === "ok" &&
    !!universityId &&
    !!facultyId &&
    !isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className={LABEL}>
          Pick a username
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-ink-muted">
            @
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="john_doe"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={20}
            className={`${FIELD} pl-9 pr-10`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            {usernameStatus === "checking" && <Spinner />}
            {usernameStatus === "ok" && <Tick />}
          </span>
        </div>
        <p
          className={`mt-1.5 text-sm ${
            usernameStatus === "ok"
              ? "text-brand"
              : usernameStatus === "error"
                ? "text-danger"
                : "text-ink-muted"
          }`}
        >
          {usernameStatus === "checking"
            ? "Checking…"
            : usernameMessage || "Lowercase letters, numbers and underscores."}
        </p>
      </div>

      <div>
        <label htmlFor="university" className={LABEL}>
          University
        </label>
        <select
          id="university"
          value={universityId}
          onChange={(e) => handleUniversityChange(e.target.value)}
          className={FIELD}
        >
          <option value="">Select your university</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.shortName} — {u.name}
            </option>
          ))}
        </select>
      </div>

      {universityId && (
        <div>
          <label htmlFor="faculty" className={LABEL}>
            Faculty
          </label>
          <select
            id="faculty"
            value={facultyId}
            onChange={(e) => handleFacultyChange(e.target.value)}
            disabled={loadingFaculties}
            className={FIELD}
          >
            <option value="">
              {loadingFaculties ? "Loading…" : "Select your faculty"}
            </option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {facultyId && (
        <div>
          <label htmlFor="department" className={LABEL}>
            Department <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={loadingDepartments}
            className={FIELD}
          >
            <option value="">
              {loadingDepartments ? "Loading…" : "Skip for now"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

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

      <button
        type="submit"
        disabled={!canSubmit}
        aria-busy={isPending}
        className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Spinner />
            Saving…
          </>
        ) : (
          "Continue"
        )}
      </button>
    </form>
  );
}