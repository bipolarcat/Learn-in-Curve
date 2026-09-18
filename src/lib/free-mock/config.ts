/**
 * Per-exam free-mock config (copy, CTA, disclaimer, SEO fields).
 * No em dashes or en dashes in any string here.
 */

import {
  LIBRARY_HUB_APM_DISCLAIMER,
  PFQ_ATP_DISCLAIMER,
  PMI_DISCLAIMER,
} from "@/lib/legal-copy";
import { PMP_LIST_KEY } from "@/lib/notify/lists";
import { getFreeMockBank } from "@/lib/free-mock/banks";
import type { FreeMockExamId, FreeMockItem } from "@/lib/free-mock/types";

export type FreeMockResultsCtaKind = "course" | "waitlist";

export type FreeMockFaq = {
  q: string;
  a: string;
};

export type FreeMockExamConfig = {
  examId: FreeMockExamId;
  /** URL segment under /free-mock-exam/ */
  slug: string;
  path: string;
  displayName: string;
  /** Short mark for titles: PMQ / PFQ / PMP */
  mark: string;
  /** Storage / analytics course key */
  course: "pmq" | "pfq" | "pmp";
  questionCount: number;
  /** Countdown length for the readiness check (seconds). */
  timerSeconds: number;
  /** Target pace per question (ms) — usually timerSeconds*1000/questionCount. */
  targetPaceMsPerQuestion: number;
  items: FreeMockItem[];
  resultsCtaKind: FreeMockResultsCtaKind;
  /** Course href when resultsCtaKind is course; null for waitlist. */
  ctaHref: string | null;
  ctaLabel: string;
  waitlistNotifyKey: string | null;
  waitlistSubjectLabel: string | null;
  waitlistCourseCopy: string | null;
  breakdownNoun: string;
  breakdownNounPlural: string;
  disclaimer: string;
  pageTitle: string;
  pageDescription: string;
  heroSupport: string;
  gatePrompt: string;
  marketingConsentLabel: string;
  faqs: FreeMockFaq[];
};

const PMQ_ITEMS = getFreeMockBank("apm-pmq");
const PFQ_ITEMS = getFreeMockBank("apm-pfq");
const PMP_ITEMS = getFreeMockBank("pmp");

function pace(timerSeconds: number, questionCount: number) {
  return Math.round((timerSeconds * 1000) / questionCount);
}

