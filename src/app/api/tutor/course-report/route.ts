import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getAiTutorEntitlement } from "@/lib/pmq/queries";
import { canAccessCourseReport, toTier } from "@/lib/pmq/tiers";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";
import { CourseReportPdfDocument } from "@/lib/tutor/CourseReportPdf";
import type {
  PerLoMeter,
  WeakLoNote,
} from "@/lib/tutor/course-report";
import { getCourseCompletionReport } from "@/lib/tutor/tutor-db";

export const runtime = "nodejs";

const REPORTS_BUCKET = "course-reports";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((s): s is string => typeof s === "string");
}

function asPerLo(value: unknown): PerLoMeter[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const loNumber = Number(r.loNumber);
      const wrongCount = Number(r.wrongCount);
      const totalCount = Number(r.totalCount);
      const tier = r.tier;
      if (
        !Number.isInteger(loNumber) ||
        !Number.isFinite(wrongCount) ||
        !Number.isFinite(totalCount) ||
        typeof tier !== "string"
      ) {
        return null;
      }
      return {
        loNumber,
        wrongCount,
        totalCount,
        tier: tier as PerLoMeter["tier"],
      };
    })
    .filter((r): r is PerLoMeter => r != null);
}

function asWeakNotes(value: unknown): WeakLoNote[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const loNumber = Number(r.loNumber);
      const note = r.note;
      if (!Number.isInteger(loNumber) || typeof note !== "string") return null;
      return { loNumber, note };
    })
    .filter((r): r is WeakLoNote => r != null);
}

async function ensureReportsBucket(
  admin: ReturnType<typeof createServiceClient>,
) {
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.name === REPORTS_BUCKET)) return;
  await admin.storage.createBucket(REPORTS_BUCKET, { public: false });
}

/**
 * GET /api/tutor/course-report?courseId=…
 * Pro-only download of the end-of-course PDF (LIC-65).
 * Serves Storage cache when pdf_storage_path is set; otherwise renders once.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId")?.trim() || PMQ_COURSE_ID;

  // End-of-course report is AI Pro only — Pro doesn't include it.
  const entitlement = await getAiTutorEntitlement(supabase, user.id, courseId);
  if (!canAccessCourseReport(toTier(entitlement?.feature))) {
    return NextResponse.json(
      { error: "AI Pro Bundle required" },
      { status: 403 },
    );
  }

  const report = await getCourseCompletionReport(supabase, user.id, courseId);
  if (!report) {
    return NextResponse.json(
      { error: "Report not ready yet" },
      { status: 404 },
    );
  }

  const admin = createServiceClient();
  await ensureReportsBucket(admin);

  const filename = "pmq-end-of-course-report.pdf";

  if (report.pdf_storage_path) {
    const started = Date.now();
    const { data, error } = await admin.storage
      .from(REPORTS_BUCKET)
      .download(report.pdf_storage_path);
    if (error || !data) {
      console.error("[course-report] cache download failed", error?.message);
      return NextResponse.json(
        { error: "Failed to load cached report" },
        { status: 500 },
      );
    }
    const bytes = Buffer.from(await data.arrayBuffer());
    console.info(
      `[course-report] served cached PDF path=${report.pdf_storage_path} bytes=${bytes.length} ms=${Date.now() - started}`,
    );
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Course-Report-Cache": "hit",
      },
    });
  }

  const started = Date.now();
  const perLo = asPerLo(report.per_lo);
  const keyTakeaways = asStringArray(report.key_takeaways);
  const weakLoNotes = asWeakNotes(report.weak_lo_notes);
  const improvementTips = asStringArray(report.improvement_tips);

  const { data: course } = await supabase
    .from("courses")
    .select("name")
    .eq("id", courseId)
    .maybeSingle();

  const buffer = await renderToBuffer(
    createElement(CourseReportPdfDocument, {
      courseName: course?.name ?? "PMQ in 5 Days",
      generatedAt: report.generated_at,
      perLo,
      keyTakeaways,
      weakLoNotes,
      improvementTips,
    }) as Parameters<typeof renderToBuffer>[0],
  );

  const storagePath = `${user.id}/${courseId}/end-of-course-report.pdf`;
  const { error: uploadError } = await admin.storage
    .from(REPORTS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("[course-report] upload failed", uploadError.message);
    // Still return the fresh PDF even if cache write fails.
  } else {
    const { error: updateError } = await supabase
      .from("course_completion_reports")
      .update({ pdf_storage_path: storagePath })
      .eq("id", report.id);

    if (updateError) {
      console.error(
        "[course-report] pdf_storage_path update failed",
        updateError.message,
      );
    }
  }

  console.info(
    `[course-report] rendered fresh PDF path=${storagePath} bytes=${buffer.length} ms=${Date.now() - started}`,
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Course-Report-Cache": "miss",
    },
  });
}
