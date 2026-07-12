"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconChevronDown,
  IconClipboard,
  IconDownload,
  IconExternalLink,
  IconNotebook,
  IconTrophy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SendToMenuProps {
  disabled?: boolean;
  baseUrl?: string;
  className?: string;
}

function pythonSnippet(baseUrl: string) {
  return `import requests

API_KEY = "dfk_..."  # Settings → API Keys
BASE = "${baseUrl}"
headers = {"Authorization": f"Bearer {API_KEY}"}

zip_bytes = requests.get(f"{BASE}/api/download", headers=headers, timeout=120).content
open("dataforge-export.zip", "wb").write(zip_bytes)
print(f"Saved {len(zip_bytes):,} bytes")`;
}

export function SendToMenu({ disabled, baseUrl, className }: SendToMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [kaggleConnected, setKaggleConnected] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const origin = baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");

  useEffect(() => {
    fetch("/api/integrations/kaggle")
      .then((r) => r.json())
      .then((d: { connected?: boolean }) => setKaggleConnected(!!d.connected))
      .catch(() => setKaggleConnected(false));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function downloadColabNotebook() {
    setBusy("colab");
    setMessage(null);
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
      setMessage("Notebook downloaded — upload it in Colab (File → Upload notebook)");
    } catch {
      setMessage("Failed to generate Colab notebook");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  async function copySnippet() {
    setBusy("snippet");
    try {
      await navigator.clipboard.writeText(pythonSnippet(origin));
      setMessage("Python snippet copied");
    } catch {
      setMessage("Could not copy to clipboard");
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
    const title = window.prompt("Kaggle dataset title:", "DataForge cleaned dataset");
    if (!title) return;

    setBusy("kaggle");
    setMessage(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: "kaggle", title, format: "JSON" }),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(data.error ?? "Kaggle push failed");
      setMessage(`Published to Kaggle → ${data.url ?? "check your datasets"}`);
      if (data.url) window.open(data.url, "_blank");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Kaggle push failed");
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  const items = [
    {
      id: "colab",
      label: "Open in Colab",
      hint: "Download starter notebook",
      icon: IconBrandGoogle,
      onClick: downloadColabNotebook,
    },
    {
      id: "snippet",
      label: "Copy Python snippet",
      hint: "For Kaggle / any notebook",
      icon: IconClipboard,
      onClick: copySnippet,
    },
    {
      id: "kaggle",
      label: kaggleConnected ? "Push to Kaggle" : "Connect Kaggle…",
      hint: kaggleConnected ? "Create a new dataset" : "Settings → Integrations",
      icon: IconTrophy,
      onClick: pushKaggle,
    },
    {
      id: "github",
      label: "GitHub (via snippet)",
      hint: "Use gh release upload or git push",
      icon: IconBrandGithub,
      onClick: () => {
        copySnippet();
        setMessage("Snippet copied — upload the ZIP to a GitHub release");
      },
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
            Includes datacard + cleaned data
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

export function DownloadZipButton({
  onDownload,
  loading,
}: {
  onDownload: () => void;
  loading?: boolean;
}) {
  return (
    <Button variant="primary" size="sm" onClick={onDownload} loading={loading}>
      <IconDownload size={14} />
      Download ZIP
    </Button>
  );
}
