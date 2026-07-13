import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { fileStatusToBadge, getProjectDetail } from "@/lib/project-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconEdit,
  IconFilterCog,
} from "@tabler/icons-react";

export const metadata: Metadata = { title: "Review files" };

export default async function ReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();
  const project = await getProjectDetail(session!.user.id, params.id);
  if (!project) notFound();

  const files = project.files;
  const flaggedCount = files.filter((f) => f.flagged).length;
  const acceptedCount = files.filter(
    (f) => !f.flagged && f.status === "COMPLETE"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${params.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <IconArrowLeft size={14} />
          Back to project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Review files
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {flaggedCount} file{flaggedCount !== 1 ? "s" : ""} flagged for
              review.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">
              <IconFilterCog size={15} />
              Filter
            </Button>
            <Button variant="secondary">Accept all</Button>
            <Link href={`/projects/${params.id}/export`}>
              <Button variant="primary">Proceed to export</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total files", value: files.length, color: "text-gray-900" },
          { label: "Flagged", value: flaggedCount, color: "text-amber-600" },
          { label: "Accepted", value: acceptedCount, color: "text-green-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 text-center"
          >
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {files.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No files to review yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  File
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Actions taken
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Confidence
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map((f) => {
                const confidence = f.score ?? 0;
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{f.name}</p>
                      <p className="text-xs text-gray-400">{f.type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {f.actions.length > 0 ? (
                          f.actions.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono"
                            >
                              {a}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {f.score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                confidence >= 0.8
                                  ? "bg-green-500"
                                  : confidence >= 0.6
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {(confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={fileStatusToBadge(f.status, f.flagged)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Accept"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <IconCheck size={15} />
                        </button>
                        <button
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          title="Reject"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <IconX size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
