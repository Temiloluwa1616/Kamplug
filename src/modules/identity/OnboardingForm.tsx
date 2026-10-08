"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  completeOnboarding,
  checkUsernameAvailable,
  fetchFaculties,
  fetchDepartments,
} from "./actions";

type University = { id: string; name: string; shortName: string };
type Option = { id: string; name: string };
type Props = { universities: University[] };
type UsernameStatus = "idle" | "checking" | "ok" | "error";

const USERNAME_MIN = 3;

/* ------------------------------ icons ------------------------------ */
/* Note: the verified-blue tick is reserved for verified sellers.       */
/* Form feedback uses brand green instead.                              */

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="var(--color-line)" strokeWidth="2.5" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="10" fill="var(--color-brand)" />
      <path d="M6 10.3l2.8 2.8L14 7.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="var(--color-danger)" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" stroke="var(--color-ink-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------- field pieces --------------------------- */

const CONTROL =
  "h-13 w-full rounded-xl border border-line bg-surface px-4 text-base transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:bg-sand disabled:text-ink-muted";

function Field({
  id,
  label,
  optional,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-semibold text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-medium text-ink-muted">Optional</span>}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  id,
  label,
  optional,
  value,
  onChange,
  placeholder,
  options,
  loading,
}: {
  id: string;
  label: string;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Option[];
  loading?: boolean;
}) {
  return (
    <Field id={id} label={label} optional={optional}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          aria-busy={loading}
          className={`${CONTROL} appearance-none pr-11 ${value ? "text-ink" : "text-ink-muted"}`}
        >
          <option value="">{loading ? "Loading…" : placeholder}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id} className="text-ink">
              {o.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? <SpinnerIcon /> : <ChevronIcon />}
        </span>
      </div>
    </Field>
  );
}

/* ------------------------------- form ------------------------------- */

