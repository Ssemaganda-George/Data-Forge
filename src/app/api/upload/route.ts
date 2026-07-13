import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { runProcessing } from "@/lib/memory-store";
import { resolveUploadBatch, syncBatchStatus } from "@/lib/project-queries";

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
      result = await runProcessing(fileType, buffer);

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
