import {
  CREDIT_COSTS,
  DEFAULT_CREDIT_COST,
  type CreditCostRule,
  type ProcessingType,
} from "./creditCosts";

const MB = 1024 * 1024;

/**
 * Classify an uploaded file into a processing type so we can price it.
 * Audio / video → transcription (most expensive). Scanned / image-heavy PDFs →
 * OCR. Plain PDFs / docs → text. Spreadsheets → cheapest.
 */
export function classifyFile(
  fileType: string,
  sizeBytes: number,
  opts?: { estimatedDurationMinutes?: number; imageHeavyPdf?: boolean }
): ProcessingType {
  if (fileType.startsWith("audio/") || fileType.startsWith("video/")) {
    return "audio_transcription";
  }
  if (fileType.startsWith("image/")) {
    return "image";
  }
  if (fileType === "application/pdf") {
    return opts?.imageHeavyPdf ? "ocr_pdf" : "text_pdf";
  }
  if (
    fileType === "text/csv" ||
    fileType === "text/tab-separated-values" ||
    fileType.includes("spreadsheet") ||
    fileType.includes("excel")
  ) {
    return "spreadsheet";
  }
  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "application/msword" ||
    fileType === "text/plain" ||
    fileType === "text/markdown"
  ) {
    return "text_pdf";
  }
  // Unknown — fall back to text cost; size-based.
  return sizeBytes > 5 * MB ? "ocr_pdf" : "text_pdf";
}

export interface CreditEstimate {
  rule: CreditCostRule;
  processingType: ProcessingType;
  /** Estimated credits for this file (rounded up to a whole credit). */
  credits: number;
  /** Number of billing units (MB or minutes). */
  units: number;
}

/**
 * Estimate the credit cost of a single file. Returns 0 when the processing
 * type is duration-based but no duration is known yet (caller can re-estimate
 * after transcription).
 */
export function estimateCredits(
  fileType: string,
  sizeBytes: number,
  opts?: { estimatedDurationMinutes?: number; imageHeavyPdf?: boolean }
): CreditEstimate {
  const processingType = classifyFile(fileType, sizeBytes, opts);
  const rule = CREDIT_COSTS[processingType] ?? DEFAULT_CREDIT_COST;

  let units: number;
  if (rule.unit === "minute") {
    units = opts?.estimatedDurationMinutes ?? 0;
  } else {
    units = sizeBytes / MB;
  }

  const credits = Math.max(1, Math.ceil(units * rule.creditsPerUnit));

  return { rule, processingType, credits, units };
}

/** Re-estimate an audio/video file once its real duration (minutes) is known. */
export function estimateAudioCredits(durationMinutes: number): CreditEstimate {
  const rule = CREDIT_COSTS.audio_transcription;
  const credits = Math.max(1, Math.ceil(durationMinutes * rule.creditsPerUnit));
  return {
    rule,
    processingType: "audio_transcription",
    credits,
    units: durationMinutes,
  };
}
