import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { runProcessing } from "@/lib/memory-store";
import { resolveUploadBatch, syncBatchStatus } from "@/lib/project-queries";
import { estimateCredits } from "@/lib/pricing/estimate";
import { deductCredits } from "@/lib/pricing/usage";

const MAX_BYTES = 50 * 1024 * 1024;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const batchId = formData.get("batchId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Uploads must be made inside a project." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 50 MB limit" },
        { status: 413 }
      );
    }

    const batch = await resolveUploadBatch(
      session.user.id,
      projectId,
      batchId
    );

    if (!batch) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = await db.project.findFirst({
      where: { id: projectId, userId: session.user.id },
      select: { module: true },
    });

    const language = (formData.get("language") as string | null)?.trim() || undefined;

    await db.uploadBatch.update({
      where: { id: batch.id },
      data: { status: "PROCESSING" },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || "application/octet-stream";

    const fileRecord = await db.fileRecord.create({
      data: {
        batchId: batch.id,
        originalName: file.name,
        fileType,
        storageUrl: "",
        status: "PROCESSING",
        sizeBytes: file.size,
      },
    });

    let result;
    try {
      result = await runProcessing(fileType, buffer, {
        module: project?.module,
        language,
      });

      await db.fileRecord.update({
        where: { id: fileRecord.id },
        data: {
          status: "COMPLETE",
          cleaningActions: result.cleaningActions as object,
          confidenceScore: result.confidenceScore,
          flaggedForReview: result.flaggedForReview,
          processedAt: new Date(),
          cleanedContent: result.cleanedContent,
        },
      });
    } catch (processingError) {
      await db.fileRecord.update({
        where: { id: fileRecord.id },
        data: { status: "FAILED" },
      });
      throw processingError;
    }

    // ── Credit cost (estimate → deduct) ─────────────────────────────────────
    // Audio duration isn't known before processing; approximate minutes from
    // size (1 MB ≈ 1 min of typical compressed audio). Replace with real
    // transcription duration once Whisper segments are parsed in production.
    const isAudio = fileType.startsWith("audio/") || fileType.startsWith("video/");
    const estimatedDurationMinutes = isAudio
      ? Math.max(1, Math.round(file.size / (1024 * 1024)))
      : undefined;
    const estimate = estimateCredits(fileType, file.size, {
      estimatedDurationMinutes,
    });

    let overage = false;
    try {
      const deduction = await deductCredits({
        userId: session.user.id,
        credits: estimate.credits,
        reason: `${estimate.processingType}:${file.name}`,
        fileRecordId: fileRecord.id,
      });
      overage = deduction.overage;
    } catch (creditErr) {
      // Never let a credit error block the result the user already paid for.
      console.error("[upload POST] credit deduction error:", creditErr);
    }

    await syncBatchStatus(batch.id);
    await db.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    const updatedBatch = await db.uploadBatch.findUnique({
      where: { id: batch.id },
      select: { status: true },
    });

    return NextResponse.json(
      {
        fileRecordId: fileRecord.id,
        projectId,
        batchId: batch.id,
        batchStatus: updatedBatch?.status ?? "PROCESSING",
        status: "complete",
        creditsUsed: estimate.credits,
        overage,
        cleaningActions: result.cleaningActions,
        confidenceScore: result.confidenceScore,
        flaggedForReview: result.flaggedForReview,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[upload POST] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
