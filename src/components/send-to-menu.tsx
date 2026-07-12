"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconChevronDown,
  IconClipboard,
  IconExternalLink,
  IconNotebook,
  IconTrophy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/lib/export-builder";
import { useExportActions } from "@/hooks/use-export-actions";

interface SendToMenuProps {
  disabled?: boolean;
  batchId?: string;
  fileId?: string;
  format?: ExportFormat;
  className?: string;
}

export function SendToMenu({
  disabled,
  batchId,
  fileId,
  format = "JSON",
  className,
}: SendToMenuProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const {
    busy,
    kaggleConnected,
    githubConnected,
    openColab,
    copySnippet,
    pushKaggle,
    pushGitHub,
  } = useExportActions({ batchId, fileId, format });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function run(action: () => Promise<{ ok: boolean; message: string }>) {
    setMessage(null);
    const result = await action();
    setMessage(result.message);
    if (result.ok) setOpen(false);
  }

  const items = [
    {
      id: "colab",
      label: "Open in Colab",
      hint: batchId ? "Batch-scoped notebook" : fileId ? "File-scoped notebook" : "Workspace notebook",
      icon: IconBrandGoogle,
      onClick: () => run(openColab),
    },
    {
      id: "snippet",
      label: "Copy Python snippet",
      hint: "For Kaggle / any notebook",
      icon: IconClipboard,
      onClick: () => run(copySnippet),
    },
    {
      id: "kaggle",
      label: kaggleConnected ? "Push to Kaggle" : "Connect Kaggle…",
      hint: kaggleConnected ? "Create a new dataset" : "Settings → Integrations",
      icon: IconTrophy,
      onClick: () => run(pushKaggle),
    },
    {
      id: "github",
      label: githubConnected ? "Push to GitHub" : "Connect GitHub…",
      hint: githubConnected ? "Upload release asset" : "Settings → Integrations",
      icon: IconBrandGithub,
      onClick: () => run(pushGitHub),
    },
  ];

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        variant="secondary"
        size="sm"
        disabled={disabled || !!busy}
        onClick={() => setOpen((v) => !v)}
      >
        <IconExternalLink size={14} />
        Send to
        <IconChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1.5">
          {items.map(({ id, label, hint, icon: Icon, onClick }) => (
            <button
              key={id}
              type="button"
              disabled={!!busy}
              onClick={() => onClick()}
              className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50"
            >
              <Icon size={16} className="text-gray-400 shrink-0 mt-0.5" stroke={1.5} />
              <span>
                <span className="block text-sm font-medium text-gray-800">{label}</span>
                <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>
              </span>
              {busy === id && (
                <span className="ml-auto w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin shrink-0 mt-1" />
              )}
            </button>
          ))}
          <div className="border-t border-gray-50 mt-1 px-3 py-2 flex items-center gap-2 text-xs text-gray-400">
            <IconNotebook size={13} />
            Includes datacard + {format} dataset
          </div>
        </div>
      )}

      {message && (
        <p className="absolute right-0 top-full mt-1 w-72 text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm z-10">
          {message}
        </p>
      )}
    </div>
  );
}
