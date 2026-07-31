/**
 * Renders the Learn in Curve mock-exam completion certificate as a single
 * self-contained HTML document.
 *
 * Intended usage (wire this up in Cursor):
 *   - Fetch profile name + exam result once the mock exam is marked complete.
 *   - Call renderCertificateHtml({...}) to get the HTML string.
 *   - Render it headlessly (Playwright/Puppeteer) and export:
 *       - PDF:  page.pdf({ width: "1600px", height: "1132px", printBackground: true })
 *       - JPEG: page.screenshot({ type: "jpeg", quality: 92 }) with
 *               deviceScaleFactor: 2 on the browser context for crisp text.
 *   - The canvas is fixed at 1600x1132px (A4 landscape ratio, ~1.414:1) so
 *     both export paths produce the same layout — don't rely on the @page
 *     rule alone for sizing, it's a fallback for direct browser printing.
 *
 * Fonts: Fraunces (site's real display font) for all headline/name/signature
 * text, same Google Fonts import + Georgia fallback stack used in the notify
 * confirmation email (src/lib/notify/send-confirmation-email.ts) so the two
 * pieces of branded output stay visually consistent.
 */

export type CertificateInput = {
  /** Name exactly as entered in the learner's profile. No fallback — caller must resolve a display name before calling this. */
  recipientName: string;
  /** e.g. "APM Project Management Qualification (PMQ)" or "APM Project Fundamentals Qualification (PFQ)" */
  courseLabel: string;
  /** Pre-formatted, e.g. "28 July 2026" — format in the caller's locale/timezone logic, not here. */
  completionDate: string;
  /** Pass null/undefined to omit the score line entirely (e.g. if the exam is pass/fail only). */
  scorePercent?: number | null;
  /** Unique per-issued-certificate ID, e.g. "LIC-PMQ-2026-004821". Caller generates/stores this for verification lookups. */
  credentialId: string;
  /** Origin used to build the absolute logo URL, e.g. "https://learnincurve.com". */
  origin: string;
  /** Optional public verification URL shown in the footer, e.g. "https://learnincurve.com/verify/LIC-PMQ-2026-004821" */
  verifyUrl?: string;
};

const DISPLAY_FONT_STACK = "'Fraunces', Georgia, 'Times New Roman', serif";
const INK = "#241A12";
const RUST = "#D5501F";
const CREAM = "#FBF3E1";
const OLIVE = "#5B6B3A";

