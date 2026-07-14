import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import {
  batchStatusToBadge,
  fileStatusToBadge,
  getProjectDetail,
  moduleLabel,
} from "@/lib/project-queries";
import { Badge } from "@/components/ui/badge";
import { ProjectUploadPanel } from "@/components/project-upload-panel";
import {
  IconArrowLeft,
  IconSettings,
  IconShield,
} from "@tabler/icons-react";

export const metadata: Metadata = { title: "Project" };
export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();
  const project = await getProjectDetail(session!.user.id, params.id);
  if (!project) notFound();

  const progress =
    project.fileCount > 0
      ? Math.round((project.processedCount / project.fileCount) * 100)
      : 0;

  const canReview =
    project.fileCount > 0 &&
    (project.batchStatus === "REVIEW" ||
      project.batchStatus === "COMPLETE" ||
      project.processedCount === project.fileCount);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/projects"
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
              <Badge variant={batchStatusToBadge(project.batchStatus)} />
              <span className="text-xs text-gray-400">
                {moduleLabel(project.module)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canReview && (
              <>
                <Link
                  href={`/projects/${project.id}/review`}
                  className="btn-secondary inline-flex items-center"
                >
                  Review files
                </Link>
                <Link
                  href={`/projects/${project.id}/export`}
                  className="btn-primary inline-flex items-center"
                >
                  Export dataset
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              Add files
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Drop documents here to run this project&apos;s cleaning pipeline.
              Results appear in the file list below.
            </p>
            <ProjectUploadPanel
              projectId={project.id}
              batchId={project.batchId}
              module={project.module}
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Files</h2>
            </div>
            {project.files.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                No files yet. Upload documents above to start processing.
              </div>
            ) : (
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
                  {project.files.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {f.name}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {f.type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={fileStatusToBadge(f.status, f.flagged)}
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
            )}
          </div>
        </div>

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
                <dd className="font-medium text-amber-600">
                  {project.flaggedCount}
                </dd>
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
