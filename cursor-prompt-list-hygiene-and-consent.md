# Cursor prompt — list hygiene (`is_internal`) + marketing-consent capture

**Written:** 2026-08-13
**Project:** learn-in-curve (Supabase `dbjoimidfbftammchnql`)
**Priority:** High. This blocks every email Learn in Curve will ever send.

---

## Context — what was found

A manual audit of the email lists on 13 Aug 2026 found two separate problems.

**Problem 1 — the lists were 70% noise.** `newsletter_subscribers` held 14 rows: 4 real people, 4 of Sim's own addresses, and 6 `test.*@gmail.com` rows written by a test pass on 3 Aug. `waitlist_signups` held the same pattern. Those 21 rows have now been deleted manually, but nothing prevents the next test run from recreating them. Every metric anyone reads off these tables is currently wrong by default.

**Problem 2 — and this is the serious one — marketing consent is not being captured.** After cleanup, the real rows look like this:

| List | Email | `marketing_consent` |
|---|---|---|
| newsletter | pintodenver@yahoo.co.in | **false** |
| newsletter | eunessia14@hotmail.com | **false** |
| newsletter | birabrata1006@yahoo.com | **false** |
| newsletter | denverpinto11@gmail.com | true |
| leads (free mock exam) | rachelshrigley1@gmail.com | **false** |
| leads (free mock exam) | alfredbidokwu@yahoo.com | **false** |

Three of four newsletter subscribers and two of two mock-exam leads have no recorded consent. Under UK GDPR/PECR that means **they cannot be sent marketing email at all.** A 25% consent rate on a form literally labelled "Join our newsletter" is not plausible user behaviour — it points at the form not recording the consent basis. `confirmation_sent_at` is also null on the earliest rows, so double opt-in did not fire for them either.

Diagnose before you build. The fix depends on which it is:
- the checkbox is absent from one or both forms, or
- it is present but its value never reaches the insert, or
- the insert defaults `marketing_consent` to `false` and the form never overrides it.

Report which one it actually was.

---

## Part 1 — `is_internal` flag

### Schema

Migration adding to `public.newsletter_subscribers`, `public.waitlist_signups` and `public.leads`:

```sql
alter table public.<table>
  add column is_internal boolean not null default false;

create index on public.<table> (is_internal) where is_internal = false;
```

Backfill is not needed — the existing junk rows were deleted manually on 13 Aug and the remaining six rows are all genuine.

### Classification

One shared server-side helper, single source of truth. Suggested `src/lib/email/internal.ts`:

```ts
export function isInternalEmail(email: string): boolean
```

Returns true when the normalised address (trimmed, lowercased, plus-tag stripped for comparison) matches any of:

1. An exact address in a configured founder list.
2. A `test.` local-part prefix (catches `test.aipro.*`, `test.pfq.*`, `test.news.*`).
3. Any domain in a configured internal-domain list.

Founder addresses and internal domains come from environment config, not hardcoded literals scattered across call sites. Seed the founder list with the four addresses removed on 13 Aug (`simsamaarshened@gmail.com`, `sim.samaar@yahoo.in`, `sim.samaar@yahoo.com`, and the `+news` variant — the plus-tag rule should cover the last one automatically, so verify it does rather than listing it).

**Set it server-side on insert, in the server action. Never accept `is_internal` from the client** — a client-supplied flag is trivially forgeable and would let anyone exclude themselves from, or insert themselves into, an internal-only path.

### Exclusion

`is_internal = true` rows must be excluded from:

- every count, dashboard figure and admin view of list size
- every export
- every send path (Resend broadcasts, automations, any future n8n workflow reading these tables)

Prefer excluding at the query layer in one place over sprinkling `.eq('is_internal', false)` at each call site. Grep for existing reads of all three tables and confirm each one is covered — a missed read is how the wrong number ends up in a decision.

Keep an admin-only way to see internal rows. The point is to exclude them from counts and sends, not to make them invisible when debugging.

---

