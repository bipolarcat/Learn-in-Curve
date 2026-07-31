import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendFeedbackEmail } from "@/lib/notify/send-feedback-email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let body: { message?: string; email?: string; source?: string; pageUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400 },
    );
  }

  const source = body.source?.trim() || "Unknown";
  const pageUrl = body.pageUrl?.trim() || "Unknown";

  // Signed-in users: trust the server-verified session email, ignore
  // whatever (if anything) the client sent — never trust a client-supplied
  // email for an authenticated identity.
  // Signed-out users: an email is required and must look like an email.
  let email: string;
  let emailIsVerified: boolean;

  if (user?.email) {
    email = user.email;
    emailIsVerified = true;
  } else {
    const typed = body.email?.trim();
    if (!typed || !EMAIL_RE.test(typed)) {
      return NextResponse.json(
        { error: "A valid email is required when not signed in" },
        { status: 400 },
      );
    }
    email = typed;
    emailIsVerified = false;
  }

  const sent = await sendFeedbackEmail({
    message,
    email,
    emailIsVerified,
    source,
    pageUrl,
  });

  if (!sent) {
    return NextResponse.json(
      { error: "Couldn't send feedback right now — please try again" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
