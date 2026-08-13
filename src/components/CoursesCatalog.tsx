"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/database";
import {
  type CatalogFilter,
  filterCatalogCourses,
} from "@/lib/courses-catalog";
import { PMQ_SLUG } from "@/lib/pmq/constants";
import { PMQ_PRICING_HREF } from "@/lib/pmq/plans";
import { PmqStartLink } from "@/components/PmqStartLink";
import { PfqNotifyDialog } from "@/components/PfqNotifyDialog";
import { CtaArrow, stampCtaPrimaryCompact, stampCtaSecondaryCompact } from "@/components/stamp-chip";
import { Spinner } from "@/components/ui/spinner";
import styles from "@/components/CoursesCatalog.module.css";

type CoursesCatalogProps = {
  courses: Course[];
  isSignedIn: boolean;
  enrolledSlugs?: string[];
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

const SUBHEADS: Partial<
  Record<string, { line1: string; line2: string }>
> = {
  [PMQ_SLUG]: {
    line1: "Everything You Need to Pass Your APM - Project",
    line2: "Management Qualification Exam",
  },
  "pfq-in-2-days": {
    line1:
      "59 lessons, 306 practice questions and a full mock, mapped to every APM PFQ learning outcome",
    line2: "",
  },
};

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

function CatalogNavButton({
  href,
  className,
  children,
  busyLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  busyLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? busyLabel : undefined}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-80`}
      onClick={() => {
        startTransition(() => {
          router.push(href);
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
        children
      )}
    </button>
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
      className={`${stampCtaSecondaryCompact} disabled:cursor-wait disabled:opacity-80`}
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
  isSignedIn,
  enrolledSlugs = [],
}: CoursesCatalogProps) {
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [notifyOpen, setNotifyOpen] = useState(false);
  const enrolled = useMemo(() => new Set(enrolledSlugs), [enrolledSlugs]);
  const visible = useMemo(
    () => filterCatalogCourses(courses, filter),
    [courses, filter],
  );

  return (
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>
          Pick your <span className="text-orange">course</span>.
        </h1>
        <FilterDropdown value={filter} onChange={setFilter} />
      </div>

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
            const subhead = SUBHEADS[course.slug];
            const isEnrolled = enrolled.has(course.slug);

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
                    {subhead ? (
                      <p className={styles.subhead}>
                        <span className={styles.subheadLine}>
                          {subhead.line1}
                        </span>
                        {subhead.line2 ? (
                          <>
                            {" "}
                            <span className={styles.subheadLine}>
                              {subhead.line2}
                            </span>
                          </>
                        ) : null}
                      </p>
                    ) : (
                      <p className={styles.subheadMuted}>Coming soon</p>
                    )}
                  </header>

                  <div
                    className={`${styles.art} ${
                      artSrc ? "" : styles.artEmpty
                    }`}
                  >
                    {artSrc ? (
                      <Image
                        src={artSrc}
                        alt=""
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
                        <PmqStartLink
                          isSignedIn={isSignedIn}
                          from="courses"
                          showArrow={!isEnrolled}
                          className={
                            isEnrolled
                              ? stampCtaSecondaryCompact
                              : stampCtaPrimaryCompact
                          }
                        >
                          {isEnrolled ? "Enrolled" : "Enrol for free"}
                        </PmqStartLink>
                        <CatalogNavButton
                          href={PMQ_PRICING_HREF}
                          className={stampCtaSecondaryCompact}
                          busyLabel="Opening plans"
                        >
                          View plans
                        </CatalogNavButton>
                      </>
                    ) : course.slug === "pfq-in-2-days" ? (
                      <CatalogNavButton
                        href="/pfq"
                        className={stampCtaPrimaryCompact}
                        busyLabel="Opening PFQ"
                      >
                        View course
                      </CatalogNavButton>
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
