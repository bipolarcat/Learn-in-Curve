import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/admin/send-admin-notification";

/**
 * POST /api/admin/new-user
 *
 * Receives a Supabase Database Webhook payload whenever a new row is inserted
 * into auth.users, then sends a notification email to the site owner.
 *
 * The webhook is secured with a shared secret passed in the
 * `x-webhook-secret` header. Set ADMIN_WEBHOOK_SECRET in Railway env vars
 * and in the Supabase trigger function.
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
    ? new Date(user.created_at).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "unknown";
  const provider = user?.app_metadata?.provider ?? "email";
  const name =
    user?.raw_user_meta_data?.full_name ??
    user?.raw_user_meta_data?.name ??
    null;

  const rows: { label: string; value: string }[] = [
    { label: "Email", value: email },
    ...(name ? [{ label: "Name", value: name }] : []),
    {
      label: "Method",
      value: provider === "google" ? "Google OAuth" : "Email & Password",
    },
    { label: "Signed up", value: `${createdAt} (London)` },
  ];

  try {
    await sendAdminNotification({
      subject: `🎉 New sign-up: ${email}`,
      title: "🎉 New sign-up",
      rows,
    });

    console.log(`[new-user] Notification sent for ${email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[new-user] Unexpected error", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
