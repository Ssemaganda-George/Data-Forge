"use client";

import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload-zone";

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
