#!/usr/bin/env node
/**
 * IndexNow ping (LIC-202).
 *
 * Tells Bing (and Yandex, Seznam, Naver) which public URLs changed, so they
 * recrawl within hours instead of whenever. Bing also feeds ChatGPT search,
 * Copilot, DuckDuckGo and Yahoo. Google does not use IndexNow.
 *
 * Source of URLs: the live https://www.learnincurve.com/sitemap.xml, filtered
 * to public marketing/library pages (no auth, dashboard, gated course routes,
 * mock attempts or legal pages).
 *
 * Only URLs whose sitemap <lastmod> is on or after the last successful ping are
 * sent. IndexNow is a change-notification protocol: resubmitting unchanged URLs
 * on every deploy is noise and can get the host deprioritised. State lives in
 * .indexnow-state.json (gitignored). First run, or --all, sends everything.
 *
 * This script NEVER exits non-zero. A failed ping must not fail a deploy.
 *
 * Usage:
 *   npm run indexnow                       # ping changed URLs now
 *   npm run indexnow -- --all              # ping every eligible sitemap URL
 *   npm run indexnow -- --dry-run          # show what would be sent
 *   node scripts/indexnow-ping.mjs --wait-version 3.14
 *       # poll the live footer until it shows v3.14, then ping (used by deploy)
 *   node scripts/indexnow-ping.mjs --delay 900
 *       # sleep 900s first (used by deploy when the version is not bumped)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SITE = "https://www.learnincurve.com";
const HOST = "www.learnincurve.com";
// Not a secret: IndexNow keys are public by design (hosted at keyLocation).
const KEY = "39345a7c887c7d33017d6fc94f13e119";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const STATE_FILE = path.join(root, ".indexnow-state.json");

// Never submit these, even if they ever appear in the sitemap.
const EXCLUDE_EXACT = new Set(["/privacy", "/terms", "/cookies"]);
const EXCLUDE_PREFIX = [
  "/dashboard",
  "/auth",
  "/lab",
  "/api",
  "/survey",
  "/courses/pmq-in-5-days/lo",
  "/courses/pmq-in-5-days/mock",
  "/courses/pfq-in-2-days/preview",
  "/courses/pfq-in-2-days/learn",
  "/courses/pfq-in-2-days/mock",
  "/courses/pfq-in-2-days/practice",
  "/courses/pfq-in-2-days/trap-school",
];

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const dryRun = flag("--dry-run");
const sendAll = flag("--all");
const waitVersion = opt("--wait-version");
const delaySec = Number(opt("--delay") || 0);

const log = (...m) => console.log(`[indexnow ${new Date().toISOString()}]`, ...m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isEligible(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.host !== HOST) return false;
  const p = u.pathname.replace(/\/+$/, "") || "/";
  if (EXCLUDE_EXACT.has(p)) return false;
  return !EXCLUDE_PREFIX.some((pre) => p === pre || p.startsWith(`${pre}/`));
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function waitForLiveVersion(version) {
  const deadline = Date.now() + 25 * 60 * 1000;
  const needle = `v${version}<`;
  log(`waiting for live footer to show v${version} (max 25 min)...`);
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${SITE}/?indexnow=${Date.now()}`, {
        headers: { "cache-control": "no-cache" },
      });
      const html = await res.text();
      if (html.includes(needle)) {
        log(`v${version} is live.`);
        return true;
      }
    } catch (e) {
      log(`poll error (will retry): ${e.message}`);
    }
    await sleep(30_000);
  }
  log(`gave up: v${version} not live after 25 min. Run "npm run indexnow" once it is.`);
  return false;
}

async function main() {
  const localKey = path.join(root, "public", `${KEY}.txt`);
  if (!fs.existsSync(localKey)) {
    log(`missing public/${KEY}.txt, skipping.`);
    return;
  }

  if (delaySec > 0) {
    log(`sleeping ${delaySec}s for the deploy to go live...`);
    await sleep(delaySec * 1000);
  }
  if (waitVersion && !(await waitForLiveVersion(waitVersion))) return;

  // 1. Key file must be live, or IndexNow rejects the submission (403).
  const keyRes = await fetch(KEY_LOCATION);
  const keyBody = (await keyRes.text()).trim();
  if (keyRes.status !== 200 || keyBody !== KEY) {
    log(`key file not live yet (${KEY_LOCATION} -> ${keyRes.status}), skipping.`);
    return;
  }

  // 2. Live sitemap -> eligible URLs with lastmod.
  const smRes = await fetch(`${SITE}/sitemap.xml`);
  if (!smRes.ok) {
    log(`sitemap fetch failed: ${smRes.status}, skipping.`);
    return;
  }
  const xml = await smRes.text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: (/<loc>\s*([^<]+?)\s*<\/loc>/.exec(m[1]) || [])[1],
    lastmod: (/<lastmod>\s*([^<]+?)\s*<\/lastmod>/.exec(m[1]) || [])[1],
  }));
  const eligible = entries.filter((e) => e.loc && isEligible(e.loc));
  const skipped = entries.length - eligible.length;

  // 3. Changed since last successful ping (compare by UTC day: lastmod is date-only).
  const state = readState();
  let urlList;
  if (sendAll || !state.lastPingAt) {
    urlList = eligible.map((e) => e.loc);
    log(`${sendAll ? "--all" : "first run"}: sending all ${urlList.length} eligible URLs.`);
  } else {
    const since = state.lastPingAt.slice(0, 10);
    urlList = eligible
      .filter((e) => !e.lastmod || e.lastmod.slice(0, 10) >= since)
      .map((e) => e.loc);
    log(`${urlList.length} of ${eligible.length} eligible URLs changed since ${since}.`);
  }
  log(`sitemap: ${entries.length} URLs, ${skipped} excluded by filter.`);

  if (urlList.length === 0) {
    log("nothing changed, no ping sent.");
    return;
  }
  if (dryRun) {
    log("--dry-run, would send:");
    urlList.forEach((u) => console.log(`  ${u}`));
    return;
  }

  // 4. Submit (max 10,000 URLs per request; we are nowhere near).
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  const body = (await res.text()).slice(0, 300);
  if (res.status === 200 || res.status === 202) {
    log(`OK ${res.status}: submitted ${urlList.length} URL(s).`);
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify(
        { lastPingAt: new Date().toISOString(), lastStatus: res.status, lastCount: urlList.length },
        null,
        2,
      ) + "\n",
    );
  } else {
    const hint =
      { 400: "bad request", 403: "key not valid / key file not found", 422: "URLs do not match host or key", 429: "too many requests, back off" }[
        res.status
      ] || "unexpected";
    log(`FAILED ${res.status} (${hint}). ${body}`);
  }
}

main()
  .catch((e) => log(`error (ignored, deploy unaffected): ${e.message}`))
  .finally(() => process.exit(0));
