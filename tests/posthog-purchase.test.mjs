/**
 * Unit tests for Stripe → PostHog `purchase_completed` mapping.
 *
 * `purchase.ts` is TypeScript — plain `node --test` cannot load `@/` path
 * aliases. Duplicate the pure mapper here (same pattern as
 * `course-report-meter.test.mjs`) and also assert the source still exports it.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";
const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

/** Mirrors src/lib/analytics/purchase.ts purchaseCompletedFromCheckoutSession */
function purchaseCompletedFromCheckoutSession(session) {
  if (session.payment_status && session.payment_status !== "paid") {
    return null;
  }
  const distinctId = session.metadata?.user_id;
  if (!distinctId) return null;

  const feature = session.metadata?.feature;
  const product =
    feature === "ai_tutor_topup"
      ? "sly_topup"
      : feature === "ai_tutor"
        ? "ai_pro"
        : feature;
  const courseId = session.metadata?.course_id;
  const course = !courseId
    ? undefined
    : courseId === PMQ_COURSE_ID
      ? "pmq"
      : courseId;

  const intent = session.payment_intent;
  const stripePaymentId =
    typeof intent === "string" && intent
      ? intent
      : intent && typeof intent === "object" && intent.id
        ? intent.id
        : session.id;

  const properties = {
    $insert_id: `purchase_completed:${session.id}`,
    stripe_session_id: session.id,
    stripe_payment_id: stripePaymentId,
  };
  if (typeof session.amount_total === "number") {
    properties.amount_cents = session.amount_total;
  }
  if (session.currency) {
    properties.currency = session.currency;
  }
  if (product) {
    properties.product = product;
  }
  if (course) {
    properties.course = course;
  }
  return { distinctId, properties };
}

test("maps a paid Pro checkout to purchase_completed", () => {
  const payload = purchaseCompletedFromCheckoutSession({
    id: "cs_test_123",
    payment_status: "paid",
    amount_total: 800,
    currency: "gbp",
    payment_intent: "pi_test_456",
    metadata: {
      user_id: USER_ID,
      course_id: PMQ_COURSE_ID,
      feature: "pro",
    },
  });

  assert.ok(payload);
  assert.equal(payload.distinctId, USER_ID);
  assert.equal(payload.properties.product, "pro");
  assert.equal(payload.properties.course, "pmq");
  assert.equal(payload.properties.amount_cents, 800);
  assert.equal(payload.properties.currency, "gbp");
  assert.equal(payload.properties.stripe_session_id, "cs_test_123");
  assert.equal(payload.properties.stripe_payment_id, "pi_test_456");
  assert.equal(payload.properties.$insert_id, "purchase_completed:cs_test_123");
});

test("maps top-up feature to sly_topup product", () => {
  const payload = purchaseCompletedFromCheckoutSession({
    id: "cs_test_topup",
    payment_status: "paid",
    amount_total: 500,
    currency: "gbp",
    payment_intent: "pi_topup",
    metadata: {
      user_id: USER_ID,
      course_id: PMQ_COURSE_ID,
      feature: "ai_tutor_topup",
    },
  });

  assert.ok(payload);
  assert.equal(payload.properties.product, "sly_topup");
});

test("legacy ai_tutor feature maps to ai_pro", () => {
  const payload = purchaseCompletedFromCheckoutSession({
    id: "cs_legacy",
    payment_status: "paid",
    metadata: {
      user_id: USER_ID,
      course_id: PMQ_COURSE_ID,
      feature: "ai_tutor",
    },
  });

  assert.ok(payload);
  assert.equal(payload.properties.product, "ai_pro");
});

test("skips unpaid sessions", () => {
  const payload = purchaseCompletedFromCheckoutSession({
    id: "cs_unpaid",
    payment_status: "unpaid",
    metadata: { user_id: USER_ID, course_id: PMQ_COURSE_ID, feature: "pro" },
  });
  assert.equal(payload, null);
});

test("skips when buyer user_id is missing", () => {
  const payload = purchaseCompletedFromCheckoutSession({
    id: "cs_no_user",
    payment_status: "paid",
    metadata: { course_id: PMQ_COURSE_ID, feature: "pro" },
  });
  assert.equal(payload, null);
});

test("falls back to session id when payment_intent is absent", () => {
  const payload = purchaseCompletedFromCheckoutSession({
    id: "cs_no_pi",
    payment_status: "paid",
    metadata: { user_id: USER_ID, feature: "pro" },
  });
  assert.ok(payload);
  assert.equal(payload.properties.stripe_payment_id, "cs_no_pi");
  assert.equal(payload.properties.course, undefined);
});

test("webhook and helpers still wire purchase_completed server-side", async () => {
  const purchase = await readFile(
    join(root, "src/lib/analytics/purchase.ts"),
    "utf8",
  );
  const server = await readFile(join(root, "src/lib/analytics/server.ts"), "utf8");
  const webhook = await readFile(
    join(root, "src/app/api/stripe/webhook/route.ts"),
    "utf8",
  );
  const events = await readFile(join(root, "src/lib/analytics/events.ts"), "utf8");
  const freeMock = await readFile(
    join(root, "src/components/free-mock/FreeMockExamClient.tsx"),
    "utf8",
  );

  assert.match(purchase, /captureServer\(/);
  assert.match(purchase, /"purchase_completed"/);
  assert.match(purchase, /metadata\?\.user_id/);
  assert.match(server, /NEXT_PUBLIC_POSTHOG_HOST/);
  assert.match(server, /eu\.i\.posthog\.com/);
  assert.match(webhook, /trackPurchaseCompleted\(session\)/);
  assert.match(events, /capture\("free_mock_started"/);
  assert.match(events, /capture\("tutor_message_sent"/);
  assert.match(events, /course: props\.course \?\? ANALYTICS_COURSE_PMQ/);
  assert.match(freeMock, /trackFreeMockStarted\(\)/);
});
