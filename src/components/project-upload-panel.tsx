"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { ProjectModule } from "@prisma/client";

const UploadZone = dynamic(
  () => import("@/components/upload-zone").then((m) => m.UploadZone),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-xl border border-dashed border-gray-200 bg-gray-50" />
    ),
  }
);

interface ProjectUploadPanelProps {
  projectId: string;
  batchId: string;
  module: ProjectModule;
}

export function ProjectUploadPanel({
  projectId,
  batchId,
  module,
}: ProjectUploadPanelProps) {
  const router = useRouter();

  return (
    <UploadZone
      projectId={projectId}
      batchId={batchId}
      module={module}
      onUploadComplete={() => {
        router.refresh();
      }}
    />
  );
}
