/**
 * Unit tests for Stripe → PostHog `purchase_completed` mapping.
 * Imports the real TypeScript module via tsx.
 *
 *   npx tsx --test tests/posthog-purchase.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  purchaseCompletedEventUuid,
  purchaseCompletedFromCheckoutSession,
} from "../src/lib/analytics/purchase.ts";

const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";
const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const EVENT_CREATED = 1_700_000_000;

test("same session id always yields the same event uuid", () => {
  const a = purchaseCompletedEventUuid("cs_test_123");
  const b = purchaseCompletedEventUuid("cs_test_123");
  const c = purchaseCompletedEventUuid("cs_test_other");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(
    a,
    /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
});

test("maps a paid Pro checkout with timestamp from event.created", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
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
    },
    EVENT_CREATED,
  );

  assert.ok(payload);
  assert.equal(payload.distinctId, USER_ID);
  assert.equal(payload.uuid, purchaseCompletedEventUuid("cs_test_123"));
  assert.equal(payload.timestamp, new Date(EVENT_CREATED * 1000).toISOString());
  assert.equal(payload.properties.product, "pro");
  assert.equal(payload.properties.course, "pmq");
  assert.equal(payload.properties.amount_cents, 800);
  assert.equal(payload.properties.currency, "GBP");
  assert.equal(payload.properties.stripe_session_id, "cs_test_123");
  assert.equal(payload.properties.stripe_payment_id, "pi_test_456");
  assert.equal(payload.properties.$insert_id, undefined);
});

test("maps top-up feature to sly_topup product", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
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
    },
    EVENT_CREATED,
  );

  assert.ok(payload);
  assert.equal(payload.properties.product, "sly_topup");
});

test("legacy ai_tutor feature maps to ai_pro", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
      id: "cs_legacy",
      payment_status: "paid",
      metadata: {
        user_id: USER_ID,
        course_id: PMQ_COURSE_ID,
        feature: "ai_tutor",
      },
    },
    EVENT_CREATED,
  );

  assert.ok(payload);
  assert.equal(payload.properties.product, "ai_pro");
});

test("unpaid session returns null", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
      id: "cs_unpaid",
      payment_status: "unpaid",
      metadata: { user_id: USER_ID, course_id: PMQ_COURSE_ID, feature: "pro" },
    },
    EVENT_CREATED,
  );
  assert.equal(payload, null);
});

test("missing user_id returns null", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
      id: "cs_no_user",
      payment_status: "paid",
      metadata: { course_id: PMQ_COURSE_ID, feature: "pro" },
    },
    EVENT_CREATED,
  );
  assert.equal(payload, null);
});

test("falls back to session id when payment_intent is absent", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
      id: "cs_no_pi",
      payment_status: "paid",
      metadata: { user_id: USER_ID, feature: "pro" },
    },
    EVENT_CREATED,
  );
  assert.ok(payload);
  assert.equal(payload.properties.stripe_payment_id, "cs_no_pi");
  assert.equal(payload.properties.course, undefined);
});
