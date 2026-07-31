import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessCourseReport,
  canAccessMedia,
  canAccessMockExam,
  canAccessQuizSet,
  canAccessSly,
  maxQuizSetForTier,
  mockExamCountForTier,
  toTier,
} from "../src/lib/pmq/tiers.ts";

/**
 * These assertions ARE the pricing page's promises. If one fails, the site is
 * advertising something it doesn't deliver — or handing over something it sells
 * separately. Change a rule here only alongside the copy in plans.ts.
 */

test("quiz sets split 1 / 2-5 / 6-8", () => {
  const expected = {
    starter: [1],
    pro: [1, 2, 3, 4, 5],
    ai_pro: [1, 2, 3, 4, 5, 6, 7, 8],
  };

  for (const [tier, allowed] of Object.entries(expected)) {
    for (let set = 1; set <= 8; set += 1) {
      assert.equal(
        canAccessQuizSet(tier, set),
        allowed.includes(set),
        `${tier} / set ${set}`,
      );
    }
  }

  assert.equal(maxQuizSetForTier("starter"), 1);
  assert.equal(maxQuizSetForTier("pro"), 5);
  assert.equal(maxQuizSetForTier("ai_pro"), 8);
});

test("mock exams split 1 / 1-3 / 1-4", () => {
  const expected = {
    starter: [1],
    pro: [1, 2, 3],
    ai_pro: [1, 2, 3, 4],
  };

  for (const [tier, allowed] of Object.entries(expected)) {
    for (const exam of [1, 2, 3, 4]) {
      assert.equal(
        canAccessMockExam(tier, exam),
        allowed.includes(exam),
        `${tier} / exam ${exam}`,
      );
    }
    assert.equal(mockExamCountForTier(tier), allowed.length);
  }
});

test("Sly and the report are AI Pro only; media is Pro and above", () => {
  assert.equal(canAccessSly("starter"), false);
  assert.equal(canAccessSly("pro"), false, "Pro must not reach Sly");
  assert.equal(canAccessSly("ai_pro"), true);

  assert.equal(canAccessCourseReport("pro"), false);
  assert.equal(canAccessCourseReport("ai_pro"), true);

  assert.equal(canAccessMedia("starter"), false);
  assert.equal(canAccessMedia("pro"), true);
});

test("unknown entitlement values fail closed to starter", () => {
  // A typo, a legacy row, or a null must never unlock paid content.
  for (const value of [null, undefined, "", "ai_tutor", "premium", "PRO", 1]) {
    assert.equal(toTier(value), "starter", String(value));
  }
  assert.equal(toTier("pro"), "pro");
  assert.equal(toTier("ai_pro"), "ai_pro");
});
