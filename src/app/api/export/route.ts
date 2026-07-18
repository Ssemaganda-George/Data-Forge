import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  buildBatchDataCard,
  buildExportZip,
} from "@/lib/export-builder";
import { pushToGitHub, pushToKaggle } from "@/lib/export-destinations";
import { resolveExportFiles } from "@/lib/export-scope";
import {
  incrementSiteStat,
  DATASETS_GENERATED_KEY,
} from "@/lib/site-stats";

const exportSchema = z.object({
  batchId: z.string(),
  format: z.enum(["CSV", "JSON", "PARQUET", "COCO"]),
  destination: z.enum(["kaggle", "github"]).optional(),
  title: z.string().optional(),
  repo: z.string().optional(),
  tag: z.string().optional(),
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

  const { batchId, format, destination, title, repo, tag } = parsed.data;

  const batch = await db.uploadBatch.findFirst({
    where: {
      id: batchId,
      project: { userId: session.user.id },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const files = await resolveExportFiles(session.user.id, { batchId });
  if (files.length === 0) {
    return NextResponse.json({ error: "No files in this batch" }, { status: 400 });
  }

  const dataCard = buildBatchDataCard(batchId, files);
  const zipBuffer = await buildExportZip(
    files,
    format,
    session.user.email ?? "unknown"
  );

  const defaultTitle = `YoDataSet batch ${batchId.slice(0, 8)}`;

  if (destination === "kaggle") {
    try {
      const result = await pushToKaggle(
        session.user.id,
        zipBuffer,
        title?.trim() || defaultTitle
      );
      await db.datasetExport.create({ data: { batchId, format } });
      await incrementSiteStat(DATASETS_GENERATED_KEY, 1);
      return NextResponse.json({ ok: true, ...result, dataCard });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kaggle upload failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (destination === "github") {
    if (!repo?.trim()) {
      return NextResponse.json({ error: "GitHub repo (owner/name) is required" }, { status: 400 });
    }
    try {
      const result = await pushToGitHub(
        session.user.id,
        zipBuffer,
        repo.trim(),
        title?.trim() || defaultTitle,
        tag?.trim()
      );
      await db.datasetExport.create({ data: { batchId, format } });
      await incrementSiteStat(DATASETS_GENERATED_KEY, 1);
      return NextResponse.json({ ok: true, ...result, dataCard });
    } catch (err) {
      const message = err instanceof Error ? err.message : "GitHub upload failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const exportRecord = await db.datasetExport.create({
    data: { batchId, format },
  });
  await incrementSiteStat(DATASETS_GENERATED_KEY, 1);

  const filename = `yodataset-${batchId.slice(0, 8)}-${format.toLowerCase()}.zip`;
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
