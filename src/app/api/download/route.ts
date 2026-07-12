import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBytes } from "@/lib/utils";
import JSZip from "jszip";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await db.fileRecord.findMany({
    where: {
      batch: { project: { userId: session.user.id } },
    },
    include: {
      batch: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (files.length === 0) {
    return NextResponse.json({ error: "No files to export" }, { status: 400 });
  }

  const totalFiles = files.length;
  const avgScore = files.reduce((s, f) => s + (f.confidenceScore ?? 0), 0) / totalFiles;
  const ts = Date.now();

  const datacard = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.user.email,
    totalFiles,
    avgConfidenceScore: Math.round(avgScore * 1000) / 1000,
    flaggedCount: files.filter((f) => f.flaggedForReview).length,
    fileTypes: files.reduce<Record<string, number>>((acc, f) => {
      acc[f.fileType] = (acc[f.fileType] ?? 0) + 1;
      return acc;
    }, {}),
    cleaningActionsSummary: files
      .flatMap((f) => (f.cleaningActions ?? []))
      .reduce<Record<string, number>>((acc, a) => {
        if (a && typeof a === "object" && "type" in a) {
          acc[(a as { type: string }).type] = ((acc[(a as { type: string }).type] ?? 0) + 1);
        }
        return acc;
      }, {}),
    files: files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      fileType: f.fileType,
      size: formatBytes(f.sizeBytes ?? 0),
      confidenceScore: f.confidenceScore ?? 0,
      flaggedForReview: f.flaggedForReview,
      cleaningActions: f.cleaningActions ?? [],
      uploadedAt: f.createdAt.toISOString(),
    })),
  };

  const separator = "─".repeat(72);
  const cleanedDataText = files
    .map(
      (f, i) =>
        `${separator}\nFile ${i + 1} of ${totalFiles}: ${f.originalName}\nType: ${f.fileType} · Score: ${((f.confidenceScore ?? 0) * 100).toFixed(0)}%\n${separator}\n\n${f.cleanedContent ?? ""}\n`
    )
    .join("\n");

  const zip = new JSZip();
  zip.file("datacard.json", JSON.stringify(datacard, null, 2));
  zip.file("cleaned-data.txt", cleanedDataText);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const filename = `dataforge-export-${ts}.zip`;
  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Expose-Headers": "Content-Disposition",
    },
  });
}
