#!/usr/bin/env node
/**
 * Copies LIC version pre-commit hook into .git/hooks (no git config changes).
 * Runs from npm `prepare` so every install wires the bump.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "scripts", "git-hooks", "pre-commit");
const gitDir = path.join(root, ".git");
const destDir = path.join(gitDir, "hooks");
const dest = path.join(destDir, "pre-commit");

if (!fs.existsSync(gitDir) || !fs.statSync(gitDir).isDirectory()) {
  // Worktree / package consumers without a local .git — skip quietly
  process.exit(0);
}

if (!fs.existsSync(src)) {
  console.warn("install-git-hooks: missing scripts/git-hooks/pre-commit");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
try {
  fs.chmodSync(dest, 0o755);
} catch {
  // Windows may ignore mode; Git Bash still runs the hook
}

console.log("install-git-hooks: pre-commit → .git/hooks/pre-commit");
