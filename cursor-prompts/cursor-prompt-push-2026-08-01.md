# Push — 2026-08-01

Five items. Ordered by user impact. Items 1–3 are small; item 4 is the bulk of the work.

Do not touch `PMQ in 5 days/` — that is the legacy site and its `public/diagrams/` folder must
stay exactly as it is.

---

## 1. Favicon and app icons

Currently absent — no icon files, and `src/app/layout.tsx` has no `icons` in its metadata.

Source asset: `public/brand/logo/fox-logo-png.png`.

Generate and place in `src/app/` (Next 15 picks these up by convention, no metadata edit needed):

- `icon.png` — 512×512
- `apple-icon.png` — 180×180
- `favicon.ico` — 32×32

Keep the fox on a transparent or brand-cream background; it must stay legible at 16×16.

**Verify:** favicon appears in the browser tab on `/`, and `/icon.png` returns 200.

---

## 2. Diagrams move to the app's own public folder

LIC diagrams must be served from the Next app itself, fully independent of the legacy PMQ route.

**Authoring source of truth:** `LIC - PMQ in 5days/Digrams/LO{n}/`
**Served location:** `public/diagrams/lo{n}/`

Steps:

1. Create `public/diagrams/lo1/` and copy the three SVGs from `LIC - PMQ in 5days/Digrams/LO1/`,
   renamed to kebab-case with no spaces:
   - `Iterative life cycle.svg` → `lo1-iterative-life-cycle.svg`
   - `Hybrid life cycle.svg` → `lo1-hybrid-life-cycle.svg`
   - `Extended life cycle.svg` → `lo1-extended-life-cycle.svg`
2. In `src/components/pmq/CoreContentBlock.tsx`, change:
   ```
   const PMQ_DIAGRAM_BASE = "/courses/pmq-in-5-days/public/diagrams";
   ```
   to resolve LIC diagrams from `/diagrams/lo{loNumber}` instead. Legacy diagrams that still
   reference the old path must keep working — fall back to the old base when the file is not
   found under the new one, or gate on the presence of an `alt` field (v2 diagrams always have
   one, v1 diagrams never do).
3. Render the `alt` value on the `<img>`. It is present in the v2 JSON and required for
   accessibility — these SVGs contain no selectable text, so without `alt` they are invisible
   to screen readers and will fail the a11y suite.
4. Run `npx svgo --folder public/diagrams --recursive` to strip Canva's redundant markup.
   Do **not** run this against `PMQ in 5 days/public/diagrams`.

Also delete these three files, which were copied into the legacy folder in error:
`PMQ in 5 days/public/diagrams/lo1-{iterative,hybrid,extended}-life-cycle.svg`

**Verify:** `/diagrams/lo1/lo1-iterative-life-cycle.svg` returns 200; LO1 renders all three
diagrams; an existing LO with legacy diagrams (e.g. LO2) still renders.

---

## 3. Diagram presentation in the Learn stage

Each diagram renders inside its own bordered box containing:

- the diagram
- one caption line beneath it, small, italic, in the form: `Figure 1.1 — {caption}`

Nothing else. No provenance, no source attribution, no author or date.

The v2 JSON supplies `figure_number`, `caption`, `alt` and `file` on each diagram object.

---

## 4. Course overview page — six new sections

Add to the PMQ course overview page. All facts below are from the APM PMQ Handbook 2024 and are
correct as written — do not paraphrase the numbers.

### 4.1 How the exam works
- 2.5 hours, taken online in the Surpass platform
- Split into two parts, with an optional break of up to 30 minutes between them
- 40 questions, 90 marks total
- **Once you submit Part 1 you cannot go back and edit those answers**
- You should attempt every question

### 4.2 Where the marks are
| Question type | Number | Marks each | Total |
|---|---|---|---|
| Multiple response | 20 | 1 | 20 |
| Select from list | 5 | 2 | 10 |
| Short response (typed) | 5 | 2 | 10 |
| Long response (typed) | 10 | 5 | 50 |

Headline to make prominent: **67% of the marks come from typed written answers.**

