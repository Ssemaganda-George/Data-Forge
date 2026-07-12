"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  IconUpload,
  IconFile,
  IconDownload,
  IconCheck,
  IconAlertTriangle,
  IconTrash,
  IconRefresh,
} from "@tabler/icons-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileExportActions } from "@/components/file-export-actions";
import { Badge } from "@/components/ui/badge";

interface CleaningAction {
  type: string;
  description: string;
  appliedAt: string;
}

interface WorkspaceFile {
  id: string;
  originalName: string;
  fileType: string;
  sizeBytes: number;
  status: "processing" | "complete" | "failed";
  cleaningActions: CleaningAction[];
  confidenceScore: number;
  flaggedForReview: boolean;
  uploadedAt: string;
  cleanedContent: string;
}

interface Uploading {
  localId: string;
  name: string;
  size: number;
  progress: "uploading" | "done" | "error";
  errorMsg?: string;
}

export function WorkspaceSection() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  // ── Load existing session files ──
  const loadFiles = useCallback(async () => {
    const res = await fetch("/api/workspace");
    if (res.ok) {
      const data = (await res.json()) as { files: WorkspaceFile[] };
      setFiles(data.files);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(message: string, tone: "success" | "error" = "success") {
    setToast({ message, tone });
  }

  // ── Drop handler ──
  const onDrop = useCallback(
    async (accepted: File[]) => {
      const tooLarge = accepted.filter((f) => f.size > 4 * 1024 * 1024);
      if (tooLarge.length > 0) {
        setUploading((prev) => [
          ...prev,
          ...tooLarge.map((f) => ({
            localId: crypto.randomUUID(),
            name: f.name,
            size: f.size,
            progress: "error" as const,
            errorMsg: "File exceeds 4 MB limit on this server",
          })),
        ]);
      }

      const valid = accepted.filter((f) => f.size <= 4 * 1024 * 1024);
      if (valid.length === 0) return;

      const newUploads: Uploading[] = valid.map((f) => ({
        localId: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        progress: "uploading",
      }));
      setUploading((prev) => [...prev, ...newUploads]);

      await Promise.all(
        accepted.map(async (file, i) => {
          const localId = newUploads[i].localId;
          try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) {
              const err = (await res.json()) as { error?: string };
              setUploading((prev) =>
                prev.map((u) =>
                  u.localId === localId
                    ? { ...u, progress: "error", errorMsg: err.error ?? "Upload failed" }
                    : u
                )
              );
              return;
            }
            setUploading((prev) =>
              prev.map((u) =>
                u.localId === localId ? { ...u, progress: "done" } : u
              )
            );
          } catch {
            setUploading((prev) =>
              prev.map((u) =>
                u.localId === localId
                  ? { ...u, progress: "error", errorMsg: "Network error" }
                  : u
              )
            );
          }
        })
      );

      // Refresh file list
      await loadFiles();
      // Clear done uploads from the tray after a short delay
      setTimeout(
        () =>
          setUploading((prev) => prev.filter((u) => u.progress !== "done")),
        1500
      );
    },
    [loadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "audio/*": [],
      "video/*": [],
      "text/csv": [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "application/msword": [],
    },
  });

  // ── Download ──
  async function download() {
    setDownloading(true);
    try {
      const res = await fetch("/api/download");
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        alert(err.error ?? "Download failed");
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Derive filename from Content-Disposition or fall back
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `dataforge-export-${Date.now()}.zip`;

      // Must be attached to the DOM for Firefox + Safari
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setDownloading(false);
    }
  }

  // ── Clear ──
  async function clearAll() {
    setClearing(true);
    await fetch("/api/workspace", { method: "DELETE" });
    setFiles([]);
    setClearing(false);
  }

  const avgScore =
    files.length > 0
      ? files.reduce((s, f) => s + f.confidenceScore, 0) / files.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl px-8 py-10 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-brand-400 bg-brand-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <IconUpload
          size={32}
          className={cn(
            "mx-auto mb-3",
            isDragActive ? "text-brand-500" : "text-gray-400"
          )}
          stroke={1.5}
        />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? "Drop to clean" : "Drag files here to clean them"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          PDFs, images, audio, spreadsheets · max 4 MB per file · cleaned instantly
        </p>
      </div>

      {/* Upload progress tray */}
      {uploading.length > 0 && (
        <div className="space-y-1.5">
          {uploading.map((u) => (
            <div
              key={u.localId}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5"
            >
              <IconFile size={15} className="text-gray-400 shrink-0" stroke={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{u.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(u.size)}</p>
              </div>
              {u.progress === "uploading" && (
                <span className="text-xs text-blue-600 animate-pulse">Cleaning…</span>
              )}
              {u.progress === "done" && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <IconCheck size={13} /> Done
                </span>
              )}
              {u.progress === "error" && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <IconAlertTriangle size={13} />
                  {u.errorMsg ?? "Failed"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results panel */}
      {files.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-gray-900">
                {files.length} file{files.length !== 1 ? "s" : ""} cleaned
              </p>
              <span className="hidden h-3 w-px bg-gray-200 sm:block" aria-hidden />
              <span className="text-xs text-gray-500">
                Avg score{" "}
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    avgScore >= 0.8
                      ? "text-green-600"
                      : avgScore >= 0.6
                      ? "text-amber-600"
                      : "text-red-600"
                  )}
                >
                  {(avgScore * 100).toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={loadFiles}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                title="Refresh"
              >
                <IconRefresh size={15} />
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => download()}
                loading={downloading}
              >
                <IconDownload size={14} />
                Download all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                loading={clearing}
                className="text-gray-500 hover:text-red-600"
              >
                <IconTrash size={14} />
                Clear all
              </Button>
            </div>
          </div>

          {toast && (
            <div
              className={cn(
                "border-b px-5 py-2 text-xs font-medium",
                toast.tone === "error"
                  ? "border-red-100 bg-red-50 text-red-700"
                  : "border-green-100 bg-green-50 text-green-700"
              )}
            >
              {toast.message}
            </div>
          )}

          {/* File rows */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  File
                </th>
                <th className="hidden px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">
                  Type
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Score
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="hidden px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 lg:table-cell">
                  Pipeline
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Export
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map((f) => (
                <Fragment key={f.id}>
                  <tr
                    className={cn(
                      "transition-colors hover:bg-gray-50/80",
                      expandedId === f.id && "bg-gray-50/60"
                    )}
                  >
                    <td
                      className="cursor-pointer px-5 py-3"
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    >
                      <p className="max-w-[220px] truncate font-medium text-gray-800">
                        {f.originalName}
                      </p>
                      <p className="text-xs text-gray-400">{formatBytes(f.sizeBytes)}</p>
                    </td>
                    <td
                      className="hidden cursor-pointer px-3 py-3 text-xs text-gray-500 sm:table-cell"
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    >
                      {f.fileType.split("/")[1] ?? f.fileType}
                    </td>
                    <td
                      className="cursor-pointer px-3 py-3"
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              f.confidenceScore >= 0.8
                                ? "bg-green-500"
                                : f.confidenceScore >= 0.6
                                ? "bg-amber-400"
                                : "bg-red-400"
                            )}
                            style={{ width: `${f.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-gray-600">
                          {(f.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td
                      className="cursor-pointer px-3 py-3"
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    >
                      <Badge variant={f.flaggedForReview ? "flagged" : "ready"} />
                    </td>
                    <td
                      className="hidden cursor-pointer px-3 py-3 lg:table-cell"
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    >
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {f.cleaningActions.slice(0, 2).map((a) => (
                          <span
                            key={a.type}
                            className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600"
                          >
                            {a.type}
                          </span>
                        ))}
                        {f.cleaningActions.length > 2 && (
                          <span className="text-[10px] text-gray-400">
                            +{f.cleaningActions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <FileExportActions
                        fileId={f.id}
                        fileName={f.originalName}
                        onDeleted={loadFiles}
                        onNotify={showToast}
                      />
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedId === f.id && (
                    <tr key={`${f.id}-detail`} className="bg-gray-50/80">
                      <td colSpan={6} className="space-y-4 px-5 py-4">
                        {/* Cleaned content */}
                        {f.cleanedContent && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Cleaned output
                            </p>
                            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-white border border-gray-100 rounded-lg p-3 max-h-56 overflow-y-auto leading-relaxed">
                              {f.cleanedContent}
                            </pre>
                          </div>
                        )}

                        {/* Cleaning actions */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Cleaning actions applied
                          </p>
                          <ul className="space-y-1.5">
                            {f.cleaningActions.map((a) => (
                              <li
                                key={a.type}
                                className="flex items-start gap-2 text-xs"
                              >
                                <IconCheck
                                  size={13}
                                  className="text-green-500 shrink-0 mt-0.5"
                                />
                                <span className="font-mono text-gray-500 w-40 shrink-0">
                                  {a.type}
                                </span>
                                <span className="text-gray-600">{a.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
