"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { AI_TUTOR_LAUNCHED, formatGbp, PMQ_SLUG } from "@/lib/pmq/constants";
import { AiTutorUpgradeCta } from "@/components/pmq/AiTutorUpgradeCta";
import { SlyTopUpDialog } from "@/components/pmq/SlyTopUpDialog";
import { SlyUsageMeter } from "@/components/pmq/SlyUsageMeter";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { CtaArrow } from "@/components/stamp-chip";
import { saveExamDeadline } from "@/lib/profile-actions";
import { PMQ_PLANS, type PmqPlanFeature } from "@/lib/pmq/plans";
import type { PmqTier } from "@/lib/pmq/tiers";
import { tierAtLeast } from "@/lib/pmq/tiers";
import type { FairUsageSummary } from "@/lib/tutor/fair-usage";
import {
  IconAudio,
  IconMock,
  IconPractice,
  IconVideo,
} from "@/components/pmq/PmqPreviewFeatureIcons";
import {
  productActionPrimary,
  productActionSecondary,
  productSurfaceQuiet,
} from "@/components/ui/semantic";
import styles from "./DashboardPmqCourseCard.module.css";

const PRO_PLAN_FEATURES =
  PMQ_PLANS.find((plan) => plan.id === "pro")?.features ?? [];

const PRO_FEATURE_ICONS: Partial<
  Record<PmqPlanFeature["icon"], ComponentType<{ className?: string }>>
> = {
  practice: IconPractice,
  mock: IconMock,
  video: IconVideo,
  audio: IconAudio,
};

/** Same mark as pricing Pro card “Everything in Starter, plus”. */
function InheritsArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M3 3v5.5a2 2 0 0 0 2 2h7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 8l3 2.5-3 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type DashboardPmqCourseCardProps = {
  courseName: string;
  overviewHref?: string;
  continueHref: string;
  continueLabel?: string;
  /** Next incomplete LO number — shown on Continue/Start; null when course complete. */
  nextLoNumber?: number | null;
  /** False when that LO has no pathway stages reached yet → "Start · LO N". */
  nextLoStarted?: boolean;
  streak: number;
  completionPercent: number;
  /** True when Sly (AI Pro) is unlocked — drives meter vs upgrade CTA. */
  tutorUnlocked: boolean;
  /**
   * Paid-tier mark beside the course name.
   * Prefer this over inferring from `tutorUnlocked` (Sly ≠ Pro).
   */
  userTier?: PmqTier;
  tutorPriceCents: number;
  tutorUsage?: FairUsageSummary | null;
  topUpSuccess?: boolean;
  /** YYYY-MM-DD from profiles.target_exam_date */
  examDeadline?: string | null;
};

