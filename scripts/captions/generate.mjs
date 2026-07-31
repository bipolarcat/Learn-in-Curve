import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  captionConfig,
  draftPathFor,
  loTitles,
  padLo,
  projectRoot,
  publicCaptionPathFor,
  qaPathFor,
  sourcePathFor,
} from "./config.mjs";
import { buildCaptionPrompt, captionResponseSchema } from "./prompt.mjs";
import {
  deterministicChecks,
  formatTimestamp,
  parseTimestamp,
  parseWebVtt,
} from "./validate.mjs";

const manifestVersion = 1;
const pipelineVersion = 1;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} exited with ${code}: ${stderr.trim() || stdout.trim()}`,
          ),
        );
      }
    });
  });
}

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.writing`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
  await fs.rename(temporaryPath, filePath);
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(captionConfig.manifestPath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return {
      version: manifestVersion,
      captionModel: captionConfig.model,
      entries: {},
    };
  }
}

async function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  const handle = await fs.open(filePath, "r");
  try {
    for await (const chunk of handle.createReadStream()) hash.update(chunk);
  } finally {
    await handle.close();
  }
  return hash.digest("hex");
}

async function mediaDurationMs(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nokey=1:noprint_wrappers=1",
    filePath,
  ]);
  const durationMs = Math.round(Number(stdout.trim()) * 1000);
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error(`ffprobe returned an invalid duration for ${filePath}`);
  }
  return durationMs;
}

async function extractAudio(sourcePath, audioPath) {
  await fs.mkdir(path.dirname(audioPath), { recursive: true });
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    sourcePath,
    ...captionConfig.audio.ffmpegArgs,
    audioPath,
  ]);
}

function responseText(data) {
  if (data.error?.message) throw new Error(data.error.message);
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("")
    .trim();
  if (!text) {
    const reason =
      data.promptFeedback?.blockReason ||
      data.candidates?.[0]?.finishReason ||
      "unknown reason";
    throw new Error(`Gemini returned no caption data (${reason})`);
  }
  return text;
}

async function fetchWithRetry(url, options, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15 * 60 * 1000),
      });
      const data = await response.json();
      if (response.ok) return data;
      const message = data.error?.message || `Gemini API error (${response.status})`;
      if (response.status !== 429 && response.status < 500) {
        throw new Error(message);
      }
      lastError = new Error(message);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(30_000, 1500 * 2 ** (attempt - 1))),
    );
  }
  throw lastError;
}

async function transcribeWithGemini({
  apiKey,
  audioPath,
  durationMs,
  loNumber,
}) {
  const audio = await fs.readFile(audioPath);
  const request = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: captionConfig.audio.mimeType,
              data: audio.toString("base64"),
            },
          },
          {
            text: buildCaptionPrompt({
              loNumber,
              title: loTitles[loNumber],
              durationMs,
            }),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 16384,
      responseMimeType: "application/json",
      responseJsonSchema: captionResponseSchema,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(captionConfig.model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const data = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const parsed = JSON.parse(responseText(data));
  if (!Array.isArray(parsed.cues)) {
    throw new Error("Gemini response has no cues array");
  }
  return {
    cues: parsed.cues,
    provider: "gemini",
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount ?? null,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? null,
      totalTokens: data.usageMetadata?.totalTokenCount ?? null,
      estimatedCostUsd: null,
    },
  };
}

function filterEscape(value) {
  return value.replaceAll("\\", "/").replaceAll(":", "\\:");
}

function parseSrt(source) {
  return source
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      const timingIndex = lines.findIndex((line) => line.includes(" --> "));
      const timing = timingIndex >= 0
        ? /^(\d{2}:\d{2}:\d{2})[,.](\d{3}) --> (\d{2}:\d{2}:\d{2})[,.](\d{3})$/.exec(lines[timingIndex])
        : null;
      if (!timing) return null;
      return {
        startMs: parseTimestamp(`${timing[1]}.${timing[2]}`),
        endMs: parseTimestamp(`${timing[3]}.${timing[4]}`),
        text: lines.slice(timingIndex + 1).join(" ").trim(),
        confidence: "medium",
        qaMarkers: ["FFmpeg Whisper fallback; full human review required"],
      };
    })
    .filter(Boolean);
}

