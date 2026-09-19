"use client";

import { useMemo, useState } from "react";
import {
  LIBRARY_GROUP_LABELS,
  type LibraryGroup,
  type LibraryPage,
} from "@/content/library";
import { FreeMockExamLink } from "@/components/FreeMockExamLink";
import { LibrarySoftNavLink } from "@/components/library/LibrarySoftNavLink";
import {
  LibraryGroupIllustration,
  LibraryHeroIllustration,
  LibraryPageIllustration,
} from "@/components/library/libraryIllustrations";
import { stampCtaPrimary } from "@/components/stamp-chip";
import { withSoftNavFrom } from "@/lib/soft-nav-back";
import styles from "./LibraryHub.module.css";

type FilterId = "all" | LibraryGroup;

type LibraryHubProps = {
  pages: LibraryPage[];
  groups: { group: LibraryGroup; label: string; pages: LibraryPage[] }[];
  draftCount: number;
  disclaimer: string;
};

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All guides" },
  { id: "exam-prep", label: LIBRARY_GROUP_LABELS["exam-prep"] },
  { id: "choosing", label: LIBRARY_GROUP_LABELS.choosing },
  { id: "syllabus", label: LIBRARY_GROUP_LABELS.syllabus },
];

export function LibraryHub({
  pages,
  groups,
  draftCount,
  disclaimer,
}: LibraryHubProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<FilterId, number> = {
      all: pages.length,
      "exam-prep": 0,
      choosing: 0,
      syllabus: 0,
    };
    for (const p of pages) map[p.group] += 1;
    return map;
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

  const sections = useMemo(() => {
    if (filter !== "all") {
      const label = LIBRARY_GROUP_LABELS[filter];
      return [{ group: filter, label, pages: filtered }];
    }
    return groups
      .map((g) => ({
        ...g,
        pages: filtered.filter((p) => p.group === g.group),
      }))
      .filter((g) => g.pages.length > 0);
  }, [filter, filtered, groups]);

  return (
    <div className={styles.page}>
      {/* Same chrome rhythm as SiteHeader: gutter outside, max-w-wrap content flush to bar edges */}
      <div className="px-3 sm:px-5">
        <div className={`mx-auto w-full max-w-wrap ${styles.shell}`}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Library</p>
            <h1 className={styles.title}>APM PMQ guides</h1>
            <p className={styles.lede}>
              Plain-English exam prep, qualification comparisons, and syllabus
              topics — filter the shelf, then open a guide.
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.metaChip}>
                {pages.length} published
              </span>
              {draftCount > 0 ? (
                <span className={styles.metaChipMuted}>
                  {draftCount} draft{draftCount === 1 ? "" : "s"} in progress
                </span>
              ) : null}
            </div>
          </div>
          <div className={styles.heroArt}>
            <LibraryHeroIllustration className={styles.heroSvg} />
          </div>
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
            <aside className={styles.side} aria-label="Library filters">
              <div className={styles.sideInner}>
                <label className={styles.searchLabel} htmlFor="library-search">
                  Search
                </label>
                <input
                  id="library-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guides…"
                  className={styles.search}
                  autoComplete="off"
                />

                <p className={styles.filterHeading}>Browse</p>
                <ul className={styles.filterList} role="list">
                  {FILTERS.map((f) => {
                    const active = filter === f.id;
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          className={
                            active ? styles.filterBtnActive : styles.filterBtn
                          }
                          aria-pressed={active}
                          onClick={() => setFilter(f.id)}
                        >
                          <LibraryGroupIllustration
                            group={f.id}
                            className={styles.filterIcon}
                          />
                          <span className={styles.filterLabel}>{f.label}</span>
                          <span className={styles.filterCount}>
                            {counts[f.id]}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.sideCta}>
                  <p className={styles.sideCtaLabel}>Ready to test?</p>
                  <LibrarySoftNavLink
                    href={withSoftNavFrom("/free-mock-exam/apm-pmq", "library")}
                    busyLabel="Opening free mock exam"
                    spinner="ellipsis"
                    spinnerClassName="text-orange"
                    className={styles.sideCtaLink}
                  >
                    Free 15-question mock →
                  </LibrarySoftNavLink>
                </div>
              </div>
            </aside>

            <div className={styles.main}>
              <div className={styles.mobileTools}>
                <label className={styles.srOnly} htmlFor="library-search-mobile">
                  Search guides
                </label>
                <input
                  id="library-search-mobile"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guides…"
                  className={styles.searchMobile}
                  autoComplete="off"
                />
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
              </div>

              <p className={styles.resultCount} aria-live="polite">
                {filtered.length === 0
                  ? "No guides match"
                  : `${filtered.length} guide${filtered.length === 1 ? "" : "s"}`}
                {query.trim() ? ` for “${query.trim()}”` : null}
              </p>

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
                    Show all guides
                  </button>
                </div>
              ) : (
                sections.map((section) => (
                  <section
                    key={section.group}
                    className={styles.section}
                    aria-labelledby={`library-section-${section.group}`}
                  >
                    <div className={styles.sectionHead}>
                      <LibraryGroupIllustration
                        group={section.group}
                        className={styles.sectionIcon}
                      />
                      <h2
                        id={`library-section-${section.group}`}
                        className={styles.sectionTitle}
                      >
                        {section.label}
                      </h2>
                    </div>

                    <ul className={styles.grid} role="list">
                      {section.pages.map((page) => (
                        <li key={page.slug} className={styles.card}>
                          <LibrarySoftNavLink
                            href={`/library/${page.slug}`}
                            busyLabel={`Opening ${page.title}`}
                            className={styles.cardLink}
                          >
                            <div className={styles.cardArt}>
                              <LibraryPageIllustration
                                slug={page.slug}
                                className={styles.cardSvg}
                              />
                            </div>
                            <div className={styles.cardBody}>
                              <span className={styles.cardGroup}>
                                {LIBRARY_GROUP_LABELS[page.group]}
                              </span>
                              <span className={styles.cardTitle}>
                                {page.title}
                              </span>
                              <span className={styles.cardBlurb}>
                                {page.answerFirst}
                              </span>
                              <span className={styles.cardCta}>Read guide</span>
                            </div>
                          </LibrarySoftNavLink>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}

              <div className={styles.footerCta}>
                <LibrarySoftNavLink
                  href={withSoftNavFrom("/free-mock-exam/apm-pmq", "library")}
                  busyLabel="Opening free mock exam"
                  spinner="ellipsis"
                  spinnerClassName="text-orange"
                  className={styles.footerCtaLink}
                >
                  Test yourself: free 15-question APM PMQ mock exam
                </LibrarySoftNavLink>
              </div>
            </div>
          </div>
        )}

        <p className={styles.disclaimer}>{disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
