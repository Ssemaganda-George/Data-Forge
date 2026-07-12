/**
 * Stub implementation — replace with Tesseract / AWS Textract call.
 * Accepts: application/pdf
 */
import type { FileRecord } from "@prisma/client";
import type { CleaningPipeline, CleaningResult } from "./index";

export class PdfOcrCleaner implements CleaningPipeline {
  accepts(fileType: string): boolean {
    return fileType === "application/pdf";
  }

  async process(file: FileRecord): Promise<CleaningResult> {
    // TODO: call Python FastAPI /ocr endpoint
    await new Promise((r) => setTimeout(r, 300));

    return {
      fileRecordId: file.id,
      cleaningActions: [
        {
          type: "OCR_EXTRACTION",
          description: "Text extracted from PDF via OCR",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "PII_REDACTION",
          description: "PII scan completed — 0 items redacted",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "LANGUAGE_DETECT",
          description: "Language detected: en",
          appliedAt: new Date().toISOString(),
        },
      ],
      confidenceScore: 0.88,
      flaggedForReview: false,
      metadata: { pageCount: 1, language: "en" },
    };
  }
}
