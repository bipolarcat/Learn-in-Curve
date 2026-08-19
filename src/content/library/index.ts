import type { LibraryGroup, LibraryPage } from "./types";
import { isLibraryPageIndexable, LIBRARY_GROUP_LABELS } from "./types";
import { page as apmPmqPassMark } from "./pages/apm-pmq-pass-mark";
import { page as howHardIsApmPmq } from "./pages/how-hard-is-apm-pmq";
import { page as apmPmqExamFormat } from "./pages/apm-pmq-exam-format";
import { page as howLongToRevise } from "./pages/how-long-to-revise-for-apm-pmq";
import { page as apmPmqVsPfq } from "./pages/apm-pmq-vs-pfq";
import { page as apmPmqVsPrince2 } from "./pages/apm-pmq-vs-prince2";
import { page as apmPmqVsPmp } from "./pages/apm-pmq-vs-pmp";
import { page as isApmPmqWorthIt } from "./pages/is-apm-pmq-worth-it";
import { page as apmPmqBusinessCase } from "./pages/apm-pmq-business-case";
import { page as apmPmqRiskManagement } from "./pages/apm-pmq-risk-management";
import { page as apmPmqStakeholderManagement } from "./pages/apm-pmq-stakeholder-management";
import { page as apmPmqGovernance } from "./pages/apm-pmq-governance";
import { page as apmPmqProjectLifeCycles } from "./pages/apm-pmq-project-life-cycles";
import { page as apmPmqBreakdownStructures } from "./pages/apm-pmq-breakdown-structures";
import { page as apmPmqScheduling } from "./pages/apm-pmq-scheduling-and-critical-path";
import { page as apmPmqChangeControl } from "./pages/apm-pmq-change-control";
import { page as apmPmqQualityManagement } from "./pages/apm-pmq-quality-management";
import { page as apmPmqLeadershipAndTeams } from "./pages/apm-pmq-leadership-and-teams";

/**
 * Register new pages here. Adding page #40 = one import + one array entry.
 */
export const LIBRARY_PAGES: LibraryPage[] = [
  apmPmqPassMark,
  howHardIsApmPmq,
  apmPmqExamFormat,
  howLongToRevise,
  apmPmqVsPfq,
  apmPmqVsPrince2,
  apmPmqVsPmp,
  isApmPmqWorthIt,
  apmPmqBusinessCase,
  apmPmqRiskManagement,
  apmPmqStakeholderManagement,
  apmPmqGovernance,
  apmPmqProjectLifeCycles,
  apmPmqBreakdownStructures,
  apmPmqScheduling,
  apmPmqChangeControl,
  apmPmqQualityManagement,
  apmPmqLeadershipAndTeams,
];

const bySlug = new Map(LIBRARY_PAGES.map((p) => [p.slug, p]));

export function getLibraryPage(slug: string): LibraryPage | undefined {
  return bySlug.get(slug);
}

export function getAllLibrarySlugs(): string[] {
  return LIBRARY_PAGES.map((p) => p.slug);
}

export function getPublishedLibraryPages(): LibraryPage[] {
  return LIBRARY_PAGES.filter(isLibraryPageIndexable);
}

export function getLibraryPagesByGroup(): {
  group: LibraryGroup;
  label: string;
  pages: LibraryPage[];
}[] {
  const order: LibraryGroup[] = ["exam-prep", "choosing", "syllabus"];
  return order.map((group) => ({
    group,
    label: LIBRARY_GROUP_LABELS[group],
    pages: getPublishedLibraryPages().filter((p) => p.group === group),
  }));
}

export {
  isLibraryPageIndexable,
  pageHasTodoCopy,
  LIBRARY_GROUP_LABELS,
  TODO_COPY,
  type LibraryPage,
  type LibraryGroup,
} from "./types";
