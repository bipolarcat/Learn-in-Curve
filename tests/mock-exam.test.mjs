import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  canAccessMockTier,
  finalizationDisposition,
  formatExamTime,
  isMockExamReady,
  isDeadlineExpired,
  isValidMockExamSelection,
  liteMockExamConfig,
  mockPartForQuestion,
  mockExamSelectorState,
  parseMockExamSelection,
  parseMockExamSet,
  parseMockExamTier,
  overallSecondsRemaining,
  partDurationMinutes,
  questionsForTier,
} from "../src/lib/pmq/mock-domain.ts";

const questions = [
  { id: "mcq", question_type: "multiple_choice", marks: 1, part: 1, position: 1 },
  { id: "written", question_type: "long_answer", marks: 5, part: 1, position: 2 },
  { id: "dropdown", question_type: "select_from_list", marks: 2, part: 2, position: 1 },
];

test("missing and invalid tiers fail safely to Lite", () => {
  assert.equal(parseMockExamTier(undefined), "lite");
  assert.equal(parseMockExamTier("enterprise"), "lite");
  assert.equal(parseMockExamTier("full"), "full");
});

test("Exam 1 Lite keeps the complete 40-question paper contract", () => {
  const lite = questionsForTier(questions, "lite");
  assert.deepEqual(lite, questions);
  assert.deepEqual(liteMockExamConfig(lite), {
    total_marks: 8,
    pass_mark: 5,
    pass_percentage: 60,
    time_allowed_minutes: 150,
    part_duration_minutes: 75,
    break_after_question: 20,
    break_duration_minutes: 30,
  });
});

test("tier and set parsing enforces Exam 1 Lite and Exams 2-4 Full", () => {
  assert.equal(parseMockExamSet("1"), 1);
  assert.equal(parseMockExamSet("4"), 4);
  assert.equal(parseMockExamSet("5"), null);
  assert.equal(isValidMockExamSelection("lite", 1), true);
  assert.equal(isValidMockExamSelection("lite", 2), false);
  assert.equal(isValidMockExamSelection("full", 1), false);
  assert.equal(isValidMockExamSelection("full", 4), true);
  assert.deepEqual(parseMockExamSelection("full", "3"), {
    tier: "full",
    examSet: 3,
  });
  assert.equal(parseMockExamSelection("full", "1"), null);
  assert.equal(isMockExamReady(40), true);
  assert.equal(isMockExamReady(39), false);
  assert.equal(isMockExamReady(41), false);
  assert.equal(isMockExamReady(40, 89), false);
});

test("Pro selector resolves coming-soon, start, resume, conflict and result states", () => {
  const base = {
    examSet: 2,
    questionCount: 40,
    totalMarks: 90,
    ready: true,
    activeSessionId: null,
    latestResult: null,
    hasPassed: false,
  };
  assert.deepEqual(
    mockExamSelectorState({ ...base, ready: false }, true, null),
    { status: "Coming soon", action: "Coming soon", enabled: false },
  );
  assert.deepEqual(mockExamSelectorState(base, true, null), {
    status: "Ready",
    action: "Start Exam 2 →",
    enabled: true,
  });
  assert.deepEqual(
    mockExamSelectorState(
      { ...base, activeSessionId: "session" },
      true,
      2,
    ),
    { status: "In progress", action: "Resume Exam 2 →", enabled: true },
  );
  assert.equal(mockExamSelectorState(base, true, 3).action, "Finish Exam 3 first");
  assert.equal(
    mockExamSelectorState(
      {
        ...base,
        latestResult: "passed",
        hasPassed: true,
        latestStatus: "finalized",
      },
      true,
      null,
    )
      .status,
    "Passed",
  );
  assert.equal(
    mockExamSelectorState(
      {
        ...base,
        latestResult: "passed",
        hasPassed: true,
        latestStatus: "finalized",
      },
      true,
      null,
    ).action,
    "View Exam 2 result →",
  );
  assert.equal(
    mockExamSelectorState({ ...base, latestResult: "refer" }, false, null)
      .status,
    "Completed · Refer",
  );
});

