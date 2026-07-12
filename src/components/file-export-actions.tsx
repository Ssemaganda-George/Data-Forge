"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconChevronDown,
  IconClipboard,
  IconDownload,
  IconShare2,
  IconTrash,
  IconTrophy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/lib/export-builder";
import { useExportActions } from "@/hooks/use-export-actions";

interface FileExportActionsProps {
  fileId: string;
  fileName: string;
  format?: ExportFormat;
  onDeleted?: () => void;
  onNotify?: (message: string, tone?: "success" | "error") => void;
}

export function FileExportActions({
  fileId,
  fileName,
  format = "JSON",
  onDeleted,
  onNotify,
}: FileExportActionsProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const {
    busy,
    kaggleConnected,
    githubConnected,
    downloadZip,
    openColab,
    copySnippet,
    pushKaggle,
    pushGitHub,
  } = useExportActions({ fileId, format });

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function notify(message: string, tone: "success" | "error" = "success") {
    onNotify?.(message, tone);
  }

  async function run(action: () => Promise<{ ok: boolean; message: string }>) {
    const result = await action();
    notify(result.message, result.ok ? "success" : "error");
    if (result.ok) setOpen(false);
  }

  async function deleteFile() {
    if (!window.confirm(`Remove "${fileName}" from this workspace?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspace/${encodeURIComponent(fileId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      notify("File removed");
      onDeleted?.();
    } catch {
      notify("Could not delete file", "error");
    } finally {
      setDeleting(false);
    }
  }

  const menuItems = [
    { id: "download", label: "Download ZIP", hint: `${format} + datacard`, onClick: () => run(downloadZip) },
    { id: "colab", label: "Open in Colab", hint: "Scoped to this file", icon: IconBrandGoogle, onClick: () => run(openColab) },
    { id: "snippet", label: "Copy Python snippet", hint: "For notebooks", icon: IconClipboard, onClick: () => run(copySnippet) },
    {
      id: "kaggle",
      label: kaggleConnected ? "Push to Kaggle" : "Connect Kaggle",
      hint: kaggleConnected ? "New dataset" : "Settings → Integrations",
      icon: IconTrophy,
      onClick: () => run(pushKaggle),
    },
    {
      id: "github",
      label: githubConnected ? "Push to GitHub" : "Connect GitHub",
      hint: githubConnected ? "New release asset" : "Settings → Integrations",
      icon: IconBrandGithub,
      onClick: () => run(pushGitHub),
    },
  ];

  return (
    <div
      className="flex items-center justify-end gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={!!busy || deleting}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium",
            "text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
            open && "bg-brand-100"
          )}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <IconShare2 size={14} stroke={1.75} />
          <span className="hidden sm:inline">Export</span>
          <IconChevronDown
            size={12}
            className={cn("opacity-60 transition-transform duration-200", open && "rotate-180")}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-gray-200/80 bg-white py-1 shadow-lg shadow-gray-900/5"
          >
            {menuItems.map(({ id, label, hint, icon: Icon, onClick }) => (
              <button
                key={id}
                type="button"
                role="menuitem"
                disabled={!!busy}
                onClick={() => onClick()}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50"
              >
                {Icon ? (
                  <Icon size={15} className="mt-0.5 shrink-0 text-gray-400" stroke={1.5} />
                ) : (
                  <IconDownload size={15} className="mt-0.5 shrink-0 text-gray-400" stroke={1.5} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-gray-800">{label}</span>
                  <span className="block text-[11px] text-gray-400">{hint}</span>
                </span>
                {busy === id && (
                  <span className="mt-1 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        title="Download ZIP"
        disabled={!!busy || deleting}
        onClick={() => run(downloadZip)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
      >
        {busy === "download" ? (
          <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        ) : (
          <IconDownload size={15} stroke={1.75} />
        )}
      </button>

      <button
        type="button"
        title="Delete file"
        disabled={!!busy || deleting}
        onClick={() => deleteFile()}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        {deleting ? (
          <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
        ) : (
          <IconTrash size={15} stroke={1.75} />
        )}
      </button>
    </div>
  );
}
