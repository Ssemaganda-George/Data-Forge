import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFiles } from "@/lib/memory-store";
import { formatBytes } from "@/lib/utils";
import JSZip from "jszip";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = getFiles(session.user.id);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files to export" }, { status: 400 });
  }

  const totalFiles = files.length;
  const avgScore = files.reduce((s, f) => s + f.confidenceScore, 0) / totalFiles;
  const ts = Date.now();

  // ── 1. datacard.json ──────────────────────────────────────────────────────
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
      .flatMap((f) => f.cleaningActions)
      .reduce<Record<string, number>>((acc, a) => {
        acc[a.type] = (acc[a.type] ?? 0) + 1;
        return acc;
      }, {}),
    files: files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      fileType: f.fileType,
      size: formatBytes(f.sizeBytes),
      confidenceScore: f.confidenceScore,
      flaggedForReview: f.flaggedForReview,
      cleaningActions: f.cleaningActions,
      uploadedAt: f.uploadedAt,
    })),
  };

  // ── 2. cleaned-data.txt ───────────────────────────────────────────────────
  const separator = "─".repeat(72);
  const cleanedDataText = files
    .map(
      (f, i) =>
        `${separator}\nFile ${i + 1} of ${totalFiles}: ${f.originalName}\nType: ${f.fileType} · Size: ${formatBytes(f.sizeBytes)} · Score: ${(f.confidenceScore * 100).toFixed(0)}%\n${separator}\n\n${f.cleanedContent}\n`
    )
    .join("\n");

  // ── Build ZIP ─────────────────────────────────────────────────────────────
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
