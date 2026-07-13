import type { BatchStatus, FileStatus } from "@prisma/client";

export type BadgeVariant =
  | "processing"
  | "ready"
  | "flagged"
  | "failed"
  | "pending";

export type CleaningActionSummary = {
  type: string;
  description: string;
};

export function batchStatusToBadge(status: BatchStatus): BadgeVariant {
  const map: Record<BatchStatus, BadgeVariant> = {
    PENDING: "pending",
    PROCESSING: "processing",
    REVIEW: "flagged",
    COMPLETE: "ready",
    FAILED: "failed",
  };
  return map[status];
}

export function fileStatusToBadge(
  status: FileStatus,
  flagged?: boolean
): BadgeVariant {
  if (flagged) return "flagged";
  const map: Record<FileStatus, BadgeVariant> = {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETE: "ready",
    FAILED: "failed",
  };
  return map[status];
}

export function moduleLabel(module: string): string {
  if (module === "LANGUAGE_VOICE") return "Language & voice";
  if (module === "BUSINESS_DATA") return "Business data";
  return "General";
}

export function parseCleaningActions(raw: unknown): CleaningActionSummary[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    if (typeof item === "string") {
      return { type: item, description: "" };
    }
    if (item && typeof item === "object" && "type" in item) {
      const action = item as { type?: string; description?: string };
      return {
        type: action.type ?? "unknown",
        description: action.description ?? "",
      };
    }
    return { type: "unknown", description: "" };
  });
}
