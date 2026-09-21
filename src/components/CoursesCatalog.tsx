"use client";

import type { MouseEvent, ReactNode } from "react";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/database";
import {
  type CatalogFilter,
  filterCatalogCourses,
} from "@/lib/courses-catalog";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import {
  PMQ_OVERVIEW_HREF,
  PMQ_PREVIEW_HREF,
  PMQ_PRICING_HREF,
} from "@/lib/pmq/plans";
import {
  PFQ_BASE_HREF,
  PFQ_PREVIEW_HREF,
  PFQ_PRICING_HREF,
} from "@/lib/pfq/constants";
import { PfqNotifyDialog } from "@/components/PfqNotifyDialog";
import {
  CtaArrow,
  stampCtaPrimary,
  stampCtaSecondary,
} from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import { trackCtaClicked } from "@/lib/analytics/events";
import { isSoftNavClick } from "@/lib/soft-nav-back";
import styles from "@/components/CoursesCatalog.module.css";

/** Homepage catalogue CTAs — shared min-h-11 tokens, no compact !min-h overrides. */
const CARD_PRIMARY = `${stampCtaPrimary} !normal-case !tracking-[-0.01em]`;
const CARD_SECONDARY = `${stampCtaSecondary} !normal-case !tracking-[-0.01em]`;
/** Tertiary “View plans” — quieter than secondary (text link, no hover wash). */
const CARD_TERTIARY =
  "group inline-flex min-h-11 w-fit items-center justify-center gap-1.5 rounded-xl border border-transparent bg-transparent px-3 font-body text-[13px] font-semibold tracking-tight text-ink/65 underline-offset-2 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2";

type CoursesCatalogProps = {
  courses: Course[];
  isSignedIn: boolean;
  enrolledSlugs?: string[];
  /** Hide page title + filter (embed under another section heading). */
  showToolbar?: boolean;
};

const FILTERS: { id: CatalogFilter; label: string }[] = [
  { id: "all", label: "All courses" },
  { id: "live", label: "Live" },
  { id: "coming", label: "Coming soon" },
];

const ILLUSTRATIONS: Partial<Record<string, string>> = {
  [PMQ_SLUG]: "/brand/Courses/pmq-in-5-days.png",
  "pfq-in-2-days": "/brand/Courses/pfq-in-2-days.png",
};

function CourseSubhead({ course }: { course: Course }) {
  if (course.slug === PMQ_SLUG) {
    return (
      <p className={styles.subhead}>
        <span className={styles.subheadLine}>
          Covers all 24 learning objectives and 71 learning outcomes in the APM
          PMQ syllabus.
        </span>
      </p>
    );
  }
  if (course.slug === "pfq-in-2-days") {
    return (
      <p className={styles.subhead}>
        <span className={styles.subheadLine}>
          Covers all 10 learning objectives and 59 learning outcomes in the APM
          PFQ syllabus.
        </span>
      </p>
    );
  }
  return <p className={styles.subheadMuted}>Coming soon</p>;
}

function CourseTitle({ course }: { course: Course }) {
  if (course.slug === PMQ_SLUG) {
    return (
      <>
        PMQ in <span className="text-orange">5 Days</span>
      </>
    );
  }
  if (course.slug === "pfq-in-2-days") {
    return (
      <>
        PFQ in <span className="text-orange">2 Days</span>
      </>
    );
  }
  return <>{course.name}</>;
}