async function transcribeWithWhisper({ sourcePath, srtPath, modelPath }) {
  const filter = [
    `whisper=model='${filterEscape(modelPath)}'`,
    "language=en",
    `destination='${filterEscape(srtPath)}'`,
    "format=srt",
    `max_len=${captionConfig.cue.maximumCharacters}`,
  ].join(":");
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    sourcePath,
    "-af",
    filter,
    "-f",
    "null",
    process.platform === "win32" ? "NUL" : "/dev/null",
  ]);
  const cues = parseSrt(await fs.readFile(srtPath, "utf8"));
  if (cues.length === 0) throw new Error("FFmpeg Whisper returned no cues");
  return {
    cues,
    provider: "ffmpeg-whisper",
    usage: {
      promptTokens: null,
      outputTokens: null,
      totalTokens: null,
      estimatedCostUsd: 0,
    },
  };
}

function textChunks(text, maximumCharacters) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const chunks = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > maximumCharacters) {
      chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function captionTextChunks(text) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const chunks = [];
  let currentWords = [];

  for (const word of words) {
    const candidateWords = [...currentWords, word];
    const candidate = candidateWords.join(" ");
    const lines = textChunks(
      candidate,
      captionConfig.cue.maximumLineCharacters,
    );
    if (
      currentWords.length > 0 &&
      (candidate.length > captionConfig.cue.maximumCharacters || lines.length > 2)
    ) {
      chunks.push(currentWords.join(" "));
      currentWords = [word];
    } else {
      currentWords = candidateWords;
    }
  }
  if (currentWords.length > 0) chunks.push(currentWords.join(" "));
  return chunks;
}

function cueTimestampMs(cue, field) {
  const timestamp = cue[field];
  if (typeof timestamp === "string") return parseTimestamp(timestamp);
  const legacy = cue[field === "start" ? "startMs" : "endMs"];
  return Number.isFinite(Number(legacy)) ? Number(legacy) : null;
}

function normalizeCues(rawCues, durationMs) {
  const normalized = [];
  const sorted = rawCues
    .filter((cue) => cue && typeof cue.text === "string" && cue.text.trim())
    .sort((a, b) => cueTimestampMs(a, "start") - cueTimestampMs(b, "start"));
  const maximumRawEnd = Math.max(
    0,
    ...sorted.map((cue) => cueTimestampMs(cue, "end") || 0),
  );
  const hasStructuredTimestamps = sorted.some(
    (cue) => typeof cue.start === "string" || typeof cue.end === "string",
  );
  const scaleCandidates = [1, 10, 100, 1000];
  const timestampScale = hasStructuredTimestamps
    ? 1
    : scaleCandidates.reduce((best, candidate) => {
        const bestDelta = Math.abs(maximumRawEnd * best - durationMs);
        const candidateDelta = Math.abs(maximumRawEnd * candidate - durationMs);
        return candidateDelta < bestDelta ? candidate : best;
      }, 1);

  for (const raw of sorted) {
    const rawStart = Math.max(
      normalized.at(-1)?.endMs ?? 0,
      Math.round(cueTimestampMs(raw, "start") * timestampScale),
    );
    const rawEnd = Math.min(
      durationMs,
      Math.round(cueTimestampMs(raw, "end") * timestampScale),
    );
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd) || rawEnd <= rawStart) {
      continue;
    }
    const chunks = captionTextChunks(raw.text);
    const totalCharacters = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    let startMs = rawStart;
    chunks.forEach((text, index) => {
      const remaining = rawEnd - startMs;
      const proportional =
        index === chunks.length - 1
          ? remaining
          : Math.round(((rawEnd - rawStart) * text.length) / totalCharacters);
      const endMs =
        index === chunks.length - 1
          ? rawEnd
          : Math.min(rawEnd, startMs + Math.max(1, proportional));
      if (endMs > startMs) {
        normalized.push({
          startMs,
          endMs,
          text,
          confidence: ["high", "medium", "low"].includes(raw.confidence)
            ? raw.confidence
            : "low",
          qaMarkers: Array.isArray(raw.qaMarkers)
            ? [
                ...raw.qaMarkers.map(String).filter(Boolean),
                ...(timestampScale === 1 || normalized.length > 0
                  ? []
                  : [`Model timestamp units corrected ×${timestampScale}`]),
              ]
            : ["Model omitted confidence metadata"],
        });
      }
      startMs = endMs;
    });
  }
  return normalized;
}

