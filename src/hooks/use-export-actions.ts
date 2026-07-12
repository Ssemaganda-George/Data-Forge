"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExportFormat } from "@/lib/export-builder";

export interface ExportTarget {
  fileId?: string;
  batchId?: string;
  format?: ExportFormat;
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

export function buildPythonSnippet(origin: string, target: ExportTarget) {
  const format = target.format ?? "JSON";
  if (target.fileId) {
    return `import requests

API_KEY = "dfk_..."  # Settings → API Keys
BASE = "${origin}"
headers = {"Authorization": f"Bearer {API_KEY}"}

res = requests.post(
    f"{BASE}/api/download",
    headers=headers,
    json={"format": "${format}", "fileId": "${target.fileId}"},
    timeout=120,
)
res.raise_for_status()
open("dataforge-export.zip", "wb").write(res.content)`;
  }

  if (target.batchId) {
    return `import requests

API_KEY = "dfk_..."  # Settings → API Keys
BASE = "${origin}"
headers = {"Authorization": f"Bearer {API_KEY}"}

res = requests.post(
    f"{BASE}/api/export",
    headers=headers,
    json={"batchId": "${target.batchId}", "format": "${format}"},
    timeout=120,
)
res.raise_for_status()
open("dataforge-batch.zip", "wb").write(res.content)`;
  }

  return `import requests

API_KEY = "dfk_..."  # Settings → API Keys
BASE = "${origin}"
headers = {"Authorization": f"Bearer {API_KEY}"}

res = requests.post(
    f"{BASE}/api/download",
    headers=headers,
    json={"format": "${format}"},
    timeout=120,
)
res.raise_for_status()
open("dataforge-export.zip", "wb").write(res.content)`;
}

export function useExportActions(target: ExportTarget) {
  const [busy, setBusy] = useState<string | null>(null);
  const [kaggleConnected, setKaggleConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const format = target.format ?? "JSON";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    Promise.all([
      fetch("/api/integrations/kaggle").then((r) => r.json()),
      fetch("/api/integrations/github").then((r) => r.json()),
    ])
      .then(([kaggle, github]) => {
        setKaggleConnected(!!kaggle.connected);
        setGithubConnected(!!github.connected);
      })
      .catch(() => {
        setKaggleConnected(false);
        setGithubConnected(false);
      });
  }, []);

  const downloadZip = useCallback(async () => {
    setBusy("download");
    try {
      if (target.batchId && !target.fileId) {
        const res = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchId: target.batchId, format }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? "Download failed");
        }
        await saveDownload(res, `dataforge-batch-${format.toLowerCase()}.zip`);
        return { ok: true as const, message: "Download started" };
      }

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          ...(target.fileId ? { fileId: target.fileId } : {}),
          ...(target.batchId ? { batchId: target.batchId } : {}),
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Download failed");
      }
      await saveDownload(res, `dataforge-export-${format.toLowerCase()}.zip`);
      return { ok: true as const, message: "Download started" };
    } catch (err) {
      return {
        ok: false as const,
        message: err instanceof Error ? err.message : "Download failed",
      };
    } finally {
      setBusy(null);
    }
  }, [format, target.batchId, target.fileId]);

  const openColab = useCallback(async () => {
    setBusy("colab");
    try {
      const params = new URLSearchParams({ format });
      if (target.fileId) params.set("fileId", target.fileId);
      if (target.batchId) params.set("batchId", target.batchId);
      const res = await fetch(`/api/export/colab?${params}`);
      if (!res.ok) throw new Error("Could not generate notebook");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = target.fileId
        ? "dataforge-file.ipynb"
        : target.batchId
          ? "dataforge-batch.ipynb"
          : "dataforge-import.ipynb";
      a.click();
      URL.revokeObjectURL(url);
      window.open("https://colab.research.google.com/", "_blank");
      return { ok: true as const, message: "Notebook saved. Upload it in Colab." };
    } catch {
      return { ok: false as const, message: "Colab notebook failed" };
    } finally {
      setBusy(null);
    }
  }, [format, target.batchId, target.fileId]);

  const copySnippet = useCallback(async () => {
    setBusy("snippet");
    try {
      await navigator.clipboard.writeText(buildPythonSnippet(origin, { ...target, format }));
      return { ok: true as const, message: "Python snippet copied" };
    } catch {
      return { ok: false as const, message: "Could not copy snippet" };
    } finally {
      setBusy(null);
    }
  }, [format, origin, target]);

  const pushKaggle = useCallback(async () => {
    if (!kaggleConnected) {
      window.location.href = "/settings/integrations";
      return { ok: false as const, message: "Connect Kaggle first" };
    }
    const defaultTitle = target.fileId
      ? "DataForge file export"
      : target.batchId
        ? "DataForge batch export"
        : "DataForge cleaned dataset";
    const title = window.prompt("Kaggle dataset title:", defaultTitle);
    if (!title) return { ok: false as const, message: "Cancelled" };

    setBusy("kaggle");
    try {
      const endpoint = target.batchId && !target.fileId ? "/api/export" : "/api/download";
      const payload =
        endpoint === "/api/export"
          ? { destination: "kaggle", title, format, batchId: target.batchId }
          : {
              destination: "kaggle",
              title,
              format,
              ...(target.fileId ? { fileId: target.fileId } : {}),
              ...(target.batchId ? { batchId: target.batchId } : {}),
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(data.error ?? "Kaggle push failed");
      if (data.url) window.open(data.url, "_blank");
      return { ok: true as const, message: "Published to Kaggle" };
    } catch (err) {
      return {
        ok: false as const,
        message: err instanceof Error ? err.message : "Kaggle push failed",
      };
    } finally {
      setBusy(null);
    }
  }, [format, kaggleConnected, target.batchId, target.fileId]);

  const pushGitHub = useCallback(async () => {
    if (!githubConnected) {
      window.location.href = "/settings/integrations";
      return { ok: false as const, message: "Connect GitHub first" };
    }
    const repo = window.prompt("GitHub repo (owner/name):", "");
    if (!repo) return { ok: false as const, message: "Cancelled" };

    const defaultTitle = target.fileId
      ? "DataForge file export"
      : target.batchId
        ? "DataForge batch export"
        : "DataForge cleaned dataset";
    const title = window.prompt("Release title:", defaultTitle);
    if (!title) return { ok: false as const, message: "Cancelled" };

    setBusy("github");
    try {
      const endpoint = target.batchId && !target.fileId ? "/api/export" : "/api/download";
      const payload =
        endpoint === "/api/export"
          ? { destination: "github", title, format, batchId: target.batchId, repo }
          : {
              destination: "github",
              title,
              format,
              repo,
              ...(target.fileId ? { fileId: target.fileId } : {}),
              ...(target.batchId ? { batchId: target.batchId } : {}),
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(data.error ?? "GitHub push failed");
      if (data.url) window.open(data.url, "_blank");
      return { ok: true as const, message: "Published to GitHub release" };
    } catch (err) {
      return {
        ok: false as const,
        message: err instanceof Error ? err.message : "GitHub push failed",
      };
    } finally {
      setBusy(null);
    }
  }, [format, githubConnected, target.batchId, target.fileId]);

  return {
    busy,
    kaggleConnected,
    githubConnected,
    downloadZip,
    openColab,
    copySnippet,
    pushKaggle,
    pushGitHub,
  };
}