function highlightFiveDays(name: string) {
  const parts = name.split(/(5[\s-]days?)/i);
  if (parts.length === 1) return name;
  return parts.map((part, i) =>
    /^5[\s-]days?$/i.test(part) ? (
      <span key={i} className="text-orange">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYmd(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function continueButtonLabel(
  label: string,
  nextLoNumber: number | null | undefined,
  nextLoStarted = true,
) {
  if (nextLoNumber != null && nextLoNumber > 0) {
    return `${nextLoStarted ? "Continue" : "Start"} · LO ${nextLoNumber}`;
  }
  if (label === "Continue studying") return "Continue";
  if (label === "Review course") return "Review";
  return label;
}

function ExamDeadlinePicker({
  id,
  value,
  pending,
  msg,
  onPick,
  popPlacement = "up",
}: {
  id: string;
  value: string;
  pending: boolean;
  msg: string | null;
  onPick: (ymd: string) => void;
  popPlacement?: "up" | "down";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseYmd(value), [value]);

  const startOfToday = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = selected
    ? selected.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Exam date";

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          selected ? `Exam date ${label}. Change date` : "Set exam date"
        }
        disabled={pending}
        onClick={() => setOpen((prev) => !prev)}
        className={`${styles.deadlineBtn}${selected ? "" : ` ${styles.deadlineBtnEmpty}`}`}
      >
        {label}
      </button>
      <span className={styles.deadlineStatus} aria-live="polite">
        {pending ? (
          <Spinner variant="ring" size={12} className="text-ink/45" aria-hidden />
        ) : msg === "Saved" ? (
          "Saved"
        ) : null}
      </span>
      {msg && msg !== "Saved" ? (
        <p className={styles.deadlineError}>{msg}</p>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label="Choose exam date"
          className={
            popPlacement === "down" ? styles.deadlinePopDown : styles.deadlinePop
          }
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected && selected >= startOfToday ? selected : startOfToday}
            disabled={{ before: startOfToday }}
            onSelect={(date) => {
              if (!date) return;
              const picked = new Date(date);
              picked.setHours(0, 0, 0, 0);
              if (picked < startOfToday) return;
              onPick(formatYmd(date));
              setOpen(false);
            }}
            className="w-full rounded-md p-1"
            classNames={{
              months: "relative flex w-full flex-col gap-1",
              month: "w-full",
              month_caption:
                "relative mx-6 mb-0 flex h-6 items-center justify-center z-20",
              caption_label: "text-[11px] font-semibold tracking-[-0.01em]",
              button_previous:
                "size-6 text-muted-foreground/80 hover:text-foreground p-0",
              button_next:
                "size-6 text-muted-foreground/80 hover:text-foreground p-0",
              weekdays: "flex w-full",
              weekday:
                "flex-1 p-0 text-center text-[9px] font-medium text-muted-foreground/80",
              week: "mt-0.5 flex w-full",
              day: "group flex-1 aspect-square p-0 text-[11px]",
              day_button:
                "relative flex size-full max-h-6 max-w-6 mx-auto items-center justify-center whitespace-nowrap rounded-md p-0 text-[11px] text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
              today:
                "*:after:pointer-events-none *:after:absolute *:after:bottom-0.5 *:after:start-1/2 *:after:z-10 *:after:size-[2px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
            }}
            components={{
              Chevron: ({ orientation, className }) =>
                orientation === "left" ? (
                  <ChevronLeft
                    size={12}
                    strokeWidth={2}
                    className={className}
                    aria-hidden
                  />
                ) : (
                  <ChevronRight
                    size={12}
                    strokeWidth={2}
                    className={className}
                    aria-hidden
                  />
                ),
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Dashboard PMQ course card — quiet SaaS console (next task → continue → meta → Pro).
 */
export function DashboardPmqCourseCard({
  courseName,
  overviewHref = `/courses/${PMQ_SLUG}`,
  continueHref,
  continueLabel = "Continue studying",
  nextLoNumber = null,
  nextLoStarted = true,
  streak,
  completionPercent,
  tutorUnlocked,
  userTier = "starter",
  tutorPriceCents,
  tutorUsage = null,
  topUpSuccess = false,
  examDeadline = null,
}: DashboardPmqCourseCardProps) {
  const router = useRouter();
  const panelId = useId();
  const deadlineId = useId();
  const showTutor = AI_TUTOR_LAUNCHED;
  const priceLabel = formatGbp(tutorPriceCents);
  const [includedOpen, setIncludedOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [navPending, startNav] = useTransition();
  const [overviewPending, startOverview] = useTransition();
  const [deadline, setDeadline] = useState(examDeadline ?? "");
  const [deadlineMsg, setDeadlineMsg] = useState<string | null>(null);
  const [deadlinePending, startDeadline] = useTransition();
  const anyNavPending = navPending || overviewPending;

  const overviewPath =
    overviewHref.startsWith("/") && overviewHref.length > 1
      ? overviewHref
      : `/courses/${PMQ_SLUG}`;

  const pct = Math.max(0, Math.min(100, Math.round(completionPercent)));
  const done = pct >= 100;
  const streakDays = Math.max(0, Math.floor(streak));

  useEffect(() => {
    setDeadline(examDeadline ?? "");
  }, [examDeadline]);

  function persistDeadline(next: string) {
    setDeadline(next);
    setDeadlineMsg(null);
    const fd = new FormData();
    fd.set("target_exam_date", next);
    startDeadline(async () => {
      const result = await saveExamDeadline(fd);
      if (!result.ok) {
        setDeadlineMsg(result.error);
        return;
      }
      setDeadlineMsg("Saved");
      window.setTimeout(() => setDeadlineMsg(null), 1800);
      router.refresh();
    });
  }

  const ctaLabel = continueButtonLabel(continueLabel, nextLoNumber, nextLoStarted);

  return (
    <article
      className={`${productSurfaceQuiet} relative z-20 flex w-full max-w-md flex-col overflow-visible`}
    >
      <div className="px-3.5 pb-3 pt-3 sm:px-4">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-1.5 pt-0.5">
            <a
              href={overviewPath}
              className="min-w-0 truncate font-display text-[1.125rem] font-bold tracking-[-0.02em] text-ink no-underline transition-colors duration-150 ease-[var(--ease-out-quint)] hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:text-[1.25rem]"
              title={courseName}
            >
              {highlightFiveDays(courseName)}
            </a>
            {userTier === "ai_pro" ? (
              <span
                className="inline-flex h-4 shrink-0 items-center rounded-[0.2rem] bg-[color-mix(in_srgb,var(--gold)_32%,rgb(var(--paper-rgb)))] px-0.5 text-[9px] font-semibold leading-none tracking-tight text-[color-mix(in_srgb,var(--gold)_55%,#241a12)]"
                aria-label="AI Pro unlocked"
              >
                AI Pro
              </span>
            ) : userTier === "pro" ? (
              <span
                className="inline-flex h-4 shrink-0 items-center rounded-[0.2rem] bg-teal/[0.12] px-0.5 text-[9px] font-semibold leading-none tracking-tight text-teal dark:bg-teal/[0.2]"
                aria-label="Pro unlocked"
              >
                Pro
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            <span
              className="inline-flex h-6 items-center gap-0.5 rounded-[0.25rem] bg-ink/[0.05] px-1.5 text-[11px] font-semibold tabular-nums tracking-tight text-ink dark:bg-white/[0.08]"
              aria-label={`${streakDays} day streak`}
            >
              <Flame
                className={`size-3 shrink-0 ${streakDays > 0 ? "text-orange" : "text-ink/35"}`}
                strokeWidth={2.25}
                aria-hidden
              />
              {streakDays}
            </span>
            <span
              className={`inline-flex h-6 items-center rounded-[0.25rem] bg-ink/[0.05] px-1.5 text-[11px] font-semibold tabular-nums tracking-tight dark:bg-white/[0.08] ${
                done ? "text-olive" : "text-ink"
              }`}
              aria-label={`${pct}% of course complete`}
            >
              {pct}%
            </span>
            <div className="relative z-[40] flex min-w-0 max-w-[8rem] items-center">
              <ExamDeadlinePicker
                id={deadlineId}
                value={deadline}
                pending={deadlinePending}
                msg={deadlineMsg}
                onPick={persistDeadline}
                popPlacement="down"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={anyNavPending}
            aria-busy={navPending}
            aria-label={navPending ? `Opening ${ctaLabel}` : ctaLabel}
            onClick={() => {
              startNav(() => {
                router.push(continueHref);
              });
            }}
            className={`${productActionPrimary} min-w-0 flex-1 !min-h-9 !rounded-xl !px-3 !text-[12.5px] !font-semibold disabled:cursor-wait disabled:opacity-90`}
          >
            {navPending ? (
              <Spinner variant="bars" size={14} className="text-paper" aria-hidden />
            ) : (
              <>
                {ctaLabel}
                <CtaArrow />
              </>
            )}
          </button>
          <button
            type="button"
            disabled={anyNavPending}
            aria-busy={overviewPending}
            aria-label={
              overviewPending ? "Opening course overview" : "Course overview"
            }
            onClick={() => {
              startOverview(() => {
                router.push(overviewPath);
              });
            }}
            className={`${productActionSecondary} min-w-0 flex-1 !min-h-9 !rounded-xl !border-ink/12 !px-3 !text-[12.5px] !font-semibold !text-ink/75 hover:!bg-ink/[0.04] disabled:cursor-wait disabled:opacity-90`}
          >
            {overviewPending ? (
              <Spinner variant="bars" size={14} className="text-ink/70" aria-hidden />
            ) : (
              "Course overview"
            )}
          </button>
        </div>
      </div>

      {showTutor && tutorUnlocked ? (
        <div className="relative z-0 mt-auto overflow-hidden rounded-b-xl border-t border-black/[0.08] bg-ink/[0.025] px-3.5 py-2.5 sm:px-4 dark:border-white/[0.12]">
          {tutorUsage ? (
            <SlyUsageMeter
              variant="card"
              usage={tutorUsage}
              onTopUp={() => setTopUpOpen(true)}
              topUpSuccess={topUpSuccess}
            />
          ) : (
            <p className="text-[12px] leading-snug text-ink/55">
              Fair-usage metre unavailable — refresh the page.
            </p>
          )}
        </div>
      ) : showTutor && !tierAtLeast(userTier, "pro") ? (
        <div className="relative z-0 mt-auto rounded-b-xl border-t border-black/[0.06] px-3.5 py-2 sm:px-4 dark:border-white/[0.1]">
          <div className="grid gap-2">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIncludedOpen((v) => !v)}
                className="inline-flex min-h-8 min-w-0 items-center gap-1 rounded-md px-1 text-[11px] font-medium tracking-tight text-ink/50 transition-colors duration-150 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                aria-expanded={includedOpen}
                aria-controls={panelId}
              >
                What&apos;s included
                <span
                  aria-hidden
                  className={`text-[10px] transition-transform duration-150 ease-[var(--ease-out-quint)] ${
                    includedOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              <AiTutorUpgradeCta
                variant="compact"
                size="sm"
                buttonAriaLabel={`Get Pro Bundle · ${priceLabel}`}
                buttonLabel={
                  <>
                    Get{" "}
                    <span className="inline-flex h-4 shrink-0 items-center rounded-[0.2rem] bg-teal px-1 text-[9px] font-bold leading-none tracking-tight text-paper">
                      Pro
                    </span>{" "}
                    Bundle · {priceLabel}
                  </>
                }
                priceCents={tutorPriceCents}
                returnPath="/dashboard"
                className="shrink-0 [&_button]:!min-h-8 [&_button]:!w-auto [&_button]:!rounded-lg [&_button]:!border [&_button]:!border-ink/70 [&_button]:!bg-ink [&_button]:!px-2.5 [&_button]:!py-1 [&_button]:!font-body [&_button]:!text-[11px] [&_button]:!font-semibold [&_button]:!normal-case [&_button]:!tracking-tight [&_button]:!text-paper hover:[&_button]:!bg-teal-deep"
              />
            </div>

            {includedOpen ? (
              <div
                id={panelId}
                className="w-full border-t border-ink/10 pt-2 text-left dark:border-white/10"
              >
                <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold leading-none tracking-tight text-ink/70">
                  <InheritsArrow className="size-[0.85rem] shrink-0 text-teal" />
                  All the starter pack features
                </p>
                <ul className="grid list-none gap-2">
                  {PRO_PLAN_FEATURES.map((feature) => {
                    const Icon = PRO_FEATURE_ICONS[feature.icon];
                    return (
                      <li
                        key={`${feature.icon}-${feature.label}`}
                        className="flex min-w-0 items-center gap-[0.45rem]"
                      >
                        {Icon ? (
                          <Icon className="inline-flex size-[1.1rem] shrink-0 items-center justify-center text-orange [&_svg]:!h-[1.1rem] [&_svg]:!w-[1.1rem]" />
                        ) : (
                          <span
                            className="size-[1.1rem] shrink-0"
                            aria-hidden
                          />
                        )}
                        <p className="min-w-0 text-[12px] font-medium leading-[1.3] tracking-tight text-ink/80 text-pretty">
                          {feature.value ? (
                            <>
                              <span className="font-bold tabular-nums text-ink">
                                {feature.value}
                              </span>{" "}
                            </>
                          ) : null}
                          {feature.label}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {topUpOpen ? (
        <SlyTopUpDialog
          open
          onClose={() => setTopUpOpen(false)}
          returnPath="/dashboard"
        />
      ) : null}
    </article>
  );
}
