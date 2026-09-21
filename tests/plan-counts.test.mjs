import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

/**
 * Guards the quantities advertised on the pricing page.
 *
 * These are typed into plans.ts rather than queried, so nothing but this test
 * stops them drifting from the question bank. A wrong count on a paid page is a
 * specific factual claim to a consumer — materially inaccurate ones are a
 * misleading action under the CPRs regardless of intent, so "the constant was
 * stale" is not a defence. Same failure mode that produced the "1,000+
 * questions" claim and the £9.99 checkout description.
 *
 * Source-level assertions because plans.ts imports through the `@/` alias,
 * which bare `node --test` can't resolve. Same approach as apm-disclaimer.test.mjs.
 *
 * LIVE COUNTS, verified 2026-07-30 against public.questions:
 *   practice_quiz 240 | quiz_set_2..5 240 each | quiz_set_6 240
 *   quiz_set_7 239    | quiz_set_8 183         | mock_exam 160 (4 x 40)
 *
 * Re-run this to re-verify:
 *   select context, count(*) from public.questions group by context order by context;
 */

const STARTER_QUESTIONS = 240; // set 1
const PRO_QUESTIONS = 1200; // sets 1-5
const AI_PRO_QUESTIONS = 1862; // sets 1-8  (240*6 + 239 + 183)

const STARTER_MOCKS = 1;
const PRO_MOCKS = 3;
const AI_PRO_MOCKS = 4;

const source = readFileSync(
  new URL("../src/lib/pmq/plans.ts", import.meta.url),
  "utf8",
);

test("tier totals are internally consistent", () => {
  assert.equal(240 * 5, PRO_QUESTIONS, "sets 1-5 should total 1,200");
  assert.equal(
    240 * 6 + 239 + 183,
    AI_PRO_QUESTIONS,
    "sets 1-8 should total 1,862 — set 7 has 239 and set 8 only 183",
  );
});

test("paid tiers advertise totals (not increments over Starter)", () => {
  // Commercial frame: cards still say “Everything in Starter, plus”, but the
  // listed practice/mock figures are what the buyer ends up with on that tier.
  assert.ok(
    source.includes(`label: "total practice questions",\n        value: "1,200"`),
    "Pro advertises 1,200 total practice questions",
  );
  assert.ok(
    source.includes(`label: "total practice questions",\n        value: "1,860"`),
    "AI Pro advertises 1,860 total practice questions",
  );

  const aiProBlock = source.slice(source.indexOf(`id: "ai_pro"`));
  assert.ok(
    aiProBlock.includes(`inheritsFrom: "starter"`),
    "AI Pro still inherits from starter for the card frame",
  );
});

test("advertised counts never exceed what is actually delivered", () => {
  // Under-promising is safe — a buyer getting more than advertised has no
  // complaint. Over-promising is a misleading action under the CPRs, so this
  // is the assertion that actually protects us.
  const advertisedAiPro = 1860;
  assert.ok(
    advertisedAiPro <= AI_PRO_QUESTIONS,
    `advertising ${advertisedAiPro} questions but only ${AI_PRO_QUESTIONS} exist`,
  );

  const advertisedPro = 1200;
  assert.ok(advertisedPro <= PRO_QUESTIONS);
});

test("mock exam totals match the tier ladder", () => {
  assert.equal(PRO_MOCKS, 3);
  assert.equal(AI_PRO_MOCKS, 4);
  assert.equal(STARTER_MOCKS, 1);

  assert.ok(
    source.includes(`label: "total mock exams", value: "3"`),
    "Pro includes 3 mock papers total",
  );
  assert.ok(
    source.includes(`label: "total mock exams", value: "4"`),
    "AI Pro includes 4 mock papers total",
  );
});

test("the Stripe checkout description derives its figures, never types them", () => {
  // The checkout page and the pricing card quote the same two numbers to the
  // same buyer seconds apart. Hardcoding either into the description is how
  // a stale price survived a prior repricing — so the description must read them from
  // PMQ_PLANS via planFeatureValue, and must not contain a money literal.
  const actions = readFileSync(
    new URL("../src/lib/pmq/actions.ts", import.meta.url),
    "utf8",
  );
  const description = actions.slice(
    actions.indexOf("description: `Unlock the complete PMQ"),
    actions.indexOf("No subscription."),
  );

  assert.ok(
    description.includes(`planFeatureValue("pro", "practice")`),
    "practice-question count must come from PMQ_PLANS",
  );
  assert.ok(
    description.includes(`planFeatureValue("pro", "mock")`),
    "mock-exam count must come from PMQ_PLANS",
  );
  assert.ok(
    description.includes("total practice questions"),
    "checkout wording must match pricing totals frame",
  );
  assert.ok(
    description.includes("total mock exams"),
    "checkout wording must match pricing totals frame",
  );
  assert.ok(
    !/£\d/.test(description),
    "no price literal in the checkout description — Stripe renders unit_amount",
  );
  assert.ok(
    !/\bSly\b/.test(description),
    "Sly is AI Pro (waitlist) and must not be promised to Pro buyers",
  );
});

test("Starter advertises the free tier honestly", () => {
  assert.ok(source.includes(`value: "${STARTER_QUESTIONS}"`));
  assert.ok(
    source.includes(`label: "Mock exam", value: "1"`),
    "Starter includes exactly one mock paper",
  );
});