export const FREE_MOCK_EXAMS: Record<FreeMockExamId, FreeMockExamConfig> = {
  "apm-pmq": {
    examId: "apm-pmq",
    slug: "apm-pmq",
    path: "/free-mock-exam/apm-pmq",
    displayName: "APM PMQ",
    mark: "PMQ",
    course: "pmq",
    questionCount: PMQ_ITEMS.length,
    timerSeconds: 600,
    targetPaceMsPerQuestion: pace(600, PMQ_ITEMS.length),
    items: PMQ_ITEMS,
    resultsCtaKind: "course",
    ctaHref: "/courses/pmq-in-5-days",
    ctaLabel: "Start PMQ in 5 Days for free",
    waitlistNotifyKey: null,
    waitlistSubjectLabel: null,
    waitlistCourseCopy: null,
    breakdownNoun: "learning objective",
    breakdownNounPlural: "learning objectives",
    disclaimer: LIBRARY_HUB_APM_DISCLAIMER,
    pageTitle: "Free APM PMQ Mock Exam - 15-Question Readiness Check",
    pageDescription:
      "Take a free 15-question APM PMQ readiness check in real exam format. See which learning objectives to revise first - no account required.",
    heroSupport:
      "Test yourself with real APM PMQ-style questions covering multiple choice, scenario-based, and select-from-list formats. Complete it within 10 minutes.",
    gatePrompt:
      "Enter your email to get your test summary and identify your weakest learning objectives, so you know exactly what to revise first.",
    marketingConsentLabel:
      "Email me PMQ study tips and product updates. You can unsubscribe any time.",
    faqs: [
      {
        q: "Is this the full APM PMQ mock exam?",
        a: "No. This is a free 15-question readiness check using the same question styles as the real APM PMQ (multiple choice, scenario, and select-from-list). The full timed mock papers live inside the PMQ in 5 Days course.",
      },
      {
        q: "Do I need an account?",
        a: "No account is required to take the check. After you finish, enter your email to unlock your learning-objective breakdown. Creating an account is optional if you want to start the 5-day revision plan.",
      },
      {
        q: "Is Learn in Curve affiliated with APM?",
        a: "No. Learn in Curve is not affiliated with, endorsed by, or accredited by APM (the Association for Project Management). Our revision material is aimed at their published syllabus.",
      },
    ],
  },
  "apm-pfq": {
    examId: "apm-pfq",
    slug: "apm-pfq",
    path: "/free-mock-exam/apm-pfq",
    displayName: "APM PFQ",
    mark: "PFQ",
    course: "pfq",
    questionCount: PFQ_ITEMS.length,
    timerSeconds: 400,
    targetPaceMsPerQuestion: pace(400, PFQ_ITEMS.length),
    items: PFQ_ITEMS,
    resultsCtaKind: "course",
    ctaHref: "/courses/pfq-in-2-days",
    ctaLabel: "Explore PFQ in 2 Days",
    waitlistNotifyKey: null,
    waitlistSubjectLabel: null,
    waitlistCourseCopy: null,
    breakdownNoun: "learning objective",
    breakdownNounPlural: "learning objectives",
    disclaimer: PFQ_ATP_DISCLAIMER,
    pageTitle: "Free APM PFQ Mock Exam - 10-Question Readiness Check",
    pageDescription:
      "Take a free 10-question APM PFQ readiness check. See which learning objectives to revise first - no account required.",
    heroSupport:
      "Test yourself with APM PFQ-style multiple choice questions. Spot weak learning objectives before you book the real exam.",
    gatePrompt:
      "Enter your email to get your test summary and identify your weakest learning objectives, so you know exactly what to revise first.",
    marketingConsentLabel:
      "Email me PFQ study tips and product updates. You can unsubscribe any time.",
    faqs: [
      {
        q: "Is this the full APM PFQ exam?",
        a: "No. This is a free 10-question readiness check. The real APM PFQ is 60 questions in 60 minutes with a pass mark of 36 out of 60.",
      },
      {
        q: "Do I need an account?",
        a: "No account is required to take the check. After you finish, enter your email to unlock your learning-objective breakdown.",
      },
      {
        q: "Is Learn in Curve an APM Accredited Training Provider?",
        a: "No. Learn in Curve is not an APM Accredited Training Provider. We do not sell, administer or invigilate the APM PFQ exam.",
      },
    ],
  },
  pmp: {
    examId: "pmp",
    slug: "pmp",
    path: "/free-mock-exam/pmp",
    displayName: "PMP",
    mark: "PMP",
    course: "pmp",
    questionCount: PMP_ITEMS.length,
    timerSeconds: 600,
    targetPaceMsPerQuestion: pace(600, PMP_ITEMS.length),
    items: PMP_ITEMS,
    resultsCtaKind: "waitlist",
    ctaHref: null,
    ctaLabel: "Join the PMP waitlist",
    waitlistNotifyKey: PMP_LIST_KEY,
    waitlistSubjectLabel: "PMP readiness course",
    waitlistCourseCopy: "a PMP readiness course",
    breakdownNoun: "domain",
    breakdownNounPlural: "domains",
    disclaimer: PMI_DISCLAIMER,
    pageTitle: "Free PMP Readiness Check - 15 Scenario Questions",
    pageDescription:
      "Take a free 15-question PMP readiness check across People, Process and Business Environment - no account required.",
    heroSupport:
      "Fifteen scenario questions across the three PMP domains. See where you are strong and where to focus next.",
    gatePrompt:
      "Enter your email to get your test summary and see how you scored across the three domains.",
    marketingConsentLabel:
      "Email me PMP study tips and product updates. You can unsubscribe any time.",
    faqs: [
      {
        q: "Is this the full PMP exam?",
        a: "No. This is a free 15-question readiness check. The real PMP exam is 180 questions, of which 170 are scored, across three domains: People, Process and Business Environment.",
      },
      {
        q: "Do I need an account?",
        a: "No account is required to take the check. After you finish, enter your email to unlock your domain breakdown.",
      },
      {
        q: "Is Learn in Curve affiliated with PMI?",
        a: "No. Learn in Curve is not affiliated with, endorsed by, or accredited by the Project Management Institute (PMI). PMP and PMI are registered marks of the Project Management Institute, Inc. This readiness check is independently written against PMI's published Examination Content Outline.",
      },
    ],
  },
};

export const FREE_MOCK_EXAM_IDS = Object.keys(
  FREE_MOCK_EXAMS,
) as FreeMockExamId[];

export function getFreeMockExamConfig(
  examId: FreeMockExamId,
): FreeMockExamConfig {
  return FREE_MOCK_EXAMS[examId];
}

export function isFreeMockExamId(value: string): value is FreeMockExamId {
  return value === "apm-pmq" || value === "apm-pfq" || value === "pmp";
}
