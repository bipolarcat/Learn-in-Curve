/**
 * Dashboard inbox messages (bell dropdown). Newest first.
 *
 * Ids are stable announcement keys. Read state itself lives on
 * `profiles.whats_new_seen_at` (one timestamp clears the whole list). Changing
 * an id does not re-announce; bump `publishedAt` past the user's seen-at, or
 * reset seen-at, if you need that deliberately.
 *
 * `unreadUntil` closes the announcement window. Past that date the message
 * stays in the list as history but stops counting towards the unread badge, so
 * someone signing up later is not greeted by an old release note.
 */
export type InboxMessage = {
  id: string;
  /** Short title for the dropdown row. */
  title: string;
  /** ISO date. */
  publishedAt: string;
  /**
   * ISO date, exclusive. Until this date the message shows as unread to anyone
   * who has not opened it, including new sign-ups. Omit for no expiry.
   */
  unreadUntil?: string;
  /** Modal heading. */
  heading: string;
  /** Body sections rendered in order. */
  sections: readonly InboxSection[];
  signOff: {
    thanks: string;
    farewell: string;
    name: string;
    role: string;
  };
};

export type InboxSection =
  | { kind: "lead"; text: string }
  | { kind: "date"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "numbered"; number: number; title: string; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: readonly string[] };

export const DASHBOARD_INBOX: readonly InboxMessage[] = [
  {
    id: "2026-09-21-v3-announce",
    title: "Learn in Curve Version 3.0 is live",
    publishedAt: "2026-09-21",
    unreadUntil: "2026-10-06",
    heading: "Version 3.0 of Learn in Curve is now live",
    sections: [
      { kind: "lead", text: "Here's what's changed" },
      { kind: "date", text: "21 September 2026" },
      {
        kind: "numbered",
        number: 1,
        title: "PFQ in 2 Days is live",
        text: "You can now start preparing for the APM PFQ with the new PFQ in 2 Days course.",
      },
      {
        kind: "numbered",
        number: 2,
        title: "Delete your account",
        text: "You can now permanently delete your account yourself from the profile menu on your dashboard.",
      },
      {
        kind: "numbered",
        number: 3,
        title: "Two new free mock exams",
        text: "APM PFQ and PMI PMP are now available in Mock Me, with no sign-up or payment required.",
      },
      {
        kind: "numbered",
        number: 4,
        title: "Three new recall activities",
        text: "Pair Up, Group Up and Line Up are now included in the PMQ in 5 Days Pro bundle at no extra cost.",
      },
      {
        kind: "numbered",
        number: 5,
        title: "The Shelf has been rebuilt",
        text: "It now includes 19 articles covering exam topics, certification comparisons and what to expect on exam day. Accessible from the Menu drop down in the header.",
      },
      {
        kind: "numbered",
        number: 6,
        title: "PMQ in 5 Days has a refreshed interface",
        text: "The study content itself hasn't changed, but the learning experience has been improved:",
      },
      {
        kind: "bullets",
        items: [
          "Key definitions now sit within the Orient section and can be expanded or collapsed.",
          "Scrolling within the Learn tab is smoother.",
          "Polish section has a new look.",
        ],
      },
      {
        kind: "numbered",
        number: 7,
        title: "The website's homepage has been redesigned",
        text: "",
      },
      {
        kind: "numbered",
        number: 8,
        title: "A cleaner header",
        text: "Your dashboard, sign out and other actions that previously sat in the footer are now grouped under the new Menu button.",
      },
      { kind: "heading", text: "On pricing" },
      {
        kind: "paragraph",
        text: "The price of the PMQ in 5 Days Pro and AI Pro bundles has increased.",
      },
      {
        kind: "paragraph",
        text: "If you already own a bundle, nothing changes for you. Your existing access continues as before, and you won't be charged again.",
      },
      {
        kind: "paragraph",
        text: "If you have joined the PMQ in 5 Days AI Pro waitlist on or before 21 September 2026, you can still purchase it at the previous price, with no deadline to do so.",
      },
      {
        kind: "paragraph",
        text: "If you join the waitlist from 22 September 2026 onwards, the new price applies.",
      },
      {
        kind: "paragraph",
        text: "And if you already own the Pro bundle and want to upgrade to AI Pro, you'll only pay the difference.",
      },
      {
        kind: "paragraph",
        text: "If you have any questions or spot something that doesn't look right, the Send Feedback button in the site footer reaches me directly.",
      },
    ],
    signOff: {
      thanks: "Thanks for being part of Learn in Curve.",
      farewell: "All the best,",
      name: "Sim Samaar Shened",
      role: "Founder, Learn in Curve",
    },
  },
];
