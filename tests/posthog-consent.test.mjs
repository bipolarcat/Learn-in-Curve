/**
 * Cookieless PostHog config and first-touch attribution.
 *   node --experimental-strip-types --test tests/posthog-consent.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  POSTHOG_EU_ASSETS_HOST,
  POSTHOG_EU_INGEST_HOST,
  POSTHOG_PROXY_PATH,
  POSTHOG_UI_HOST,
  headersForPostHogProxy,
  isPostHogProxyPath,
  posthogBrowserInitConfig,
  posthogProxyRewrites,
  resolvePostHogServerHost,
} from "../src/lib/analytics/posthog-hosts.ts";
import { parseAttribution } from "../src/lib/analytics/attribution.ts";

test("browser init is cookieless until accept", () => {
  for (const consent of ["unset", "denied"]) {
    const config = posthogBrowserInitConfig(consent);
    assert.equal(config.api_host, POSTHOG_PROXY_PATH);
    assert.equal(config.ui_host, POSTHOG_UI_HOST);
    assert.equal(config.persistence, "memory");
    assert.equal(config.disable_session_recording, true);
    assert.equal(config.disable_surveys, true);
    assert.equal(config.capture_pageview, false);
    assert.equal(config.capture_pageleave, true);
    assert.equal(config.person_profiles, "identified_only");
  }
});

test("accept uses persistent storage and allows replay", () => {
  const config = posthogBrowserInitConfig("granted");
  assert.equal(config.persistence, "localStorage+cookie");
  assert.equal(config.disable_session_recording, false);
  assert.equal(config.disable_surveys, false);
  assert.equal(config.api_host, "/rq");
  assert.equal(config.ui_host, "https://eu.posthog.com");
});

test("proxy rewrites hit EU ingest and assets, static before catch-all", () => {
  const rewrites = posthogProxyRewrites();
  assert.equal(rewrites.length, 3);
  assert.equal(rewrites[0].source, "/rq/static/:path*");
  assert.equal(
    rewrites[0].destination,
    `${POSTHOG_EU_ASSETS_HOST}/static/:path*`,
  );
  assert.equal(rewrites[1].source, "/rq/array/:path*");
  assert.equal(
    rewrites[1].destination,
    `${POSTHOG_EU_ASSETS_HOST}/array/:path*`,
  );
  assert.equal(rewrites[2].source, "/rq/:path*");
  assert.equal(rewrites[2].destination, `${POSTHOG_EU_INGEST_HOST}/:path*`);
});

test("proxy path match does not swallow other routes", () => {
  assert.equal(isPostHogProxyPath("/rq"), true);
  assert.equal(isPostHogProxyPath("/rq/e/"), true);
  assert.equal(isPostHogProxyPath("/rq-extra"), false);
  assert.equal(isPostHogProxyPath("/free-mock-exam/apm-pmq"), false);
});

test("proxy headers drop cookies and authorization", () => {
  const headers = new Headers({
    cookie: "sb-access-token=secret",
    authorization: "Bearer secret",
    "content-type": "application/json",
  });
  const next = headersForPostHogProxy(headers);
  assert.equal(next.has("cookie"), false);
  assert.equal(next.has("authorization"), false);
  assert.equal(next.get("content-type"), "application/json");
  assert.equal(headers.get("cookie"), "sb-access-token=secret");
});

test("server capture stays on an absolute EU host", () => {
  assert.equal(resolvePostHogServerHost(undefined), POSTHOG_EU_INGEST_HOST);
  assert.equal(resolvePostHogServerHost(""), POSTHOG_EU_INGEST_HOST);
  assert.equal(resolvePostHogServerHost("/rq"), POSTHOG_EU_INGEST_HOST);
  assert.equal(
    resolvePostHogServerHost("https://eu.i.posthog.com/"),
    "https://eu.i.posthog.com",
  );
});

test("parseAttribution keeps reddit campaign params", () => {
  const parsed = parseAttribution(
    "?utm_source=reddit&utm_campaign=pmq_test&utm_medium=cpc",
    "https://www.reddit.com/r/projectmanagement/",
  );
  assert.equal(parsed.utm_source, "reddit");
  assert.equal(parsed.utm_campaign, "pmq_test");
  assert.equal(parsed.utm_medium, "cpc");
  assert.equal(parsed.utm_content, null);
  assert.equal(parsed.referrer_category, "social");
});
