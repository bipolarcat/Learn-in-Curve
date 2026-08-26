#!/usr/bin/env node
/**
 * Learn in Curve site version bumper.
 *
 * Usage:
 *   node scripts/bump-version.mjs              # +0.1 (2.0 → 2.1)
 *   node scripts/bump-version.mjs --commit      # same, no-op if AUTO_BUMP false
 *   node scripts/bump-version.mjs --set 3.0     # milestone jump
 *   node scripts/bump-version.mjs --print       # print current version
 *
 * Env (git hook):
 *   LIC_VERSION=3.0     → jump
 *   LIC_SKIP_VERSION=1  → skip (handled in pre-commit)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const versionFile = path.join(root, "src", "lib", "site-version.ts");
const packageFile = path.join(root, "package.json");

function parseVersion(raw) {
  const m = /^(\d+)\.(\d+)$/.exec(String(raw).trim());
  if (!m) {
    throw new Error(`Invalid site version "${raw}" — expected major.minor (e.g. 2.0)`);
  }
  return { major: Number(m[1]), minor: Number(m[2]) };
}

function formatVersion({ major, minor }) {
  return `${major}.${minor}`;
}

function readVersionFile() {
  const src = fs.readFileSync(versionFile, "utf8");
  const versionMatch = src.match(
    /export const SITE_VERSION = "(\d+\.\d+)";/,
  );
  const bumpMatch = src.match(
    /export const SITE_VERSION_AUTO_BUMP = (true|false);/,
  );
  if (!versionMatch) {
    throw new Error(`Could not parse SITE_VERSION in ${versionFile}`);
  }
  return {
    src,
    version: versionMatch[1],
    autoBump: bumpMatch ? bumpMatch[1] === "true" : true,
  };
}

function writeVersion(next) {
  let src = fs.readFileSync(versionFile, "utf8");
  src = src.replace(
    /export const SITE_VERSION = "\d+\.\d+";/,
    `export const SITE_VERSION = "${next}";`,
  );
  fs.writeFileSync(versionFile, src);

  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  const { major, minor } = parseVersion(next);
  pkg.version = `${major}.${minor}.0`;
  fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
}

function bumpPoint(current) {
  const parsed = parseVersion(current);
  return formatVersion({ major: parsed.major, minor: parsed.minor + 1 });
}

const args = process.argv.slice(2);
const printOnly = args.includes("--print");
const commitMode = args.includes("--commit");
const setIdx = args.indexOf("--set");
const setTo = setIdx >= 0 ? args[setIdx + 1] : process.env.LIC_VERSION || null;

const current = readVersionFile();

if (printOnly) {
  process.stdout.write(`${current.version}\n`);
  process.exit(0);
}

if (commitMode && !current.autoBump && !setTo) {
  process.stdout.write(
    `site-version: auto-bump off — staying at ${current.version}\n`,
  );
  process.exit(0);
}

let next;
if (setTo) {
  parseVersion(setTo); // validate
  next = setTo;
} else {
  next = bumpPoint(current.version);
}

if (next === current.version) {
  // Still rewrite so package.json can never drift out of sync with SITE_VERSION.
  writeVersion(next);
  process.stdout.write(`site-version: already ${next}\n`);
  process.exit(0);
}

writeVersion(next);
process.stdout.write(`site-version: ${current.version} → ${next}\n`);
