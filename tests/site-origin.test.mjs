import assert from "node:assert/strict";
import test from "node:test";
import { getSiteOrigin } from "../src/lib/site-origin.ts";

function requestWith(headers) {
  return new Request("http://localhost:8080/auth/callback", { headers });
}

test("LIC-116: forwarded host wins over the proxy-internal request host", () => {
  const request = requestWith({
    host: "localhost:8080",
    "x-forwarded-host": "www.learnincurve.com",
    "x-forwarded-proto": "https",
  });

  assert.equal(new URL(getSiteOrigin(request)).host, "www.learnincurve.com");
});

test("NEXT_PUBLIC_SITE_URL wins over the forwarded header when set", async () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.learnincurve.com";
  try {
    const { getSiteOrigin: getSiteOriginWithEnv } = await import(
      `../src/lib/site-origin.ts?env-set=${Date.now()}`
    );
    const request = requestWith({
      host: "localhost:8080",
      "x-forwarded-host": "attacker.example.com",
    });

    assert.equal(getSiteOriginWithEnv(request), "https://www.learnincurve.com");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
