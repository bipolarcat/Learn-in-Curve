/**
 * Detect and (after human review) backfill pfq_questions.traps tags.
 *
 * Never writes in a single pass — detection accuracy varies by trap type.
 *
 *   npx tsx scripts/pfq/backfill-traps.ts --report
 *   npx tsx scripts/pfq/backfill-traps.ts --apply
 *   npx tsx scripts/pfq/backfill-traps.ts --apply --report-file path/to/reviewed.json
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { PFQ_TRAP_SCHOOL } from "../../src/lib/pfq/trap-school-content.ts";
import {
  isPfqTrapTag,
  type PfqTrapTag,
} from "../../src/lib/pfq/trap-tags.ts";

config({ path: join(process.cwd(), ".env.local") });

const DEFAULT_REPORT = join(
  process.cwd(),
  "scripts/pfq/trap-backfill-report.json",
);

/**
 * Inverted-question operators only (trap school: pick the false / absent option).
 * Do not use a bare "not" word match — that tags contrastive and scenario stems.
 */
const INVERTED_NEGATIVE_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "which ... is not", re: /\bwhich\b[\s\S]{0,160}?\bis\s+not\b/i },
  { label: "which ... are not", re: /\bwhich\b[\s\S]{0,160}?\bare\s+not\b/i },
  { label: "which ... would not", re: /\bwhich\b[\s\S]{0,160}?\bwould\s+not\b/i },
  { label: "which ... does not", re: /\bwhich\b[\s\S]{0,160}?\bdoes\s+not\b/i },
  { label: "what can ... not", re: /\bwhat\s+can\b[\s\S]{0,100}?\bnot\b/i },
  { label: "is false", re: /\bis\s+false\b/i },
  { label: "is incorrect", re: /\bis\s+incorrect\b/i },
  { label: "least", re: /\bleast\b/i },
  { label: "except", re: /\bexcept\b/i },
  { label: "not a genuine", re: /\bnot\s+a\s+genuine\b/i },
  { label: "not a real", re: /\bnot\s+a\s+real\b/i },
];

/**
 * Stems that contain a negative word but still ask for a true statement
 * (contrastive clause, scenario constraint, or Why-explanation).
 * Belt-and-suspenders against future allowlist drift.
 */
const NEGATIVE_REJECT_PATTERNS: RegExp[] = [
  /\bwhy\s+can\b[\s\S]{0,100}?\bnot\b/i,
  /\bwhy\b[\s\S]{0,80}?\bnot\b/i,
  /\bbut\s+not\s+in\b/i,
  /\balone\s+does\s+not\b/i,
  /\bthat\b[\s\S]{0,60}?\bdoes\s+not\b/i,
  /\bmust\s+not\b/i,
  /\bwill\s+not\s+fit\b/i,
  /\bwith\s+no\b/i,
];

type QuestionRow = {
  id: string;
  learning_outcome: string;
  objective: number;
  type: "single" | "multi_select";
  traps: string[] | null;
  stem: string;
  items: string[] | null;
  options: Record<string, string>;
  answer: string;
  active: boolean;
};

type Confidence = "high" | "medium" | "low";

type Proposal = {
  question_id: string;
  objective: number;
  learning_outcome: string;
  trap: PfqTrapTag;
  confidence: Confidence;
  evidence: string;
  stem_excerpt: string;
  existing_traps: string[];
  /** Already present on the row — kept for overlap sanity checks; --apply skips. */
  already_tagged: boolean;
  approved: boolean;
};

type Report = {
  generated_at: string;
  summary: {
    active_questions: number;
    currently_tagged: number;
    proposed_additions: number;
    by_trap: Record<PfqTrapTag, number>;
    negative_stem_overlap: {
      detected: number;
      already_tagged_among_detected: number;
      note: string;
    };
    multi_select_shortfall: {
      bank_count: number;
      bank_percent: number;
      exam_percent: number;
      note: string;
    };
    traps_checksum_before: string;
    by_objective_currently_tagged: Record<string, number>;
  };
  integrity: {
    multi_select_untagged: string[];
    unknown_existing_tags: string[];
  };
  proposals: Proposal[];
};

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply");
  const report = argv.includes("--report") || !apply;
  const fileIdx = argv.indexOf("--report-file");
  const reportFile =
    fileIdx >= 0 && argv[fileIdx + 1]
      ? join(process.cwd(), argv[fileIdx + 1])
      : DEFAULT_REPORT;
  return { apply, report: apply ? false : report, reportFile, dual: apply && argv.includes("--report") };
}

