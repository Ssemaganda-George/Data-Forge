import JSZip from "jszip";
import { formatBytes } from "@/lib/utils";
import { generateDataCard } from "@/lib/data-card";
import {
  formatVoiceDisplay,
  parseVoiceCleanedContent,
  parseCleaningActions,
} from "@/lib/project-ui";
import { extractAiReport } from "@/lib/trial/report";

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

export interface ImageDatasetRecord {
  classification: "document" | "photo";
  caption: string;
  tags: string[];
  keyDetails: string;
  expectedOutput: string;
  extractedText: string;
}

function grabReportSection(report: string, heading: string): string {
  const idx = report.indexOf(`${heading}:`);
  if (idx === -1) return "";
  const after = report.slice(idx + heading.length + 1);
  const next = after.search(/\n[A-Z][A-Za-z ]*:/);
  return (next === -1 ? after : after.slice(0, next)).trim();
}

/**
 * Turn an image file's cleaning-pipeline output into structured fields that
 * are directly usable for model training (caption/classification datasets),
 * rather than just a blob of report text. Returns null for non-image files
 * or images that predate the IMAGE_CLASSIFICATION step.
 */
export function buildImageDatasetRecord(f: ExportFileRow): ImageDatasetRecord | null {
  if (!f.fileType.startsWith("image/")) return null;

  const actions = parseCleaningActions(f.cleaningActions);
  const classificationAction = actions.find((a) => a.type === "IMAGE_CLASSIFICATION");
  if (!classificationAction) return null;

  const classification: "document" | "photo" = /document/i.test(
    classificationAction.description
  )
    ? "document"
    : "photo";

  if (classification === "document") {
    return {
      classification,
      caption: "",
      tags: [],
      keyDetails: "",
      expectedOutput: "",
      extractedText: f.cleanedContent ?? "",
    };
  }

  const report = f.cleanedContent ? extractAiReport(f.cleanedContent) : null;
  const tagsRaw = report ? grabReportSection(report, "Tags") : "";

  return {
    classification,
    caption: report ? grabReportSection(report, "Summary") : "",
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
    keyDetails: report ? grabReportSection(report, "Key Details") : "",
    expectedOutput: report ? grabReportSection(report, "Expected Output") : "",
    extractedText: "",
  };
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
    aiProviders: Array.from(
      new Set(
        files
          .map((f) =>
            f.cleanedContent
              ? parseVoiceCleanedContent(f.cleanedContent)?.provider
              : undefined
          )
          .filter((p): p is "sunbird" | "groq" => p === "sunbird" || p === "groq")
      )
    ),
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
  const header =
    "id,originalName,fileType,confidenceScore,flaggedForReview,imageClassification,imageCaption,imageTags,cleanedContent";
  const rows = files.map((f) => {
    const img = buildImageDatasetRecord(f);
    return [
      f.id,
      escapeCsv(f.originalName),
      escapeCsv(f.fileType),
      (f.confidenceScore ?? 0).toFixed(4),
      f.flaggedForReview ? "true" : "false",
      escapeCsv(img?.classification ?? ""),
      escapeCsv(img?.caption ?? ""),
      escapeCsv(img?.tags.join("; ") ?? ""),
      escapeCsv(f.cleanedContent ?? ""),
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

export function buildJsonDataset(files: ExportFileRow[]) {
  return JSON.stringify(
    files.map((f) => {
      const imageAnalysis = buildImageDatasetRecord(f);
      return {
        id: f.id,
        originalName: f.originalName,
        fileType: f.fileType,
        confidenceScore: f.confidenceScore ?? 0,
        flaggedForReview: f.flaggedForReview,
        cleanedContent: f.cleanedContent ?? "",
        cleaningActions: f.cleaningActions ?? [],
        ...(imageAnalysis ? { imageAnalysis } : {}),
      };
    }),
    null,
    2
  );
}

export function buildCocoJson(files: ExportFileRow[]) {
  const imageFiles = files.filter((f) => f.fileType.startsWith("image/"));

  const categoryIds = new Map<string, number>();
  const categories: { id: number; name: string; supercategory: string }[] = [];
  const categoryId = (tag: string): number => {
    const key = tag.toLowerCase();
    let id = categoryIds.get(key);
    if (!id) {
      id = categories.length + 1;
      categoryIds.set(key, id);
      categories.push({ id, name: tag, supercategory: "none" });
    }
    return id;
  };

  const images: { id: number; file_name: string; width: number; height: number }[] = [];
  // COCO Captions-style annotations (image-level, no bounding boxes).
  const annotations: { id: number; image_id: number; caption: string }[] = [];
  // Not part of the official COCO schema, but a practical addition: which
  // tag/category ids apply to each image, for classification-style training.
  const imageTags: { image_id: number; category_ids: number[] }[] = [];
  let annotationId = 1;

  imageFiles.forEach((f, i) => {
    const imageId = i + 1;
    images.push({ id: imageId, file_name: f.originalName, width: 0, height: 0 });

    const record = buildImageDatasetRecord(f);
    if (!record || record.classification !== "photo") return;

    if (record.caption) {
      annotations.push({ id: annotationId++, image_id: imageId, caption: record.caption });
    }
    if (record.tags.length > 0) {
      imageTags.push({ image_id: imageId, category_ids: record.tags.map(categoryId) });
    }
  });

  return JSON.stringify(
    {
      info: {
        description:
          "YoDataSet export — image captions (COCO Captions format) and tag-based categories",
        version: "1.0",
      },
      images,
      annotations,
      categories: categories.length > 0 ? categories : [{ id: 1, name: "object", supercategory: "none" }],
      image_tags: imageTags,
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
