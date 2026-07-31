import { DEFAULT_TUTOR_MODEL } from "./constants";
import type { TutorChatMessage, TutorModelResult } from "./types";

type GeminiPart = { text?: string; thought?: boolean };
type GeminiContent = { role: string; parts: GeminiPart[] };

type GeminiResponse = {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: { message?: string };
};

export type TutorStreamEvent =
  | { type: "chunk"; text: string }
  | { type: "done"; result: TutorModelResult };

function buildRequestBody(
  systemPrompt: string,
  messages: TutorChatMessage[],
  options?: {
    responseMimeType?: string;
    responseSchema?: Record<string, unknown>;
    maxOutputTokens?: number;
  },
) {
  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const generationConfig: Record<string, unknown> = {
    temperature: 0.7,
    // Backstop cap, not a target — the system prompt now targets 60-100
    // words for a normal reply. High enough not to truncate a legitimate
    // table/worked example, now that thinking tokens (below) no longer
    // eat into this same budget.
    maxOutputTokens: options?.maxOutputTokens ?? 1200,
    // gemini-3-flash-preview thinks by default, and thinking tokens count
    // against maxOutputTokens — they were silently eating the budget meant
    // for the visible reply, causing mid-word truncation on short caps.
    // Tutor replies don't need deep reasoning, so disable it outright.
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };

  if (options?.responseMimeType) {
    generationConfig.responseMimeType = options.responseMimeType;
  }
  if (options?.responseSchema) {
    generationConfig.responseSchema = options.responseSchema;
  }

  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig,
  };
}

/**
 * LIC-61: Gemini doesn't reliably comply with the system prompt's "no bold,
 * no italics" instruction under sustained generation — confirmed live via
 * adversarial testing 2026-07-16. Negative formatting instructions to LLMs
 * are known to be unreliable, so stop relying on prompt wording alone and
 * strip emphasis markers mechanically before the reply is stored or shown.
 * Conservative regex — only matches markers with no adjacent whitespace (the
 * same boundary real markdown emphasis requires), so "3 * 4" or a stray
 * multiplication sign is left untouched. Doubles stripped before singles so
 * "**bold**" doesn't get mangled into leftover single asterisks.
 */
function stripEmphasisMarkers(text: string): string {
  return text
    .replace(/\*\*(\S(?:[\s\S]*?\S)?)\*\*/g, "$1")
    .replace(/__(\S(?:[\s\S]*?\S)?)__/g, "$1")
    .replace(/(?<!\*)\*(\S(?:[\s\S]*?\S)?)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_(\S(?:[\s\S]*?\S)?)_(?!_)/g, "$1");
}

/** Visible reply text only — skip Gemini "thought" parts when present. */
function extractText(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text ?? "")
    .join("");
}

function assertNoGeminiError(data: GeminiResponse) {
  if (data.error?.message) {
    throw new Error(data.error.message);
  }
  if (data.promptFeedback?.blockReason) {
    throw new Error(
      `Tutor response blocked (${data.promptFeedback.blockReason})`,
    );
  }
}

/**
 * Consume complete SSE events from `buffer`. Returns unconsumed remainder.
 * Handles LF / CRLF and flushes when you append a trailing `\n\n`.
 */
function consumeSseEvents(
  buffer: string,
  onData: (data: GeminiResponse) => void,
): string {
  const normalized = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const parts = normalized.split("\n\n");
  const remainder = parts.pop() ?? "";

  for (const part of parts) {
    for (const line of part.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const raw = trimmed.slice(5).trim();
      if (!raw || raw === "[DONE]") continue;

      try {
        onData(JSON.parse(raw) as GeminiResponse);
      } catch {
        // Incomplete / non-JSON line — skip
      }
    }
  }

  return remainder;
}

/**
 * Single vendor-specific implementation — all Gemini code lives here (§3, §8).
 * Blocking helper kept for course-completion summary and stream fallback.
 */
