import assert from "node:assert/strict";
import test from "node:test";
import { classifyReferrer } from "../src/lib/analytics/referrer.ts";

test("empty / $direct → direct", () => {
  assert.equal(classifyReferrer(null), "direct");
  assert.equal(classifyReferrer(undefined), "direct");
  assert.equal(classifyReferrer(""), "direct");
  assert.equal(classifyReferrer("$direct"), "direct");
});

test("AI assistant hosts", () => {
  assert.equal(classifyReferrer("chatgpt.com"), "ai_assistant");
  assert.equal(classifyReferrer("www.chatgpt.com"), "ai_assistant");
  assert.equal(classifyReferrer("https://chat.openai.com/c/abc"), "ai_assistant");
  assert.equal(classifyReferrer("perplexity.ai"), "ai_assistant");
  assert.equal(classifyReferrer("claude.ai"), "ai_assistant");
  assert.equal(classifyReferrer("gemini.google.com"), "ai_assistant");
  assert.equal(classifyReferrer("copilot.microsoft.com"), "ai_assistant");
  assert.equal(classifyReferrer("you.com"), "ai_assistant");
});

test("search hosts including google country TLDs", () => {
  assert.equal(classifyReferrer("www.google.com"), "search");
  assert.equal(classifyReferrer("google.co.uk"), "search");
  assert.equal(classifyReferrer("www.google.de"), "search");
  assert.equal(classifyReferrer("bing.com"), "search");
  assert.equal(classifyReferrer("duckduckgo.com"), "search");
  assert.equal(classifyReferrer("search.brave.com"), "search");
  assert.equal(classifyReferrer("ecosia.org"), "search");
});

test("social hosts including mobile package names", () => {
  assert.equal(classifyReferrer("linkedin.com"), "social");
  assert.equal(classifyReferrer("lnkd.in"), "social");
  assert.equal(classifyReferrer("com.linkedin.android"), "social");
  assert.equal(classifyReferrer("reddit.com"), "social");
  assert.equal(classifyReferrer("com.reddit.frontpage"), "social");
  assert.equal(classifyReferrer("instagram.com"), "social");
  assert.equal(classifyReferrer("t.co"), "social");
  assert.equal(classifyReferrer("x.com"), "social");
  assert.equal(classifyReferrer("twitter.com"), "social");
});

test("unknown host → other", () => {
  assert.equal(classifyReferrer("newsletter.substack.com"), "other");
  assert.equal(classifyReferrer("example.com"), "other");
});