function FilterDropdown({
  value,
  onChange,
}: {
  value: CatalogFilter;
  onChange: (next: CatalogFilter) => void;
}) {
  const selectId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const active = FILTERS.find((item) => item.id === value) ?? FILTERS[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`${styles.filterDropdown} ${
        open ? styles.filterDropdownOpen : ""
      }`}
      ref={rootRef}
    >
      <span className={styles.filterLabel} id={`${selectId}-label`}>
        Filter
      </span>

      {/* Mobile: native OS picker */}
      <div className={styles.filterNativeShell}>
        <select
          id={selectId}
          className={styles.filterSelect}
          value={value}
          aria-labelledby={`${selectId}-label`}
          onChange={(event) => onChange(event.target.value as CatalogFilter)}
        >
          {FILTERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <svg
          className={styles.filterChevron}
          viewBox="0 0 16 16"
          aria-hidden
        >
          <path
            d="M4.2 6.2 8 10l3.8-3.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Desktop: LIC-themed menu */}
      <div className={styles.filterCustom}>
        <button
          type="button"
          className={styles.filterTrigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${selectId}-label`}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={styles.filterTriggerValue}>{active.label}</span>
          <svg
            className={`${styles.filterChevron} ${
              open ? styles.filterChevronOpen : ""
            }`}
            viewBox="0 0 16 16"
            aria-hidden
          >
            <path
              d="M4.2 6.2 8 10l3.8-3.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <ul
            id={listId}
            className={styles.filterMenu}
            role="listbox"
            aria-label="Course filters"
          >
            {FILTERS.map((item) => {
              const selected = value === item.id;
              return (
                <li key={item.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.filterOption} ${
                      selected ? styles.filterOptionActive : ""
                    }`}
                    onClick={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function CatalogNavLink({
  href,
  className,
  children,
  busyLabel,
  analyticsLabel,
  location = "courses-catalog",
}: {
  href: string;
  className?: string;
  children: ReactNode;
  busyLabel: string;
  analyticsLabel: string;
  location?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackCtaClicked({
      variant: analyticsLabel,
      location,
    });
    if (!isSoftNavClick(event)) return;
    event.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      aria-busy={pending || undefined}
      aria-label={pending ? busyLabel : undefined}
      tabIndex={pending ? -1 : undefined}
      className={`${className ?? ""} ${pending ? "pointer-events-none opacity-80" : ""}`.trim()}
      onClick={onClick}
    >
      {pending ? (
        <Spinner
          variant="ellipsis"
          size={14}
          className="text-current"
          aria-hidden
        />
      ) : (
        children
      )}
    </Link>
  );
}

function NotifyMeButton({ onOpen }: { onOpen: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Opening notify form" : "Notify me"}
      className={`${stampCtaSecondary} !normal-case disabled:opacity-80`}
      onClick={() => {
        startTransition(() => {
          onOpen();
        });
      }}
    >
      {pending ? (
        <Spinner
          variant="ellipsis"
          size={14}
          className="text-current"
          aria-hidden
        />
      ) : (
        <>
          Notify me
          <CtaArrow />
        </>
      )}
    </button>
  );
}

export function CoursesCatalog({
  courses,
  showToolbar = true,
}: CoursesCatalogProps) {
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const visible = useMemo(
    () => filterCatalogCourses(courses, filter),
    [courses, filter],
  );

  return (
    <div className={styles.shell}>
      {showToolbar ? (
        <div className={styles.toolbar}>
          <h1 className={styles.pageTitle}>
            Pick your <span className="text-orange">course</span>.
          </h1>
          <FilterDropdown value={filter} onChange={setFilter} />
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className={styles.empty} role="status">
          Nothing in this filter yet.
        </p>
      ) : (
        <ul className={styles.grid}>
          {visible.map((course) => {
            const isLive = course.status === "live";
            const isPmq = course.slug === PMQ_SLUG;
            const artSrc = ILLUSTRATIONS[course.slug];
            return (
              <li key={course.id} className={styles.item}>
                <article
                  className={`${styles.tile} ${
                    artSrc ? styles.tileIllustrated : styles.tileEmpty
                  }`}
                >
                  <header className={styles.head}>
                    <h2 className={styles.title}>
                      <CourseTitle course={course} />
                    </h2>
                    <CourseSubhead course={course} />
                  </header>

                  <div
                    className={`${styles.art} ${
                      artSrc ? "" : styles.artEmpty
                    }`}
                  >
                    {artSrc ? (
                      <Image
                        src={artSrc}
                        alt={
                          isPmq
                            ? "PMQ course illustration — animals studying at a desk"
                            : "PFQ course illustration — animals with study materials"
                        }
                        fill
                        sizes="(max-width: 47.99rem) 92vw, 26rem"
                        className={`${styles.artImage} ${
                          course.slug === "pfq-in-2-days"
                            ? styles.artImageLarge
                            : ""
                        }`}
                        priority={isPmq}
                      />
                    ) : (
                      <span className={styles.artSoon}>Soon</span>
                    )}
                  </div>

                  <div className={styles.footer}>
                    {isLive && isPmq ? (
                      <>
                        <CatalogNavLink
                          href={PMQ_PREVIEW_HREF}
                          className={CARD_PRIMARY}
                          busyLabel="Opening free course"
                          analyticsLabel="Start free course"
                        >
                          Start free course
                          <CtaArrow />
                        </CatalogNavLink>
                        <CatalogNavLink
                          href={PMQ_OVERVIEW_HREF}
                          className={CARD_SECONDARY}
                          busyLabel="Opening overview"
                          analyticsLabel="Course overview"
                        >
                          Course overview
                        </CatalogNavLink>
                        <CatalogNavLink
                          href={PMQ_PRICING_HREF}
                          className={CARD_TERTIARY}
                          busyLabel="Opening plans"
                          analyticsLabel="View plans"
                        >
                          View plans
                        </CatalogNavLink>
                      </>
                    ) : course.slug === "pfq-in-2-days" ? (
                      <>
                        <CatalogNavLink
                          href={PFQ_PREVIEW_HREF}
                          className={CARD_PRIMARY}
                          busyLabel="Opening free course"
                          analyticsLabel="Start free course"
                        >
                          Start free course
                          <CtaArrow />
                        </CatalogNavLink>
                        <CatalogNavLink
                          href={PFQ_BASE_HREF}
                          className={CARD_SECONDARY}
                          busyLabel="Opening overview"
                          analyticsLabel="Course overview"
                        >
                          Course overview
                        </CatalogNavLink>
                        <CatalogNavLink
                          href={PFQ_PRICING_HREF}
                          className={CARD_TERTIARY}
                          busyLabel="Opening plans"
                          analyticsLabel="View plans"
                        >
                          View plans
                        </CatalogNavLink>
                      </>
                    ) : (
                      <NotifyMeButton onOpen={() => setNotifyOpen(true)} />
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <PfqNotifyDialog
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
    </div>
  );
}
