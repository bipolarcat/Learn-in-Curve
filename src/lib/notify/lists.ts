/**
 * Every email list Learn in Curve maintains, in one place.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Why this file exists
 *
 * Until 2026-07-30 list membership was a single `course` column on
 * `newsletter_subscribers`, and that table is UNIQUE on `email`. Joining a second
 * list therefore *overwrote* the first: someone on the PFQ waitlist who then
 * asked about the AI Pro Bundle silently stopped being a PFQ signup. Membership
 * is now rows in `waitlist_signups`, one per (email, list_key), and this registry
 * is the only place a list is defined.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Consent model — read before adding a list
 *
 * Two separate permissions, deliberately not merged:
 *
 *   1. Asking to hear when a specific thing launches (a `launch` list). One
 *      message about one product. This is not marketing consent.
 *   2. Agreeing to ongoing marketing (the `newsletter` list). Added when they
 *      submit the dedicated newsletter form (that submission is the consent
 *      act) or tick the optional, unticked box on a launch waitlist.
 *
 * Under UK GDPR / PECR these must be separately given and separately
 * withdrawable — a pre-ticked box, or bundling (2) into (1), is not valid
 * consent. So ticking marketing on any form adds a SECOND row for `newsletter`;
 * it never rewrites the launch row, and leaving one list never forces leaving
 * the other.
 */

export type NotifyListKind = "launch" | "newsletter";

export type NotifyList = {
  /** Stored in `waitlist_signups.list_key`. Never rename — it's persisted data. */
  key: string;
  kind: NotifyListKind;
  /** Human label for admin/export and email subject lines. */
  label: string;
  /** Used mid-sentence: "We'll email you when {subjectCopy} launches." */
  subjectCopy: string;
  subject: string;
  heading: string;
  /** Body paragraphs for the confirmation email. Plain text; escaped on render. */
  body: string[];
  /**
   * Public URL of this list's illustration, served from Supabase Storage.
   * Left empty until Sim supplies the artwork — `renderIllustration` reserves
   * the vertical space either way so adding the file later can't reflow the
   * layout or require re-testing every client.
   */
  illustrationUrl: string;
  /** Alt text for the illustration. Required — emails are read by screen readers too. */
  illustrationAlt: string;
};

/** Marketing newsletter. Homepage form submit, or optional waitlist tick. */
export const NEWSLETTER_LIST_KEY = "newsletter";

/** Launch waitlist for the AI Pro Bundle (Sly + end-of-course report). */
export const AI_PRO_LIST_KEY = "pmq-in-5-days-ai-pro";

/** Launch waitlist for the next course. */
export const PFQ_LIST_KEY = "pfq-in-2-days";

/** Launch waitlist for the PFQ AI Pro Bundle (not yet purchasable). */
export const PFQ_AI_PRO_NOTIFY_KEY = "pfq-in-2-days-ai-pro";

export const NOTIFY_LISTS: NotifyList[] = [
  {
    key: AI_PRO_LIST_KEY,
    kind: "launch",
    label: "AI Pro Bundle",
    subjectCopy: "the AI Pro Bundle",
    subject: "You're on the list for the AI Pro Bundle",
    heading: "You're on the list",
    body: [
      "You'll be the first to know when the AI Pro Bundle launches.",
      "One email when it's ready. Nothing else.",
    ],
    illustrationUrl:
      "https://dbjoimidfbftammchnql.supabase.co/storage/v1/object/public/email-assets/notify-illustration.jpg",
    illustrationAlt: "A cheerful dog character throwing a paper plane into a mailbox",
  },
  {
    key: PFQ_LIST_KEY,
    kind: "launch",
    label: "PFQ in 2 Days",
    subjectCopy: "PFQ in 2 Days",
    subject: "You're on the list for PFQ in 2 Days",
    heading: "You're on the list",
    body: [
      "We'll let you know as soon as PFQ in 2 Days launches.",
      "One email when it's ready. Nothing else.",
    ],
    illustrationUrl:
      "https://dbjoimidfbftammchnql.supabase.co/storage/v1/object/public/email-assets/notify-illustration.jpg",
    illustrationAlt: "A cheerful dog character throwing a paper plane into a mailbox",
  },
  {
    key: PFQ_AI_PRO_NOTIFY_KEY,
    kind: "launch",
    label: "PFQ AI Pro Bundle",
    subjectCopy: "the PFQ AI Pro Bundle",
    subject: "You're on the list for the PFQ AI Pro Bundle",
    heading: "You're on the list",
    body: [
      "You'll be the first to know when the PFQ AI Pro Bundle launches.",
      "One email when it's ready. Nothing else.",
    ],
    illustrationUrl:
      "https://dbjoimidfbftammchnql.supabase.co/storage/v1/object/public/email-assets/notify-illustration.jpg",
    illustrationAlt: "A cheerful dog character throwing a paper plane into a mailbox",
  },
  {
    key: NEWSLETTER_LIST_KEY,
    kind: "newsletter",
    label: "Learn in Curve newsletter",
    subjectCopy: "the Learn in Curve newsletter",
    subject: "You're subscribed to Learn in Curve",
    heading: "Welcome aboard",
    body: [
      "You'll get new project management resources, AI insights, and course launches as they land.",
      "You can leave any time from the link at the bottom of any email.",
    ],
    illustrationUrl:
      "https://dbjoimidfbftammchnql.supabase.co/storage/v1/object/public/email-assets/notify-illustration.jpg",
    illustrationAlt: "A cheerful dog character throwing a paper plane into a mailbox",
  },
];

/**
 * Fourth illustration: the account sign-up confirmation email.
 *
 * NOT a list — it's transactional, sent by Supabase Auth ("Confirm signup"), so
 * it is NOT rendered by this codebase. Its template lives in the Supabase
 * dashboard under Authentication → Email Templates, and the artwork has to be
 * pasted into that template as an absolute <img src>. Recorded here so all four
 * illustrations are tracked in one place rather than one of them living only in
 * a dashboard nobody thinks to check.
 */
export const SIGNUP_CONFIRMATION_ILLUSTRATION = {
  purpose: "Supabase Auth 'Confirm signup' email",
  managedIn: "Supabase dashboard → Authentication → Email Templates",
  illustrationUrl: "",
  illustrationAlt: "Sly the fox unlocking a front door",
} as const;

const BY_KEY = new Map(NOTIFY_LISTS.map((list) => [list.key, list]));

export function getNotifyList(key: string | null | undefined): NotifyList | null {
  if (typeof key !== "string") return null;
  return BY_KEY.get(key) ?? null;
}

export function isNotifyListKey(key: string | null | undefined): boolean {
  return getNotifyList(key) !== null;
}

/** Every launch list — used by admin exports and the unsubscribe screen. */
export const LAUNCH_LIST_KEYS = NOTIFY_LISTS.filter(
  (l) => l.kind === "launch",
).map((l) => l.key);
