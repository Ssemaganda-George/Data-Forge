import type { Metadata } from "next";
import { requireServerSession } from "@/lib/auth";
import { getDatasetsForUser } from "@/lib/project-queries";
import {
  buildBatchDataCard,
  type ExportFileRow,
} from "@/lib/export-builder";
import { analyzeDataset } from "@/lib/dataset-ai";
import { DatasetsList } from "@/components/dataset-cards-list";

export const metadata: Metadata = { title: "Datasets" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DatasetsPage() {
  const session = await requireServerSession();
  const datasets = await getDatasetsForUser(session.user.id);

  const viewModels = await Promise.all(
    datasets.map(async (d) => {
      const rows: ExportFileRow[] = d.files.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        fileType: f.fileType,
        sizeBytes: f.sizeBytes,
        cleaningActions: f.cleaningActions,
        confidenceScore: f.confidenceScore,
        flaggedForReview: f.flaggedForReview,
        cleanedContent: f.cleanedContent,
        createdAt: new Date(),
      }));

      const [datacard, analysis] = await Promise.all([
        Promise.resolve(buildBatchDataCard(d.batchId, rows)),
        analyzeDataset(d.files),
      ]);

      return {
        id: d.id,
        name: d.name,
        project: d.project,
        format: d.format,
        fileCount: d.fileCount,
        sizeBytes: d.sizeBytes,
        createdAt: d.createdAt,
        batchId: d.batchId,
        files: d.files.map((f) => ({
          id: f.id,
          originalName: f.originalName,
          fileType: f.fileType,
          sizeBytes: f.sizeBytes,
          confidenceScore: f.confidenceScore,
          flaggedForReview: f.flaggedForReview,
          cleanedContent: f.cleanedContent ?? "",
          cleaningActions: f.cleaningActions,
        })),
        datacard,
        analysis,
      };
    })
  );

  return <DatasetsList datasets={viewModels} />;
}
