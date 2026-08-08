import type { LearnGroup, LearnPage } from "./types";
import { isLearnPageIndexable, LEARN_GROUP_LABELS } from "./types";
import { page as apmPmqPassMark } from "./pages/apm-pmq-pass-mark";
import { page as howHardIsApmPmq } from "./pages/how-hard-is-apm-pmq";
import { page as apmPmqExamFormat } from "./pages/apm-pmq-exam-format";
import { page as howLongToRevise } from "./pages/how-long-to-revise-for-apm-pmq";
import { page as apmPmqVsPfq } from "./pages/apm-pmq-vs-pfq";
import { page as apmPmqVsPrince2 } from "./pages/apm-pmq-vs-prince2";
import { page as isApmPmqWorthIt } from "./pages/is-apm-pmq-worth-it";
import { page as apmPmqBusinessCase } from "./pages/apm-pmq-business-case";
import { page as apmPmqRiskManagement } from "./pages/apm-pmq-risk-management";
import { page as apmPmqStakeholderManagement } from "./pages/apm-pmq-stakeholder-management";

/**
 * Register new pages here. Adding page #40 = one import + one array entry.
 */
export const LEARN_PAGES: LearnPage[] = [
  apmPmqPassMark,
  howHardIsApmPmq,
  apmPmqExamFormat,
  howLongToRevise,
  apmPmqVsPfq,
  apmPmqVsPrince2,
  isApmPmqWorthIt,
  apmPmqBusinessCase,
  apmPmqRiskManagement,
  apmPmqStakeholderManagement,
];

const bySlug = new Map(LEARN_PAGES.map((p) => [p.slug, p]));

export function getLearnPage(slug: string): LearnPage | undefined {
  return bySlug.get(slug);
}

export function getAllLearnSlugs(): string[] {
  return LEARN_PAGES.map((p) => p.slug);
}

export function getPublishedLearnPages(): LearnPage[] {
  return LEARN_PAGES.filter(isLearnPageIndexable);
}

export function getLearnPagesByGroup(): {
  group: LearnGroup;
  label: string;
  pages: LearnPage[];
}[] {
  const order: LearnGroup[] = ["exam-prep", "choosing", "syllabus"];
  return order.map((group) => ({
    group,
    label: LEARN_GROUP_LABELS[group],
    pages: getPublishedLearnPages().filter((p) => p.group === group),
  }));
}

export {
  isLearnPageIndexable,
  pageHasTodoCopy,
  LEARN_GROUP_LABELS,
  TODO_COPY,
  type LearnPage,
  type LearnGroup,
} from "./types";
