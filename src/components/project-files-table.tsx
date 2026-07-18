"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fileStatusToBadge, type CleaningActionSummary } from "@/lib/project-ui";
import type { FileStatus } from "@prisma/client";
import { CleanedResultDetail } from "@/components/cleaned-result-detail";

export type ProjectFileRow = {
  id: string;
  name: string;
  type: string;
  status: FileStatus;
  flagged: boolean;
  score: number | null;
  cleanedContent: string;
  actions: CleaningActionSummary[];
};

export function ProjectFilesTable({ files }: { files: ProjectFileRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (files.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-gray-500">
        No files yet. Upload documents above to start processing.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="w-8 px-4 py-3" />
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
            Name
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
            Type
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
            Cleaning actions applied
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
        {files.map((f) => {
          const expanded = expandedId === f.id;
          return (
            <Fragment key={f.id}>
              <tr
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedId(expanded ? null : f.id)}
              >
                <td className="px-4 py-3">
                  <span className="text-gray-400" aria-hidden="true">
                    {expanded ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {f.name}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{f.type}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {f.actions.length > 0 ? (
                      f.actions.map((a) => (
                        <span
                          key={`${f.id}-${a.type}`}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono"
                          title={a.description}
                        >
                          {a.type}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={fileStatusToBadge(f.status, f.flagged)} />
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {f.score !== null ? `${(f.score * 100).toFixed(0)}%` : "—"}
                </td>
              </tr>
              {expanded && (
                <tr className="bg-gray-50/60">
                  <td colSpan={6} className="px-5 py-4">
                    {f.cleanedContent || f.actions.length > 0 ? (
                      <CleanedResultDetail
                        actions={f.actions}
                        cleanedContent={f.cleanedContent}
                        score={f.score}
                      />
                    ) : (
                      <p className="text-xs text-gray-500">
                        No cleaned content available for this file yet.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