export function renderCertificateHtml(input: CertificateInput): string {
  const logoUrl = `${input.origin}/brand/logo/fox-logo-png.png`;
  const scoreLine =
    input.scorePercent != null
      ? `<span style="font-weight:700;color:${INK};">${Math.round(input.scorePercent)}%</span> overall score &nbsp;&bull;&nbsp; `
      : "";
  const verifyLine = input.verifyUrl
    ? `<div style="margin-top:6px;font-size:11px;color:${INK}99;">Verify this certificate at ${input.verifyUrl}</div>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;1,500;1,600&display=swap" rel="stylesheet" />
    <style>
      @page { size: 1600px 1132px landscape; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
    </style>
  </head>
  <body style="width:1600px;height:1132px;background:${CREAM};font-family:Georgia,'Times New Roman',serif;">
    <div style="position:relative;width:1600px;height:1132px;padding:56px;">

      <!-- outer rule -->
      <div style="position:absolute;inset:56px;border:2px solid ${RUST};"></div>
      <!-- inner rule -->
      <div style="position:absolute;inset:70px;border:1px solid ${INK}33;"></div>

      <!-- corner flourishes -->
      <div style="position:absolute;top:70px;left:70px;width:28px;height:28px;border-top:3px solid ${RUST};border-left:3px solid ${RUST};"></div>
      <div style="position:absolute;top:70px;right:70px;width:28px;height:28px;border-top:3px solid ${RUST};border-right:3px solid ${RUST};"></div>
      <div style="position:absolute;bottom:70px;left:70px;width:28px;height:28px;border-bottom:3px solid ${RUST};border-left:3px solid ${RUST};"></div>
      <div style="position:absolute;bottom:70px;right:70px;width:28px;height:28px;border-bottom:3px solid ${RUST};border-right:3px solid ${RUST};"></div>

      <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;text-align:center;padding:64px 120px 40px;">

        <!-- logo + wordmark -->
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${logoUrl}" width="40" height="40" style="display:block;border-radius:8px;" alt="" />
          <div style="text-align:left;">
            <p style="margin:0;font-family:${DISPLAY_FONT_STACK};font-size:15px;font-weight:700;line-height:1;letter-spacing:-0.02em;color:${INK};">Learn in</p>
            <p style="margin:2px 0 0 0;font-family:${DISPLAY_FONT_STACK};font-size:22px;font-weight:700;line-height:1;letter-spacing:-0.03em;color:${RUST};">Curve</p>
          </div>
        </div>

        <p style="margin:36px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.28em;color:${RUST};text-transform:uppercase;">Certificate of Completion</p>

        <p style="margin:28px 0 0 0;font-size:17px;font-style:italic;color:${INK}cc;">This certifies that</p>

        <h1 style="margin:18px 0 0 0;font-family:${DISPLAY_FONT_STACK};font-style:italic;font-weight:600;font-size:52px;color:${INK};line-height:1.15;max-width:900px;">${escapeHtml(input.recipientName)}</h1>
        <div style="margin-top:10px;width:340px;height:1px;background:${INK}55;"></div>

        <p style="margin:26px 0 0 0;font-size:17px;line-height:1.7;color:${INK}dd;max-width:760px;">
          has successfully completed the full mock examination for the
          <span style="font-weight:700;color:${INK};">${escapeHtml(input.courseLabel)}</span>,
          demonstrating a working knowledge of project management principles and practice.
        </p>

        <p style="margin:20px 0 0 0;font-size:14px;color:${INK}99;">
          ${scoreLine}Completed <span style="font-weight:700;color:${INK};">${escapeHtml(input.completionDate)}</span>
        </p>

        <!-- spacer pushes footer to bottom -->
        <div style="flex:1;"></div>

        <div style="width:100%;max-width:900px;display:flex;align-items:flex-end;justify-content:space-between;margin-top:40px;">
          <div style="text-align:left;">
            <p style="margin:0;font-family:${DISPLAY_FONT_STACK};font-style:italic;font-weight:600;font-size:26px;color:${INK};">Sim Samaar Shened</p>
            <div style="margin-top:6px;width:220px;height:1px;background:${INK}55;"></div>
            <p style="margin:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;color:${INK}99;">Founder, Learn in Curve</p>
          </div>

          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:76px;height:76px;border-radius:50%;background:${CREAM};border:3px solid ${OLIVE};display:flex;align-items:center;justify-content:center;">
              <span style="font-family:${DISPLAY_FONT_STACK};font-weight:700;font-size:13px;color:${OLIVE};letter-spacing:0.03em;">PMQ<br/>PASS</span>
            </div>
          </div>

          <div style="text-align:right;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;color:${INK}99;">Credential ID</p>
            <p style="margin:4px 0 0 0;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:${INK};">${escapeHtml(input.credentialId)}</p>
            ${verifyLine}
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Sample data for local preview only — not used in the real send/export path. */
export function getSampleCertificateHtml(origin: string): string {
  return renderCertificateHtml({
    recipientName: "Alex Morgan",
    courseLabel: "APM Project Management Qualification (PMQ)",
    completionDate: "28 July 2026",
    scorePercent: 84,
    credentialId: "LIC-PMQ-2026-004821",
    origin,
    verifyUrl: "learnincurve.com/verify/LIC-PMQ-2026-004821",
  });
}
