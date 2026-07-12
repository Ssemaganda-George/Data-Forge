import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  buildBatchDataCard,
  buildExportZip,
  type ExportFileRow,
} from "@/lib/export-builder";

const exportSchema = z.object({
  batchId: z.string(),
  format: z.enum(["CSV", "JSON", "PARQUET", "COCO"]),
});

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
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

  const files: ExportFileRow[] = batch.files;
  const dataCard = buildBatchDataCard(batchId, files);
  const zipBuffer = await buildExportZip(
    files,
    format,
    session.user.email ?? "unknown"
  );

  const exportRecord = await db.datasetExport.create({
    data: { batchId, format },
  });

  const filename = `dataforge-${batchId.slice(0, 8)}-${format.toLowerCase()}.zip`;
  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 201,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Export-Id": exportRecord.id,
      "X-Data-Card": JSON.stringify(dataCard),
      "Access-Control-Expose-Headers": "Content-Disposition, X-Export-Id, X-Data-Card",
    },
  });
}
