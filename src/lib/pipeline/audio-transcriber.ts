/**
 * Stub implementation — replace with Whisper / AWS Transcribe call.
 * Accepts: audio/*, video/*
 */
import type { FileRecord } from "@prisma/client";
import type { CleaningPipeline, CleaningResult } from "./index";

export class AudioTranscriber implements CleaningPipeline {
  accepts(fileType: string): boolean {
    return fileType.startsWith("audio/") || fileType.startsWith("video/");
  }

  async process(file: FileRecord): Promise<CleaningResult> {
    // TODO: call Python FastAPI /transcribe endpoint
    await new Promise((r) => setTimeout(r, 500));

    return {
      fileRecordId: file.id,
      cleaningActions: [
        {
          type: "AUDIO_TRANSCRIPTION",
          description: "Audio transcribed to text",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "LANGUAGE_DETECT",
          description: "Language detected: en",
          appliedAt: new Date().toISOString(),
        },
        {
          type: "SPEAKER_DIARIZE",
          description: "2 speakers identified",
          appliedAt: new Date().toISOString(),
        },
      ],
      confidenceScore: 0.82,
      flaggedForReview: false,
      metadata: { durationSeconds: 0, language: "en", speakerCount: 2 },
    };
  }
}
