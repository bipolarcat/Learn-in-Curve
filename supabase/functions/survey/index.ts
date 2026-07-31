// Survey click-through handler — deployed as a Supabase Edge Function.
//
// Why an Edge Function and not the Next.js page or the old static site:
//   - The new Learn in Curve platform (Next.js) isn't deployed anywhere yet,
//     so links pointing at it would 404 for real recipients.
//   - The live "PMQ in 5 days" site (pmqin5days.learnincurve.com) is served
//     by Caddy's `file_server` directive off plain static files — there is
//     no server-side code running there at all, so it can't record a click
//     server-side, and we don't want to bolt a new backend onto a site we
//     were originally told never to touch.
//   - Supabase is already live and already holds the data. An Edge Function
//     is infrastructure we already have — no new hosting, no touching either
//     website, works today. See BUSINESS_STATE.md 2026-07-07 entry.
//
// Same flow/logic as the original src/app/survey/[token]/page.tsx (kept as
// reference/for when the Next.js app eventually deploys), reimplemented as
// a single Deno HTTP handler returning raw HTML. Zero client-side JS —
// every step is either a plain link (the click itself is the answer) or a
// native GET <form> for the two free-text steps.
//
// URL shape: https://<project-ref>.supabase.co/functions/v1/survey
//            ?token=<uuid>&r=<1-5>&l=y|n&a=y|n&improve=...&note=...&done=1

import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const COLORS = {
  ink: "#241A12",
  cream: "#F4E9D6",
  paper: "#FBF3E1",
  orange: "#D5501F",
  olive: "#5F7A3D",
  teal: "#1B6560",
};

function page(inner: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Learn in Curve</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};font-family:Georgia,'Times New Roman',serif;">
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
    <div style="width:100%;max-width:440px;background-color:${COLORS.paper};border:2px solid ${COLORS.ink};border-radius:16px;padding:32px;">
      ${inner}
    </div>
  </div>
</body>
</html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${COLORS.ink};margin:0 0 14px 0;">${text}</h1>`;
}

function body(text: string): string {
  return `<p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.ink};opacity:0.85;margin:0 0 18px 0;">${text}</p>`;
}

function linkButton(href: string, label: string, bg: string, fg = "#FBF3E1"): string {
  return `<a href="${href}" style="display:inline-block;text-decoration:none;text-align:center;padding:10px 20px;margin-right:10px;border:2px solid ${COLORS.ink};border-radius:10px;background-color:${bg};color:${fg};font-family:'Courier New',monospace;font-size:13px;font-weight:bold;text-transform:uppercase;">${label}</a>`;
}

function ghostButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;text-decoration:none;text-align:center;padding:10px 20px;border:2px solid ${COLORS.ink};border-radius:10px;background-color:transparent;color:${COLORS.ink};font-family:'Courier New',monospace;font-size:13px;font-weight:bold;text-transform:uppercase;">${label}</a>`;
}