export async function callTutorModel(
  systemPrompt: string,
  messages: TutorChatMessage[],
): Promise<TutorModelResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_TUTOR_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildRequestBody(systemPrompt, messages)),
  });

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    const message = data.error?.message ?? `Gemini API error (${response.status})`;
    throw new Error(message);
  }

  assertNoGeminiError(data);

  const text = stripEmphasisMarkers(extractText(data).trim());

  if (!text) {
    throw new Error("Empty response from tutor model");
  }

  const inputTokens = data.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;

  return { content: text, inputTokens, outputTokens };
}

/**
 * Blocking Gemini call with native JSON structured output.
 * Used for course-completion report (LIC-65) — not for streaming chat.
 */
export async function callTutorModelJson(
  systemPrompt: string,
  messages: TutorChatMessage[],
  responseSchema: Record<string, unknown>,
): Promise<TutorModelResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_TUTOR_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildRequestBody(systemPrompt, messages, {
        responseMimeType: "application/json",
        responseSchema,
        // Chat prose + takeaways + notes need more headroom than a short reply.
        maxOutputTokens: 2400,
      }),
    ),
  });

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    const message = data.error?.message ?? `Gemini API error (${response.status})`;
    throw new Error(message);
  }

  assertNoGeminiError(data);

  const text = extractText(data).trim();

  if (!text) {
    throw new Error("Empty JSON response from tutor model");
  }

  const inputTokens = data.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;

  return { content: text, inputTokens, outputTokens };
}

/**
 * Stream tokens via Gemini `:streamGenerateContent` (SSE).
 * Yields text deltas, then a final `done` with full content + token usage.
 * Falls back to non-streaming generateContent if the stream yields no text
 * (incomplete SSE framing, thought-only parts, etc.).
 */
export async function* streamTutorModel(
  systemPrompt: string,
  messages: TutorChatMessage[],
): AsyncGenerator<TutorStreamEvent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_TUTOR_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  let fullText = "";
  let inputTokens = 0;
  let outputTokens = 0;
  const pendingChunks: string[] = [];

  const onData = (data: GeminiResponse) => {
    assertNoGeminiError(data);

    const text = extractText(data);
    if (text) {
      fullText += text;
      pendingChunks.push(text);
    }

    if (data.usageMetadata) {
      inputTokens = data.usageMetadata.promptTokenCount ?? inputTokens;
      outputTokens = data.usageMetadata.candidatesTokenCount ?? outputTokens;
    }
  };

  let streamError: unknown = null;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(buildRequestBody(systemPrompt, messages)),
    });

    if (!response.ok) {
      let message = `Gemini API error (${response.status})`;
      try {
        const data = (await response.json()) as GeminiResponse;
        if (data.error?.message) message = data.error.message;
      } catch {
        // ignore parse failure
      }
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("Empty stream from tutor model");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = consumeSseEvents(buffer, onData);

      while (pendingChunks.length > 0) {
        yield { type: "chunk", text: pendingChunks.shift()! };
      }
    }

    // Flush decoder + any trailing SSE event without a final blank line
    buffer += decoder.decode();
    if (buffer.trim()) {
      buffer = consumeSseEvents(`${buffer}\n\n`, onData);
    }

    while (pendingChunks.length > 0) {
      yield { type: "chunk", text: pendingChunks.shift()! };
    }
  } catch (err) {
    streamError = err;
  }

  if (!fullText.trim()) {
    if (streamError) {
      console.error(
        "tutor stream failed, falling back to generateContent:",
        streamError instanceof Error ? streamError.message : streamError,
      );
    } else {
      console.error(
        "tutor stream returned no text, falling back to generateContent",
      );
    }

    const result = await callTutorModel(systemPrompt, messages);
    yield { type: "chunk", text: result.content };
    yield { type: "done", result };
    return;
  }

  if (streamError && fullText.trim()) {
    // Partial stream then hard fail — still return what we have
    console.error(
      "tutor stream interrupted after partial text:",
      streamError instanceof Error ? streamError.message : streamError,
    );
  }

  yield {
    type: "done",
    result: {
      content: stripEmphasisMarkers(fullText.trim()),
      inputTokens,
      outputTokens,
    },
  };
}
