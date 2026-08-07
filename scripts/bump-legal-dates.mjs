#!/usr/bin/env node
/**
 * Auto-bump "Last updated:" on staged legal/*.md files when the date line
 * is unchanged vs HEAD (so policy edits can't ship with a stale date).
 *
 * Skip: LIC_SKIP_LEGAL_DATE=1 git commit ...
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const LAST_UPDATED_RE =
  /^(\*?Last updated:\s*)(\d{1,2}\s+[A-Za-z]+\s+\d{4})(\*?)\s*$/m;

function todayLabel(now = new Date()) {
  return `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function git(args, { encoding = "utf8", allowFail = false } = {}) {
  try {
    return execFileSync("git", args, {
      encoding,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (allowFail) return null;
    throw error;
  }
}

function extractDate(content) {
  const match = content.match(LAST_UPDATED_RE);
  return match ? match[2] : null;
}

function bumpDate(content, nextDate) {
  if (LAST_UPDATED_RE.test(content)) {
    return content.replace(LAST_UPDATED_RE, `$1${nextDate}$3`);
  }
  // No date line — insert after first heading if present.
  const heading = content.match(/^# .+\r?\n/);
  if (heading) {
    const insert = `Last updated: ${nextDate}\n\n`;
    return content.replace(heading[0], `${heading[0]}${insert}`);
  }
  return `Last updated: ${nextDate}\n\n${content}`;
}

const root = git(["rev-parse", "--show-toplevel"]).trim();
const staged = git(["diff", "--cached", "--name-only", "--", "legal/"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.endsWith(".md"));

if (staged.length === 0) {
  process.exit(0);
}

const today = todayLabel();
let changed = 0;

for (const rel of staged) {
  const abs = join(root, rel);
  const stagedBlob = git(["show", `:${rel}`], { allowFail: true });
  if (stagedBlob == null) continue;

  const headBlob = git(["show", `HEAD:${rel}`], { allowFail: true });
  const stagedDate = extractDate(stagedBlob);
  const headDate = headBlob ? extractDate(headBlob) : null;

  // Bump when: date missing, or date unchanged from HEAD while file content changed.
  const needsBump =
    !stagedDate || (headDate != null && stagedDate === headDate);

  if (!needsBump) continue;

  const onDisk = readFileSync(abs, "utf8");
  const next = bumpDate(onDisk, today);
  if (next === onDisk) continue;
  writeFileSync(abs, next);
  git(["add", "--", rel]);
  changed += 1;
  console.log(`legal date: ${rel} → ${today}`);
}

if (changed > 0) {
  console.log(`Updated Last updated on ${changed} legal doc(s).`);
}
