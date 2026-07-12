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

interface FileExportActionsProps {
  fileId: string;
  fileName: string;
  onDeleted?: () => void;
  onNotify?: (message: string, tone?: "success" | "error") => void;
}

function pythonSnippet(origin: string, fileId: string) {
  return `import requests

API_KEY = "dfk_..."  # Settings → API Keys
BASE = "${origin}"
headers = {"Authorization": f"Bearer {API_KEY}"}

res = requests.get(f"{BASE}/api/download?fileId=${fileId}", headers=headers, timeout=120)
res.raise_for_status()
open("dataforge-export.zip", "wb").write(res.content)`;
}

async function saveDownload(res: Response, fallback: string) {
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? fallback;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function FileExportActions({
  fileId,
  fileName,
  onDeleted,
  onNotify,
}: FileExportActionsProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [kaggleConnected, setKaggleConnected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetch("/api/integrations/kaggle")
      .then((r) => r.json())
      .then((d: { connected?: boolean }) => setKaggleConnected(!!d.connected))
      .catch(() => setKaggleConnected(false));
  }, []);

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

  async function downloadFile() {
    setBusy("download");
    try {
      const res = await fetch(`/api/download?fileId=${encodeURIComponent(fileId)}`);
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Download failed");
      }
      await saveDownload(res, `${fileName}.zip`);
      notify("Download started");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Download failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function openColab() {
    setBusy("colab");
    try {
      const res = await fetch("/api/export/colab");
      if (!res.ok) throw new Error("Could not generate notebook");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dataforge-import.ipynb";
      a.click();
      URL.revokeObjectURL(url);
      window.open("https://colab.research.google.com/", "_blank");
      notify("Notebook saved. Upload it in Colab.");
    } catch {
      notify("Colab notebook failed", "error");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function copySnippet(message = "Python snippet copied") {
    setBusy("snippet");
    try {
      await navigator.clipboard.writeText(pythonSnippet(origin, fileId));
      notify(message);
    } catch {
      notify("Could not copy snippet", "error");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function pushKaggle() {
    if (!kaggleConnected) {
      window.location.href = "/settings/integrations";
      return;
    }
    const title = window.prompt("Kaggle dataset title:", `DataForge: ${fileName}`);
    if (!title) return;

    setBusy("kaggle");
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: "kaggle", title, format: "JSON", fileId }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(data.error ?? "Kaggle push failed");
      notify("Published to Kaggle");
      if (data.url) window.open(data.url, "_blank");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Kaggle push failed", "error");
    } finally {
      setBusy(null);
      setOpen(false);
    }
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
    { id: "download", label: "Download ZIP", hint: "Datacard + cleaned output", onClick: downloadFile },
    { id: "colab", label: "Open in Colab", hint: "Starter notebook", icon: IconBrandGoogle, onClick: openColab },
    { id: "snippet", label: "Copy Python snippet", hint: "For notebooks", icon: IconClipboard, onClick: copySnippet },
    {
      id: "kaggle",
      label: kaggleConnected ? "Push to Kaggle" : "Connect Kaggle",
      hint: kaggleConnected ? "New dataset" : "Settings → Integrations",
      icon: IconTrophy,
      onClick: pushKaggle,
    },
    {
      id: "github",
      label: "GitHub snippet",
      hint: "Copy upload commands",
      icon: IconBrandGithub,
      onClick: () => copySnippet("Snippet copied for GitHub release upload"),
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
        onClick={() => downloadFile()}
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
