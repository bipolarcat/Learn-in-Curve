import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { messageId?: string; rating?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messageId, rating } = body;
  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  if (rating !== null && rating !== -1 && rating !== 1) {
    return NextResponse.json(
      { error: "rating must be -1, 1, or null" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("tutor_messages")
    .update({ rating })
    .eq("id", messageId)
    .eq("user_id", user.id)
    .eq("role", "assistant")
    .select("id, rating")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json({ id: data.id, rating: data.rating });
}
