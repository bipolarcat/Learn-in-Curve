# Landing page audit — `/`

**Date:** 2026-09-20  
**Tool:** `/impeccable audit`  
**Surface:** live home (`src/app/(site)/page.tsx`)  
**Order audited:** Hero → Testing Method → How you practise → Exam/course cards → Sly  
**Verified:** browser at `http://127.0.0.1:3000/` + code inspection

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | **2** | Sly body at `ink/55` fails AA (~3.6:1); quiz Q-rail cells ~24px tall; catalog cards use `h2` under a section `h2` |
| 2 | Performance | **3** | Sensible dynamic imports; still heavy client island (activities + GSAP SplitText + Sly) |
| 3 | Responsive Design | **3** | Layout holds on mobile; touch targets and cookie overlay are the rough edges |
| 4 | Theming | **3** | Mostly brand tokens; catalog tiles hard-code `#f6efdd` |
| 5 | Anti-Patterns | **2** | Hero uses banned bounce/elastic easing; “curve” can collide with the line above mid-animation |
| **Total** | | **13/20** | **Acceptable** |

**Rating bands:** 18–20 Excellent · 14–17 Good · 10–13 Acceptable · 6–9 Poor · 0–5 Critical

---

## Anti-Patterns Verdict

**Does it look AI-generated?** No — the illustrated animals, cream dot-grid, Fraunces/Figtree lockup, and teal/orange stamp system read as a real brand, not generic SaaS.

**Tells that do show up:**

- Hero `BouncingText` uses GSAP `ease: "bounce"` / `"elastic"` (explicit impeccable ban) and can overlap “PFQ or PMQ.” while letters drop from `fromY={-72}`.
- Three consecutive sections share the same tiny uppercase tracked teal eyebrow pattern (“The testing method” / “How you practise” / “Pick your exam”). Brand kit *does* call for stamp eyebrows, but stacking three in a row tips into scaffolding.
- Exam block is now a twin catalogue-card grid (intentional reuse of `/courses`) — fine as product, flat as landing narrative.

---

## Executive Summary

- **Score: 13/20 (Acceptable)**
- **Issues:** 0 P0 · **5 P1** · **5 P2** · **2 P3**
- **Top fixes:**
  1. Hero bounce collision + banned easing
  2. Sly `ink/55` contrast
  3. Restore or deliberately drop Explore-courses CTA
  4. Catalog heading levels when embedded
  5. Quiz Q-rail touch height on mobile

---

## Detailed Findings by Severity

### P1 — Hero “curve” bounce collides / banned motion

- **Location:** `HomeBrandHero.tsx` → `BouncingText` (`ui/bouncing-text.tsx`)
- **Category:** Anti-Pattern / Accessibility (readable name)
- **Impact:** Mid-animation, orange letters sit on top of “PFQ or PMQ.”; bounce/elastic feels toy-like vs brand voice; SplitText wraps chars in `<div>`s inside an `<h1>`
- **WCAG:** 1.4.4 / readable text during motion; motion preference only partially covered (`useReducedMotion` skips bounce, good)
- **Recommendation:** Replace bounce with a short ease-out settle (or static orange “curve.”); keep `persist`; avoid SplitText divs in headings
- **Suggested command:** `/impeccable animate` home hero

### P1 — Sly supporting copy fails contrast

- **Location:** `SlyShowcase.tsx` — `text-ink/55` (~3.64:1 on cream)
- **Category:** Accessibility
- **Impact:** Body-size text under AA 4.5:1
- **WCAG:** 1.4.3 Contrast (Minimum)
- **Recommendation:** Use ≥ `text-ink/65` (measured ~4.94:1) or solid muted ink token
- **Suggested command:** `/impeccable polish` SlyShowcase

### P1 — Quiz Q-rail touch targets too small

- **Location:** `PracticeQuiz.module.css` `.qCell` — measured **24×183** on mobile home embed
- **Category:** Accessibility / Responsive
- **Impact:** Hard to tap accurately in How you practise
- **WCAG:** 2.5.5 Target Size (AAA) / mobile usability
- **Recommendation:** Raise cell height to ≥44px on touch breakpoints (or add invisible hit padding)
- **Suggested command:** `/impeccable adapt` LabActivityDemo / PracticeQuiz

### P1 — Heading hierarchy broken in exam section

- **Location:** `CoursesCatalog.tsx` always renders course titles as `<h2>`; embedded under `LabExamPaths` section `h2`
- **Category:** Accessibility
- **Impact:** Six `h2`s in main; screen-reader outline skips a level
- **WCAG:** 1.3.1 Info and Relationships / 2.4.6 Headings
- **Recommendation:** When `showToolbar={false}`, render titles as `<h3>` (or pass a `headingLevel` prop)
- **Suggested command:** `/impeccable polish` CoursesCatalog

### P1 — Explore courses CTA missing from hero

