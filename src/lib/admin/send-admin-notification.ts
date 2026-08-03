/**
 * Sends a lightweight admin notification email to the site owner via Resend.
 * Fire-and-forget — never awaited in the hot path.
 */
export async function sendAdminNotification({
  subject,
  title,
  rows,
}: {
  subject: string;
  title: string;
  rows: { label: string; value: string }[];
}): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail =
    process.env.ADMIN_NOTIFY_EMAIL ?? "simsamaarshened@gmail.com";
  const fromEmail =
    process.env.NOTIFY_EMAIL_FROM ??
    "Learn in Curve <hello@learnincurve.com>";

  if (!resendApiKey) {
    console.error("[admin-notify] RESEND_API_KEY not set");
    return;
  }

  const rowsHtml = rows
    .map(
      ({ label, value }, i) => `
      <tr>
        <td style="padding:10px 0;${i < rows.length - 1 ? "border-bottom:1px solid #e0d8c8;" : ""}font-size:14px;color:#555;width:130px;">${label}</td>
        <td style="padding:10px 0;${i < rows.length - 1 ? "border-bottom:1px solid #e0d8c8;" : ""}font-size:14px;color:#1a1a1a;">${value}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FBF3E1;border:2px solid #1a1a1a;border-radius:12px;padding:36px 40px;">
        <tr><td>
          <p style="margin:0 0 8px 0;font-size:13px;color:#888;letter-spacing:0.05em;text-transform:uppercase;">Learn in Curve</p>
          <h2 style="margin:0 0 24px 0;font-size:22px;color:#1a1a1a;font-weight:normal;">${title}</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${rowsHtml}
          </table>
          <p style="margin:24px 0 0 0;font-size:13px;color:#888;">This is an automated notification from learnincurve.com</p>
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
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[admin-notify] Resend error", res.status, body);
    }
  } catch (err) {
    console.error("[admin-notify] Unexpected error", err);
  }
}
