export function buildCaptionPrompt({ loNumber, title, durationMs }) {
  const durationSeconds = (durationMs / 1000).toFixed(3);
  const durationTimestamp = new Date(durationMs).toISOString().slice(11, 23);

  return `Transcribe the attached audio as accessibility captions for a UK APM PMQ exam-revision video.

Context:
- Learning Objective ${loNumber}: ${title}
- Audio duration: ${durationSeconds} seconds
- Language: British English (en-GB)
- Domain: project management and APM PMQ terminology

Requirements:
1. Transcribe every spoken word faithfully. Do not summarise, rewrite, correct the speaker's meaning, or invent content.
2. Use British spelling and preserve PMQ terms and abbreviations accurately.
3. Return short, readable caption cues in chronological order.
4. Each cue must have start and end timestamps measured from the start of the audio, formatted exactly as HH:MM:SS.mmm.
   Example: twelve and a third seconds is "00:00:12.345". The final cue should end close to "${durationTimestamp}".
5. Keep cues at 7 seconds or less and normally 84 characters or less.
6. Do not include speaker labels unless more than one speaker is audible.
7. Put non-speech information in square brackets only when it matters to understanding, for example [music] or [laughter].
8. If speech cannot be resolved, transcribe the best-supported words and add a qaMarkers item. Never silently guess.
9. qaMarkers may contain concise notes such as "unclear term", "inaudible speech", "overlapping speech", or "timestamp uncertain". Use an empty array when no review marker is needed.
10. confidence must be "high", "medium", or "low".

Output only the requested structured JSON.`;
}

export const captionResponseSchema = Object.freeze({
  type: "OBJECT",
  properties: {
    cues: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          start: { type: "STRING" },
          end: { type: "STRING" },
          text: { type: "STRING" },
          confidence: {
            type: "STRING",
            enum: ["high", "medium", "low"],
          },
          qaMarkers: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: [
          "start",
          "end",
          "text",
          "confidence",
          "qaMarkers",
        ],
      },
    },
  },
  required: ["cues"],
});
