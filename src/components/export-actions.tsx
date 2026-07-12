"use client";

import { SendToMenu } from "@/components/send-to-menu";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";

export function ExportActions() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-semibold text-gray-900">Ready to export</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Download or send to Colab, Kaggle, or GitHub
        </p>
      </div>
      <div className="flex items-center gap-2">
        <SendToMenu />
        <Button variant="primary">
          <IconDownload size={15} />
          Download dataset
        </Button>
      </div>
    </div>
  );
}
