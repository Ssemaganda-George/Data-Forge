import { db } from "@/lib/db";
import type { BatchStatus, FileStatus, ProjectModule } from "@prisma/client";
import { format, formatDistanceToNow, startOfMonth, subMonths } from "date-fns";
import {
  type BadgeVariant,
  batchStatusToBadge,
  fileStatusToBadge,
  moduleLabel,
  parseCleaningActions,
} from "@/lib/project-ui";

export type { BadgeVariant, CleaningActionSummary } from "@/lib/project-ui";
export { batchStatusToBadge, fileStatusToBadge, moduleLabel, parseCleaningActions };

export async function getDashboardStats(userId: string) {
  const where = { batch: { project: { userId } } };

  const [filesProcessed, datasetsReady, avgQuality, storageSum] =
    await Promise.all([
      db.fileRecord.count({ where }),
      db.datasetExport.count({ where: { batch: { project: { userId } } } }),
      db.fileRecord.aggregate({
        where: { ...where, confidenceScore: { not: null } },
        _avg: { confidenceScore: true },
      }),
      db.fileRecord.aggregate({
        where,
        _sum: { sizeBytes: true },
      }),
    ]);

  return {
    filesProcessed,
    datasetsReady,
    avgQualityScore: avgQuality._avg.confidenceScore
      ? Math.round(avgQuality._avg.confidenceScore * 100)
      : null,
    storageUsedBytes: storageSum._sum.sizeBytes ?? 0,
  };
}

export async function getProjectsForUser(userId: string) {
  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      batches: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { _count: { select: { files: true } } },
      },
    },
  });

  return projects.map((p) => {
    const batch = p.batches[0];
    return {
      id: p.id,
      name: p.name,
      module: p.module,
      batchStatus: (batch?.status ?? "PENDING") as BatchStatus,
      fileCount: batch?._count.files ?? 0,
      createdAt: format(p.createdAt, "MMM d, yyyy"),
      updatedAt: formatDistanceToNow(p.updatedAt, { addSuffix: true }),
    };
  });
}

export async function getProjectDetail(userId: string, projectId: string) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    include: {
      batches: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          files: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!project) return null;

  let batch = project.batches[0];
  if (!batch) {
    const created = await db.uploadBatch.create({
      data: { projectId: project.id, status: "PENDING" },
      include: { files: true },
    });
    batch = created;
  }

  const files = batch.files;
  const processedCount = files.filter(
    (f) => f.status === "COMPLETE" || f.status === "FAILED"
  ).length;
  const flaggedCount = files.filter((f) => f.flaggedForReview).length;

  return {
    id: project.id,
    name: project.name,
    module: project.module,
    batchId: batch.id,
    batchStatus: batch.status,
    fileCount: files.length,
    processedCount,
    flaggedCount,
    files: files.map((f) => ({
      id: f.id,
      name: f.originalName,
      type: f.fileType,
      status: f.status,
      flagged: f.flaggedForReview,
      score: f.confidenceScore,
      cleanedContent: f.cleanedContent ?? "",
      actions: parseCleaningActions(f.cleaningActions),
    })),
  };
}

export async function resolveUploadBatch(
  userId: string,
  projectId: string,
  batchId?: string | null
) {
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) return null;

  if (batchId) {
    const existing = await db.uploadBatch.findFirst({
      where: { id: batchId, projectId },
    });
    if (existing) return existing;
  }

  const latest = await db.uploadBatch.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  if (latest) return latest;

  return db.uploadBatch.create({
    data: { projectId, status: "PENDING" },
  });
}

export async function syncBatchStatus(batchId: string) {
  const files = await db.fileRecord.findMany({ where: { batchId } });

  if (files.length === 0) {
    return db.uploadBatch.update({
      where: { id: batchId },
      data: { status: "PENDING" },
    });
  }

  if (files.some((f) => f.status === "PENDING" || f.status === "PROCESSING")) {
    return db.uploadBatch.update({
      where: { id: batchId },
      data: { status: "PROCESSING" },
    });
  }

  if (files.every((f) => f.status === "FAILED")) {
    return db.uploadBatch.update({
      where: { id: batchId },
      data: { status: "FAILED" },
    });
  }

  if (files.some((f) => f.flaggedForReview && f.status === "COMPLETE")) {
    return db.uploadBatch.update({
      where: { id: batchId },
      data: { status: "REVIEW" },
    });
  }

  return db.uploadBatch.update({
    where: { id: batchId },
    data: { status: "COMPLETE" },
  });
}

export async function getDatasetsForUser(userId: string) {
  const exports = await db.datasetExport.findMany({
    where: { batch: { project: { userId } } },
    orderBy: { createdAt: "desc" },
    include: {
      batch: {
        include: {
          project: { select: { name: true } },
          files: { select: { sizeBytes: true } },
        },
      },
    },
  });

  return exports.map((exp) => {
    const sizeBytes = exp.batch.files.reduce(
      (sum, f) => sum + (f.sizeBytes ?? 0),
      0
    );
    return {
      id: exp.id,
      name: `${exp.batch.project.name} — ${exp.format}`,
      format: exp.format,
      project: exp.batch.project.name,
      fileCount: exp.batch.files.length,
      sizeBytes,
      downloadUrl: exp.downloadUrl,
      createdAt: format(exp.createdAt, "MMM d, yyyy"),
    };
  });
}

const PLAN_LIMIT_GB = 100;

export async function getUsageForUser(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const chartStart = startOfMonth(subMonths(now, 5));

  const files = await db.fileRecord.findMany({
    where: {
      batch: { project: { userId } },
      createdAt: { gte: chartStart },
    },
    select: { sizeBytes: true, createdAt: true },
  });

  const totalFiles = await db.fileRecord.count({
    where: { batch: { project: { userId } } },
  });

  const monthFiles = files.filter((f) => f.createdAt >= monthStart);
  const monthBytes = monthFiles.reduce(
    (sum, f) => sum + (f.sizeBytes ?? 0),
    0
  );
  const monthGb = monthBytes / 1024 ** 3;

  const months: { month: string; gb: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const key = format(d, "MMM");
    const start = startOfMonth(d);
    const end = startOfMonth(subMonths(d, -1));
    const bytes = files
      .filter((f) => f.createdAt >= start && f.createdAt < end)
      .reduce((sum, f) => sum + (f.sizeBytes ?? 0), 0);
    months.push({ month: key, gb: Math.round((bytes / 1024 ** 3) * 10) / 10 });
  }

  const nextReset = startOfMonth(subMonths(now, -1));

  return {
    monthGb: Math.round(monthGb * 10) / 10,
    monthFileCount: monthFiles.length,
    totalFiles,
    planLimitGb: PLAN_LIMIT_GB,
    planRemainingGb: Math.max(
      0,
      Math.round((PLAN_LIMIT_GB - monthGb) * 10) / 10
    ),
    months,
    resetDate: format(nextReset, "d MMMM yyyy"),
    quotaPercent: Math.min(100, Math.round((monthGb / PLAN_LIMIT_GB) * 100)),
  };
}