### 4.3 Where the syllabus weight sits
| Area | Learning objectives | Share of exam |
|---|---|---|
| A — Setting up for success | 1–4 | 15–20% |
| B — Preparing for change | 5–9 | 15–20% |
| C — People and behaviours | 10–15 | 25–35% |
| D — Planning and managing deployment | 16–24 | 30–40% |

### 4.4 Command verbs
| Question type | Verbs | What to do |
|---|---|---|
| Multiple response | Select, Choose | Pick the correct option or combination |
| Select from list | Select, Choose | Choose the option that completes the text |
| Short response | Give, List, State, Provide, Identify | A single word, phrase, or short list |
| Long response | Differentiate | Explain how the areas differ |
| Long response | Describe, Explain | Give key characteristics, qualities or events |
| Long response | Interpret | Explain the meaning in the given context |
| Long response | Outline | Give the main points or characteristics |

This replaces any existing command-word list. The previous list included "Compare", which does
not appear in the handbook, and omitted five verbs that do.

### 4.5 How written answers are marked
- Structure your answer in an order that reflects the instructions in the question
- Disjointed or unclear answers make it hard for a marker to award marks, even when the
  knowledge is there
- The size of the answer box indicates the expected length
- The text box supports basic formatting: font size, bold, italic, underline, alignment, indent

### 4.6 About the pass mark
- The pass mark **varies between exam papers**, set using a modified Angoff method, to account
  for differences in difficulty between versions
- Maximum score is 90 marks
- A borderline fail (within 3 marks of the pass mark) is automatically re-marked

**Also audit the site for any claim of a fixed pass mark or fixed pass percentage** — in mock
exam results, marketing copy, or course descriptions — and reword to reflect that it varies.
Stating a fixed pass mark is inaccurate.

---

## 5. Google sign-in silently blocked by the terms checkbox — HIGHEST PRIORITY

**Confirmed by reproduction.** In `src/components/AuthForm.tsx`, `handleGoogle()` opens with:

```ts
if (!requireTermsAcceptance()) {
  return;
}
```

On the sign-up page, if the user has not ticked the terms checkbox, clicking **Continue with
Google** returns immediately — no popup, no redirect, nothing visible happens. An error message
is set, but it renders in the form's message area, away from the button the user just pressed,
so it reads as a dead button.

Supabase auth logs confirm the impact: only 3 Google OAuth flows have ever run, and the Google
Cloud user cap still reads 0 users. Most people click the Google button before scrolling to a
checkbox.

**Fix:**

1. **Disable the Google button while the terms box is unticked**, so it is visibly unavailable
   rather than silently inert. Apply the same to the email sign-up submit button for consistency.
2. Show an inline hint **immediately adjacent to the Google button** — not only in the shared
   form message area — along the lines of: "Tick the Terms and Privacy Policy box to continue
   with Google."
3. Keep the same treatment on both the `saas` and default variants.

**Do NOT remove the terms gate to make the button work.** The affirmative tick is what makes the
terms enforceable — clickwrap holds up because the user took a deliberate action, and implied
acceptance is materially weaker. Keep the gate, fix the feedback.

**Verify:** on the sign-up page with the box unticked, the Google button is visibly disabled and
an adjacent hint explains why. Ticking the box enables it and the OAuth flow runs.

---

## 6. Password reset

Currently not implemented anywhere — there is no `resetPasswordForEmail` call in the codebase,
and no "Forgot password?" link. Users who forget their password are locked out.

1. Add a **Forgot password?** link on the sign-in form (`src/components/AuthForm.tsx`).
2. New page `/auth/forgot-password` — email field, calls
   `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` })`.
   Show a neutral confirmation regardless of whether the address exists, so the form cannot be
   used to discover which emails have accounts.
3. New page `/auth/reset-password` — new password + confirm, calls
   `supabase.auth.updateUser({ password })`, then redirects to the course.
4. Match the existing auth pages' styling and the same password rules as sign-up.

**Verify:** full round trip on a real address — request, receive email, click link, set new
password, sign in with it.

---

## Version

This is a normal push, so the pre-commit hook's automatic +0.1 bump applies. Do not set
`LIC_VERSION`. The jump to 3.0 is reserved for the v2 content cutover.
