/**
 * Stub implementation — replace with pandas / openpyxl processing.
 * Accepts: CSV, XLSX, XLS, TSV
 */
import type { FileRecord } from "@prisma/client";
import type { CleaningPipeline, CleaningResult } from "./index";

const SPREADSHEET_TYPES = new Set([
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/tab-separated-values",
]);

export class SpreadsheetCleaner implements CleaningPipeline {
  accepts(fileType: string): boolean {
    return SPREADSHEET_TYPES.has(fileType);
  }

  async process(file: FileRecord): Promise<CleaningResult> {
    // TODO: call Python FastAPI /clean-spreadsheet endpoint
    await new Promise((r) => setTimeout(r, 250));

    return {
      fileRecordId: file.id,
      cleaningActions: [
        {
          type: "NULL_REMOVAL",
          description: "Empty rows and columns removed",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "SCHEMA_INFER",
          description: "Column types inferred from data",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "DEDUP_ROWS",
          description: "Duplicate rows removed",
          appliedAt: new Date().toISOString(),
        },
      ],
      confidenceScore: 0.91,
      flaggedForReview: false,
      metadata: { rowCount: 0, columnCount: 0 },
    };
  }
}
