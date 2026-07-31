# Design Standards & Edtech Best Practices — Research Brief

Compiled 2026-07-02. Purpose: ground the Learn in Curve redesign in an actual design system (not ad hoc styling) and in what the best-designed edtech products do that we currently don't.

---

## Part 1 — What "a design standard" actually means and how to build one

### The core idea: design tokens, not hardcoded values

A design system is built on **design tokens** — named, reusable decisions (a color, a spacing unit, a font size) instead of hardcoded hex codes and pixel values scattered across components. The payoff: change one token, everything using it updates. Dark mode, rebrands, and consistency stop being manual work.

**Three-layer token structure** (the standard approach):
1. **Primitive tokens** — raw values. `--color-base-orange: #D5501F`
2. **Semantic tokens** — intent-named, reference primitives. `--color-primary: var(--color-base-orange)`, `--color-error: var(--color-base-red)`
3. **Component tokens** — scoped to one component. `--button-bg-primary: var(--color-primary)`

Categories to define: color, typography (family/weight/size/line-height/letter-spacing), spacing, sizing, border radius, shadow/elevation, and motion/animation timing.

### For our stack specifically (Next.js + Tailwind)

**shadcn/ui is the standard 2026 recommendation for Next.js + Tailwind projects.** It's not a component *library* you install as a black box — the CLI copies real TypeScript component code into your repo that you own and edit. It uses Tailwind + CSS variables for theming, so design tokens live as CSS custom properties and every component reads from them.

Practical structure Cursor should set up:
- `components/ui/` — raw shadcn primitives (button, card, input, dialog, etc.), unmodified
- `components/primitives/` — lightly customized versions (branded button variants, etc.)
- `components/blocks/` — product-level compositions (a course card, a dashboard stat tile)
- Tailwind config + a `globals.css` (or `tokens.css`) holding the CSS variable definitions — colors, radii, fonts — sourced from the brand kit (`brand/BRAND_KIT_v2.html`)

This gives us exactly the "one source of truth" a style guide is supposed to provide, without inventing custom tooling.

### General style-guide discipline (applies regardless of stack)

- Limit to **2–3 fonts max** (one display, one body, optionally one accent) — we already have this: Fraunces / Figtree / Space Mono.
- Define the palette once, reference it everywhere — no ad hoc hex values in components.
- Consistent button styles and hover states across every page.
- Periodically audit the live site against the guide — inconsistency creeps in as pages get added.
- **Accessibility is not optional**: follow WCAG for contrast, keyboard navigation, and screen-reader support. This is explicitly called out as a *buying criterion* for edtech buyers (parents, schools), not just a nice-to-have.

### Balancing the retro-70s brand with usability

This is the one place general web-design advice needs adapting for us specifically, since we're not building a generic clean SaaS look:

- **Treat retro elements as accents, not the whole system.** The ink-circle mark, ticket-stub cards, sunburst motifs, Space Mono stamps — these should decorate a *conventional, predictable layout*, not replace it.
- **Keep navigation completely conventional.** Nav bar at the top, familiar patterns for sign-in/dashboard/course pages. Don't let the 70s aesthetic touch information architecture — only decoration, color, type, and illustration.
- **Pair a characterful display font with a highly readable body font** — which we already do (Fraunces for headers, Figtree for body). Don't let Fraunces creep into body copy or form labels.
- Retro sites still have to be fast, responsive, and accessible — high-contrast text, real focus states, no relying on color alone to convey meaning (stamped/ticket UI is great for this but must stay legible).

**Bottom line for Cursor:** build a real shadcn/ui + Tailwind token system first, wire the brand kit's palette/type into it as tokens, *then* layer the retro illustration/motif work on top of that disciplined foundation — not the other way around.

---

## Part 2 — What the best-designed edtech platforms actually do