## Part 2 — consent capture

### The legal distinction that drives the design

These are two different things and the code must treat them separately:

- **Transactional / service message** — "here is the mock exam result you just asked for." The user requested it; sending it is the service they signed up for. Does not require marketing consent.
- **Marketing message** — "here's our new course / a study tip / an offer." Requires consent from an individual under PECR, recorded, with a working unsubscribe.

Conflating them is the single most common way small products end up with a list they legally cannot use.

### Newsletter form (`/` footer, "Join our newsletter")

Submitting a form labelled "Join our newsletter" **is** the consent act. So:

- Record `marketing_consent = true` and `marketing_consent_at = now()` on insert.
- Show the purpose plainly next to the field: who's sending, what they'll get, and a link to the privacy notice. Consent must be informed to count.
- Keep double opt-in: send the confirmation email and set `confirmation_sent_at`. Investigate why it did not fire for the 1 Aug and 4 Aug rows — those two rows are the reproduction case.

### Free mock exam gate (`/free-mock-exam` results)

Two distinct fields:

1. **Email address** — to send the learning-objective breakdown they just asked for. Transactional. No consent checkbox needed for this specific send.
2. **A separate, unticked marketing checkbox** — "Email me PMQ study tips and product updates." Its own field, its own timestamp. Never pre-ticked, never bundled into the same control as the email field, never a condition of seeing the result.

Write `marketing_consent` and `consent_timestamp` from that checkbox only.

### Record-keeping

For every consent captured, store what was consented to, when, and by what mechanism. The columns largely exist already (`marketing_consent`, `marketing_consent_at` / `consent_timestamp`, `source`, `utm_*`, `referrer_category`) — make sure they are actually populated rather than left null.

### Also check

`newsletter_subscribers` has an `unsubscribe_token` column; `waitlist_signups` does not. If anything is ever sent to the waitlist, it needs a working unsubscribe too. Flag whether this matters or whether waitlist is transactional-only by design — do not add columns speculatively.

---

## Out of scope

- Do not touch `auth.users`. The founder and test accounts stay.
- Do not delete or modify the six remaining real rows.
- Do not retroactively set `marketing_consent = true` on the five rows currently false. **Consent cannot be inferred after the fact, and backfilling it would be exactly the kind of thing that turns a fixable gap into a real problem.** Those five people can be sent transactional messages only, unless and until they consent through the fixed form.

---

## Acceptance criteria

1. Migration applied; all three tables have `is_internal`.
2. `isInternalEmail()` exists as one shared helper, driven by config, used by all three insert paths.
3. A signup from `test.anything@gmail.com` lands with `is_internal = true` without any client involvement.
4. A signup from a founder address lands with `is_internal = true`, including a `+tag` variant.
5. A signup from a normal address lands with `is_internal = false`.
6. Every count, export and send path excludes internal rows — list the files you changed.
7. Newsletter signup writes `marketing_consent = true`, `marketing_consent_at`, and fires the confirmation email setting `confirmation_sent_at`.
8. Mock exam gate has a separate unticked marketing checkbox; ticking it writes consent + timestamp, leaving it unticked writes false, and the result breakdown is delivered either way.
9. Root cause of the original consent bug is reported in the PR description — which of the three candidates it actually was.

### Verification queries

```sql
-- Should return only genuine rows
select email, is_internal, marketing_consent
from public.newsletter_subscribers where is_internal = false;

-- After a test pass: should be non-zero, and excluded everywhere
select count(*) from public.newsletter_subscribers where is_internal = true;

-- No internal row may ever be marketing-consented
select count(*) from public.newsletter_subscribers
where is_internal = true and marketing_consent = true;  -- expect 0
```

---

*Legal note: informal, educational guidance, not legal advice. The consent design above reflects the standard reading of UK GDPR and PECR for marketing to individuals. Worth a solicitor's eye before the first real marketing send goes out, alongside the other items in `legal/PRE_LAUNCH_CHECKLIST.md`.*
