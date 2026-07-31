import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  captionConfig,
  draftPathFor,
  padLo,
  projectRoot,
  publicCaptionPathFor,
  qaPathFor,
} from "./config.mjs";

const qaTokenPattern =
  /\[(?:inaudible|unclear[^\]]*|overlapping speech|music|laughter|sound effect)\]/i;

export function formatTimestamp(milliseconds) {
  const value = Math.max(0, Math.round(milliseconds));
  const hours = Math.floor(value / 3_600_000);
  const minutes = Math.floor((value % 3_600_000) / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  const millis = value % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

export function parseTimestamp(value) {
  const match = /^(\d{2,}):([0-5]\d):([0-5]\d)\.(\d{3})$/.exec(value);
  if (!match) return null;
  return (
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1000 +
    Number(match[4])
  );
}

export function parseWebVtt(source) {
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  if (!normalized.startsWith("WEBVTT\n")) {
    throw new Error("missing WEBVTT header");
  }

  const blocks = normalized.slice(7).trim().split(/\n{2,}/);
  const cues = [];

  for (const block of blocks) {
    if (!block.trim() || block.startsWith("NOTE")) continue;
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes(" --> "));
    if (timingIndex < 0) throw new Error("cue has no timing line");
    const timing = /^(\S+) --> (\S+)$/.exec(lines[timingIndex]);
    if (!timing) throw new Error(`invalid timing line: ${lines[timingIndex]}`);
    const startMs = parseTimestamp(timing[1]);
    const endMs = parseTimestamp(timing[2]);
    if (startMs === null || endMs === null) {
      throw new Error(`invalid timestamp: ${lines[timingIndex]}`);
    }
    const textLines = lines.slice(timingIndex + 1);
    cues.push({
      id: timingIndex === 1 ? lines[0] : String(cues.length + 1),
      startMs,
      endMs,
      textLines,
      text: textLines.join(" "),
    });
  }

  return cues;
}

export function deterministicChecks(cues, durationMs) {
  const errors = [];
  const warnings = [];
  let previousEnd = 0;

  if (cues.length === 0) errors.push({ code: "NO_CUES" });

  cues.forEach((cue, index) => {
    const cueNumber = index + 1;
    const duration = cue.endMs - cue.startMs;
    const charactersPerSecond =
      duration > 0 ? cue.text.length / (duration / 1000) : Infinity;

    if (cue.startMs < previousEnd) {
      errors.push({ code: "OVERLAP", cue: cueNumber });
    }
    if (cue.endMs <= cue.startMs) {
      errors.push({ code: "INVALID_DURATION", cue: cueNumber });
    }
    if (cue.endMs > durationMs + 250) {
      errors.push({ code: "AFTER_MEDIA_END", cue: cueNumber });
    }
    if (!cue.text.trim()) errors.push({ code: "EMPTY_TEXT", cue: cueNumber });
    if (cue.text.includes("-->")) {
      errors.push({ code: "TIMING_TOKEN_IN_TEXT", cue: cueNumber });
    }
    if (duration > captionConfig.cue.maximumDurationMs) {
      warnings.push({ code: "LONG_DURATION", cue: cueNumber, value: duration });
    }
    if (cue.text.length > captionConfig.cue.maximumCharacters) {
      warnings.push({
        code: "LONG_CUE",
        cue: cueNumber,
        value: cue.text.length,
      });
    }
    if (cue.textLines.length > 2) {
      warnings.push({
        code: "TOO_MANY_LINES",
        cue: cueNumber,
        value: cue.textLines.length,
      });
    }
    cue.textLines.forEach((line, lineIndex) => {
      if (line.length > captionConfig.cue.maximumLineCharacters) {
        warnings.push({
          code: "LONG_LINE",
          cue: cueNumber,
          line: lineIndex + 1,
          value: line.length,
        });
      }
    });
    if (charactersPerSecond > captionConfig.cue.maximumCharactersPerSecond) {
      warnings.push({
        code: "FAST_READING_SPEED",
        cue: cueNumber,
        value: Number(charactersPerSecond.toFixed(1)),
      });
    }
    if (
      index > 0 &&
      cue.startMs - previousEnd > captionConfig.cue.warningGapMs
    ) {
      warnings.push({
        code: "LONG_GAP",
        cue: cueNumber,
        value: cue.startMs - previousEnd,
      });
    }
    if (qaTokenPattern.test(cue.text)) {
      warnings.push({ code: "TRANSCRIPTION_MARKER", cue: cueNumber });
    }

    previousEnd = cue.endMs;
  });

  return { errors, warnings };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function validateEntry(loNumber, entry) {
  const errors = [];
  const warnings = [];
  const vttPath =
    entry.status === "approved"
      ? publicCaptionPathFor(loNumber)
      : draftPathFor(loNumber);
  const qaPath = qaPathFor(loNumber);

  try {
    const cues = parseWebVtt(await fs.readFile(vttPath, "utf8"));
    const checks = deterministicChecks(cues, entry.durationMs);
    errors.push(...checks.errors);
    warnings.push(...checks.warnings);
    if (entry.cueCount !== cues.length) {
      errors.push({
        code: "MANIFEST_CUE_COUNT_MISMATCH",
        expected: entry.cueCount,
        actual: cues.length,
      });
    }
  } catch (error) {
    errors.push({
      code: "VTT_READ_OR_PARSE_FAILED",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const qa = await readJson(qaPath);
    if (qa.loNumber !== loNumber || qa.sourceSha256 !== entry.sourceSha256) {
      errors.push({ code: "QA_SIDECAR_MISMATCH" });
    }
  } catch (error) {
    errors.push({
      code: "QA_READ_OR_PARSE_FAILED",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return { loNumber, errors, warnings, path: path.relative(projectRoot, vttPath) };
}

async function validateConstants(manifest) {
  const constantsPath = path.join(projectRoot, "src", "lib", "pmq", "constants.ts");
  const constants = await fs.readFile(constantsPath, "utf8");
  const approved = new Set(
    Object.entries(manifest.entries ?? {})
      .filter(([, entry]) => entry.status === "approved")
      .map(([lo]) => Number(lo)),
  );
  const references = [
    ...constants.matchAll(
      /captionsSrc:\s*["'`]\/videos\/pmq\/captions\/lo-(\d{2})\.vtt["'`]/g,
    ),
  ].map((match) => Number(match[1]));

  const errors = [];
  for (const loNumber of references) {
    if (!approved.has(loNumber)) {
      errors.push({
        code: "UNAPPROVED_CAPTION_REFERENCE",
        loNumber,
      });
    }
  }
  for (const loNumber of approved) {
    if (!references.includes(loNumber)) {
      errors.push({
        code: "APPROVED_CAPTION_NOT_REFERENCED",
        loNumber,
      });
    }
  }
  return errors;
}

export async function validateAll({ requireApproved = false } = {}) {
  const manifest = await readJson(captionConfig.manifestPath);
  const results = [];

  for (let loNumber = 1; loNumber <= captionConfig.loCount; loNumber += 1) {
    const entry = manifest.entries?.[String(loNumber)];
    if (!entry) {
      results.push({
        loNumber,
        errors: [{ code: "MISSING_MANIFEST_ENTRY" }],
        warnings: [],
      });
      continue;
    }
    results.push(await validateEntry(loNumber, entry));
  }

  const constantsErrors = await validateConstants(manifest);
  if (requireApproved) {
    for (let loNumber = 1; loNumber <= captionConfig.loCount; loNumber += 1) {
      if (manifest.entries?.[String(loNumber)]?.status !== "approved") {
        constantsErrors.push({
          code: "CAPTION_NOT_APPROVED",
          loNumber,
        });
      }
    }
  }
  const errorCount =
    constantsErrors.length +
    results.reduce((sum, result) => sum + result.errors.length, 0);
  const warningCount = results.reduce(
    (sum, result) => sum + result.warnings.length,
    0,
  );

  return { errorCount, warningCount, constantsErrors, results };
}

async function main() {
  try {
    const report = await validateAll({
      requireApproved: process.argv.includes("--require-approved"),
    });
    for (const result of report.results) {
      const label = `LO ${padLo(result.loNumber)}`;
      if (result.errors.length > 0) {
        console.error(`${label}: FAIL (${result.errors.length} errors)`);
      } else {
        console.log(`${label}: PASS (${result.warnings.length} QA warnings)`);
      }
    }
    report.constantsErrors.forEach((error) => {
      console.error(`Constants: FAIL ${JSON.stringify(error)}`);
    });
    console.log(
      `Validated ${report.results.length} captions: ${report.errorCount} errors, ${report.warningCount} QA warnings.`,
    );
    if (report.errorCount > 0) process.exitCode = 1;
  } catch (error) {
    console.error(
      `Caption validation failed: ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