export function OnboardingForm({ universities }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  // With a single campus there is nothing to choose, so it is preselected.
  const onlyUniversity = universities.length === 1 ? universities[0] : undefined;
  const onlyUniversityId = onlyUniversity?.id;

  const [universityId, setUniversityId] = useState(onlyUniversityId ?? "");
  const [faculties, setFaculties] = useState<Option[]>([]);
  const [facultyId, setFacultyId] = useState("");
  const [loadingFaculties, setLoadingFaculties] = useState(Boolean(onlyUniversityId));

  const [departments, setDepartments] = useState<Option[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  const [error, setError] = useState("");

  // Request counters: a response only counts if it belongs to the latest request.
  const facultyReq = useRef(0);
  const departmentReq = useRef(0);
  const usernameReq = useRef(0);

  const loadFaculties = useCallback(async (forUniversityId: string) => {
    const req = ++facultyReq.current;
    try {
      const list = await fetchFaculties(forUniversityId);
      if (req === facultyReq.current) setFaculties(list);
    } catch {
      if (req === facultyReq.current) {
        setError("We couldn't load faculties. Check your connection and try again.");
      }
    } finally {
      if (req === facultyReq.current) setLoadingFaculties(false);
    }
  }, []);

  const loadDepartments = useCallback(async (forFacultyId: string) => {
    const req = ++departmentReq.current;
    try {
      const list = await fetchDepartments(forFacultyId);
      if (req === departmentReq.current) setDepartments(list);
    } catch {
      if (req === departmentReq.current) {
        setError("We couldn't load departments. You can skip this and add it later.");
      }
    } finally {
      if (req === departmentReq.current) setLoadingDepartments(false);
    }
  }, []);

  // Preselected campus: fetch its faculties on first render.
  // `loadingFaculties` already starts as true for this case, and every setState
  // below happens after an await, never synchronously inside the effect.
  useEffect(() => {
    if (!onlyUniversityId) return;
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchFaculties(onlyUniversityId);
        if (!cancelled) setFaculties(list);
      } catch {
        if (!cancelled) {
          setError("We couldn't load faculties. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoadingFaculties(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onlyUniversityId]);

  // Debounced username availability check.
  useEffect(() => {
    if (username.length < USERNAME_MIN) return;
    const req = ++usernameReq.current;
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailable(username);
        if (req !== usernameReq.current) return;
        setUsernameStatus(result.available ? "ok" : "error");
        setUsernameMessage(result.available ? "" : (result.reason ?? "That username isn't available."));
      } catch {
        if (req !== usernameReq.current) return;
        setUsernameStatus("error");
        setUsernameMessage("We couldn't check that right now. Try again.");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  function handleUsernameChange(raw: string) {
    const next = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
    usernameReq.current++; // drop any check still in flight
    setUsername(next);
    setUsernameMessage("");
    setUsernameStatus(next.length >= USERNAME_MIN ? "checking" : "idle");
  }

  function handleUniversityChange(next: string) {
    setUniversityId(next);
    setFacultyId("");
    setFaculties([]);
    setDepartmentId("");
    setDepartments([]);
    facultyReq.current++;
    departmentReq.current++;
    setLoadingDepartments(false);
    setError("");
    if (!next) {
      setLoadingFaculties(false);
      return;
    }
    setLoadingFaculties(true);
    void loadFaculties(next);
  }

  function handleFacultyChange(next: string) {
    setFacultyId(next);
    setDepartmentId("");
    setDepartments([]);
    departmentReq.current++;
    setError("");
    if (!next) {
      setLoadingDepartments(false);
      return;
    }
    setLoadingDepartments(true);
    void loadDepartments(next);
  }

  const busy = isPending || done;
  const canSubmit =
    username.length >= USERNAME_MIN &&
    usernameStatus === "ok" &&
    Boolean(universityId) &&
    Boolean(facultyId) &&
    !busy;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");

    startTransition(async () => {
      try {
        const result = await completeOnboarding({ username, universityId, facultyId, departmentId });
        if (result.ok) {
          setDone(true); // keep the button locked while we navigate
          router.replace("/");
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch {
        setError("Something went wrong. Check your connection and try again.");
      }
    });
  }

  /* progress: campus, faculty, username */
  const steps = [Boolean(universityId), Boolean(facultyId), usernameStatus === "ok"];
  const stepsDone = steps.filter(Boolean).length;

  let hint = "3 to 20 characters. Letters, numbers and underscores.";
  let hintTone = "text-ink-muted";
  if (usernameStatus === "checking") hint = "Checking availability…";
  if (usernameStatus === "ok") {
    hint = `Available. Your shop link will be /@${username}`;
    hintTone = "text-brand";
  }
  if (usernameStatus === "error") {
    hint = usernameMessage;
    hintTone = "text-danger";
  }

  const usernameBorder =
    usernameStatus === "ok" ? "border-brand" : usernameStatus === "error" ? "border-danger" : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Progress */}
      <div>
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((isDone, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${isDone ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {stepsDone} of 3 steps complete
        </p>
      </div>

      {/* Campus */}
      {onlyUniversity ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Your campus</p>
          <div className="flex items-center gap-3 rounded-xl border border-brand/25 bg-brand-soft p-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
              {onlyUniversity.shortName.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-ink">{onlyUniversity.name}</p>
              <p className="text-sm text-ink-muted">Selected for you</p>
            </div>
            <CheckIcon />
          </div>
        </div>
      ) : (
        <SelectField
          id="university"
          label="University"
          value={universityId}
          onChange={handleUniversityChange}
          placeholder="Select your university"
          options={universities.map((u) => ({ id: u.id, name: `${u.name} (${u.shortName})` }))}
        />
      )}

      {/* Faculty */}
      {universityId && (
        <SelectField
          id="faculty"
          label="Faculty"
          value={facultyId}
          onChange={handleFacultyChange}
          placeholder="Select your faculty"
          options={faculties}
          loading={loadingFaculties}
        />
      )}

      {/* Department */}
      {facultyId && (
        <SelectField
          id="department"
          label="Department"
          optional
          value={departmentId}
          onChange={setDepartmentId}
          placeholder="Skip for now"
          options={departments}
          loading={loadingDepartments}
        />
      )}

      {/* Username */}
      <Field id="username" label="Pick a username">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-ink-muted">
            @
          </span>
          <input
            id="username"
            type="text"
            inputMode="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="aisha_perfumes"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            maxLength={20}
            aria-describedby="username-hint"
            aria-invalid={usernameStatus === "error"}
            className={`${CONTROL} pl-9 pr-12 placeholder:text-ink-muted/60 ${usernameBorder}`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            {usernameStatus === "checking" && <SpinnerIcon />}
            {usernameStatus === "ok" && <CheckIcon />}
            {usernameStatus === "error" && <CrossIcon />}
          </span>
        </div>
        <p id="username-hint" aria-live="polite" className={`mt-2 text-sm leading-snug ${hintTone}`}>
          {hint}
        </p>
      </Field>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-danger-soft p-3.5 text-sm text-danger">
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
        aria-busy={busy}
        className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent text-base font-bold text-on-accent shadow-card transition hover:brightness-[1.03] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-muted disabled:shadow-none"
      >
        {busy && <SpinnerIcon />}
        {busy ? "Setting up your profile…" : "Continue"}
      </button>
    </form>
  );
}