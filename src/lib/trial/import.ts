import { db } from "@/lib/db";
import { getTrialResult, deleteTrialResult } from "./store";

/**
 * Import a free-trial result into a brand-new project for a freshly signed-up
 * user, so they don't have to re-upload the same file. The trial result was
 * already processed for free, so no credits are charged here.
 *
 * Returns the new project id, or null if the trial is missing/expired.
 */
export async function importTrialIntoNewAccount(
  userId: string,
  trialId: string
): Promise<string | null> {
  const trial = getTrialResult(trialId);
  if (!trial) return null;

  const project = await db.project.create({
    data: {
      userId,
      name: `Trial: ${trial.originalName}`,
      module: "GENERAL",
    },
  });

  const batch = await db.uploadBatch.create({
    data: { projectId: project.id, status: "COMPLETE" },
  });

  await db.fileRecord.create({
    data: {
      batchId: batch.id,
      originalName: trial.originalName,
      fileType: trial.fileType,
      storageUrl: "",
      status: "COMPLETE",
      sizeBytes: trial.sizeBytes,
      cleaningActions: trial.cleaningActions as object,
      confidenceScore: trial.confidenceScore,
      flaggedForReview: trial.flaggedForReview,
      cleanedContent: trial.cleanedContent,
    },
  });

  // Mark trial as converted (growth metric) and clean up short-lived storage.
  try {
    await db.trialUsage.updateMany({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      data: { convertedToUserId: userId },
    });
  } catch {
    /* best-effort */
  }
  deleteTrialResult(trialId);

  return project.id;
}
