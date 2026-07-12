// =============================================================================
// UPLOAD ROUTE
//
// ── TEMP MODE (active) ───────────────────────────────────────────────────────
// Stores files in process memory (memory-store.ts). No DB or S3 required.
// Files are lost on server restart or sign-out.
//
// ── DB MODE (commented out below) ────────────────────────────────────────────
// To restore: comment out the TEMP MODE block, uncomment the DB MODE block.
// Requires: DATABASE_URL, REDIS_URL, and storage env vars to be set.
// =============================================================================

// ── TEMP MODE ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addFile, runProcessing } from "@/lib/memory-store";
import { v4 as uuidv4 } from "uuid";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB per file in dev

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
  const id = uuidv4();

  // Run processing (async for PDF/text, sync for spreadsheets)
  const result = await runProcessing(file.type || "application/octet-stream", buffer);

  addFile({
    id,
    userId: session.user.id,
    originalName: file.name,
    fileType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    buffer,
    status: "complete",
    cleaningActions: result.cleaningActions,
    confidenceScore: result.confidenceScore,
    flaggedForReview: result.flaggedForReview,
    cleanedContent: result.cleanedContent,
    uploadedAt: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      fileRecordId: id,
      status: "complete",
      cleaningActions: result.cleaningActions,
      confidenceScore: result.confidenceScore,
      flaggedForReview: result.flaggedForReview,
    },
    { status: 201 }
  );
}
// ── END TEMP MODE ─────────────────────────────────────────────────────────────

// ── DB MODE (uncomment when DB + queue + storage are ready) ──────────────────
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { db } from "@/lib/db";
// import { getQueue } from "@/lib/queue";
// import { getStorage } from "@/lib/storage";
// import { v4 as uuidv4 } from "uuid";
//
// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//
//   const formData = await req.formData();
//   const file = formData.get("file") as File | null;
//   const projectId = formData.get("projectId") as string | null;
//   const batchId = formData.get("batchId") as string | null;
//
//   if (!file) {
//     return NextResponse.json({ error: "No file provided" }, { status: 400 });
//   }
//
//   // Validate batchId belongs to this user
//   if (batchId) {
//     const batch = await db.uploadBatch.findFirst({
//       where: { id: batchId, project: { userId: session.user.id } },
//     });
//     if (!batch) {
//       return NextResponse.json(
//         { error: "Batch not found or access denied" },
//         { status: 403 }
//       );
//     }
//   }
//
//   // Resolve or create batch
//   let resolvedBatchId = batchId;
//   if (!resolvedBatchId && projectId) {
//     const batch = await db.uploadBatch.create({
//       data: { projectId, status: "PENDING" },
//     });
//     resolvedBatchId = batch.id;
//   }
//   if (!resolvedBatchId) {
//     return NextResponse.json(
//       { error: "batchId or projectId is required" },
//       { status: 400 }
//     );
//   }
//
//   // Store file in S3 / MinIO
//   const buffer = Buffer.from(await file.arrayBuffer());
//   const key = `${session.user.id}/${resolvedBatchId}/${uuidv4()}-${file.name}`;
//   const storage = getStorage();
//   const { url } = await storage.upload(key, buffer, file.type);
//
//   // Persist FileRecord
//   const fileRecord = await db.fileRecord.create({
//     data: {
//       batchId: resolvedBatchId,
//       originalName: file.name,
//       fileType: file.type,
//       storageUrl: url,
//       status: "PENDING",
//     },
//   });
//
//   // Advance batch status
//   await db.uploadBatch.update({
//     where: { id: resolvedBatchId },
//     data: { status: "PROCESSING" },
//   });
//
//   // Log GB usage for billing
//   await db.usageLog.create({
//     data: {
//       userId: session.user.id,
//       gbProcessed: buffer.byteLength / (1024 * 1024 * 1024),
//       fileCount: 1,
//     },
//   });
//
//   // Enqueue async processing job (Redis → Python service)
//   const queue = getQueue();
//   await queue.enqueue({
//     jobId: uuidv4(),
//     fileRecordId: fileRecord.id,
//     batchId: resolvedBatchId,
//     fileType: file.type,
//     storageUrl: url,
//   });
//
//   return NextResponse.json({ fileRecordId: fileRecord.id }, { status: 201 });
// }
// ── END DB MODE ───────────────────────────────────────────────────────────────

