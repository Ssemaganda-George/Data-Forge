"use client";

import { useState } from "react";
import { SendToMenu } from "@/components/send-to-menu";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import type { ExportFormat } from "@/lib/export-builder";
import { useExportActions } from "@/hooks/use-export-actions";

interface ExportActionsProps {
  batchId?: string;
  fileId?: string;
  format: ExportFormat;
  disabled?: boolean;
}

export function ExportActions({ batchId, fileId, format, disabled }: ExportActionsProps) {
  const { busy, downloadZip } = useExportActions({ batchId, fileId, format });
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    const result = await downloadZip();
    if (!result.ok) setError(result.message);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-gray-900">Ready to export</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Download as {format} or send to Colab, Kaggle, or GitHub
          </p>
        </div>
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
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