test("Full requires entitlement while Lite remains additive", () => {
  assert.equal(canAccessMockTier("lite", false), true);
  assert.equal(canAccessMockTier("lite", true), true);
  assert.equal(canAccessMockTier("full", false), false);
  assert.equal(canAccessMockTier("full", true), true);
});

test("deadline and finalization guards cover expiry and idempotency", () => {
  assert.equal(isDeadlineExpired("2026-01-01T00:00:00.000Z", Date.parse("2026-01-01T00:00:01.000Z")), true);
  assert.equal(isDeadlineExpired("2026-01-01T00:00:02.000Z", Date.parse("2026-01-01T00:00:01.000Z")), false);
  assert.equal(finalizationDisposition("active"), "run");
  assert.equal(finalizationDisposition("self_assessing"), "run");
  assert.equal(finalizationDisposition("grading"), "run");
  assert.equal(finalizationDisposition("finalized"), "idempotent");
  assert.equal(finalizationDisposition("abandoned"), "blocked");
});

test("two-part timing is fixed, readable, and excludes the break", () => {
  const config = liteMockExamConfig(questions);
  assert.equal(partDurationMinutes(config), 75);
  assert.equal(mockPartForQuestion({ part: 1 }), 1);
  assert.equal(mockPartForQuestion({ part: 2 }), 2);
  assert.equal(overallSecondsRemaining(1, 4500, 75), 9000);
  assert.equal(overallSecondsRemaining(2, 4500, 75), 4500);
  assert.equal(formatExamTime(9000), "2h 30m 00s");
  assert.equal(formatExamTime(4499), "1h 14m 59s");
});

test("schema preserves one open tier while storing exam identity", async () => {
  const source = await readFile(
    new URL(
      "../supabase/migrations/20260718220000_mock_exam_sets.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /add column if not exists exam_set smallint/);
  assert.match(
    source,
    /on public\.exam_sessions \(user_id, course_id, tier\)/,
  );
  assert.doesNotMatch(
    source,
    /on public\.exam_sessions \(user_id, course_id, tier, exam_set\)/,
  );
  assert.match(source, /'self_assessing'/);
});

test("part lifecycle migration persists flags and enforces one lifetime paper", async () => {
  const source = await readFile(
    new URL(
      "../supabase/migrations/20260718234500_mock_exam_parts_navigation.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /part_1_deadline_at timestamptz/);
  assert.match(source, /part_2_submitted_at timestamptz/);
  assert.match(source, /create table if not exists public\.exam_question_flags/);
  assert.match(
    source,
    /on public\.exam_sessions \(user_id, course_id, exam_set\)/,
  );
  assert.match(source, /Duplicate mock sessions exist/);
});

test("server and selector expose set guards, readiness and AI grading", async () => {
  const [actions, selector] = await Promise.all([
    readFile(
      new URL("../src/lib/pmq/mock-actions.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../src/components/pmq/PmqMockExamsSection.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  assert.match(actions, /\.eq\("exam_set", session\.exam_set\)/);
  assert.match(
    actions,
    /isMockExamReady\(questions\.length, totalMarks\)/,
  );
  assert.match(actions, /finalizeMockExam/);
  assert.match(actions, /callExamGrader/);
  assert.match(selector, /mockExamSelectorState/);
});

test("failure UX exposes alert, retry, busy, and focus states", async () => {
  const source = await readFile(
    new URL("../src/components/pmq/MockExamRunner.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /role="alert"/);
  assert.match(source, /Retry marking/);
  assert.match(source, /aria-busy=\{pending\}/);
  assert.match(source, /errorRef\.current\?\.focus\(\)/);
  assert.match(source, /MockExamQuestionRail/);
  assert.match(source, /Flag question/);
  assert.match(source, /Submit Part/);
  assert.match(source, /overallRemaining/);
  assert.match(source, /Review all 40 answers/);
});
