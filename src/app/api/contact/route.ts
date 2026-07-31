import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/notify/send-contact-email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: Request) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() || "General enquiry";
  const message = body.message?.trim() ?? "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400 },
    );
  }

  const sent = await sendContactEmail({
    firstName,
    lastName,
    email,
    subject,
    message,
  });

  if (!sent) {
    return NextResponse.json(
      { error: "Couldn't send right now — please try again" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