function stemExcerpt(stem: string, max = 140): string {
  const one = stem.replace(/\s+/g, " ").trim();
  return one.length <= max ? one : `${one.slice(0, max - 1)}…`;
}

function normaliseTraps(traps: string[] | null | undefined): string[] {
  return Array.isArray(traps) ? [...traps] : [];
}

function trapsChecksum(rows: QuestionRow[]): string {
  const parts = rows
    .map((r) => `${r.id}:${normaliseTraps(r.traps).slice().sort().join(",")}`)
    .sort();
  return createHash("sha256").update(parts.join("\n")).digest("hex");
}

function countTagged(rows: QuestionRow[]): number {
  return rows.filter((r) => normaliseTraps(r.traps).length > 0).length;
}

function taggedByObjective(rows: QuestionRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    if (normaliseTraps(r.traps).length === 0) continue;
    const key = String(r.objective);
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

/** True when the stem is an inverted demand (pick the false/absent option). */
function findInvertedNegative(stem: string): { label: string } | null {
  if (NEGATIVE_REJECT_PATTERNS.some((re) => re.test(stem))) return null;
  for (const { label, re } of INVERTED_NEGATIVE_PATTERNS) {
    if (re.test(stem)) return { label };
  }
  return null;
}

function pairTerms(confused: string): string[] {
  return confused
    .split("/")
    .map((t) => t.trim())
    .filter(Boolean);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termPresent(haystack: string, term: string): boolean {
  // Multi-word terms (e.g. "post-project review") as phrase; single tokens as \b.
  const pattern =
    term.includes(" ") || term.includes("-")
      ? new RegExp(escapeRegExp(term), "i")
      : new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
  return pattern.test(haystack);
}

function buildNearMissPairs(): { label: string; terms: string[] }[] {
  const near = PFQ_TRAP_SCHOOL.traps.find((t) => t.id === "near_miss");
  if (!near || !("pairs" in near)) return [];
  return near.pairs.map((p) => ({
    label: p.confused,
    terms: pairTerms(p.confused),
  }));
}

async function fetchActiveQuestions(
  supabase: ReturnType<typeof createClient>,
): Promise<QuestionRow[]> {
  const pageSize = 1000;
  const { data, error } = await supabase
    .from("pfq_questions")
    .select(
      "id, learning_outcome, objective, type, traps, stem, items, options, answer, active",
    )
    .eq("active", true)
    .order("objective", { ascending: true })
    .order("learning_outcome", { ascending: true })
    .limit(pageSize);

  if (error) {
    throw new Error(`Failed to load pfq_questions: ${error.message}`);
  }
  return (data ?? []) as QuestionRow[];
}

function detectProposals(rows: QuestionRow[]): {
  proposals: Proposal[];
  integrity: Report["integrity"];
  multiSelectCount: number;
} {
  const pairs = buildNearMissPairs();
  const proposals: Proposal[] = [];
  const multiSelectUntagged: string[] = [];
  const unknownTags = new Set<string>();

  for (const row of rows) {
    const existing = normaliseTraps(row.traps);
    for (const t of existing) {
      if (!isPfqTrapTag(t)) unknownTags.add(t);
    }

    // 2a — inverted negative stem only (not contrastive / scenario "not")
    const neg = findInvertedNegative(row.stem);
    if (neg) {
      const already = existing.includes("negative_stem");
      proposals.push({
        question_id: row.id,
        objective: row.objective,
        learning_outcome: row.learning_outcome,
        trap: "negative_stem",
        confidence: "high",
        evidence: `inverted demand: matched "${neg.label}" in stem`,
        stem_excerpt: stemExcerpt(row.stem),
        existing_traps: existing,
        already_tagged: already,
        approved: !already,
      });
    }

    // 2b — multi-select
    const isMulti =
      row.type === "multi_select" ||
      (Array.isArray(row.items) && row.items.length > 0);
    if (isMulti) {
      const already = existing.includes("multi_select");
      if (!already) multiSelectUntagged.push(row.id);
      proposals.push({
        question_id: row.id,
        objective: row.objective,
        learning_outcome: row.learning_outcome,
        trap: "multi_select",
        confidence: "high",
        evidence:
          row.type === "multi_select"
            ? "type = multi_select"
            : "items IS NOT NULL",
        stem_excerpt: stemExcerpt(row.stem),
        existing_traps: existing,
        already_tagged: already,
        approved: !already,
      });
    }

    // 2c — absolutes retired: do not detect or propose

    // 2d — near-miss definition pairs
    const options = row.options ?? {};
    const haystack = [
      row.stem,
      ...Object.values(options),
      ...(row.items ?? []),
    ].join("\n");
    for (const pair of pairs) {
      const hits = pair.terms.filter((t) => termPresent(haystack, t));
      if (hits.length < 2) continue;
      const already = existing.includes("near_miss");
      proposals.push({
        question_id: row.id,
        objective: row.objective,
        learning_outcome: row.learning_outcome,
        trap: "near_miss",
        confidence: hits.length >= 3 ? "high" : "medium",
        evidence: `matched pair: ${pair.label} (terms: ${hits.join(", ")})`,
        stem_excerpt: stemExcerpt(row.stem),
        existing_traps: existing,
        already_tagged: already,
        approved: false,
      });
      break; // first matching pair only
    }
  }

  const multiSelectCount = rows.filter(
    (r) =>
      r.type === "multi_select" ||
      (Array.isArray(r.items) && r.items.length > 0),
  ).length;

  return {
    proposals,
    integrity: {
      multi_select_untagged: multiSelectUntagged,
      unknown_existing_tags: [...unknownTags].sort(),
    },
    multiSelectCount,
  };
}

function buildReport(rows: QuestionRow[]): Report {
  const { proposals, integrity, multiSelectCount } = detectProposals(rows);
  const additions = proposals.filter((p) => !p.already_tagged);
  const byTrap: Record<PfqTrapTag, number> = {
    near_miss: 0,
    negative_stem: 0,
    multi_select: 0,
  };
  for (const p of additions) byTrap[p.trap] += 1;

  const negAll = proposals.filter((p) => p.trap === "negative_stem");
  const negAlready = negAll.filter((p) => p.already_tagged).length;

  const bankPercent =
    rows.length === 0
      ? 0
      : Math.round((multiSelectCount / rows.length) * 1000) / 10;

  return {
    generated_at: new Date().toISOString(),
    summary: {
      active_questions: rows.length,
      currently_tagged: countTagged(rows),
      proposed_additions: additions.length,
      by_trap: byTrap,
      negative_stem_overlap: {
        detected: negAll.length,
        already_tagged_among_detected: negAlready,
        note:
          "Tightened 2026-09-05: inverted demand only. Expect ~22 detections, all already tagged → zero new negative_stem proposals.",
      },
      multi_select_shortfall: {
        bank_count: multiSelectCount,
        bank_percent: bankPercent,
        exam_percent: 10.0,
        note: "Authoring gap, not a tagging gap. See section 2b.",
      },
      traps_checksum_before: trapsChecksum(rows),
      by_objective_currently_tagged: taggedByObjective(rows),
    },
    integrity,
    proposals,
  };
}

function printSummary(report: Report) {
  const s = report.summary;
  console.log("PFQ trap backfill — report");
  console.log(`  active questions:     ${s.active_questions}`);
  console.log(`  currently tagged:     ${s.currently_tagged}`);
  console.log(`  proposed additions:   ${s.proposed_additions}`);
  console.log(`  by trap (additions):  ${JSON.stringify(s.by_trap)}`);
  console.log(
    `  negative overlap:     ${s.negative_stem_overlap.already_tagged_among_detected}/${s.negative_stem_overlap.detected} already tagged`,
  );
  console.log(
    `  multi-select bank:    ${s.multi_select_shortfall.bank_count} (${s.multi_select_shortfall.bank_percent}%) vs exam ${s.multi_select_shortfall.exam_percent}%`,
  );
  console.log(`  traps checksum:       ${s.traps_checksum_before}`);
  if (report.integrity.multi_select_untagged.length) {
    console.log(
      `  INTEGRITY: multi_select untagged: ${report.integrity.multi_select_untagged.join(", ")}`,
    );
  }
  if (report.integrity.unknown_existing_tags.length) {
    console.log(
      `  INTEGRITY: unknown tags: ${report.integrity.unknown_existing_tags.join(", ")}`,
    );
  }
  console.log(`  proposals on disk:    ${report.proposals.length} (not printed)`);
}

async function applyApproved(
  supabase: ReturnType<typeof createClient>,
  reportPath: string,
  rows: QuestionRow[],
) {
  if (!existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`);
    console.error("Run --report first, review approved flags, then --apply.");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(reportPath, "utf8")) as Report;
  const approved = (report.proposals ?? []).filter(
    (p) => p.approved === true && !p.already_tagged,
  );

  if (approved.length === 0) {
    console.log("No approved proposals to apply. Nothing written.");
    return;
  }

  const byId = new Map<string, QuestionRow>();
  for (const r of rows) byId.set(r.id, r);

  // Merge multiple approved traps per question
  const tagsToAdd = new Map<string, Set<PfqTrapTag>>();
  for (const p of approved) {
    if (!isPfqTrapTag(p.trap)) {
      console.error(`Skipping unknown trap tag in report: ${p.trap}`);
      continue;
    }
    if (!byId.has(p.question_id)) {
      console.error(`Skipping missing question_id: ${p.question_id}`);
      continue;
    }
    const set = tagsToAdd.get(p.question_id) ?? new Set();
    set.add(p.trap);
    tagsToAdd.set(p.question_id, set);
  }

  let updated = 0;
  let skipped = 0;

  for (const [id, tags] of tagsToAdd) {
    const row = byId.get(id)!;
    const current = normaliseTraps(row.traps);
    const next = [...current];
    let changed = false;
    for (const tag of tags) {
      if (!next.includes(tag)) {
        next.push(tag);
        changed = true;
      }
    }
    if (!changed) {
      skipped += 1;
      continue;
    }

    const { error } = await supabase
      .from("pfq_questions")
      .update({ traps: next })
      .eq("id", id)
      .eq("active", true);

    if (error) {
      console.error(`Failed to update ${id}: ${error.message}`);
      process.exit(1);
    }
    row.traps = next;
    updated += 1;
  }

  const afterRows = await fetchActiveQuestions(supabase);
  const unknown = new Set<string>();
  for (const r of afterRows) {
    for (const t of normaliseTraps(r.traps)) {
      if (!isPfqTrapTag(t)) unknown.add(t);
    }
  }

  console.log("PFQ trap backfill — apply");
  console.log(`  approved proposals: ${approved.length}`);
  console.log(`  rows updated:       ${updated}`);
  console.log(`  rows skipped (idempotent): ${skipped}`);
  console.log(`  tagged now:         ${countTagged(afterRows)}`);
  console.log(
    `  by objective:       ${JSON.stringify(taggedByObjective(afterRows))}`,
  );
  console.log(`  traps checksum after: ${trapsChecksum(afterRows)}`);
  if (unknown.size) {
    console.error(
      `  FAIL: unknown tag values still present: ${[...unknown].join(", ")}`,
    );
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const before = await fetchActiveQuestions(supabase);
  const checksumBefore = trapsChecksum(before);

  if (args.apply) {
    await applyApproved(supabase, args.reportFile, before);
    const after = await fetchActiveQuestions(supabase);
    // Second-pass idempotency hint
    const report = existsSync(args.reportFile)
      ? (JSON.parse(readFileSync(args.reportFile, "utf8")) as Report)
      : null;
    if (report) {
      const still = (report.proposals ?? []).filter((p) => {
        if (!p.approved || p.already_tagged) return false;
        const row = after.find((r) => r.id === p.question_id);
        return row ? !normaliseTraps(row.traps).includes(p.trap) : true;
      });
      if (still.length === 0) {
        console.log("  idempotent check: all approved tags present.");
      }
    }
    return;
  }

  // --report (default)
  const report = buildReport(before);
  mkdirSync(dirname(DEFAULT_REPORT), { recursive: true });
  writeFileSync(DEFAULT_REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  printSummary(report);

  const after = await fetchActiveQuestions(supabase);
  const checksumAfter = trapsChecksum(after);
  if (checksumBefore !== checksumAfter) {
    console.error(
      "FAIL: --report mutated traps (checksum changed). This must never happen.",
    );
    process.exit(1);
  }
  console.log(
    `  verified: checksum unchanged (${checksumBefore.slice(0, 12)}…)`,
  );
  console.log(`  wrote ${DEFAULT_REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
