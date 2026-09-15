import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessPfqCompletionReport,
  canAccessPfqCoverageMap,
  canAccessPfqFullPractice,
  canAccessPfqInsights,
  canAccessPfqLessons,
  canAccessPfqMock,
  canAccessPfqTrapSchool,
  canAccessPfqTutor,
  PFQ_FREE_INSIGHTS_OBJECTIVE,
  toPfqTier,
} from "../src/lib/pfq/tiers.ts";
import {
  PFQ_CHECKOUT_ENABLED,
  PFQ_COURSE_ID,
  PFQ_PRO_PRICE_CENTS,
} from "../src/lib/pfq/constants.ts";

test("starter is absence — unrecognized values fail closed", () => {
  assert.equal(toPfqTier(null), "starter");
  assert.equal(toPfqTier(undefined), "starter");
  assert.equal(toPfqTier("premium"), "starter");
  assert.equal(toPfqTier("pro"), "pro");
  assert.equal(toPfqTier("ai_pro"), "ai_pro");
});

test("mock and full practice require pro", () => {
  assert.equal(canAccessPfqMock("starter"), false);
  assert.equal(canAccessPfqMock("pro"), true);
  assert.equal(canAccessPfqFullPractice("starter"), false);
  assert.equal(canAccessPfqFullPractice("pro"), true);
});

test("insights free on objective 1 only for starter", () => {
  assert.equal(canAccessPfqInsights("starter", PFQ_FREE_INSIGHTS_OBJECTIVE), true);
  assert.equal(canAccessPfqInsights("starter", 5), false);
  assert.equal(canAccessPfqInsights("pro", 5), true);
});

test("coverage is Pro; tutor and report are AI Pro", () => {
  assert.equal(canAccessPfqCoverageMap("starter"), false);
  assert.equal(canAccessPfqCoverageMap("pro"), true);
  assert.equal(canAccessPfqTutor("pro"), false);
  assert.equal(canAccessPfqTutor("ai_pro"), true);
  assert.equal(canAccessPfqCompletionReport("pro"), false);
  assert.equal(canAccessPfqCompletionReport("ai_pro"), true);
});

test("lessons and Trap School are free", () => {
  assert.equal(canAccessPfqLessons("starter"), true);
  assert.equal(canAccessPfqLessons("pro"), true);
  assert.equal(canAccessPfqTrapSchool("starter"), true);
  assert.equal(canAccessPfqTrapSchool("pro"), true);
});

test("checkout is live (LIC-157)", () => {
  assert.equal(PFQ_CHECKOUT_ENABLED, true);
});

test("price and course id are fixed", () => {
  assert.equal(PFQ_PRO_PRICE_CENTS, 1000);
  assert.match(PFQ_COURSE_ID, /^[0-9a-f-]{36}$/i);
});
