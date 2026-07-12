import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import {
  IconArrowLeft,
  IconSettings,
  IconShield,
  IconLanguage,
  IconCopy,
} from "@tabler/icons-react";
import type { BatchStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Project" };

// Placeholder — replace with real DB fetch
async function getProject(id: string) {
  const projects: Record<
    string,
    {
      id: string;
      name: string;
      module: "LANGUAGE_VOICE" | "BUSINESS_DATA" | "GENERAL";
      batchId: string;
      batchStatus: BatchStatus;
      fileCount: number;
      processedCount: number;
    }
  > = {
    proj_1: {
      id: "proj_1",
      name: "Customer support transcripts",
      module: "LANGUAGE_VOICE",
      batchId: "batch_1",
      batchStatus: "COMPLETE",
      fileCount: 320,
      processedCount: 320,
    },
    proj_2: {
      id: "proj_2",
      name: "Invoice OCR dataset",
      module: "BUSINESS_DATA",
      batchId: "batch_2",
      batchStatus: "PROCESSING",
      fileCount: 85,
      processedCount: 42,
    },
    proj_3: {
      id: "proj_3",
      name: "Product image catalogue",
      module: "GENERAL",
      batchId: "batch_3",
      batchStatus: "REVIEW",
      fileCount: 1420,
      processedCount: 1420,
    },
  };
  return projects[id] ?? null;
}

function statusToBadge(
  s: BatchStatus
): "processing" | "ready" | "flagged" | "failed" | "pending" {
  const map: Record<BatchStatus, "processing" | "ready" | "flagged" | "failed" | "pending"> = {
    PENDING: "pending",
    PROCESSING: "processing",
    REVIEW: "flagged",
    COMPLETE: "ready",
    FAILED: "failed",
  };
  return map[s];
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);
  if (!project) notFound();

  const progress =
    project.fileCount > 0
      ? Math.round((project.processedCount / project.fileCount) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <IconArrowLeft size={14} />
          All projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {project.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={statusToBadge(project.batchStatus)} />
              <span className="text-xs text-gray-400">
                {project.module === "LANGUAGE_VOICE"
                  ? "Language & voice"
                  : project.module === "BUSINESS_DATA"
                  ? "Business data"
                  : "General"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(project.batchStatus === "REVIEW" ||
              project.batchStatus === "COMPLETE") && (
              <>
                <Link href={`/projects/${project.id}/review`}>
                  <Button variant="secondary">Review files</Button>
                </Link>
                <Link href={`/projects/${project.id}/export`}>
                  <Button variant="primary">Export dataset</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload + progress — left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          {project.batchStatus === "PROCESSING" && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">
                  Processing files
                </p>
                <span className="text-xs text-gray-500">
                  {project.processedCount} / {project.fileCount}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {progress}% complete — results will appear in the review tab
                when ready.
              </p>
            </div>
          )}

          {/* Upload zone */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Add files
            </h2>
            <UploadZone
              projectId={project.id}
              batchId={project.batchId}
            />
          </div>

          {/* File list placeholder */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Files</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  {
                    name: "call_001.mp3",
                    type: "audio/mpeg",
                    status: "done" as const,
                    score: 0.94,
                  },
                  {
                    name: "call_002.wav",
                    type: "audio/wav",
                    status: "done" as const,
                    score: 0.87,
                  },
                  {
                    name: "call_003.mp3",
                    type: "audio/mpeg",
                    status: "processing" as const,
                    score: null,
                  },
                  {
                    name: "call_004.wav",
                    type: "audio/wav",
                    status: "flagged" as const,
                    score: 0.42,
                  },
                ].map((f, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {f.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {f.type}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          f.status === "done"
                            ? "ready"
                            : f.status === "processing"
                            ? "processing"
                            : "flagged"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {f.score !== null
                        ? `${(f.score * 100).toFixed(0)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cleaning options — right col */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <IconSettings size={16} className="text-gray-400" stroke={1.5} />
              <h2 className="text-sm font-semibold text-gray-900">
                Cleaning options
              </h2>
            </div>
            <div className="space-y-4">
              <ToggleOption
                label="Deduplication"
                description="Remove duplicate or near-duplicate files"
                defaultChecked
              />
              <ToggleOption
                label="Language tagging"
                description="Auto-detect and tag language per file"
                defaultChecked
              />
              <ToggleOption
                label="PII redaction"
                description="Mask names, emails, and phone numbers"
              />
              <ToggleOption
                label="Noise filtering"
                description="Remove low-quality or corrupt files"
                defaultChecked
              />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <IconShield size={16} className="text-gray-400" stroke={1.5} />
              <h2 className="text-sm font-semibold text-gray-900">Summary</h2>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total files</dt>
                <dd className="font-medium text-gray-800">
                  {project.fileCount.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Processed</dt>
                <dd className="font-medium text-gray-800">
                  {project.processedCount.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Flagged</dt>
                <dd className="font-medium text-amber-600">4</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-gray-200 peer-checked:bg-brand-600 rounded-full transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  );
}
