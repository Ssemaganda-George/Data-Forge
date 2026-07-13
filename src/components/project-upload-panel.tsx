"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

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
}

export function ProjectUploadPanel({
  projectId,
  batchId,
}: ProjectUploadPanelProps) {
  const router = useRouter();

  return (
    <UploadZone
      projectId={projectId}
      batchId={batchId}
      onUploadComplete={() => {
        router.refresh();
      }}
    />
  );
}
