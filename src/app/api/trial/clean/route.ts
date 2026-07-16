import { NextRequest, NextResponse } from "next/server";
import { runProcessing } from "@/lib/memory-store";
import { estimateCredits } from "@/lib/pricing/estimate";
import { checkTrialAllowance, recordTrialUsage } from "@/lib/trial/guard";
import { putTrialResult } from "@/lib/trial/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB for anonymous trial

// Allowed types: exclude audio (most expensive + highest abuse risk).
const ALLOWED = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    // Honeypot: bots auto-fill hidden fields; real users leave them empty.
    const honeypot = (formData.get("company_website") as string | null) ?? "";
    if (honeypot.trim() !== "") {
      // Pretend success to waste the bot's time.
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileType = file.type || "application/octet-stream";
    if (!ALLOWED.includes(fileType)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type for the free trial. Allowed: PDF, JPG, PNG, CSV, XLSX. Audio is excluded — sign up to transcribe audio.",
        },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 5 MB trial limit" },
        { status: 413 }
      );
    }

    const estimatedDurationMinutes = undefined;
    const estimate = estimateCredits(fileType, file.size, {
      estimatedDurationMinutes,
    });

    const ip = clientIp(req);
    const allowance = checkTrialAllowance(ip, estimate.credits);
    if (!allowance.ok) {
      return NextResponse.json(
        { error: allowance.message, code: allowance.code },
        { status: 429 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await runProcessing(fileType, buffer, {});
    } catch (err) {
      console.error("[trial/clean] processing error:", err);
      return NextResponse.json(
        { error: "Processing failed. Please try a different file." },
        { status: 500 }
      );
    }

    recordTrialUsage(ip, estimate.credits);

    // Log trial usage separately from authenticated usage (growth metric).
    try {
      const { db } = await import("@/lib/db");
      await db.trialUsage.create({
        data: {
          ipHash: ip,
          fileType,
          creditsUsed: estimate.credits,
        },
      });
    } catch (err) {
      console.error("[trial/clean] trial usage log error:", err);
    }

    // Increment the persistent "documents cleaned" counter for anonymous trials.
    try {
      const { incrementSiteStat, DOCUMENTS_CLEANED_KEY } =
        await import("@/lib/site-stats");
      await incrementSiteStat(DOCUMENTS_CLEANED_KEY, 1);
    } catch (err) {
      console.error("[trial/clean] stat increment error:", err);
    }

    const stored = putTrialResult({
      originalName: file.name,
      fileType,
      sizeBytes: file.size,
      cleaningActions: result.cleaningActions as { type: string; description: string }[],
      confidenceScore: result.confidenceScore,
      flaggedForReview: result.flaggedForReview,
      cleanedContent: result.cleanedContent,
      creditsUsed: estimate.credits,
    });

    return NextResponse.json(
      {
        trialId: stored.trialId,
        originalName: stored.originalName,
        fileType: stored.fileType,
        creditsUsed: stored.creditsUsed,
        cleaningActions: stored.cleaningActions,
        confidenceScore: stored.confidenceScore,
        flaggedForReview: stored.flaggedForReview,
        cleanedContent: stored.cleanedContent,
        signupUrl: `/signup?trial=${stored.trialId}`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[trial/clean] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
