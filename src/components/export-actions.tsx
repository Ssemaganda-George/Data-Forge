"use client";

import { useState } from "react";
import { SendToMenu } from "@/components/send-to-menu";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import type { ExportFormat } from "@/lib/export-builder";
import { useExportActions } from "@/hooks/use-export-actions";
import { cn } from "@/lib/utils";

interface ExportActionsProps {
  batchId?: string;
  fileId?: string;
  format: ExportFormat;
  disabled?: boolean;
  className?: string;
}

export function ExportActions({
  batchId,
  fileId,
  format,
  disabled,
  className,
}: ExportActionsProps) {
  const { busy, downloadZip } = useExportActions({ batchId, fileId, format });
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    const result = await downloadZip();
    if (!result.ok) setError(result.message);
  }

  return (
    <div className={cn("flex flex-col items-end gap-1.5", className)}>
      <div className="flex items-center gap-2">
        <SendToMenu
          disabled={disabled || !!busy}
          batchId={batchId}
          fileId={fileId}
          format={format}
        />
        <Button
          variant="primary"
          disabled={disabled || !!busy}
          loading={busy === "download"}
          onClick={() => handleDownload()}
        >
          <IconDownload size={15} />
          Download dataset
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
