import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { canAccessSly } from "../src/lib/pmq/tiers.ts";

/**
 * Guards the landing-page demo Sly (LIC-111).
 *
 * Two rules that pull in opposite directions and are easy to break together:
 *
 *  1. The DEMO must work for everyone. It used to 400 any request carrying a
 *     session, which made signing in break it — and the route it redirected
 *     people to is the in-app tutor they cannot reach either.
 *  2. IN-APP Sly must stay ai_pro-only and completely hidden below that. Not
 *     locked-with-a-teaser: a padlocked tutor advertises something nobody can
 *     buy, since ai_pro is a waitlist tier.
 *
 * Fixing (1) by relaxing (2) would be the obvious wrong move, so both are
 * asserted here.
 */

const guestRoute = readFileSync(
  new URL("../src/app/api/tutor/guest-chat/route.ts", import.meta.url),
  "utf8",
);

/** Comments describe the old bug on purpose; code must not reintroduce it. */
const guestCode = guestRoute
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

test("the demo endpoint does not gate on auth in either direction", () => {
  assert.ok(
    !/auth\.getUser/.test(guestCode),
    "guest-chat must not branch on session state — the allowance is per IP, " +
      "identical signed in or out",
  );
  assert.ok(
    !/Signed-in users should use/.test(guestCode),
    "the signed-in rejection is the LIC-111 bug and must not come back",
  );
});

test("the free cap is enforced in code, not by asking Sly nicely", () => {
  // LIC-61: soft prompt instructions have already proven unreliable for hard
  // limits. The cap has to be a real server-side gate.
  assert.ok(
    guestCode.includes("claimGuestTutorMessage"),
    "the cap must go through the atomic claim RPC",
  );
  assert.ok(
    /guest_cap_exceeded/.test(guestCode) && /403/.test(guestCode),
    "an exhausted visitor must be refused by the server, not by the prompt",
  );
});

test("in-app Sly stays AI Pro only", () => {
  assert.equal(canAccessSly("starter"), false);
  assert.equal(canAccessSly("pro"), false, "a £8 Pro purchase does not buy Sly");
  assert.equal(canAccessSly("ai_pro"), true);
});

test("the exhausted state offers the waitlist, not a purchase or a signup", () => {
  const panel = readFileSync(
    new URL("../src/components/GuestSlyPanel.tsx", import.meta.url),
    "utf8",
  );

  assert.ok(
    panel.includes("JoinWaitlistButton"),
    "reuse the pricing card's waitlist control rather than rebuilding a CTA",
  );
  assert.ok(
    panel.includes("AI Pro Bundle launching soon"),
    "the launch note is supporting text",
  );
  assert.ok(
    !/launching soon["`]?\s*}?\s*<\/button>/i.test(panel),
    "…and must not be the button label — that is 'Join Waitlist'",
  );
});
