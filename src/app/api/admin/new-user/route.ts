import { NextResponse } from "next/server";

/**
 * POST /api/admin/new-user
 *
 * Receives a Supabase Database Webhook payload whenever a new row is inserted
 * into auth.users, then sends a notification email to the site owner.
 *
 * The webhook is secured with a shared secret passed in the
 * `x-webhook-secret` header. Set ADMIN_WEBHOOK_SECRET in Railway env vars
 * and in the Supabase webhook configuration.
 */
export async function POST(request: Request) {
  // Verify the shared secret to prevent unauthorised calls
  const secret = request.headers.get("x-webhook-secret");
  const expectedSecret = process.env.ADMIN_WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    record?: {
      email?: string;
      created_at?: string;
      app_metadata?: { provider?: string };
      raw_user_meta_data?: { full_name?: string; name?: string };
    };
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const user = payload.record;
  const email = user?.email ?? "unknown";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })
    : "unknown";
  const provider = user?.app_metadata?.provider ?? "email";
  const name =
    user?.raw_user_meta_data?.full_name ??
    user?.raw_user_meta_data?.name ??
    null;

  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "simsamaarshened@gmail.com";
  const fromEmail = process.env.NOTIFY_EMAIL_FROM ?? "Learn in Curve <hello@learnincurve.com>";

  if (!resendApiKey) {
    console.error("[new-user] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FBF3E1;border:2px solid #1a1a1a;border-radius:12px;padding:36px 40px;">
        <tr><td>
          <p style="margin:0 0 8px 0;font-size:13px;color:#888;letter-spacing:0.05em;text-transform:uppercase;">Learn in Curve</p>
          <h2 style="margin:0 0 24px 0;font-size:22px;color:#1a1a1a;font-weight:normal;">🎉 New sign-up</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e0d8c8;font-size:14px;color:#555;width:120px;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #e0d8c8;font-size:14px;color:#1a1a1a;font-weight:bold;">${email}</td>
            </tr>
            ${name ? `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #e0d8c8;font-size:14px;color:#555;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #e0d8c8;font-size:14px;color:#1a1a1a;">${name}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e0d8c8;font-size:14px;color:#555;">Method</td>
              <td style="padding:10px 0;border-bottom:1px solid #e0d8c8;font-size:14px;color:#1a1a1a;">${provider === "google" ? "Google OAuth" : "Email & Password"}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:14px;color:#555;">Signed up</td>
              <td style="padding:10px 0;font-size:14px;color:#1a1a1a;">${createdAt} (London)</td>
            </tr>
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
        subject: `🎉 New sign-up: ${email}`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[new-user] Resend error", res.status, body);
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }

    console.log(`[new-user] Notification sent for ${email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[new-user] Unexpected error", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
