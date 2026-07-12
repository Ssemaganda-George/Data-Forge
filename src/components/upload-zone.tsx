"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconFile, IconX } from "@tabler/icons-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
}

interface UploadZoneProps {
  projectId?: string;
  batchId?: string;
  onUploadComplete?: (fileIds: string[]) => void;
  className?: string;
}

export function UploadZone({
  projectId,
  batchId,
  onUploadComplete,
  className,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      progress: 0,
      status: "queued",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "audio/*": [],
      "video/*": [],
      "text/csv": [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    multiple: true,
  });

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function startUpload() {
    if (files.length === 0 || uploading) return;
    setUploading(true);
    const completedIds: string[] = [];

    for (const uf of files) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uf.id ? { ...f, status: "uploading", progress: 10 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", uf.file);
        if (projectId) formData.append("projectId", projectId);
        if (batchId) formData.append("batchId", batchId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = (await res.json()) as { fileRecordId: string };

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uf.id ? { ...f, status: "done", progress: 100 } : f
          )
        );
        completedIds.push(data.fileRecordId);
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uf.id ? { ...f, status: "error" } : f
          )
        );
      }
    }

    setUploading(false);
    if (completedIds.length > 0) {
      onUploadComplete?.(completedIds);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-brand-400 bg-brand-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <IconUpload
          size={36}
          className={cn(
            "mx-auto mb-3",
            isDragActive ? "text-brand-500" : "text-gray-400"
          )}
          stroke={1.5}
        />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? "Drop files here" : "Drag and drop files here"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Supports images, PDFs, audio, spreadsheets — up to 500 MB each
        </p>
        <p className="mt-3 text-xs text-gray-400">or</p>
        <button
          type="button"
          className="mt-2 text-xs font-medium text-brand-600 underline underline-offset-2"
        >
          Browse files
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uf) => (
            <div
              key={uf.id}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3"
            >
              <IconFile size={18} className="text-gray-400 shrink-0" stroke={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {uf.file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatBytes(uf.file.size)}
                  {uf.status === "uploading" && ` · ${uf.progress}%`}
                  {uf.status === "done" && " · Uploaded"}
                  {uf.status === "error" && " · Upload failed"}
                </p>
                {uf.status === "uploading" && (
                  <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${uf.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {uf.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeFile(uf.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX size={16} />
                </button>
              )}
              {uf.status === "done" && (
                <span className="text-xs font-medium text-green-600">Done</span>
              )}
              {uf.status === "error" && (
                <span className="text-xs font-medium text-red-600">Error</span>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              onClick={startUpload}
              loading={uploading}
              disabled={files.every((f) => f.status === "done")}
            >
              {uploading ? "Uploading…" : `Upload ${files.filter((f) => f.status === "queued").length} file(s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
