import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lo1 = JSON.parse(
  readFileSync(join(root, "content", "v2", "lo1.json"), "utf8"),
);

function firstCells(markdown) {
  const cells = [];
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("|") || line.includes("---")) continue;
    const parts = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.replace(/\*\*/g, "").replace(/\s+/g, " ").trim());
    if (parts[0] && parts[0] !== "Reason" && parts[0] !== "Phase") {
      cells.push(parts[0]);
    }
  }
  return cells;
}

test("LO1 1a v2 tables include both sequence allowlist first cells", () => {
  const block = lo1.core_content.find((b) => b.outcome_code === "1a");
  assert.ok(block);
  const cells = firstCells(block.body_markdown);
  assert.ok(cells.includes("Concept"), cells.join(", "));
  assert.ok(cells.includes("Pre-project and feasibility"), cells.join(", "));
  assert.ok(cells.includes("Better grouping of activities"));
});
