import path from "path";
import { readFile, stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoSkipAuth } from "@/lib/demo";
import { getSiteOrigin } from "@/lib/site-origin";

const PMQ_ROOT = path.join(process.cwd(), "PMQ in 5 days");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function resolvePmqPath(segments: string[]): string {
  const safeParts = segments.filter((part) => part !== ".." && part !== ".");
  return path.join(PMQ_ROOT, ...safeParts);
}

/** Legacy static asset fallback — native pages live at page.tsx and lo/[loNumber]. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isDemoSkipAuth()) {
    return NextResponse.redirect(
      new URL("/auth/sign-in", getSiteOrigin(_request)),
    );
  }

  const { path: segments } = await context.params;
  const filePath = resolvePmqPath(segments);

  if (!filePath.startsWith(PMQ_ROOT)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      const html = await readFile(indexPath);
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    const content = await readFile(filePath);
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(content, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
