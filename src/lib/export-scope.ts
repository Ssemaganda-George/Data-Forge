import { db } from "@/lib/db";
import type { ExportFileRow } from "@/lib/export-builder";

export interface ExportScope {
  fileId?: string;
  batchId?: string;
}

export async function resolveExportFiles(
  userId: string,
  scope: ExportScope = {}
): Promise<ExportFileRow[]> {
  if (scope.fileId) {
    const file = await db.fileRecord.findFirst({
      where: {
        id: scope.fileId,
        batch: { project: { userId } },
      },
    });
    return file ? [file] : [];
  }

  if (scope.batchId) {
    const batch = await db.uploadBatch.findFirst({
      where: {
        id: scope.batchId,
        project: { userId },
      },
      include: { files: { orderBy: { createdAt: "desc" } } },
    });
    return batch?.files ?? [];
  }

  return db.fileRecord.findMany({
    where: { batch: { project: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}
