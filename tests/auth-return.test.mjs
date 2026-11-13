/**
 * Email confirm keeps the return path the template would otherwise drop.
 *   node --experimental-strip-types --test tests/auth-return.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  readAuthNextCookie,
  resolveAuthDestination,
} from "../src/lib/auth-return.ts";
import { getEmailAuthErrorMessage } from "../src/lib/auth-errors.ts";

const PRO =
  "/courses/pmq-in-5-days/pricing?intent=pro";

test("a hardcoded dashboard next yields to the stored return path", () => {
  const cookie = encodeURIComponent(PRO);
  assert.equal(resolveAuthDestination("/dashboard", cookie), PRO);
  assert.equal(resolveAuthDestination(null, cookie), PRO);
});

test("an explicit next on the link wins over the cookie", () => {
  assert.equal(
    resolveAuthDestination("/courses/pmq-in-5-days/lo/3", encodeURIComponent(PRO)),
    "/courses/pmq-in-5-days/lo/3",
  );
});

test("cookie reader finds the return path", () => {
  const header = `other=1; lic_auth_next=${encodeURIComponent(PRO)}`;
  assert.equal(readAuthNextCookie(header), encodeURIComponent(PRO));
});

test("wrong password does not say the email is missing, and offers Google", () => {
  const result = getEmailAuthErrorMessage(
    { code: "invalid_credentials", message: "Invalid login credentials" },
    "sign-in",
  );
  assert.equal(result.suggestGoogle, true);
  assert.equal(result.text.includes("does not exist"), false);
  assert.match(result.text, /Google/);
});

test("sign-up duplicate uses Supabase's already-registered fact", () => {
  const result = getEmailAuthErrorMessage(
    { message: "User already registered" },
    "sign-up",
  );
  assert.equal(result.suggestGoogle, true);
  assert.match(result.text, /already has an account/);
});
