# Cursor prompt — post-signup "Check your inbox" state (Tier 2)

**Status:** spec approved by Sim 2026-07-30. Not yet built.
**Scope:** `src/components/AuthForm.tsx` (+ a small new component). Sign-up flow only — sign-in untouched.

---

## Problem

After a successful sign-up, `AuthForm` sets `message` to `"Check your email to confirm your account."` (line ~130) and renders it as a single `<p>` under the password field. Three problems:

1. The form stays fully editable underneath, so the state is ambiguous — users re-submit.
2. The message doesn't echo back the address it was sent to, so typos aren't caught at the moment they're recoverable.
3. There is no resend and no spam-folder hint. Both generate support contacts on day one.

## Goal

Replace the whole form panel with a quiet confirmation card once sign-up succeeds. Subtle, modern-app styling — not a celebration screen.

---

## Behaviour

### Trigger

Only when `mode === "sign-up"` and `signUp()` returns no session (existing condition at line ~129). Keep that branch's logic; change what it renders.

Do **not** trigger on sign-in, on error, or when `data.session` exists (confirmation disabled → existing redirect stays).

### States

**A. Default (just submitted)**
- Icon tile: 34×34, `border-radius: 9px`, background `rgba(213,80,31,0.10)`, containing a mail glyph at 18px in `#D5501F`. Use the project's existing icon approach — do not add a new icon dependency.
- Title: `Check your inbox` — 16px, weight 500, `text-ink`.
- Body: `We've sent a confirmation link to {email}` — 13px, `text-ink/60`. The address itself is `text-ink` weight 500. Render the address from the `email` state value, not a hardcoded string.
- Hairline divider, `bg-ink/[0.08]`.
- Footer line, 12px, `text-ink/45`:
  `Not there? Check spam, or [resend] · [use a different email]`
  - `resend` — orange (`text-orange`), subtle underline.
  - `use a different email` — muted (`text-ink/55`), subtle underline.

**B. Cooldown (after resend clicked)**
- Footer line replaced by: `Sent — you can resend in {n}s`
- Countdown uses `font-variant-numeric: tabular-nums` so the width doesn't jitter.
- Duration: 60s.
- On reaching 0, return to state A.

**C. Resend failed**
- Footer line: `Couldn't resend. Try again in a moment.` in `text-ink/55`. Do not surface the raw Supabase error string.

### Actions

**resend** → `supabase.auth.resend({ type: "signup", email })`, then enter cooldown regardless of outcome (see security note).

**use a different email** → return to the form with the `email` field pre-filled with the current value and focused, so a single-character typo is a quick fix rather than a retype. Clear `password`, clear `message`.

---

## Security — cooldown must be refresh-proof

A `setTimeout`-only cooldown is bypassed by pressing F5. An unthrottled resend is an email-bombing vector: anyone could flood a third party's inbox from `learnincurve.com`, burning sender reputation and risking domain blacklisting — which would undo the Resend domain verification set up on 2026-07-30.

Persist a timestamp in `sessionStorage` under a key scoped to the email address, e.g. `lic_resend_until:{email}`. On mount, read it and restore the countdown if still in the future.

Enter the cooldown **on click**, before awaiting the response, and stay in it even if the call errors. Otherwise a failing endpoint becomes an unthrottled retry loop.

Note this is defence-in-depth only — Supabase enforces its own server-side rate limit. The client cooldown exists so users see a countdown instead of an opaque error.

---

## Two render sites

`AuthForm` has two layout variants and the message block appears in both:

- `variant="saas"` branch — message `<p>` at ~line 225
- default branch — message `<p>` at ~line 416

Extract the confirmation card into a single component (suggested: `src/components/AuthCheckInbox.tsx`) and render it from both, so the copy and logic can't drift. Match each branch's surrounding type/spacing conventions — `saas` uses `auth-saas-*` classes and the `styles` module; default uses `font-body` and `.btn`/`.input-field`.

Keep the existing inline `message` `<p>` for all other cases (errors, sign-in). This change only intercepts the sign-up-success case.

---

## Accessibility

- Card gets `role="status"` and `aria-live="polite"` so screen readers announce the state change when the form is replaced.
- `resend` and `use a different email` must be real `<button type="button">` elements, not styled spans or anchors.
- Countdown text must not be inside an `aria-live` region — a per-second announcement is unusable. Wrap only the static part in the live region, or set the countdown span `aria-hidden` with an accessible label on the button.
- Focus must move to the card when it replaces the form, or keyboard users are left focused on a removed node.

---

## Out of scope

- Sign-in flow copy
- Other Supabase email templates (magic link, password reset)
- Any change to the confirmation email HTML itself (`supabase/templates/confirm-signup.html` — already approved and live)

---

## Acceptance criteria

1. Signing up with a fresh email replaces the form with the card, showing the exact address typed.
2. Clicking `resend` triggers a second confirmation email and starts a 60s countdown.
3. Refreshing the page mid-cooldown resumes the countdown — it does not reset to 0.
4. `use a different email` returns to the form with the address pre-filled and focused.
5. Both `variant="saas"` and default layouts show the card, styled consistently with their surroundings.
6. Sign-in and all error paths render exactly as they do today.
7. `npm run build` and `npm run test:unit` pass.

---

## Reporting back

Append a decision-log entry to `BUSINESS_STATE.md` per `.cursor/rules/documentation-discipline.mdc`, noting anything deviated from this spec and why.
