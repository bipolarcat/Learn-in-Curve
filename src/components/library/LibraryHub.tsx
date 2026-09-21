"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers, Library, Scale, Search } from "lucide-react";
import {
  LIBRARY_GROUP_LABELS,
  type LibraryGroup,
  type LibraryPage,
} from "@/content/library";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { LibrarySoftNavLink } from "@/components/library/LibrarySoftNavLink";
import {
  LibraryViewToggle,
  type LibraryViewMode,
} from "@/components/library/LibraryViewToggle";
import { LibraryPageIllustration } from "@/components/library/libraryIllustrations";
import { stampCtaPrimary } from "@/components/stamp-chip";
import styles from "./LibraryHub.module.css";

const VIEW_STORAGE_KEY = "lic-library-view";

/** Soft brand washes for card art plates (editorial mock — not purple). */
const ART_TONES = [
  "color-mix(in srgb, var(--teal) 26%, rgb(var(--paper-rgb)))",
  "color-mix(in srgb, var(--orange) 22%, rgb(var(--paper-rgb)))",
  "rgb(var(--sand-rgb))",
  "color-mix(in srgb, var(--olive) 22%, rgb(var(--paper-rgb)))",
  "rgb(var(--cream-2-rgb))",
  "color-mix(in srgb, var(--gold) 28%, rgb(var(--paper-rgb)))",
] as const;

type FilterId = "all" | LibraryGroup;

type LibraryHubProps = {
  pages: LibraryPage[];
  groups: { group: LibraryGroup; label: string; pages: LibraryPage[] }[];
  draftCount: number;
};

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All Articles" },
  { id: "exam-prep", label: LIBRARY_GROUP_LABELS["exam-prep"] },
  { id: "choosing", label: LIBRARY_GROUP_LABELS.choosing },
  { id: "syllabus", label: LIBRARY_GROUP_LABELS.syllabus },
];

function artToneForSlug(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h + slug.charCodeAt(i) * (i + 3)) % ART_TONES.length;
  }
  return ART_TONES[h]!;
}

function formatGuideDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FilterIcon({
  id,
  className,
}: {
  id: FilterId;
  className?: string;
}) {
  if (id === "all") return <Library className={className} aria-hidden />;
  if (id === "exam-prep") return <BookOpen className={className} aria-hidden />;
  if (id === "choosing") return <Scale className={className} aria-hidden />;
  return <Layers className={className} aria-hidden />;
}

function GroupIcon({ group }: { group: LibraryGroup }) {
  return <FilterIcon id={group} className={styles.cardTagIcon} />;
}

export function LibraryHub({ pages, draftCount }: LibraryHubProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<LibraryViewMode>("grid");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "grid" || stored === "list") setView(stored);
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  function changeView(next: LibraryViewMode) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const counts = useMemo(() => {
    const next: Record<FilterId, number> = {
      all: pages.length,
      "exam-prep": 0,
      choosing: 0,
      syllabus: 0,
    };
    for (const p of pages) next[p.group] += 1;
    return next;
  }, [pages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages.filter((p) => {
      if (filter !== "all" && p.group !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.answerFirst.toLowerCase().includes(q) ||
        LIBRARY_GROUP_LABELS[p.group].toLowerCase().includes(q)
      );
    });
  }, [pages, filter, query]);

  return (
    <div className={styles.page}>
      <div className="px-3 sm:px-5">
        <div className={`mx-auto w-full max-w-wrap ${styles.shell}`}>
          <header className={styles.hero}>
            <h1 className={styles.title}>The Shelf</h1>
            <p className={styles.lead}>
              Practical insights and essential breakdowns for tackling your
              project management exams with confidence.
            </p>
          </header>

          {pages.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Guides are being written</p>
              <p className={styles.emptyBody}>
                {draftCount} draft page{draftCount === 1 ? "" : "s"} in progress.
                Meanwhile, take the free mock.
              </p>
              <FreeMockExamLink
                className={`${stampCtaPrimary} mt-5`}
                label="Free PMQ mock exam"
                location="library_hub_empty"
                from="library"
              />
            </div>
          ) : (
            <div className={styles.layout}>
              <aside className={styles.side} aria-label="Category">
                <div className={styles.accordion}>
                  <p className={styles.accordionLabel}>Category</p>
                  <ul className={styles.accordionPanel} role="list">
                    {FILTERS.map((f) => {
                      const active = filter === f.id;
                      return (
                        <li key={f.id}>
                          <button
                            type="button"
                            className={
                              active
                                ? styles.categoryBtnActive
                                : styles.categoryBtn
                            }
                            aria-pressed={active}
                            onClick={() => setFilter(f.id)}
                          >
                            <FilterIcon
                              id={f.id}
                              className={styles.categoryIcon}
                            />
                            <span className={styles.categoryLabel}>
                              {f.label}
                            </span>
                            <span className={styles.categoryCount}>
                              {counts[f.id]}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </aside>

              <div className={styles.main}>
                <div className={styles.toolbar}>
                  <label className={styles.searchWrap} htmlFor="library-search">
                    <Search className={styles.searchIcon} aria-hidden />
                    <span className={styles.srOnly}>Search Articles</span>
                    <input
                      id="library-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search Articles..."
                      className={styles.search}
                      autoComplete="off"
                    />
                  </label>
                  <LibraryViewToggle value={view} onValueChange={changeView} />
                </div>

                <div className={styles.mobileFilters} aria-label="Quick filters">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={
                        filter === f.id ? styles.chipActive : styles.chip
                      }
                      aria-pressed={filter === f.id}
                      onClick={() => setFilter(f.id)}
                    >
                      {f.label}
                      <span className={styles.chipCount}>{counts[f.id]}</span>
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className={styles.noMatch}>
                    <p className={styles.noMatchTitle}>Nothing on this shelf</p>
                    <p className={styles.noMatchBody}>
                      Try another topic or clear your search.
                    </p>
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={() => {
                        setQuery("");
                        setFilter("all");
                      }}
                    >
                      Show all articles
                    </button>
                  </div>
                ) : (
                  <ul
                    className={view === "list" ? styles.list : styles.grid}
                    role="list"
                    data-view={view}
                  >
                    {filtered.map((page) => {
                      const dateLabel = formatGuideDate(page.updatedAt);
                      return (
                        <li key={page.slug} className={styles.card}>
                          <LibrarySoftNavLink
                            href={`/library/${page.slug}`}
                            busyLabel={`Opening ${page.title}`}
                            className={
                              view === "list"
                                ? `${styles.cardLink} ${styles.cardLinkList}`
                                : styles.cardLink
                            }
                          >
                            <div
                              className={
                                view === "list"
                                  ? `${styles.cardArt} ${styles.cardArtList}`
                                  : styles.cardArt
                              }
                              style={{
                                background: artToneForSlug(page.slug),
                              }}
                            >
                              <LibraryPageIllustration
                                slug={page.slug}
                                className={styles.cardSvg}
                              />
                            </div>
                            <div className={styles.cardBody}>
                              {dateLabel ? (
                                <time
                                  className={styles.cardDate}
                                  dateTime={page.updatedAt}
                                >
                                  {dateLabel}
                                </time>
                              ) : null}
                              <span className={styles.cardTitle}>
                                {page.title}
                              </span>
                              <span className={styles.cardTag}>
                                <GroupIcon group={page.group} />
                                {LIBRARY_GROUP_LABELS[page.group]}
                              </span>
                            </div>
                          </LibrarySoftNavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
