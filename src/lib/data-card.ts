/**
 * Data Card generator.
 * Produces a structured JSON summary of a completed batch's cleaning results.
 */

import type { CleaningAction } from "./pipeline/index";

export interface DataCard {
  batchId: string;
  generatedAt: string;
  sourceSummary: {
    totalFiles: number;
    fileTypes: Record<string, number>;
    totalSizeMb: number;
  };
  cleaningActions: { type: string; count: number; description: string }[];
  qualityStats: {
    avgConfidenceScore: number;
    flaggedCount: number;
    acceptedCount: number;
    rejectedCount: number;
  };
}

interface FileCleaningSummary {
  fileType: string;
  sizeMb: number;
  cleaningActions: CleaningAction[];
  confidenceScore: number;
  flaggedForReview: boolean;
  rejected: boolean;
}

export function generateDataCard(
  batchId: string,
  files: FileCleaningSummary[]
): DataCard {
  const fileTypes: Record<string, number> = {};
  const actionCounts: Record<string, { count: number; description: string }> = {};
  let totalSize = 0;
  let totalScore = 0;
  let flagged = 0;
  let rejected = 0;

  for (const f of files) {
    fileTypes[f.fileType] = (fileTypes[f.fileType] ?? 0) + 1;
    totalSize += f.sizeMb;
    totalScore += f.confidenceScore;
    if (f.flaggedForReview) flagged++;
    if (f.rejected) rejected++;

    for (const action of f.cleaningActions) {
      const entry = actionCounts[action.type] ?? {
        count: 0,
        description: action.description,
      };
      entry.count++;
      actionCounts[action.type] = entry;
    }
  }

  return {
    batchId,
    generatedAt: new Date().toISOString(),
    sourceSummary: {
      totalFiles: files.length,
      fileTypes,
      totalSizeMb: Math.round(totalSize * 100) / 100,
    },
    cleaningActions: Object.entries(actionCounts).map(([type, v]) => ({
      type,
      count: v.count,
      description: v.description,
    })),
    qualityStats: {
      avgConfidenceScore:
        files.length > 0
          ? Math.round((totalScore / files.length) * 1000) / 1000
          : 0,
      flaggedCount: flagged,
      acceptedCount: files.length - flagged - rejected,
      rejectedCount: rejected,
    },
  };
}
