import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth";
import { getDatasetsForUser } from "@/lib/project-queries";
import { IconDatabase, IconDownload } from "@tabler/icons-react";
import { formatBytes } from "@/lib/utils";

export const metadata: Metadata = { title: "Datasets" };

export default async function DatasetsPage() {
  const session = await getServerSession();
  const datasets = await getDatasetsForUser(session!.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Datasets</h1>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {datasets.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No exports yet. Export a project batch to see datasets here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Dataset
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Format
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Files
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Created
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <IconDatabase
                        size={15}
                        className="text-gray-400 shrink-0"
                        stroke={1.5}
                      />
                      {d.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {d.project}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700">
                      {d.format}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.fileCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatBytes(d.sizeBytes)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {d.createdAt}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.downloadUrl ? (
                      <a
                        href={d.downloadUrl}
                        className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
                      >
                        <IconDownload size={13} />
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
