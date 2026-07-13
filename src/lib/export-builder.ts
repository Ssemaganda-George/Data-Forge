import JSZip from "jszip";
import { formatBytes } from "@/lib/utils";
import { generateDataCard } from "@/lib/data-card";
import {
  formatVoiceDisplay,
  parseVoiceCleanedContent,
} from "@/lib/project-ui";

export type ExportFormat = "CSV" | "JSON" | "PARQUET" | "COCO";

export interface ExportFileRow {
  id: string;
  originalName: string;
  fileType: string;
  sizeBytes: number | null;
  cleaningActions: unknown;
  confidenceScore: number | null;
  flaggedForReview: boolean;
  cleanedContent: string | null;
  createdAt: Date;
}

function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildDatacardJson(files: ExportFileRow[], exportedBy: string) {
  const totalFiles = files.length;
  const avgScore =
    totalFiles > 0
      ? files.reduce((s, f) => s + (f.confidenceScore ?? 0), 0) / totalFiles
      : 0;

  return {
    exportedAt: new Date().toISOString(),
    exportedBy,
    totalFiles,
    avgConfidenceScore: Math.round(avgScore * 1000) / 1000,
    flaggedCount: files.filter((f) => f.flaggedForReview).length,
    aiProviders: [
      ...new Set(
        files
          .map((f) =>
            f.cleanedContent
              ? parseVoiceCleanedContent(f.cleanedContent)?.provider
              : undefined
          )
          .filter((p): p is "sunbird" | "groq" => p === "sunbird" || p === "groq")
      ),
    ],
    fileTypes: files.reduce<Record<string, number>>((acc, f) => {
      acc[f.fileType] = (acc[f.fileType] ?? 0) + 1;
      return acc;
    }, {}),
    cleaningActionsSummary: files
      .flatMap((f) => (Array.isArray(f.cleaningActions) ? f.cleaningActions : []))
      .reduce<Record<string, number>>((acc, a) => {
        if (a && typeof a === "object" && "type" in a) {
          const type = (a as { type: string }).type;
          acc[type] = (acc[type] ?? 0) + 1;
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
}

export function buildCleanedDataText(files: ExportFileRow[]) {
  const separator = "─".repeat(72);
  return files
    .map((f, i) => {
      const voice = f.cleanedContent
        ? parseVoiceCleanedContent(f.cleanedContent)
        : null;
      const body = voice
        ? formatVoiceDisplay(voice)
        : (f.cleanedContent ?? "");
      return `${separator}\nFile ${i + 1} of ${files.length}: ${f.originalName}\nType: ${f.fileType} · Score: ${((f.confidenceScore ?? 0) * 100).toFixed(0)}%\n${separator}\n\n${body}\n`;
    })
    .join("\n");
}

export function buildCsv(files: ExportFileRow[]) {
  const header = "id,originalName,fileType,confidenceScore,flaggedForReview,cleanedContent";
  const rows = files.map((f) =>
    [
      f.id,
      escapeCsv(f.originalName),
      escapeCsv(f.fileType),
      (f.confidenceScore ?? 0).toFixed(4),
      f.flaggedForReview ? "true" : "false",
      escapeCsv(f.cleanedContent ?? ""),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}

export function buildJsonDataset(files: ExportFileRow[]) {
  return JSON.stringify(
    files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      fileType: f.fileType,
      confidenceScore: f.confidenceScore ?? 0,
      flaggedForReview: f.flaggedForReview,
      cleanedContent: f.cleanedContent ?? "",
      cleaningActions: f.cleaningActions ?? [],
    })),
    null,
    2
  );
}

export function buildCocoJson(files: ExportFileRow[]) {
  const images = files
    .filter((f) => f.fileType.startsWith("image/"))
    .map((f, i) => ({
      id: i + 1,
      file_name: f.originalName,
      width: 0,
      height: 0,
    }));

  return JSON.stringify(
    {
      info: { description: "DataForge export", version: "1.0" },
      images,
      annotations: [],
      categories: [{ id: 1, name: "object", supercategory: "none" }],
    },
    null,
    2
  );
}

export async function buildExportZip(
  files: ExportFileRow[],
  format: ExportFormat,
  exportedBy: string
) {
  const zip = new JSZip();
  const datacard = buildDatacardJson(files, exportedBy);
  zip.file("datacard.json", JSON.stringify(datacard, null, 2));
  zip.file("cleaned-data.txt", buildCleanedDataText(files));

  switch (format) {
    case "CSV":
      zip.file("dataset.csv", buildCsv(files));
      break;
    case "JSON":
      zip.file("dataset.json", buildJsonDataset(files));
      break;
    case "COCO":
      zip.file("annotations.coco.json", buildCocoJson(files));
      break;
    case "PARQUET":
      // Parquet requires an extra dependency; ship JSON alongside for now.
      zip.file("dataset.json", buildJsonDataset(files));
      zip.file("README.txt", "Parquet export is not yet available. Use dataset.json or CSV.");
      break;
  }

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export function buildBatchDataCard(batchId: string, files: ExportFileRow[]) {
  return generateDataCard(
    batchId,
    files.map((f) => ({
      fileType: f.fileType,
      sizeMb: (f.sizeBytes ?? 0) / (1024 * 1024),
      cleaningActions: Array.isArray(f.cleaningActions)
        ? (f.cleaningActions as { type: string; description: string; appliedAt: string }[])
        : [],
      confidenceScore: f.confidenceScore ?? 0,
      flaggedForReview: f.flaggedForReview,
      rejected: false,
    }))
  );
}