- **Location:** `HomeBrandHero.tsx` — only “Take Free Mock Exam”; no `/courses` link in hero (DESIGN.md still specifies mock + Explore courses)
- **Category:** Accessibility (wayfinding) / Product
- **Impact:** Guests must hunt Menu to reach catalogue; landing narrative jumps to exam cards later without an early browse path
- **Recommendation:** Restore secondary Explore courses CTA, or update DESIGN.md if single-CTA is deliberate
- **Suggested command:** `/impeccable clarify` HomeBrandHero

### P2 — Segmented control tabs under 44px

- **Location:** `segmented-control.tsx` — `min-h-10` (40px)
- **Category:** Responsive / Accessibility
- **Recommendation:** `min-h-11` on touch
- **Suggested command:** `/impeccable adapt`

### P2 — Section eyebrow stack

- **Location:** TestingMethod, LabActivityDemo, LabExamPaths
- **Category:** Anti-Pattern
- **Impact:** Three identical kickers in a row read as template grammar
- **Recommendation:** Keep stamp language on one primary section; vary the other two (plain Figtree lead, or no kicker)
- **Suggested command:** `/impeccable quieter` or `/impeccable typeset`

### P2 — Catalog cream hard-coded

- **Location:** `CoursesCatalog.module.css` — `--course-card-cream: #f6efdd`
- **Category:** Theming
- **Recommendation:** Map to `paper` / `cream-2` tokens
- **Suggested command:** `/impeccable colorize` or `/impeccable polish`

### P2 — Cookie banner occludes first fold of Testing Method art

- **Location:** cookie consent over Testing Method plate
- **Category:** Responsive / UX
- **Impact:** First illustration partially unreadable until dismiss
- **Recommendation:** Anchor banner lower / less tall on mobile; ensure Accept is ≥44px (Accept looks fine)
- **Suggested command:** `/impeccable adapt` cookie banner

### P2 — `DESIGN.md` / PRODUCT home order is stale

- **Location:** DESIGN.md still describes Proof → Features → TrialQuiz; live order is Testing → Practise → LabExamPaths → Sly; Proof/FeatureStack/TrialQuiz moved to `/lab`
- **Category:** Theming / Process
- **Impact:** Future agents will “fix” the wrong page
- **Suggested command:** `/impeccable document`

### P3 — Section ids still `lab-*` on live home

- **Location:** `lab-activity-demo`, `lab-exams`
- **Category:** Polish
- **Recommendation:** `home-activity-demo` / `home-exams` for analytics + deep links

### P3 — Course card images `alt=""`

- **Location:** `CoursesCatalog.tsx`
- **Category:** Accessibility
- **Impact:** Low if title is adjacent; better with short alt (“PMQ course illustration — cat at desk”) for share/preview contexts

---

## Patterns & Systemic Issues

1. **Muted ink opacity ladder is inconsistent** — `/65` passes AA; `/60` and `/55` fail. Standardize body muted at `ink/65+`.
2. **Touch height wasn’t part of the lab→home promote** — Q-rail and segments ship at desktop chrome sizes.
3. **Embeddable catalog wasn’t given a document-outline mode** — page `h2` reused inside landing sections.
4. **Docs lag promotions** — DESIGN.md still describes last month’s home stack.

---

## Positive Findings

- Distinctive illustrated brand (not Inter/purple SaaS).
- Real interactive practise (TrialQuiz + activities) on the landing page — rare and on-thesis.
- Landmarks/regions are solid; skip link present; quiz tabs have clear `aria-label`s.
- Dynamic imports for Sly + activity demo keep initial route lighter.
- `prefers-reduced-motion` path on hero curve and ScrollReveal.
- Cream continuous paper scroll with color inside plates — matches brand layout rules.
- Course cards correctly reuse `/courses` tiles (Overview / Plans).

---

## Contrast measurements (cream `#F4E9D6`)

| Sample | Ratio | AA body (4.5:1) |
|--------|-------|-----------------|
| ink 100% | 14.19 | Pass |
| ink/80 | 7.99 | Pass |
| ink/65 | 4.94 | Pass |
| ink/60 | 4.22 | Fail |
| ink/55 | 3.64 | Fail |
| teal | 5.68 | Pass |
| orange | 3.50 | Fail as small text; OK as large/bold |

---

## Measured touch sizes (mobile)

| Control | Size |
|---------|------|
| Segmented mode tabs | 40×137 |
| Quiz Q-rail cells | 24×183 |

---

## Recommended Actions

1. **[P1] `/impeccable animate` HomeBrandHero** — kill bounce/elastic; stop mid-air collision with line 1
2. **[P1] `/impeccable polish` SlyShowcase + CoursesCatalog** — contrast + heading levels when embedded
3. **[P1] `/impeccable adapt` PracticeQuiz Q-rail + SegmentedControl** — ≥44px touch targets on mobile
4. **[P1] `/impeccable clarify` HomeBrandHero** — restore Explore courses or document single-CTA choice
5. **[P2] `/impeccable quieter` section kickers** — break the three-eyebrow stack
6. **[P2] `/impeccable document`** — sync DESIGN.md to current home vs `/lab`
7. **[P2] `/impeccable polish`** — final pass after the above

Re-run `/impeccable audit` after fixes to see the score improve.