function textForm(action: string, hidden: Record<string, string>, fieldName: string, placeholder: string, submitLabel: string, extra?: string): string {
  const hiddenInputs = Object.entries(hidden)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}"/>`)
    .join("\n");
  return `<form action="${action}" method="get">
    ${hiddenInputs}
    <textarea name="${fieldName}" rows="3" placeholder="${placeholder}" style="width:100%;box-sizing:border-box;border:2px solid ${COLORS.ink};border-radius:10px;padding:10px;font-family:Helvetica,Arial,sans-serif;font-size:14px;margin-bottom:14px;background-color:${COLORS.cream};"></textarea>
    <div>
      <button type="submit" style="border:2px solid ${COLORS.ink};border-radius:10px;background-color:${COLORS.orange};color:${COLORS.paper};font-family:'Courier New',monospace;font-size:13px;font-weight:bold;text-transform:uppercase;padding:10px 20px;cursor:pointer;margin-right:10px;">${submitLabel}</button>
      ${extra ?? ""}
    </div>
  </form>`;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return page(body("Missing link — this URL is incomplete."));
  }

  const { data: invite } = await supabase
    .from("survey_invites")
    .select("id")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return page(
      body(
        "This link isn't valid — it may have expired or been copied incorrectly. No worries either way, thanks for stopping by.",
      ),
    );
  }

  const rParam = url.searchParams.get("r");
  const lParam = url.searchParams.get("l");
  const aParam = url.searchParams.get("a");
  const improve = url.searchParams.get("improve")?.trim();
  const note = url.searchParams.get("note")?.trim();
  const isDone = url.searchParams.get("done") !== null;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  let wroteAnything = false;

  const rating = rParam ? Number(rParam) : undefined;
  if (rating && rating >= 1 && rating <= 5) {
    patch.rating = rating;
    wroteAnything = true;
  }
  if (lParam === "y" || lParam === "n") {
    patch.login_issue = lParam === "y";
    wroteAnything = true;
  }
  if (aParam === "y" || aParam === "n") {
    patch.early_access = aParam === "y";
    wroteAnything = true;
  }
  if (improve) {
    patch.improve_text = improve;
    wroteAnything = true;
  }
  if (note) {
    patch.additional_text = note;
    wroteAnything = true;
  }

  if (wroteAnything) {
    await supabase
      .from("survey_responses")
      .upsert({ invite_id: invite.id, ...patch }, { onConflict: "invite_id" });
  }

  // NOTE: req.url's origin/pathname inside the edge runtime do NOT match the
  // public https://<ref>.supabase.co/functions/v1/<slug> invocation URL
  // (confirmed by test call 2026-07-07 — it resolves to a bare, http://
  // internal address). Hardcode the real public base instead.
  const functionUrl = "https://dbjoimidfbftammchnql.supabase.co/functions/v1/survey";
  const base = `${functionUrl}?token=${token}`;
  // GET <form action="..."> REPLACES the action URL's query string with the
  // form's own fields on submit — it doesn't append to it. So every form
  // below must carry `token` as its own hidden input, and the action itself
  // must be the bare functionUrl (no query), or the token gets silently
  // dropped when the free-text steps submit.

  // --- Terminal states ---
  if (improve !== undefined || note !== undefined || isDone) {
    return page(
      heading("Thanks — genuinely appreciate it 🎉") +
        body("That's everything. Have a good one."),
    );
  }

  // --- Step 4: after early-access click, optional closing note ---
  if (aParam !== null) {
    return page(
      heading("One last (optional) thing") +
        textForm(
          functionUrl,
          { token, r: rParam ?? "", l: lParam ?? "", a: aParam },
          "note",
          "Anything else you'd like to add? (optional)",
          "Send",
          ghostButton(`${base}&r=${rParam}&l=${lParam}&a=${aParam}&done=1`, "No thanks, that's all"),
        ),
    );
  }

  // --- Step 3: after login question, branch on rating ---
  if (lParam !== null) {
    const r = rating ?? Number(rParam);
    if (r <= 2) {
      return page(
        heading("Sorry to hear that") +
          textForm(
            functionUrl,
            { token, r: String(r), l: lParam },
            "improve",
            "What's the one thing we could improve?",
            "Send",
          ),
      );
    }
    return page(
      heading("Great to hear!") +
        body(
          "We're about to launch a free, gamified upgrade of PMQ in 5 days — including an AI tutor. Want early access as new features roll out?",
        ) +
        linkButton(`${base}&r=${r}&l=${lParam}&a=y`, "Yes", COLORS.olive) +
        ghostButton(`${base}&r=${r}&l=${lParam}&a=n`, "No thanks"),
    );
  }

  // --- Step 2: after rating click, ask about login issue ---
  if (rParam !== null) {
    return page(
      heading("Thanks! One more thing") +
        body(
          "Have you ever had trouble logging in, or found yourself logged out unexpectedly?",
        ) +
        linkButton(`${base}&r=${rParam}&l=y`, "Yes", COLORS.teal) +
        ghostButton(`${base}&r=${rParam}&l=n`, "No"),
    );
  }

  // --- Defensive fallback (email should always link straight to ?r=<n>) ---
  const ratingButtons = ["1", "2", "3", "4", "5"]
    .map((n) => linkButton(`${base}&r=${n}`, n, COLORS.paper, COLORS.ink))
    .join("");
  return page(
    heading("How has your overall experience with PMQ in 5 days by Learn in Curve been so far?") +
      `<div>${ratingButtons}</div>`,
  );
});
