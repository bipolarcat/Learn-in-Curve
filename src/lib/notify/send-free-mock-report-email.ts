/**
 * Emails the free-mock diagnostic report after soft-opt-in capture.
 * Same Resend fetch pattern as notify confirmation — never throws.
 */

import { notifyFrom } from "@/lib/notify/senders";
import type { FormatLossRow } from "@/lib/free-mock/report";
import {
  formatDuration,
  readinessBandLabel,
  type ReadinessBand,
} from "@/lib/free-mock/report";
import type { LoBreakdownRow } from "@/lib/free-mock/scoring";

type SendFreeMockReportInput = {
  email: string;
  unsubscribeToken: string;
  origin: string;
  displayName: string;
  mark: string;
  score: number;
  maxScore: number;
  band: ReadinessBand;
  durationMs: number;
  overTime: boolean;
  loBreakdown: LoBreakdownRow[];
  formatLoss: FormatLossRow[];
  nextSteps: string[];
  breakdownNounPlural: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendFreeMockReportEmail(
  input: SendFreeMockReportInput,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[free-mock-report] RESEND_API_KEY missing");
    return false;
  }

  const unsubscribeUrl = `${input.origin}/unsubscribe?token=${input.unsubscribeToken}`;
  const bandLabel = readinessBandLabel(input.band);
  const timeLabel = formatDuration(input.durationMs);
  const overtimeNote = input.overTime
    ? " (finished after the countdown)"
    : "";

  const loRows = input.loBreakdown
    .map(
      (row) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid rgba(36,26,18,0.08);">${escapeHtml(row.lo_code)}</td><td style="padding:6px 8px;border-bottom:1px solid rgba(36,26,18,0.08);">${escapeHtml(row.lo_title)}</td><td style="padding:6px 8px;border-bottom:1px solid rgba(36,26,18,0.08);">${row.correct}/${row.total}</td></tr>`,
    )
    .join("");

  const formatRows = input.formatLoss
    .map(
      (row) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid rgba(36,26,18,0.08);">${escapeHtml(row.format)}</td><td style="padding:6px 8px;border-bottom:1px solid rgba(36,26,18,0.08);">${row.correct}/${row.total}</td><td style="padding:6px 8px;border-bottom:1px solid rgba(36,26,18,0.08);">${row.lost} lost</td></tr>`,
    )
    .join("");

  const steps = input.nextSteps
    .map(
      (step, i) =>
        `<li style="margin:0 0 8px 0;">${i + 1}. ${escapeHtml(step)}</li>`,
    )
    .join("");

  const html = `<!doctype html>
<html>
  <head><meta name="color-scheme" content="light" /></head>
  <body style="margin:0;padding:0;background:#FBF3E1;font-family:Georgia,'Times New Roman',serif;color:#241A12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#FBF3E1;border:1px solid rgba(36,26,18,0.08);border-radius:16px;">
          <tr><td style="padding:28px 28px 8px 28px;">
            <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C45C26;">Your ${escapeHtml(input.mark)} report</p>
            <h1 style="margin:8px 0 0 0;font-size:22px;line-height:1.3;">${escapeHtml(String(input.score))}/${escapeHtml(String(input.maxScore))} · ${escapeHtml(bandLabel)}</h1>
            <p style="margin:10px 0 0 0;font-size:15px;line-height:1.6;color:#241A12cc;">Total time ${escapeHtml(timeLabel)}${overtimeNote}.</p>
          </td></tr>
          <tr><td style="padding:16px 28px;">
            <h2 style="margin:0 0 8px 0;font-size:16px;">${escapeHtml(input.breakdownNounPlural)}</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <thead><tr style="text-align:left;color:#241A1288;"><th style="padding:6px 8px;">Code</th><th style="padding:6px 8px;">Topic</th><th style="padding:6px 8px;">Score</th></tr></thead>
              <tbody>${loRows}</tbody>
            </table>
          </td></tr>
          <tr><td style="padding:8px 28px;">
            <h2 style="margin:0 0 8px 0;font-size:16px;">Formats</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <thead><tr style="text-align:left;color:#241A1288;"><th style="padding:6px 8px;">Format</th><th style="padding:6px 8px;">Score</th><th style="padding:6px 8px;">Lost</th></tr></thead>
              <tbody>${formatRows}</tbody>
            </table>
          </td></tr>
          <tr><td style="padding:8px 28px 24px 28px;">
            <h2 style="margin:0 0 8px 0;font-size:16px;">Next steps</h2>
            <ol style="margin:0;padding-left:18px;font-size:15px;line-height:1.55;color:#241A12cc;">${steps}</ol>
            <p style="margin:22px 0 0 0;font-size:12px;line-height:1.5;color:#241A1299;">
              You're getting this report plus occasional APM exam revision tips.
              <a href="${escapeHtml(unsubscribeUrl)}" style="color:#1B6560;">Unsubscribe</a> any time.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: notifyFrom(),
        to: [input.email],
        subject: `Your free ${input.displayName} readiness report`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[free-mock-report] Resend error", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[free-mock-report]", err);
    return false;
  }
}
