/**
 * Stub implementation — replace with real ML/perceptual-hash logic.
 * Accepts: image/*, .jpg, .jpeg, .png, .webp
 */
import type { FileRecord } from "@prisma/client";
import type { CleaningPipeline, CleaningResult } from "./index";

export class ImageDeduper implements CleaningPipeline {
  accepts(fileType: string): boolean {
    return fileType.startsWith("image/");
  }

  async process(file: FileRecord): Promise<CleaningResult> {
    // TODO: call Python FastAPI service for perceptual hash dedup
    await new Promise((r) => setTimeout(r, 200)); // simulate latency

    return {
      fileRecordId: file.id,
      cleaningActions: [
        {
          type: "DEDUP_CHECK",
          description: "Perceptual hash computed — no duplicates found",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "METADATA_STRIP",
          description: "EXIF metadata removed",
          appliedAt: new Date().toISOString(),
        },
      ],
      confidenceScore: 0.95,
      flaggedForReview: false,
      metadata: { width: 0, height: 0, format: file.fileType },
    };
  }
}
