import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessPfqFullPractice,
  canAccessPfqLessons,
  canAccessPfqMock,
  canAccessPfqTrapSchool,
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
  assert.equal(toPfqTier("ai_pro"), "starter");
  assert.equal(toPfqTier("pro"), "pro");
});

test("mock and full practice require pro", () => {
  assert.equal(canAccessPfqMock("starter"), false);
  assert.equal(canAccessPfqMock("pro"), true);
  assert.equal(canAccessPfqFullPractice("starter"), false);
  assert.equal(canAccessPfqFullPractice("pro"), true);
});

test("lessons and Trap School are free", () => {
  assert.equal(canAccessPfqLessons("starter"), true);
  assert.equal(canAccessPfqLessons("pro"), true);
  assert.equal(canAccessPfqTrapSchool("starter"), true);
  assert.equal(canAccessPfqTrapSchool("pro"), true);
});

test("checkout stays behind the review flag by default", () => {
  assert.equal(PFQ_CHECKOUT_ENABLED, false);
});

test("price and course id are fixed", () => {
  assert.equal(PFQ_PRO_PRICE_CENTS, 600);
  assert.match(PFQ_COURSE_ID, /^[0-9a-f-]{36}$/i);
});
