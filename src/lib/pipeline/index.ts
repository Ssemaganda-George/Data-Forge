import type { FileRecord } from "@prisma/client";

// ─── Core interface ───────────────────────────────────────────────────────────

export interface CleaningAction {
  type: string;
  description: string;
  appliedAt: string;
}

export interface CleaningResult {
  fileRecordId: string;
  cleaningActions: CleaningAction[];
  confidenceScore: number; // 0–1
  flaggedForReview: boolean;
  outputUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CleaningPipeline {
  /** Returns true if this pipeline handles the given file type */
  accepts(fileType: string): boolean;
  process(file: FileRecord): Promise<CleaningResult>;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const pipelines: CleaningPipeline[] = [];

export function registerPipeline(p: CleaningPipeline) {
  pipelines.push(p);
}

export function getPipelineFor(fileType: string): CleaningPipeline | null {
  return pipelines.find((p) => p.accepts(fileType)) ?? null;
}