function wrapText(text) {
  return textChunks(text, captionConfig.cue.maximumLineCharacters).join("\n");
}

function renderWebVtt(cues, metadata) {
  const blocks = cues.map(
    (cue, index) =>
      `${index + 1}\n${formatTimestamp(cue.startMs)} --> ${formatTimestamp(cue.endMs)}\n${wrapText(cue.text)}`,
  );
  return `WEBVTT

NOTE MACHINE-GENERATED DRAFT — HUMAN QA REQUIRED. LO ${padLo(metadata.loNumber)}; ${metadata.provider}; ${metadata.model}.

${blocks.join("\n\n")}
`;
}

function qaSidecar({
  loNumber,
  sourceSha256,
  durationMs,
  provider,
  usage,
  runtimeMs,
  cues,
  checks,
}) {
  return {
    version: 1,
    loNumber,
    title: loTitles[loNumber],
    status: "machine_draft",
    humanQaRequired: true,
    sourceSha256,
    durationMs,
    provider,
    model: provider === "gemini" ? captionConfig.model : "local-whisper",
    generatedAt: new Date().toISOString(),
    runtimeMs,
    usage,
    summary: {
      cueCount: cues.length,
      deterministicErrors: checks.errors.length,
      deterministicWarnings: checks.warnings.length,
      lowConfidenceCues: cues.filter((cue) => cue.confidence === "low").length,
      modelQaMarkers: cues.reduce(
        (sum, cue) => sum + cue.qaMarkers.length,
        0,
      ),
    },
    modelReviewMarkers: cues.flatMap((cue, index) =>
      cue.qaMarkers.map((marker) => ({ cue: index + 1, marker })),
    ),
    deterministicChecks: checks,
  };
}

async function canResume(entry, sourceSha256) {
  if (!entry || entry.sourceSha256 !== sourceSha256) return false;
  if (!["machine_draft", "approved"].includes(entry.status)) return false;
  if (
    entry.status === "machine_draft" &&
    (entry.model !== captionConfig.model ||
      (entry.pipelineVersion ?? 1) !== pipelineVersion)
  ) {
    return false;
  }
  try {
    await fs.access(
      entry.status === "approved"
        ? publicCaptionPathFor(entry.loNumber)
        : draftPathFor(entry.loNumber),
    );
    await fs.access(qaPathFor(entry.loNumber));
    return true;
  } catch {
    return false;
  }
}

