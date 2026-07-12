// =============================================================================
// UPLOAD ROUTE — DB MODE
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { runProcessing } from "@/lib/memory-store";

const MAX_BYTES = 50 * 1024 * 1024;

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds 50 MB dev limit` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Get or create a default project for this user
  let project = await db.project.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!project) {
    project = await db.project.create({
      data: {
        userId: session.user.id,
        name: "Default Project",
        module: "GENERAL",
      },
      select: { id: true },
    });
  }

  const batch = await db.uploadBatch.create({
    data: {
      projectId: project.id,
      status: "PROCESSING",
    },
  });

  // Run processing
  const result = await runProcessing(file.type || "application/octet-stream", buffer);

  const fileRecord = await db.fileRecord.create({
    data: {
      batchId: batch.id,
      originalName: file.name,
      fileType: file.type || "application/octet-stream",
      storageUrl: "",
      status: "COMPLETE",
      cleaningActions: result.cleaningActions as any,
      confidenceScore: result.confidenceScore,
      flaggedForReview: result.flaggedForReview,
      processedAt: new Date(),
    },
  });

  return NextResponse.json(
    {
      fileRecordId: fileRecord.id,
      status: "complete",
      cleaningActions: result.cleaningActions,
      confidenceScore: result.confidenceScore,
      flaggedForReview: result.flaggedForReview,
    },
    { status: 201 }
  );
}

