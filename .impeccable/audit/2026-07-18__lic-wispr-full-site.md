# Learn in Curve × Wispr Flow — full-site audit

**Date:** 18 July 2026  
**Scope:** 16 LIC route patterns; 45 rendered route/viewport checks; source review of authenticated product states; comparative review of [Wispr Flow](https://wisprflow.ai/) at 375px and 1440px.  
**Method:** Playwright at 375×812, 768×1024 and 1440×900; keyboard/reduced-motion/source checks; WCAG 2.2 AA where applicable.

## Post-fix verification

**Current score: 17/20 (Good)** — up from the 14/20 baseline below.

| Dimension | Current | Verified result |
|---|---:|---|
| Accessibility | 3/4 | Contrast, reflow, skip links, headings, keyboard semantics, touch targets and auth sequencing fixed; 24 caption drafts await human playback QA before release |
| Performance | 3/4 | Production build passes; global CSS reduced by ~42%; Home remains the heaviest route at 230 kB first-load JS |
| Theming | 4/4 | Semantic action/form/surface roles now cover auth, marketing, product and conversation surfaces |
| Responsive design | 4/4 | 45/45 rerun checks had no document overflow, one `h1`, one `main`, no console errors and no active animation under reduced motion |
| Anti-patterns | 3/4 | Dead visual clusters remain removed, but the previous copy-only hero, full Sly section and numbered capability row were deliberately restored at Sim’s request |

### Resolution status

- **16/20 original findings are fixed in the working tree.**
- **Accepted reversions:** findings 19–20 (first-fold product proof and numbered Home scaffolding) were implemented, then deliberately reverted to restore the previous Home layout.
- **Caption release gate:** 24 machine WebVTT drafts (3,439 cues) validate with zero structural errors, but 1,130 QA warnings require human playback review before `captionsSrc` may be enabled.
- **Mock release gate:** Lite/Full tiers, deadlines, persisted breaks, AI marking and server enforcement are implemented. Live read-only preflight found zero duplicate constraint conflicts; `20260718180000_mock_exam_integrity.sql` still requires live Supabase application (new columns currently return `42703`).
- **Verification passed:** 12 unit tests, 8 Playwright tests, production `next build`, caption validation, a 45-check responsive/reduced-motion audit, and targeted 375/1440 Home-revert checks.
- **Evidence:** [post-fix audit JSON](../post-fix-audit-evidence.json), [`todo6-public-evidence`](../todo6-public-evidence/), [reverted Home mobile](../home-revert-mobile.png) and [reverted Home desktop](../home-revert-desktop.png).

The original findings below are retained as the historical baseline. Their recommendations have been implemented unless a release gate or accepted reversion above is named.

## Baseline audit health score (before fixes)

| # | Dimension | Score | Key finding |
|---|---:|---:|---|
| 1 | Accessibility | 2/4 | Strong semantics and focus work, but CTA/auth contrast, mobile legal reflow, hidden accordion focus, captions and custom listbox behavior are unresolved |
| 2 | Performance | 3/4 | Good dynamic imports, `next/image`, reduced-motion and viewport-aware footer animation; CSS/motion ownership is becoming expensive |
| 3 | Theming | 3/4 | Coherent tokens and deliberate route-scoped dark mode; auth and illustration subsystems still hard-code colors |
| 4 | Responsive design | 3/4 | 44/45 rendered checks had no horizontal overflow; Privacy Policy fails at 375px and several frequent controls are below 44px |
| 5 | Anti-patterns | 3/4 | LIC is distinctive, not generic AI output; repeated glass, nested surfaces, tiny uppercase labels and numbered beats are creeping in |
| **Total** |  | **14/20** | **Good — address the P1 accessibility and flow failures before visual restaging** |

## Anti-pattern verdict

**Pass. LIC does not look generically AI-generated.** The illustrated paper, transit-ticket metaphor, Fraunces/Figtree/Space Mono hierarchy, orange/teal palette, Sly and exam-journey framing form a recognisable system.

The risk is not “becoming Wispr.” It is internal fragmentation:

- ticket/stamp marketing surfaces;
- white SaaS auth surfaces;
- glass PMQ product surfaces;
- Mac/chat simulation surfaces;
- bespoke buttons and shadows layered on top of shared primitives.

Wispr should be used as a **calmness and product-proof reference**, not a new skin.

## Baseline executive summary

- **Score:** 14/20 (Good)
- **Issues:** 0 P0, 9 P1, 8 P2, 3 P3
- **Rendered evidence:** 45 local route/viewport checks; no console/page errors; one confirmed horizontal-overflow route.
- **Most important actions:**
  1. Fix contrast and mobile legal reflow.
  2. Repair keyboard/focus semantics and timed-media accessibility.
  3. Preserve destination through authentication.
  4. Make mock timing and Lite/Full access truthful.
  5. Consolidate the surface/CTA system before importing more Wispr-like visual ideas.

### Evidence snapshots

- [LIC homepage — desktop](../audit-home-desktop.png)
- [LIC homepage — mobile](../audit-home-mobile.png)
- [Guest Sly — mobile](../audit-guest-sly-mobile.png)
- [LIC courses — desktop](../audit-courses-desktop.png)
- [PMQ preview — desktop](../audit-preview-desktop.png)
- [Auth sign-up — mobile](../audit-auth-sign-up-mobile.png)
- [Privacy Policy overflow — mobile](../audit-privacy-mobile.png)
- [Wispr Flow reference — desktop](../audit-wispr-desktop.png)
- [Wispr Flow reference — mobile](../audit-wispr-mobile.png)
- [Measured route evidence JSON](../lic-wispr-audit-evidence.json)

## P1 — major findings

### 1. Primary orange CTAs fail small-text contrast

- **Location:** `src/components/stamp-chip.tsx:13-30`; shared `.btn-primary` in `src/app/globals.css:121-128`
- **Category:** Accessibility / Theming
- **Evidence:** LIC paper `#FBF3E1` on orange `#D5501F` measures **3.80:1**. Stamp CTA text is 10–12px; it requires 4.5:1.
- **Impact:** Core conversion labels are harder to read for low-vision users; the issue repeats across Home, Courses, Sly and upgrade actions.
- **Standard:** WCAG 2.2 1.4.3 Contrast (Minimum)
- **Recommendation:** Introduce an accessible `orange-action` token (darker orange) or use ink text on orange where brand-safe. Do not fix per component.
- **Suggested command:** `/impeccable colorize`

### 2. Auth placeholders and helper copy fail contrast

- **Location:** `src/components/AuthForm.tsx:139,149,166,209-231`; `.auth-saas-input::placeholder` in `src/app/globals.css:1720`
- **Category:** Accessibility / Theming
- **Evidence:** `neutral-400` on white is **2.52:1**; current placeholder blend on the input surface is approximately **2.22:1**; `text-ink/45` on white is approximately **2.86:1**.
- **Impact:** The compact auth page looks calm but key instructions, placeholders and account-switching copy become difficult to read.
- **Standard:** WCAG 2.2 1.4.3
- **Recommendation:** Add auth-specific secondary/placeholder tokens that meet 4.5:1; preserve the quiet hierarchy through size and spacing, not low opacity.
- **Suggested command:** `/impeccable harden`

### 3. Privacy Policy horizontally overflows on mobile

- **Location:** `src/app/(site)/privacy/page.tsx:15-18`; generic table styles at `src/app/globals.css:234-236`; `MarkdownBlock` does not isolate wide artifacts unless explicitly requested.
- **Category:** Accessibility / Responsive
- **Evidence:** At 375px, document width is **459px** — **84px overflow**. The four-column data table is the source. The other 44 route/viewport checks had no overflow.
- **Impact:** Users must pan the whole legal page horizontally and can lose reading position.
- **Standard:** WCAG 2.2 1.4.10 Reflow
- **Recommendation:** Wrap legal markdown tables in a labelled horizontal-scroll region or transform policy rows into stacked definition blocks below the tablet breakpoint.
- **Suggested command:** `/impeccable adapt`

### 4. Collapsed LO accordion can retain keyboard-focusable descendants

- **Location:** `src/components/pmq/LoAccordionSection.tsx:85-94`
- **Category:** Accessibility
- **Evidence:** Collapsed content remains mounted with `aria-hidden` and `grid-template-rows: 0fr`, but unlike `PmqDayPlan`, the container has no `inert`.
- **Impact:** Keyboard and assistive-technology users can focus controls that are visually hidden.
- **Standard:** WCAG 2.2 2.4.3 Focus Order; 4.1.2 Name, Role, Value
- **Recommendation:** Apply `inert={!expanded || undefined}` to the panel, matching the already-correct `PmqDayPlan` pattern.
- **Suggested command:** `/impeccable harden`

### 5. Custom quiz listbox is not fully keyboard-operable

- **Location:** `src/components/pmq/QuizRunner.tsx:366-373,511-527,865-872`
- **Category:** Accessibility
- **Evidence:** Escape is handled, but the listbox/options and question tabs do not implement conventional Arrow/Home/End focus movement or roving `tabIndex`.
- **Impact:** Keyboard users must Tab through every option and do not get expected listbox/tab behavior.
- **Standard:** WCAG 2.2 2.1.1 Keyboard; 4.1.2
- **Recommendation:** Either use native controls or implement the WAI-ARIA listbox/tab keyboard patterns completely.
- **Suggested command:** `/impeccable harden`

### 6. All PMQ videos lack timed captions

- **Location:** `src/lib/pmq/constants.ts:116-118`; supported renderer at `src/components/pmq/LoExplainerVideo.tsx:37-48`
- **Category:** Accessibility
- **Evidence:** Every configured `captionsSrc` is `null`; no `.vtt` files exist. The Learn stage is a useful written alternative but does not replace synchronized captions.
- **Impact:** Deaf/hard-of-hearing users cannot access spoken content in context with the video.
- **Standard:** WCAG 2.2 1.2.2 Captions (Prerecorded)
- **Recommendation:** Produce and QA timed WebVTT for all 24 videos; keep the Learn-stage alternative.
- **Suggested command:** `/impeccable harden`

### 7. Protected deep links are lost after authentication

- **Location:** `src/components/AuthForm.tsx:90,104-107`; `src/app/(site)/auth/callback/route.ts:5-13`
- **Category:** Interaction / Anti-pattern
- **Evidence:** Protected routes generate `?next=...`, but password sign-in and OAuth callback always route to `/dashboard`.
- **Impact:** A learner opening an LO, mock or Pro return link must navigate back manually after signing in; this breaks conversion continuity.
- **Recommendation:** Validate and preserve a same-origin `next` parameter through email and OAuth flows.
- **Suggested command:** `/impeccable harden`

### 8. Mock timer reaches zero without enforcing expiry

- **Location:** `src/components/pmq/MockExamRunner.tsx:208-212,222-237,368-376`
- **Category:** Interaction / Product integrity
- **Evidence:** Timers clamp to zero, but no effect submits, disables answers or advances the phase when `timerSeconds === 0`; break timer behaves similarly.
- **Impact:** The “timed mock” promise is not real and scores become incomparable.
- **Recommendation:** Define expiry behavior, persist it server-side, announce it accessibly and test resume/clock-skew cases.
- **Suggested command:** `/impeccable harden`

### 9. Lite and Full mock access converge on the same ungated route

- **Location:** `src/components/pmq/PmqMockExamsSection.tsx:84-90,136-143`; `src/app/courses/pmq-in-5-days/mock/page.tsx:23-74`
- **Category:** Product integrity / Interaction
- **Evidence:** Both CTAs use `pmqMockHref()`. The mock route fetches questions/config but does not read entitlement/tier.
- **Impact:** The interface promises two products while the execution path cannot prove which experience the user bought.
- **Recommendation:** Pass an explicit mode and enforce entitlement server-side before rendering Full-only questions/marking.
- **Suggested command:** `/impeccable harden`

## P2 — minor findings

### 10. Heading structure is incomplete on course acquisition pages

- **Location:** `src/app/courses/pmq-in-5-days/preview/page.tsx:23-37`; course card headings in `src/components/CourseTicket.tsx`
- **Category:** Accessibility
- **Evidence:** Preview renders no `h1`. Courses jumps from page `h1` directly to course-card `h3`.
- **Impact:** Page structure is less predictable for screen-reader and document-navigation users.
- **Recommendation:** Use the course name as preview `h1`; make cards `h2` under “Pick your exam.”
- **Suggested command:** `/impeccable harden`

### 11. Course routes lack the site skip link

- **Location:** `src/app/courses/layout.tsx:10-14`
- **Category:** Accessibility
- **Evidence:** `(site)/layout.tsx` provides “Skip to content”; `courses/layout.tsx` does not and its `<main>` has no target id.
- **Impact:** Keyboard users must traverse repeated header controls on every course page.
- **Recommendation:** Share one shell-level skip-link primitive across both layouts.
- **Suggested command:** `/impeccable harden`

### 12. Frequent mobile controls fall below the 44px comfort target

- **Location:** `src/components/stamp-chip.tsx:11-20`; auth controls in `src/app/globals.css:1701-1804`
- **Category:** Responsive / Accessibility
- **Evidence:** Header chips measure 40×40px; Google/primary auth buttons 39px high; auth inputs 41px high at 375px. These exceed WCAG 2.5.8’s 24px minimum but miss the stronger 44px mobile target.
- **Impact:** More mis-taps for users operating one-handed or with motor impairments.
- **Recommendation:** Make high-frequency mobile controls 44–48px while preserving compact desktop density.
- **Suggested command:** `/impeccable adapt`

### 13. Sign-up gates the first action with a control placed last

- **Location:** `src/components/AuthForm.tsx:123-129,194-228`
- **Category:** Interaction / Responsive
- **Evidence:** “Continue with Google” is disabled until Terms consent, but the checkbox appears below the email CTA.
- **Impact:** A user can encounter an unexplained disabled first action before discovering the requirement.
- **Recommendation:** Keep legal copy near the bottom if desired, but add a concise inline reason/focus transfer when a gated CTA is pressed—or move consent before provider choice.
- **Suggested command:** `/impeccable clarify`

### 14. Surface and CTA primitives are fragmenting

- **Location:** `.btn`/`.ticket-card` in `globals.css`; `stamp-chip.tsx`; `ui/glass.ts`; bespoke strings in `CourseTicket`, `AuthForm`, `QuizRunner`, Sly and mock components.
- **Category:** Theming / Anti-pattern
- **Evidence:** Four surface languages coexist, often with bespoke border/radius/shadow definitions.
- **Impact:** Visual refinements require many one-off edits and responsive states drift.
- **Recommendation:** Define a small semantic system: marketing stamp, product surface, quiet form surface, conversational surface.
- **Suggested command:** `/impeccable extract`

### 15. Auth is an intentional exception but bypasses brand tokens

- **Location:** `src/components/AuthDeskPanel.tsx:16`; `src/components/AuthForm.tsx:19-31,139`
- **Category:** Theming
- **Evidence:** White/black/neutral hard-codes sit outside the token system (Google brand fills are legitimate exceptions).
- **Impact:** Theme changes and contrast fixes cannot be managed centrally.
- **Recommendation:** Keep Wispr-like quietness, but tokenize auth surface, divider, placeholder and shadow roles.
- **Suggested command:** `/impeccable extract`

### 16. Global motion/CSS ownership is too broad

- **Location:** `src/app/globals.css` (~1,900 lines; ~100 animation/keyframe references)
- **Category:** Performance / Maintainability
- **Evidence:** Animation, quiz, chat, footer, auth and marketing styles share one global file; around 50 client components depend on global class contracts.
- **Impact:** Dead styles are hard to identify; regressions and CSS parse/maintenance cost grow with each feature.
- **Recommendation:** Extract component-owned styles or a small set of named motion primitives. Preserve existing reduced-motion coverage.
- **Suggested command:** `/impeccable optimize`

### 17. Error/loading UX is uneven across major flows

- **Location:** `MockExamRunner.handleBegin`; auth/Sly have stronger alert/retry patterns.
- **Category:** Interaction
- **Evidence:** Mock start/session errors return without visible feedback; Sly includes retry and live regions.
- **Impact:** Users can press Start and see nothing, with no recovery path.
- **Recommendation:** Standardize async states: pending label, inline alert, retry and focus management.
- **Suggested command:** `/impeccable harden`

## P3 — polish findings

### 18. Legacy components preserve obsolete visual precedents

- **Location:** `AboutCards.tsx`, `HeroBoardingPass.tsx`, `JourneyPath.tsx`, `CourseProgressCard.tsx`
- **Category:** Maintainability / Anti-pattern
- **Evidence:** They appear unreferenced but contain older card/ticket approaches.
- **Recommendation:** Confirm with `rg`/build analysis, then remove or archive to prevent accidental reuse.
- **Suggested command:** `/impeccable distill`

### 19. Homepage first fold delays the strongest product proof

- **Location:** `src/app/(site)/page.tsx:41-78`
- **Category:** Visual hierarchy
- **Evidence:** Desktop hero leaves a large uncommitted right field; the working Sly experience begins in the next section. Wispr places product behavior inside the hero’s visual narrative.
- **Recommendation:** Keep LIC’s headline and single CTA, but pull a compact live Sly/quiz proof into the first fold rather than adding more copy.
- **Suggested command:** `/impeccable layout`

### 20. Repeated numbered beats and tiny uppercase labels are becoming scaffolding

- **Location:** `SlyShowcase`, section tags/eyebrows throughout marketing and product pages.
- **Category:** Anti-pattern
- **Evidence:** `01/02/03`, all-caps mono labels and card eyebrows recur across unrelated sections.
- **Recommendation:** Reserve stamp labels for real status/ticket metadata; let typography, imagery and interaction carry other hierarchy.
- **Suggested command:** `/impeccable quieter`

## Patterns and systemic issues

1. **Contrast is token-level, not component-level.** The same orange/paper and low-opacity ink combinations recur across many routes.
2. **A11y quality is uneven by primitive.** Dialogs, focus rings, native buttons and reduced motion are strong; custom accordions/listboxes and timed media lag.
3. **The brand is coherent; component ownership is not.** New features often add a fifth local surface language rather than extending a semantic primitive.
4. **Public pages are strongly responsive.** Only Privacy failed reflow across 45 checks. Auth control sizing is the main recurring mobile ergonomics issue.
5. **Product promises need server-backed states.** Auth return paths and mock tiers/timers are interaction-contract failures, not visual polish.

## Positive findings to preserve

- 44/45 route/viewport checks had zero horizontal overflow.
- No runtime console/page errors were observed across the 45 checks.
- Decorative imagery is consistently labelled; no missing `alt` attributes were found.
- Public pages consistently render one `h1`, except the PMQ preview; landmarks are generally present.
- Homepage Sly and Quiz are dynamically imported with reserved space, reducing layout shift.
- `next/image` is used broadly; video has poster support; locked video avoids unnecessary MP4 fetches.
- Reduced-motion handling is extensive. Footer LED animation checks motion preference, caps DPR and only runs near the viewport.
- Route-scoped dark mode is deliberate and predictable.
- Sly dialogs use modal semantics, Escape/backdrop close, live regions, focus restoration and clear retry states.
- LIC’s visual identity is stronger and more ownable than a literal Wispr imitation.

## Wispr Flow incorporation map

| LIC surface | Keep LIC | Adopt from Wispr | Avoid |
|---|---|---|---|
| Home | Ticket-out headline, orange/teal, Sly, exam-specific promise | Put product behavior in the first fold; stronger focal composition; one dominant conversion action | Flow’s purple, voice-wave motif, generic “used by” logo wall without real proof |
| Auth | Desk illustration, compact one-screen form, light-only policy | Quiet surface, clearer trust/free messaging, larger controls, less decorative chrome | Making auth visually unrelated to LIC or copying Wispr’s download card |
| Courses / preview | Exam-ticket metaphor and explicit Free/Coming Soon status | Progressive disclosure, calmer comparison hierarchy, fewer competing card weights | Role-tab complexity before the catalogue has enough courses |
| Dashboard | Progress, deadline, Continue, Sly usage | Task-first density, restrained frequent controls, one clear “resume” focus | Marketing-scale typography and decorative stamp shadows on daily controls |
| PMQ overview | Five-day plan and journey metaphor | Cleaner sticky context, fewer nested surfaces, progressive detail | Flattening the plan into a generic SaaS settings page |
| LO journey | Orient→Checkpoint staging and current-step path | Smooth in-context transitions; show the active learning artifact prominently | Adding more glass layers or motion to every accordion |
| Quiz | Immediate answer feedback and exam grounding | Crisp selected/correct/error states; clearer one-action-at-a-time flow | Turning revision into a generic chat/productivity demo |
| Sly | Fox identity, PMQ scope, live streaming, usage clarity | Calm WhatsApp-like conversation canvas; polished empty/retry/cap states | Wispr voice-wave branding or generic AI gradient/glow treatment |
| Mock | Exam-specific structure and self-assessment | Focus mode, trustworthy timer states, clean progress and recovery | Decorative marketing chrome during the exam |
| Footer / legal | LIC dark LED identity and explicit legal links | Simplified trust hierarchy; highly readable legal layouts | Dense corporate sitemap expansion before content exists |

## Phased adoption roadmap

### Phase 1 — Foundation and trust

1. Fix orange/auth contrast tokens.
2. Fix Privacy table reflow.
3. Add `inert`, complete quiz keyboard semantics and shared skip links.
4. Preserve auth `next`.
5. Ship captions.
6. Enforce mock timer and tiers server-side.

### Phase 2 — System consolidation

1. Extract four semantic surface families.
2. Consolidate async/error patterns.
3. Move component-specific animation/style ownership out of `globals.css`.
4. Remove confirmed legacy components.

### Phase 3 — Wispr-informed restaging

1. Pull live product proof into the Home first fold.
2. Simplify course/preview hierarchy.
3. Reduce dashboard/LO nested chrome.
4. Refine Sly into the clearest conversational surface in the product.
5. Finish with a cross-route responsive/keyboard/contrast polish pass.

## Baseline recommended commands (completed)

1. **[P1] `/impeccable harden`** — fix focus, keyboard, auth-return, caption and mock contract failures.
2. **[P1] `/impeccable colorize`** — rebuild orange/auth text roles to pass AA without losing LIC identity.
3. **[P1] `/impeccable adapt`** — repair legal tables and mobile control sizing.
4. **[P2] `/impeccable extract`** — consolidate stamp, product, form and chat surface primitives.
5. **[P2] `/impeccable optimize`** — reduce global CSS/motion ownership.
6. **[P3] `/impeccable layout`** — bring product proof into the Home first fold.
7. **[P3] `/impeccable quieter`** — reduce repeated eyebrows, numbered beats and nested chrome.
8. **[Final] `/impeccable polish`** — verify the integrated system across routes and viewports.

These passes were completed in the post-fix implementation. Re-run `/impeccable audit` after the caption and migration release gates close to verify the remaining two points.

## Coverage limitations

- Public routes and guest Sly were rendered directly.
- Protected Dashboard, PMQ overview, LO and mock states redirected to auth in the clean Playwright context. Those states were audited from definitive source behavior and existing component/state paths rather than by mutating production data or creating a test account.
- Dev-server response times are included in the evidence JSON but were **not** treated as production performance metrics.