function selectedLoNumbers() {
  const loIndex = process.argv.indexOf("--lo");
  if (loIndex < 0) {
    return Array.from({ length: captionConfig.loCount }, (_, index) => index + 1);
  }
  const loNumber = Number(process.argv[loIndex + 1]);
  if (!Number.isInteger(loNumber) || loNumber < 1 || loNumber > captionConfig.loCount) {
    throw new Error("--lo must be an integer from 1 to 24");
  }
  return [loNumber];
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const whisperModel = process.env.CAPTION_WHISPER_MODEL?.trim() || null;
  if (!apiKey && !whisperModel) {
    throw new Error(
      "GEMINI_API_KEY is not configured and no existing CAPTION_WHISPER_MODEL was supplied",
    );
  }
  if (whisperModel) await fs.access(whisperModel);

  await fs.mkdir(captionConfig.draftDirectory, { recursive: true });
  await fs.mkdir(captionConfig.tempDirectory, { recursive: true });
  const manifest = await readManifest();
  manifest.version = manifestVersion;
  manifest.captionModel = captionConfig.model;
  manifest.entries ??= {};
  const force = process.argv.includes("--force");
  const startedAt = Date.now();
  let generated = 0;
  let resumed = 0;
  let failed = 0;

  for (const loNumber of selectedLoNumbers()) {
    const label = `LO ${padLo(loNumber)}`;
    const sourcePath = sourcePathFor(loNumber);
    const sourceSha256 = await sha256(sourcePath);
    const previous = manifest.entries[String(loNumber)];
    if (!force && (await canResume(previous, sourceSha256))) {
      console.log(`${label}: resume hit (${previous.status})`);
      resumed += 1;
      continue;
    }

    const durationMs = await mediaDurationMs(sourcePath);
    const audioPath = path.join(
      captionConfig.tempDirectory,
      `lo-${padLo(loNumber)}${captionConfig.audio.extension}`,
    );
    const srtPath = path.join(
      captionConfig.tempDirectory,
      `lo-${padLo(loNumber)}.whisper.srt`,
    );
    const itemStartedAt = Date.now();
    console.log(`${label}: extracting audio`);

    try {
      await extractAudio(sourcePath, audioPath);
      let transcription;
      try {
        if (!apiKey) throw new Error("Gemini credential unavailable");
        console.log(`${label}: transcribing with ${captionConfig.model}`);
        transcription = await transcribeWithGemini({
          apiKey,
          audioPath,
          durationMs,
          loNumber,
        });
      } catch (geminiError) {
        if (!whisperModel) throw geminiError;
        console.warn(
          `${label}: Gemini failed; using configured local FFmpeg Whisper model`,
        );
        transcription = await transcribeWithWhisper({
          sourcePath,
          srtPath,
          modelPath: whisperModel,
        });
      }

      const cues = normalizeCues(transcription.cues, durationMs);
      const vtt = renderWebVtt(cues, {
        loNumber,
        provider: transcription.provider,
        model:
          transcription.provider === "gemini"
            ? captionConfig.model
            : "local-whisper",
      });
      const parsedCues = parseWebVtt(vtt);
      const checks = deterministicChecks(parsedCues, durationMs);
      if (checks.errors.length > 0) {
        throw new Error(
          `deterministic validation found ${checks.errors.length} error(s): ${JSON.stringify(checks.errors)}`,
        );
      }
      const runtimeMs = Date.now() - itemStartedAt;
      const qa = qaSidecar({
        loNumber,
        sourceSha256,
        durationMs,
        provider: transcription.provider,
        usage: transcription.usage,
        runtimeMs,
        cues,
        checks,
      });
      await fs.writeFile(draftPathFor(loNumber), vtt);
      await writeJsonAtomic(qaPathFor(loNumber), qa);
      manifest.entries[String(loNumber)] = {
        loNumber,
        sourcePath: path.relative(projectRoot, sourcePath).replaceAll("\\", "/"),
        sourceSha256,
        durationMs,
        draftPath: path
          .relative(projectRoot, draftPathFor(loNumber))
          .replaceAll("\\", "/"),
        qaPath: path.relative(projectRoot, qaPathFor(loNumber)).replaceAll("\\", "/"),
        status: "machine_draft",
        humanQaRequired: true,
        pipelineVersion,
        provider: transcription.provider,
        model:
          transcription.provider === "gemini"
            ? captionConfig.model
            : "local-whisper",
        cueCount: cues.length,
        generatedAt: qa.generatedAt,
        runtimeMs,
        usage: transcription.usage,
      };
      generated += 1;
      console.log(
        `${label}: draft complete (${cues.length} cues, ${checks.warnings.length} QA warnings)`,
      );
    } catch (error) {
      failed += 1;
      manifest.entries[String(loNumber)] = {
        loNumber,
        sourcePath: path.relative(projectRoot, sourcePath).replaceAll("\\", "/"),
        sourceSha256,
        durationMs,
        status: "failed",
        humanQaRequired: true,
        model: captionConfig.model,
        failedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
      console.error(
        `${label}: failed — ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      await fs.rm(audioPath, { force: true });
      await fs.rm(srtPath, { force: true });
      await writeJsonAtomic(captionConfig.manifestPath, manifest);
    }
  }

  console.log(
    `Caption run complete: ${generated} generated, ${resumed} resumed, ${failed} failed in ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`,
  );
  if (failed > 0) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(
      `Caption generation stopped: ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
  });
}