Sourced primarily from a 2026 industry review ([Merge — 7 best designed Edtech platforms](https://merge.rocks/blog/7-best-designed-edtech-platforms-weve-seen-so-far)), cross-checked against general edtech UX research.

### The evaluation lens worth stealing

The Merge review scores platforms on five criteria — this is a good rubric to hold our own dashboard/course pages against:
1. **Onboarding clarity** — can a new user understand the value within 3–5 seconds?
2. **Information hierarchy** — is the core action (Start lesson / Resume course) reachable without extra clicks?
3. **Engagement loop** — streaks, milestones, rewards that pull people back daily.
4. **Personalization & progress tracking** — does it visibly adapt to *this* learner and show measurable progress?
5. **Brand credibility & consistency** — do type, color, and components stay consistent across marketing site, dashboard, and course pages?

94% of first impressions are design-driven, and users form a credibility judgment in roughly 50 milliseconds — so the marketing home page and the first dashboard screen carry disproportionate weight.

### Platform-by-platform, what to borrow

| Platform | Best for | What to steal |
|---|---|---|
| **Duolingo** | Gamified retention | Streaks, XP, badges, a mascot with personality reinforcing every interaction, one clear task per screen |
| **Khan Academy** | Adaptive mastery | Mastery tracking (not just "watched" but "understood"), instant feedback on practice questions |
| **Coursera** | Structured credentialing | Dashboard surfaces deadlines/progress/certificates *up front*; every course follows the same navigational structure so learners never relearn the UI |
| **MasterClass** | Premium trust signals | Clean progress tracking, "pick up where you left off," production quality as a trust signal |
| **Udacity** | Outcome framing | Dashboard constantly reframes progress in terms of the *outcome* (job-ready, exam-ready), not just % complete |
| **LiveSchool** | Visible reward economy | A points/rewards system that's genuinely visible and "shoppable," not just a number in a corner |
| **HeyLady** | Onboarding speed | Gets a new user to their *first real action* fast — no long product tour before value |

### Directly relevant to our roadmap: the AI tutor UX pattern

This is the most actionable finding, since Phase 2 already plans an AI tutor. Industry practice in 2026 has converged on:

- **A persistent "Coach" / "Tutor" nav item** — same tier as Home/Dashboard/Courses, not a buried chat widget. Always one tap away from wherever the learner is.
- **Chat surfaces sit alongside the lesson/quiz player**, not as a separate destination — a learner should be able to ask a clarifying question without leaving the exercise.
- **Trust & safety UI is now a first-class design requirement**, not a compliance afterthought: clear disclaimers on AI-generated content, "verify with your source material" nudges where relevant. Worth designing in from the start rather than bolting on later, given `BUSINESS_STATE.md` already scopes the AI tutor tightly to "help pass this specific exam."

### Gamification specifics (for Phase 2, but worth designing space for now)

- **Streaks**: a visible, continuous daily-engagement counter; the *visual* reward escalates as the streak grows (bigger/more elaborate badge), not just the number.
- **Progress bars/dashboards**: show completed *and* next-up content together — momentum, not just a static percentage.
- **Badges**: milestone-based, visually distinct, worth designing as an extension of the existing ink-circle/stamp motif (this fits our aesthetic naturally — a "stamped ticket" badge system is very on-brand).

---

## Part 3 — Prioritized recommendations for Learn in Curve

1. **Set up a real token system before touching visual polish.** Have Cursor wire `brand/BRAND_KIT_v2.html`'s palette (`#D5501F`, `#D9A441`, `#5F7A3D`, `#1B6560`, `#241A12`, cream background) and type (Fraunces/Figtree/Space Mono) into shadcn/ui's CSS-variable theme, organized as primitive → semantic → component tokens. This is the fix that makes every future design pass faster instead of harder.
2. **Rebuild the dashboard around Coursera/Udacity's pattern**: progress + next action + (once it exists) outcome framing ("X objectives to mastery") front and center, not buried.
3. **Reserve a permanent nav slot for the future AI tutor now**, even before it's built — it changes the information architecture, cheaper to plan for than retrofit.
4. **Design the badge/streak system as an extension of the existing stamp/ticket motif** rather than importing a generic gamification look — this is where the retro brand can actually differentiate rather than fight with modern UX.
5. **Audit accessibility now**: contrast ratios on the ink/cream palette, keyboard nav, focus states — cheap to fix at this stage, expensive later, and it's a stated buying criterion in this market.
6. **Keep navigation and layout conventional everywhere except decoration** — the 70s aesthetic should live in illustration, color, type, and motif, never in where things are or how they behave.

---

## Sources

- [Design tokens explained — Contentful](https://www.contentful.com/blog/design-token-system/)
- [What Are Design Tokens? A Complete Guide (2026) — UXPin](https://www.uxpin.com/studio/blog/what-are-design-tokens/)
- [Design Systems Guide: Build Scalable UI in 2026 — Boundev](https://www.boundev.com/blog/design-system-guide)
- [2026 Web Design Standards That Increase Conversions — Red Rattler Creative](https://redrattlercreative.com/web-design-standards/)
- [13 Web Design Best Practices — Contentsquare](https://contentsquare.com/guides/web-design/best-practices/)
- [shadcn/ui — Next.js installation docs](https://ui.shadcn.com/docs/installation/next)
- [The Ultimate shadcn/ui Handbook (2026 Edition)](https://shadcnspace.com/blog/shadcn-ui-handbook)
- [Retro Website Design: A Guide for Authentic 70s–90s Aesthetics — Eknoji Studio](https://eknojistudio.com/retro-website-design/)
- [Modern Retro Website Design: What is This New-Old Trend? — Verpex](https://verpex.com/blog/website-tips/modern-retro-website-design-what-is-this-new-old-trend)
- [7 best designed Edtech platforms we've seen so far — Merge](https://merge.rocks/blog/7-best-designed-edtech-platforms-weve-seen-so-far)
- [Gamification for Learning — BuddyBoss](https://buddyboss.com/blog/gamification-for-learning-to-boost-engagement-with-points-badges-rewards/)
- [Gamification and Online Learning Streaks — LMSNinjas](https://lmsninjas.com/online-learning-streaks/)
- [Education Website Design Best Practices for 2026 — Digital Roots Media](https://www.digitalrootsmedia.com/blog/education/education-website-design-best-practices-2026/)
