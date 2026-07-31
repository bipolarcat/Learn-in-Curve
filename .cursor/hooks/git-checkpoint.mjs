#!/usr/bin/env node
/**
 * Cursor "stop" hook — runs once per completed agent turn.
 *
 * Purpose: this project went 2026-07-03 -> 2026-07-06 with ZERO git commits
 * despite substantial shipped work (legal docs, gamification, native LO
 * migration, Stripe checkout, etc.) sitting only in the uncommitted working
 * tree. That's a real data-loss risk independent of any documentation
 * question. This hook is a deterministic backstop for that specific problem:
 * it commits whatever changed at the end of every turn, so there is always a
 * git-history checkpoint to fall back to, regardless of whether anyone
 * remembered to commit or log the change in prose.
 *
 * It does NOT try to write good commit messages or decide what's
 * "significant" — that's still BUSINESS_STATE.md's job (see
 * .cursor/rules/documentation-discipline.mdc). This is purely a safety net:
 * frequent small checkpoint commits are an acceptable tradeoff for never
 * losing work. Squash/clean up history later if you want a tidier log for a
 * real release.
 *
 * Best-effort only: never throws, never blocks Cursor, never exits non-zero.
 */

import { execSync } from "node:child_process";
import { readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf-8");
  } catch {
    return "";
  }
}

function log(root, line) {
  try {
    const logPath = join(root, ".cursor", "checkpoint.log");
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`);
  } catch {
    // logging is best-effort only — never let it break the hook
  }
}

let payload = {};
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  // malformed/empty stdin — still attempt a checkpoint using cwd below
}

const root = payload.workspace_roots?.[0] || process.cwd();

try {
  const status = execSync("git status --porcelain", {
    cwd: root,
    encoding: "utf-8",
  });

  if (!status.trim()) {
    log(root, "stop hook: no changes — nothing to checkpoint");
    process.exit(0);
  }

  const changedFiles = status
    .trim()
    .split("\n")
    .map((line) => line.slice(3).trim());

  execSync("git add -A", { cwd: root });

  const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
  const fileList = changedFiles.slice(0, 20).join("\n- ");
  const more =
    changedFiles.length > 20 ? `\n...and ${changedFiles.length - 20} more` : "";
  const message = `Cursor checkpoint: ${stamp}\n\nFiles touched (${changedFiles.length}):\n- ${fileList}${more}\n\nAuto-committed by .cursor/hooks/git-checkpoint.mjs (stop hook) — not a curated commit message.`;

  // Write message to a temp file to avoid shell-escaping issues with quotes/newlines.
  const tmpMsgPath = join(root, ".cursor", ".checkpoint-msg.tmp");
  const { writeFileSync, unlinkSync } = await import("node:fs");
  writeFileSync(tmpMsgPath, message, "utf-8");
  try {
    execSync(`git commit --no-verify -F "${tmpMsgPath}"`, { cwd: root });
  } finally {
    try {
      unlinkSync(tmpMsgPath);
    } catch {
      // ignore cleanup failure
    }
  }

  log(root, `checkpoint committed (${changedFiles.length} files)`);

  // Mechanical doc-drift nudge (informational only — this hook can't block
  // or message the agent back per Cursor's current stop-hook contract, so
  // this just leaves a visible trail in the log for the next session/user).
  const touchesTrackedArea = changedFiles.some(
    (f) =>
      f.startsWith("src/") ||
      f.startsWith("legal/") ||
      f.startsWith("docs/") ||
      f === "BUSINESS_STATE.md",
  );
  const docUpdated = changedFiles.includes("BUSINESS_STATE.md");

  if (touchesTrackedArea && !docUpdated) {
    log(
      root,
      `WARNING: src/legal/docs files changed this turn but BUSINESS_STATE.md was NOT updated — possible undocumented drift. Changed: ${changedFiles.join(", ")}`,
    );
  }
} catch (err) {
  log(root, `ERROR: checkpoint failed — ${err?.message ?? String(err)}`);
}

process.exit(0);
