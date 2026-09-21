/**
 * Dashboard inbox messages (bell dropdown). Newest first.
 * Keep ids stable — they key localStorage read state.
 */
export type InboxMessage = {
  id: string;
  /** Short title shown in the dropdown list. */
  title: string;
  /** ISO date shown under the modal heading. */
  publishedAt: string;
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
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: readonly string[] };

export const DASHBOARD_INBOX: readonly InboxMessage[] = [
  {
    id: "2026-09-21-v3",
    title: "Learn in Curve Version 3.0 is live",
    publishedAt: "2026-09-21",
    heading: "Version 3.0 of Learn in Curve is now live",
    sections: [
      { kind: "lead", text: "Here's what's changed." },
      {
        kind: "paragraph",
        text: "PFQ in 2 Days is live. You can now prepare for the APM PFQ with the new PFQ in 2 Days course.",
      },
      {
        kind: "paragraph",
        text: "Two new free mock exams. APM PFQ and PMI PMP are now available in Mock Me, with no sign-up or payment required.",
      },
      {
        kind: "paragraph",
        text: "Three new recall activities. Pair Up, Group Up and Line Up are now included in the PMQ in 5 Days Pro bundle at no extra cost.",
      },
      {
        kind: "paragraph",
        text: "The Shelf has been rebuilt. It now holds 19 articles covering exam topics, certification comparisons and what to expect on exam day. You can reach it from the Menu in the header.",
      },
      {
        kind: "paragraph",
        text: "PMQ in 5 Days has a refreshed interface. The study content itself has not changed, but the experience around it has:",
      },
      {
        kind: "bullets",
        items: [
          "Key definitions now sit within the Orient section and can be expanded or collapsed.",
          "Scrolling within the Learn tab is smoother.",
          "The Polish section has a new look.",
        ],
      },
      {
        kind: "paragraph",
        text: "A cleaner header. Your dashboard, sign out and other actions that previously sat across the header are now grouped under the new Menu button.",
      },
      {
        kind: "paragraph",
        text: "The homepage has been redesigned.",
      },
      {
        kind: "paragraph",
        text: "You can delete your account yourself. Account deletion is now available from the profile menu on your dashboard, and it is permanent.",
      },
      { kind: "heading", text: "On pricing" },
      {
        kind: "paragraph",
        text: "The price of the PMQ in 5 Days Pro and AI Pro bundles has increased.",
      },
      {
        kind: "paragraph",
        text: "If you already own a bundle, nothing changes for you. Your existing access continues as before and you will not be charged again.",
      },
      {
        kind: "paragraph",
        text: "If you joined the PMQ in 5 Days AI Pro waitlist on or before 21 September 2026, you can still buy it at the previous price.",
      },
      {
        kind: "paragraph",
        text: "If you already own the Pro bundle and want to upgrade to AI Pro, you will only pay the difference.",
      },
      {
        kind: "paragraph",
        text: "If you have any questions, or spot something that does not look right, the Send Feedback button in the site footer reaches me directly.",
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
