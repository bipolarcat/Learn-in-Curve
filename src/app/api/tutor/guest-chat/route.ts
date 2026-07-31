import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { streamTutorModel } from "@/lib/tutor/callTutorModel";
import { buildSystemPrompt } from "@/lib/tutor/buildSystemPrompt";
import {
  GUEST_CONTEXT_MESSAGE_LIMIT,
  GUEST_MESSAGE_MAX_LENGTH,
  GUEST_TIER_MESSAGE_CAP,
} from "@/lib/tutor/constants";
import {
  claimGuestTutorMessage,
  getGuestTutorUsage,
  hashGuestIp,
  isGuestTutorEnabled,
  recordGuestTutorSpend,
  resolveClientIp,
} from "@/lib/tutor/guest-usage";
import { estimateTokenCostUsd, usdToGbpCents } from "@/lib/tutor/fair-usage";
import { sendGuestBudgetAlertEmail } from "@/lib/tutor/guest-budget-alert";

/**
 * The landing-page demo Sly.
 *
 * Deliberately auth-agnostic. This route used to reject any request with a
 * session ("Signed-in users should use /api/tutor/chat", HTTP 400), which meant
 * a signed-in visitor could not use the demo at all — and the route it pointed
 * them at is the in-app tutor, gated on `canAccessSly` (ai_pro). AI Pro is
 * status "waitlist" and not on sale, so nobody holds that tier: signing in
 * turned a working demo into a dead end.
 *
 * The allowance is now what LIC-111 specifies — three free messages per IP,
 * identical whether or not the caller is signed in. Auth state must not affect
 * it in either direction.
 *
 * Two things this does NOT do, both load-bearing:
 *
 *  - It does not open in-app Sly to anyone. `canAccessSly` in tiers.ts is
 *    untouched, and no padlocked tutor is surfaced to Starter or Pro. Showing a
 *    locked tutor would advertise something nobody can buy.
 *  - It does not use the IP cap for anything paid. IP limiting is trivially
 *    bypassed (VPN, mobile network change) and over-blocks shared connections;
 *    that is an acceptable trade for a free teaser and nothing else. Paid
 *    entitlement stays on the account, via feature_entitlements.
 *
 * The cap is enforced in the database by `claim_guest_tutor_message`, an atomic
 * RPC — not by asking Sly to behave. Soft prompt instructions have already
 * proven unreliable here (LIC-61).
 */
export const runtime = "nodejs";

type HistoryTurn = { role: "user" | "assistant"; content: string };

function sseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim()
    ) {
      out.push({ role, content: content.trim().slice(0, GUEST_MESSAGE_MAX_LENGTH) });
    }
  }
  return out.slice(-(GUEST_CONTEXT_MESSAGE_LIMIT - 1));
}

export async function GET(request: Request) {
  try {
    const admin = createServiceClient();
    const ipHash = hashGuestIp(resolveClientIp(request));
    const [usage, enabled] = await Promise.all([
      getGuestTutorUsage(admin, ipHash, GUEST_TIER_MESSAGE_CAP),
      isGuestTutorEnabled(admin),
    ]);
    return NextResponse.json({
      messagesRemaining: usage.messagesRemaining,
      locked: usage.locked || usage.messagesRemaining === 0,
      cap: GUEST_TIER_MESSAGE_CAP,
      enabled,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load guest usage";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { message?: string; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trimmed = body.message?.trim() ?? "";
  if (!trimmed) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (trimmed.length > GUEST_MESSAGE_MAX_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Service unavailable";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const enabled = await isGuestTutorEnabled(admin);
  if (!enabled) {
    return NextResponse.json(
      {
        error: "guest_trial_unavailable",
        messagesRemaining: 0,
        locked: true,
        cap: GUEST_TIER_MESSAGE_CAP,
      },
      { status: 503 },
    );
  }

  const ipHash = hashGuestIp(resolveClientIp(request));

  let claim;
  try {
    claim = await claimGuestTutorMessage(
      admin,
      ipHash,
      GUEST_TIER_MESSAGE_CAP,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to claim guest message";
    console.error("guest tutor claim error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!claim.allowed) {
    return NextResponse.json(
      {
        error: "guest_cap_exceeded",
        messagesRemaining: 0,
        locked: true,
        cap: GUEST_TIER_MESSAGE_CAP,
      },
      { status: 403 },
    );
  }

  const prior = sanitizeHistory(body.history);
  const conversationHistory = [
    ...prior,
    { role: "user" as const, content: trimmed },
  ].slice(-GUEST_CONTEXT_MESSAGE_LIMIT);

  const systemPrompt = buildSystemPrompt({
    mode: "guest",
    loNumber: 1,
    weakAreas: [],
  });

  const now = new Date().toISOString();
  const userMessageId = `guest-user-${claim.messageCount}`;
  const assistantMessageId = `guest-assistant-${claim.messageCount}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(sseData(payload)));
      };

      try {
        send({
          type: "user",
          message: {
            id: userMessageId,
            role: "user",
            content: trimmed,
            rating: null,
            createdAt: now,
          },
        });

        let fullContent = "";
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const event of streamTutorModel(
          systemPrompt,
          conversationHistory,
        )) {
          if (event.type === "chunk") {
            send({ type: "chunk", text: event.text });
          } else {
            fullContent = event.result.content;
            inputTokens = event.result.inputTokens;
            outputTokens = event.result.outputTokens;
          }
        }

        send({
          type: "done",
          reply: {
            id: assistantMessageId,
            role: "assistant",
            content: fullContent,
            rating: null,
            createdAt: new Date().toISOString(),
          },
          messagesRemaining: claim.messagesRemaining,
          locked: claim.messagesRemaining === 0,
          cap: GUEST_TIER_MESSAGE_CAP,
        });

        // Global £-cap guardrail: record real Gemini spend for this reply
        // and alert exactly once if it just pushed the total over the cap.
        // Never lets a spend-tracking failure affect the reply already sent.
        try {
          const costUsd = estimateTokenCostUsd(inputTokens, outputTokens);
          const deltaGbpCents = usdToGbpCents(costUsd);
          const budget = await recordGuestTutorSpend(admin, deltaGbpCents);
          if (budget.justCrossed) {
            await sendGuestBudgetAlertEmail(
              budget.totalGbpCents,
              budget.capGbpCents,
            );
          }
        } catch (err) {
          console.error(
            "failed to record guest tutor spend:",
            err instanceof Error ? err.message : err,
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Tutor request failed";
        console.error("guest tutor stream error:", message);
        send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
