"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AvatarImage } from "@/components/AvatarImage";
import { AVATARS, resolveAvatarId, type AvatarId } from "@/lib/avatars";
import {
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_LIMITS,
} from "@/lib/profile-limits";
import { saveUserProfile } from "@/lib/profile-actions";
import {
  ToastSave,
  type ToastSaveState,
} from "@/components/ui/toast-save";
import type { UserProfile } from "@/types/profile";

type DashboardProfileMenuProps = {
  email: string;
  initial: UserProfile;
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[11px] font-medium leading-none tracking-tight text-ink/55"
    >
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-lg border border-black/[0.08] bg-paper px-2 py-1.5 font-body text-[12.5px] font-medium tracking-tight text-ink placeholder:font-normal placeholder:text-ink/35 focus:border-black/[0.2] focus:outline-none focus:ring-2 focus:ring-orange/25 dark:border-white/[0.12] dark:focus:border-white/[0.22]";

function profileSnapshot(
  profile: UserProfile,
  avatar: AvatarId,
): string {
  return JSON.stringify({
    avatar_id: avatar,
    first_name: profile.first_name?.trim() ?? "",
    last_name: profile.last_name?.trim() ?? "",
    age: profile.age == null ? "" : String(profile.age),
    profession: profile.profession?.trim() ?? "",
    company: profile.company?.trim() ?? "",
    study_goal: profile.study_goal?.trim() ?? "",
  });
}

function readFormSnapshot(
  form: HTMLFormElement,
  avatar: AvatarId,
): string {
  const data = new FormData(form);
  return JSON.stringify({
    avatar_id: avatar,
    first_name: String(data.get("first_name") ?? "").trim(),
    last_name: String(data.get("last_name") ?? "").trim(),
    age: String(data.get("age") ?? "").trim(),
    profession: String(data.get("profession") ?? "").trim(),
    company: String(data.get("company") ?? "").trim(),
    study_goal: String(data.get("study_goal") ?? "").trim(),
  });
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 text-ink/40 transition-[transform,color] duration-150 ease-[var(--ease-out-quint)] group-hover:text-ink/60 ${
        open ? "rotate-180 text-ink/60" : ""
      }`}
    >
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DashboardProfileMenu({
  email,
  initial,
}: DashboardProfileMenuProps) {
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId>(
    resolveAvatarId(initial.avatar_id),
  );
  const [formKey, setFormKey] = useState(0);
  const [baseline, setBaseline] = useState(() =>
    profileSnapshot(initial, resolveAvatarId(initial.avatar_id)),
  );
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<ToastSaveState | "idle">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const firstName = initial.first_name?.trim() || "";
  const lastName = initial.last_name?.trim() || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;
  const triggerLabel = displayName ?? "Edit profile";
  const triggerAria = displayName
    ? `Profile for ${displayName}`
    : "Edit profile";
  const saving = saveState === "loading";
  const showSaveToast = dirty || saveState === "loading" || saveState === "success";

  function syncDirty(nextAvatar: AvatarId = avatarId) {
    const form = formRef.current;
    if (!form) {
      setDirty(false);
      return;
    }
    const nextDirty = readFormSnapshot(form, nextAvatar) !== baseline;
    setDirty(nextDirty);
    if (nextDirty && saveState === "success") {
      setSaveState("initial");
    } else if (nextDirty && saveState === "idle") {
      setSaveState("initial");
    } else if (!nextDirty && saveState === "initial") {
      setSaveState("idle");
    }
  }

  function computePanelPos(trigger: HTMLElement) {
    const r = trigger.getBoundingClientRect();
    const gap = 6;
    const margin = 8;
    const top = r.bottom + gap;
    const width = Math.min(19.5 * 16, window.innerWidth - margin * 2);
    // Prefer aligning under the trigger; clamp so the panel stays on-screen.
    let left = r.left;
    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - margin - width;
    }
    left = Math.max(margin, left);
    return {
      top,
      left,
      width,
      maxHeight: Math.max(180, window.innerHeight - top - 12),
    };
  }

  useEffect(() => {
    if (open) return;
    const nextAvatar = resolveAvatarId(initial.avatar_id);
    setAvatarId(nextAvatar);
    setBaseline(profileSnapshot(initial, nextAvatar));
  }, [initial, open]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setDirty(false);
      setSaveState("idle");
      return;
    }
    setError(null);
    setDirty(false);
    setSaveState("idle");
    const nextAvatar = resolveAvatarId(initial.avatar_id);
    setAvatarId(nextAvatar);
    setBaseline(profileSnapshot(initial, nextAvatar));
    setFormKey((k) => k + 1);
    // Reset panel form only when the dialog opens — not on every profile refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open-gated
  }, [open]);

  useEffect(() => {
    if (saveState !== "success") return;
    const t = window.setTimeout(() => {
      setSaveState("idle");
      setDirty(false);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [saveState]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }

    function placePanel() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      setPanelPos(computePanelPos(trigger));
    }

    function onPointerDown(e: MouseEvent | PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (
        target instanceof Element &&
        target.closest("[data-profile-backdrop]")
      ) {
        setOpen(false);
        return;
      }
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    placePanel();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", placePanel);

    const prevOverflow = document.body.style.overflow;
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", placePanel);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, isMobile]);

  function close() {
    setError(null);
    setDirty(false);
    setSaveState("idle");
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    // Capture the form element BEFORE any await.
    //
    // `e.currentTarget` is only valid while the event is dispatching — the DOM
    // sets it to null once the handler's synchronous portion returns. Reading it
    // after `await saveUserProfile(...)` therefore yields null, and
    // `readFormSnapshot(null)` throws inside `new FormData(null)`. That throw was
    // caught below and shown as "Couldn't save your profile" — even though the
    // save had already succeeded. Root cause of the OPERATIONS.md entry
    // "Profile save failed with no server-side trace" (confirmed 2026-07-30:
    // the row was written while the user saw the error).
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("avatar_id", avatarId);
    setError(null);
    setSaveState("loading");

    try {
      const result = await saveUserProfile(formData);
      if (!result.ok) {
        setError(result.error);
        setSaveState("initial");
        return;
      }
      const nextBaseline = readFormSnapshot(form, avatarId);
      setBaseline(nextBaseline);
      setDirty(false);
      setSaveState("success");
      router.refresh();
    } catch (err) {
      // This branch means saveUserProfile() itself threw (network failure,
      // or — likely in dev — a stale Server Action reference after a hot
      // reload), not a graceful `{ok:false}` from the action. Previously
      // silent; log it so the real cause is visible in DevTools next time
      // instead of just this generic message. See OPERATIONS.md, "Profile
      // save failed with no server-side trace."
      console.error("[DashboardProfileMenu] saveUserProfile threw:", err);
      setError("Couldn’t save your profile. Try again.");
      setSaveState("initial");
    }
  }

  const panelBody = (
    <form
      key={formKey}
      ref={formRef}
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      onInput={() => {
        if (error) setError(null);
        syncDirty();
      }}
      className="overflow-hidden"
    >
      <div className="relative flex items-center gap-2.5 border-b border-black/[0.08] px-3 py-2.5 pr-10 dark:border-white/[0.12]">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-black/[0.08] dark:ring-white/[0.12]">
          <AvatarImage avatarId={avatarId} size={36} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-ink">
            {displayName ?? "Your profile"}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-medium tracking-tight text-ink/45">
            {email}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          disabled={saving}
          aria-label="Close edit profile"
          className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-lg text-ink/40 transition-[background-color,color] duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange disabled:cursor-wait disabled:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M4 4l8 8M12 4 4 12"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-2.5 px-3 py-2.5">
        <fieldset>
          <legend className="sr-only">Avatar</legend>
          <div className="grid w-full grid-cols-5 items-center justify-items-center gap-1">
            {AVATARS.map((avatar) => {
              const isOn = avatar.id === avatarId;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    if (error) setError(null);
                    setAvatarId(avatar.id);
                    syncDirty(avatar.id);
                  }}
                  aria-pressed={isOn}
                  aria-label={avatar.label}
                  className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-avatar-plate transition-[box-shadow,opacity] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                    isOn
                      ? "ring-2 ring-orange ring-offset-1 ring-offset-paper"
                      : "ring-1 ring-black/[0.08] hover:opacity-90 dark:ring-white/[0.12]"
                  }`}
                >
                  <AvatarImage avatarId={avatar.id} size={32} />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel htmlFor="profile-first-name">First name</FieldLabel>
            <input
              id="profile-first-name"
              name="first_name"
              type="text"
              maxLength={PROFILE_LIMITS.first_name}
              defaultValue={initial.first_name ?? ""}
              autoComplete="given-name"
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="profile-last-name">Last name</FieldLabel>
            <input
              id="profile-last-name"
              name="last_name"
              type="text"
              maxLength={PROFILE_LIMITS.last_name}
              defaultValue={initial.last_name ?? ""}
              autoComplete="family-name"
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="profile-age">Age</FieldLabel>
            <input
              id="profile-age"
              name="age"
              type="number"
              inputMode="numeric"
              min={PROFILE_AGE_MIN}
              max={PROFILE_AGE_MAX}
              defaultValue={initial.age ?? ""}
              className={fieldClass}
            />
          </div>
          <div>
            <FieldLabel htmlFor="profile-profession">Profession</FieldLabel>
            <input
              id="profile-profession"
              name="profession"
              type="text"
              maxLength={PROFILE_LIMITS.profession}
              defaultValue={initial.profession ?? ""}
              autoComplete="organization-title"
              className={fieldClass}
            />
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="profile-company">Company</FieldLabel>
            <input
              id="profile-company"
              name="company"
              type="text"
              maxLength={PROFILE_LIMITS.company}
              defaultValue={initial.company ?? ""}
              autoComplete="organization"
              className={fieldClass}
              placeholder="Where you work"
            />
          </div>
          <div className="col-span-2">
            <FieldLabel htmlFor="profile-study-goal">
              Life achievement
            </FieldLabel>
            <input
              id="profile-study-goal"
              name="study_goal"
              type="text"
              maxLength={PROFILE_LIMITS.study_goal}
              defaultValue={initial.study_goal ?? ""}
              className={fieldClass}
              placeholder="one life achievement you are proud of"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pb-2.5 pt-0.5">
        <div className="min-h-[1rem] min-w-0 flex-1" aria-live="polite">
          {error ? (
            <p className="truncate font-body text-[11px] font-medium text-ink/55">
              {error}
            </p>
          ) : null}
        </div>
        {showSaveToast && saveState !== "idle" ? (
          <ToastSave
            state={saveState}
            onSave={() => formRef.current?.requestSubmit()}
            initialText="Unsaved"
            successText="Saved"
            className="shrink-0"
          />
        ) : null}
      </div>
    </form>
  );

  return (
    <div ref={rootRef} className="relative z-30 shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerAria}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next && triggerRef.current) {
              setPanelPos(computePanelPos(triggerRef.current));
            }
            return next;
          });
        }}
        className={`group inline-flex max-w-[min(100%,11.5rem)] items-center gap-1.5 rounded-xl border border-black/[0.08] py-0.5 pl-0.5 pr-1.5 transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out-quint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:max-w-[13rem] dark:border-white/[0.12] ${
          open
            ? "bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.05)]"
            : "bg-paper/90 hover:border-black/[0.14] hover:bg-paper dark:hover:border-white/[0.18]"
        }`}
      >
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-avatar-plate ring-1 ring-black/[0.08] dark:ring-white/[0.12]">
          <AvatarImage avatarId={avatarId} size={28} />
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[12px] font-medium leading-none tracking-tight text-ink/80">
          {triggerLabel}
        </span>
        <Chevron open={open} />
      </button>

      {open && isMobile && typeof document !== "undefined" && panelPos
        ? createPortal(
            <>
              <div
                data-profile-backdrop
                className="fixed inset-0 z-[100] bg-ink/35 motion-safe:animate-[profile-fade_160ms_var(--ease-out-quint)]"
                aria-hidden
              />
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-label="Edit profile"
                style={{
                  top: panelPos.top,
                  left: panelPos.left,
                  width: panelPos.width,
                  maxHeight: panelPos.maxHeight,
                }}
                className="fixed z-[110] origin-top-left overflow-y-auto overscroll-contain rounded-xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_10px_28px_rgb(var(--ink-rgb)_/_0.1)] motion-safe:animate-[profile-pop_160ms_var(--ease-out-quint)] dark:border-white/[0.12]"
              >
                {panelBody}
              </div>
            </>,
            document.body,
          )
        : null}

      {open && !isMobile ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Edit profile"
          className="absolute right-0 top-[calc(100%+0.4rem)] z-[50] w-[min(100vw-2rem,19.5rem)] origin-top-right overflow-hidden rounded-xl border border-black/[0.08] bg-paper shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_10px_28px_rgb(var(--ink-rgb)_/_0.1)] motion-safe:animate-[profile-pop_160ms_var(--ease-out-quint)] dark:border-white/[0.12]"
        >
          {panelBody}
        </div>
      ) : null}
    </div>
  );
}
