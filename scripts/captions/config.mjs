import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptDirectory, "..", "..");
dotenv.config({ path: path.join(projectRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(projectRoot, ".env"), quiet: true });

export const captionConfig = Object.freeze({
  model:
    process.env.GEMINI_CAPTION_MODEL?.trim() || "gemini-3.1-flash-lite",
  locale: "en-GB",
  sourceDirectory: path.join(projectRoot, "public", "videos", "pmq"),
  draftDirectory: path.join(scriptDirectory, "drafts"),
  tempDirectory: path.join(scriptDirectory, ".tmp"),
  manifestPath: path.join(scriptDirectory, "manifest.json"),
  loCount: 24,
  audio: Object.freeze({
    extension: ".ogg",
    mimeType: "audio/ogg",
    ffmpegArgs: Object.freeze([
      "-vn",
      "-map",
      "0:a:0",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "libopus",
      "-b:a",
      "32k",
      "-application",
      "voip",
    ]),
  }),
  cue: Object.freeze({
    minimumDurationMs: 500,
    maximumDurationMs: 7000,
    maximumCharacters: 84,
    maximumLineCharacters: 42,
    maximumCharactersPerSecond: 21,
    warningGapMs: 3000,
  }),
});

export const loTitles = Object.freeze({
  1: "Life cycles",
  2: "Governance Arrangements",
  3: "Sustainability",
  4: "Business Case",
  5: "Procurement",
  6: "Reviews",
  7: "Assurance",
  8: "Transition Management",
  9: "Benefits Management",
  10: "Stakeholder Engagement and Communications Management",
  11: "Conflict Resolution",
  12: "Leadership",
  13: "Team Management",
  14: "Diversity and Inclusion",
  15: "Ethics, Compliance and Professionalism",
  16: "Requirements Management",
  17: "Solutions Development",
  18: "Quality Management",
  19: "Integrated Planning",
  20: "Schedule Management",
  21: "Resource Management",
  22: "Budgeting and Cost Control",
  23: "Risk and Issue Management",
  24: "Change Control",
});

export function padLo(loNumber) {
  return String(loNumber).padStart(2, "0");
}

export function sourcePathFor(loNumber) {
  return path.join(
    captionConfig.sourceDirectory,
    `lo-${padLo(loNumber)}.mp4`,
  );
}

export function draftPathFor(loNumber) {
  return path.join(
    captionConfig.draftDirectory,
    `lo-${padLo(loNumber)}.machine-draft.vtt`,
  );
}

export function qaPathFor(loNumber) {
  return path.join(
    captionConfig.draftDirectory,
    `lo-${padLo(loNumber)}.qa.json`,
  );
}

export function publicCaptionPathFor(loNumber) {
  return path.join(
    captionConfig.sourceDirectory,
    "captions",
    `lo-${padLo(loNumber)}.vtt`,
  );
}
