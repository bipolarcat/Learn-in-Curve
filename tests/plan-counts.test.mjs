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

test("both paid tiers are advertised against Starter", () => {
  // Commercial decision: the comparison a visitor is actually making is against
  // the free tier, so both paid cards set `inheritsFrom: "starter"` and their
  // figures are increments over Starter — not over each other.
  const proAdded = PRO_QUESTIONS - STARTER_QUESTIONS; // 960
  const aiProAdded = AI_PRO_QUESTIONS - STARTER_QUESTIONS; // 1,622

  assert.equal(proAdded, 960);
  assert.equal(aiProAdded, 1622);

  assert.ok(source.includes(`value: "960"`), "Pro advertises +960 questions");
  assert.ok(source.includes(`value: "1,620"`), "AI Pro advertises +1,620 questions");

  // The anchor and the figures have to move together — flipping AI Pro to
  // inherit from Pro without rebasing 1,620 would claim a 2,820 total.
  const aiProBlock = source.slice(source.indexOf(`id: "ai_pro"`));
  assert.ok(
    aiProBlock.includes(`inheritsFrom: "starter"`),
    "AI Pro figures are Starter-anchored, so its inheritsFrom must stay starter",
  );
});

test("advertised counts never exceed what is actually delivered", () => {
  // Under-promising is safe — a buyer getting more than advertised has no
  // complaint. Over-promising is a misleading action under the CPRs, so this
  // is the assertion that actually protects us.
  const advertisedAiPro = STARTER_QUESTIONS + 1620; // 1,860
  assert.ok(
    advertisedAiPro <= AI_PRO_QUESTIONS,
    `advertising ${advertisedAiPro} questions but only ${AI_PRO_QUESTIONS} exist`,
  );

  const advertisedPro = STARTER_QUESTIONS + 960; // 1,200
  assert.ok(advertisedPro <= PRO_QUESTIONS);
});

test("mock exam increments match the tier ladder", () => {
  assert.equal(PRO_MOCKS - STARTER_MOCKS, 2);
  assert.equal(AI_PRO_MOCKS - STARTER_MOCKS, 3);

  assert.ok(
    source.includes(`label: "additional mock exams", value: "2"`),
    "Pro adds papers 2 and 3",
  );
  assert.ok(
    source.includes(`label: "additional mock exams", value: "3"`),
    "AI Pro adds papers 2, 3 and 4 over Starter",
  );
});

test("Starter advertises the free tier honestly", () => {
  assert.ok(source.includes(`value: "${STARTER_QUESTIONS}"`));
  assert.ok(
    source.includes(`label: "Mock exam", value: "1"`),
    "Starter includes exactly one mock paper",
  );
});
