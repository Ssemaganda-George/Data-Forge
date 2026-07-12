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

  // ── Drop handler ──
  const onDrop = useCallback(
    async (accepted: File[]) => {
      const newUploads: Uploading[] = accepted.map((f) => ({
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
          PDFs, images, audio, spreadsheets · 50 MB per file · cleaned instantly
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
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-900">
                {files.length} file{files.length !== 1 ? "s" : ""} cleaned
              </p>
              <span className="text-xs text-gray-400">
                Avg score:{" "}
                <span
                  className={cn(
                    "font-medium",
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
            <div className="flex items-center gap-2">
              <button
                onClick={loadFiles}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Refresh"
              >
                <IconRefresh size={15} />
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAll}
                loading={clearing}
              >
                <IconTrash size={14} />
                Clear all
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => download()}
                  loading={downloading}
                >
                  <IconDownload size={14} />
                  Download ZIP
                </Button>
              </div>
            </div>
          </div>

          {/* File rows */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">File</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Score</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 hidden md:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map((f) => (
                <Fragment key={f.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === f.id ? null : f.id)
                    }
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">
                        {f.originalName}
                      </p>
                      <p className="text-xs text-gray-400">{formatBytes(f.sizeBytes)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                      {f.fileType.split("/")[1] ?? f.fileType}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              f.confidenceScore >= 0.8
                                ? "bg-green-500"
                                : f.confidenceScore >= 0.6
                                ? "bg-amber-400"
                                : "bg-red-400"
                            )}
                            style={{ width: `${f.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {(f.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={f.flaggedForReview ? "flagged" : "ready"} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {f.cleaningActions.slice(0, 2).map((a) => (
                          <span
                            key={a.type}
                            className="inline-flex px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono"
                          >
                            {a.type}
                          </span>
                        ))}
                        {f.cleaningActions.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{f.cleaningActions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedId === f.id && (
                    <tr key={`${f.id}-detail`} className="bg-gray-50">
                      <td colSpan={5} className="px-5 py-4 space-y-4">
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
