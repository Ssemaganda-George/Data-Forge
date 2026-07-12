// =============================================================================
// EXPORT ROUTE — DB MODE only
//
// Reads FileRecord rows from the database and generates a DatasetExport entry.
// In TEMP MODE use /api/download instead (works from memory-store).
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateDataCard } from "@/lib/data-card";

const exportSchema = z.object({
  batchId: z.string(),
  format: z.enum(["CSV", "JSON", "PARQUET", "COCO"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = exportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { batchId, format } = parsed.data;

  const batch = await db.uploadBatch.findFirst({
    where: {
      id: batchId,
      project: { userId: session.user.id },
    },
    include: { files: true },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  // Generate data card
  const dataCard = generateDataCard(
    batchId,
    batch.files.map((f) => ({
      fileType: f.fileType,
      sizeMb: 0,
      cleaningActions: Array.isArray(f.cleaningActions)
        ? (f.cleaningActions as { type: string; description: string; appliedAt: string }[])
        : [],
      confidenceScore: f.confidenceScore ?? 0,
      flaggedForReview: f.flaggedForReview,
      rejected: false,
    }))
  );

  // TODO: generate actual file using format — stub returns data card JSON
  const exportRecord = await db.datasetExport.create({
    data: {
      batchId,
      format,
      downloadUrl: null, // set after actual file generation
      dataCardUrl: null,
    },
  });

  return NextResponse.json({ exportId: exportRecord.id, dataCard }, { status: 201 });
}
