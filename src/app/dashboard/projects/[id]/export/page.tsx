import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildBatchDataCard } from "@/lib/export-builder";
import { ExportPageClient } from "@/components/export-page-client";

export const metadata: Metadata = { title: "Export dataset" };

export default async function ExportPage({ params }: { params: { id: string } }) {
  const session = await requireServerSession();

  const project = await db.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      batches: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { files: true },
      },
    },
  });

  if (!project) redirect("/projects");

  const batch = project.batches[0] ?? null;
  const files = batch?.files ?? [];
  const dataCard =
    batch && files.length > 0 ? buildBatchDataCard(batch.id, files) : null;

  return (
    <ExportPageClient
      projectId={project.id}
      batchId={batch?.id ?? null}
      dataCard={dataCard}
      fileCount={files.length}
    />
  );
}
