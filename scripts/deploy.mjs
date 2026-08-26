#!/usr/bin/env node
/**
 * Learn in Curve deploy.
 *
 * Pushing `master` is what triggers the Railway production deploy, so the site
 * version is bumped here — once per deploy — and nowhere else. SITE_VERSION
 * therefore always equals the version that is actually live.
 *
 * Usage:
 *   npm run deploy                  # bump +0.1, build, ship current branch to master
 *   npm run deploy -- --dry-run     # print the plan, change nothing
 *   npm run deploy -- --set 3.0     # milestone version instead of +0.1
 *   npm run deploy -- --skip-build  # skip `npm run build` (tests + next build)
 *   npm run deploy -- --yes         # no interactive confirmation (CI)
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEPLOY_BRANCH = "master";
const REMOTE = "origin";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipBuild = args.includes("--skip-build");
const assumeYes = args.includes("--yes");
const setIdx = args.indexOf("--set");
const setTo = setIdx >= 0 ? args[setIdx + 1] : null;

function git(...a) {
  return execFileSync("git", a, { cwd: root, encoding: "utf8" }).trim();
}
function run(cmd, a) {
  execFileSync(cmd, a, { cwd: root, stdio: "inherit" });
}
function die(msg) {
  console.error(`deploy: ${msg}`);
  process.exit(1);
}

// --- guards ---------------------------------------------------------------

const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (branch === "HEAD") die("detached HEAD — check out a branch first.");

if (git("status", "--porcelain")) {
  die("working tree is dirty — commit or stash first.");
}

console.log(`deploy: fetching ${REMOTE}…`);
run("git", ["fetch", REMOTE, "--quiet"]);

const remoteMaster = `${REMOTE}/${DEPLOY_BRANCH}`;
try {
  execFileSync("git", ["merge-base", "--is-ancestor", remoteMaster, "HEAD"], {
    cwd: root,
  });
} catch {
  die(
    `${remoteMaster} is not an ancestor of ${branch} — this push would not be a ` +
      `fast-forward. Merge ${remoteMaster} into ${branch} first, then retry.`,
  );
}

const behind = git("rev-list", "--count", `HEAD..${remoteMaster}`);
if (behind !== "0") die(`${branch} is ${behind} commit(s) behind ${remoteMaster}.`);

const ahead = git("rev-list", "--count", `${remoteMaster}..HEAD`);
if (ahead === "0" && !setTo) {
  die(`nothing to deploy — ${branch} matches ${remoteMaster}.`);
}

// --- version --------------------------------------------------------------

const current = execFileSync(
  "node",
  ["scripts/bump-version.mjs", "--print"],
  { cwd: root, encoding: "utf8" },
).trim();

function nextVersion(v) {
  const m = /^(\d+)\.(\d+)$/.exec(v);
  if (!m) die(`cannot parse current version "${v}"`);
  return `${m[1]}.${Number(m[2]) + 1}`;
}
const autoBump = /SITE_VERSION_AUTO_BUMP = true;/.test(
  fs.readFileSync(path.join(root, "src", "lib", "site-version.ts"), "utf8"),
);
const next = setTo ?? (autoBump ? nextVersion(current) : current);
if (!/^\d+\.\d+$/.test(next)) die(`invalid target version "${next}"`);
const bumping = next !== current;

// --- plan -----------------------------------------------------------------

console.log("");
console.log(`  branch      ${branch}  (${ahead} commit(s) ahead of ${remoteMaster})`);
console.log(
  `  version     ${bumping ? `${current} → ${next}` : `${current} (auto-bump off, unchanged)`}`,
);
console.log(`  build       ${skipBuild ? "SKIPPED" : "npm run build"}`);
console.log(`  ships to    ${remoteMaster}  → Railway production deploy`);
console.log("");

if (dryRun) {
  console.log("deploy: --dry-run, nothing changed.");
  process.exit(0);
}

if (!assumeYes) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(
    `This deploys to PRODUCTION. Type the version (${next}) to confirm: `,
  );
  rl.close();
  if (answer.trim() !== next) die("confirmation did not match — aborted.");
}

// --- ship -----------------------------------------------------------------

if (!skipBuild) {
  console.log("deploy: running build + tests…");
  run("npm", ["run", "build"]);
}

if (bumping) {
  run("node", ["scripts/bump-version.mjs", "--set", next]);
  run("git", ["add", "src/lib/site-version.ts", "package.json"]);
  run("git", ["commit", "-m", `chore(release): v${next}`]);
}

run("git", ["push", REMOTE, branch]);
run("git", ["push", REMOTE, `HEAD:${DEPLOY_BRANCH}`]);

// Keep the local master ref in step with what was just shipped.
if (branch !== DEPLOY_BRANCH) {
  try {
    run("git", ["branch", "-f", DEPLOY_BRANCH, "HEAD"]);
  } catch {
    console.warn(`deploy: could not fast-forward local ${DEPLOY_BRANCH} (ignored).`);
  }
}

console.log("");
console.log(`deploy: v${next} pushed to ${remoteMaster}. Railway is deploying.`);
