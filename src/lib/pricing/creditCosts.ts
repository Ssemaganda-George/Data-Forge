/**
 * Credit cost configuration.
 *
 * Credits reflect real processing cost, not raw file size. Audio transcription
 * and OCR are far more compute-expensive than spreadsheet / text cleaning, so
 * they consume more credits per unit.
 *
 * ⚠️ PLACEHOLDER MULTIPLIERS — tune these against real API quotes from our
 * OCR / transcription providers before launch. They are intentionally rough
 * until we have per-call cost data.
 */

export type ProcessingType = "spreadsheet" | "text_pdf" | "ocr_pdf" | "image" | "audio_transcription";

export interface CreditCostRule {
  /** Processing type identifier */
  type: ProcessingType;
  /** Human-readable label used in the UI / estimates */
  label: string;
  /** Credit cost per billing unit */
  creditsPerUnit: number;
  /**
   * Billing unit. Either "mb" (file size in megabytes) or "minute"
   * (audio/video duration in minutes, when known).
   */
  unit: "mb" | "minute";
}

export const CREDIT_COSTS: Record<ProcessingType, CreditCostRule> = {
  spreadsheet: {
    type: "spreadsheet",
    label: "Spreadsheet / CSV",
    creditsPerUnit: 1,
    unit: "mb",
  },
  text_pdf: {
    type: "text_pdf",
    label: "Text PDF",
    creditsPerUnit: 1,
    unit: "mb",
  },
  ocr_pdf: {
    type: "ocr_pdf",
    label: "OCR / scanned PDF",
    creditsPerUnit: 4,
    unit: "mb",
  },
  image: {
    type: "image",
    label: "Image",
    creditsPerUnit: 3,
    unit: "mb",
  },
  audio_transcription: {
    type: "audio_transcription",
    label: "Audio transcription",
    creditsPerUnit: 10,
    unit: "minute",
  },
};

/** Default credit cost used when a file type cannot be classified. */
export const DEFAULT_CREDIT_COST: CreditCostRule = {
  type: "text_pdf",
  label: "Unknown file",
  creditsPerUnit: 1,
  unit: "mb",
};
