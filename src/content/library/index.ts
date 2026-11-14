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
import { page as howToAnswerExamQuestions } from "./pages/how-to-answer-apm-pmq-exam-questions";
import { page as apmPmqProjectLifeCycles } from "./pages/apm-pmq-project-life-cycles";
import { page as apmPmqGovernance } from "./pages/apm-pmq-governance";
import { page as apmPmqSustainability } from "./pages/apm-pmq-sustainability";
import { page as apmPmqBusinessCase } from "./pages/apm-pmq-business-case";
import { page as apmPmqProcurement } from "./pages/apm-pmq-procurement";
import { page as apmPmqReviews } from "./pages/apm-pmq-reviews";
import { page as apmPmqAssurance } from "./pages/apm-pmq-assurance";
import { page as apmPmqTransitionManagement } from "./pages/apm-pmq-transition-management";
import { page as apmPmqBenefitsManagement } from "./pages/apm-pmq-benefits-management";
import { page as apmPmqStakeholderManagement } from "./pages/apm-pmq-stakeholder-management";
import { page as apmPmqConflictResolution } from "./pages/apm-pmq-conflict-resolution";
import { page as apmPmqLeadershipAndTeams } from "./pages/apm-pmq-leadership-and-teams";
import { page as apmPmqDiversityAndInclusion } from "./pages/apm-pmq-diversity-and-inclusion";
import { page as apmPmqEthicsCompliance } from "./pages/apm-pmq-ethics-compliance-professionalism";
import { page as apmPmqRequirementsManagement } from "./pages/apm-pmq-requirements-management";
import { page as apmPmqSolutionsDevelopment } from "./pages/apm-pmq-solutions-development";
import { page as apmPmqQualityManagement } from "./pages/apm-pmq-quality-management";
import { page as apmPmqIntegratedPlanning } from "./pages/apm-pmq-integrated-planning";
import { page as apmPmqBreakdownStructures } from "./pages/apm-pmq-breakdown-structures";
import { page as apmPmqScheduling } from "./pages/apm-pmq-scheduling-and-critical-path";
import { page as apmPmqResourceManagement } from "./pages/apm-pmq-resource-management";
import { page as apmPmqBudgeting } from "./pages/apm-pmq-budgeting-and-cost-control";
import { page as apmPmqRiskManagement } from "./pages/apm-pmq-risk-management";
import { page as apmPmqChangeControl } from "./pages/apm-pmq-change-control";

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
  howToAnswerExamQuestions,
  apmPmqProjectLifeCycles,
  apmPmqGovernance,
  apmPmqSustainability,
  apmPmqBusinessCase,
  apmPmqProcurement,
  apmPmqReviews,
  apmPmqAssurance,
  apmPmqTransitionManagement,
  apmPmqBenefitsManagement,
  apmPmqStakeholderManagement,
  apmPmqConflictResolution,
  apmPmqLeadershipAndTeams,
  apmPmqDiversityAndInclusion,
  apmPmqEthicsCompliance,
  apmPmqRequirementsManagement,
  apmPmqSolutionsDevelopment,
  apmPmqQualityManagement,
  apmPmqIntegratedPlanning,
  apmPmqBreakdownStructures,
  apmPmqScheduling,
  apmPmqResourceManagement,
  apmPmqBudgeting,
  apmPmqRiskManagement,
  apmPmqChangeControl,
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

/** Syllabus shelf: LO number ascending, then title for shared numbers. */
function compareSyllabusPages(a: LibraryPage, b: LibraryPage): number {
  const aLo = a.loNumber ?? Number.POSITIVE_INFINITY;
  const bLo = b.loNumber ?? Number.POSITIVE_INFINITY;
  if (aLo !== bLo) return aLo - bLo;
  return a.title.localeCompare(b.title, "en-GB");
}

export function getLibraryPagesByGroup(): {
  group: LibraryGroup;
  label: string;
  pages: LibraryPage[];
}[] {
  const order: LibraryGroup[] = ["exam-prep", "choosing", "syllabus"];
  return order.map((group) => {
    const pages = getPublishedLibraryPages().filter((p) => p.group === group);
    if (group === "syllabus") pages.sort(compareSyllabusPages);
    return {
      group,
      label: LIBRARY_GROUP_LABELS[group],
      pages,
    };
  });
}

export {
  isLibraryPageIndexable,
  pageHasTodoCopy,
  LIBRARY_GROUP_LABELS,
  TODO_COPY,
  type LibraryPage,
  type LibraryGroup,
  type LibraryPracticeQuestion,
} from "./types";
