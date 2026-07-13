"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import type { CleaningActionSummary } from "@/lib/project-ui";
import {
  fileStatusToBadge,
  parseVoiceCleanedContent,
} from "@/lib/project-ui";
import type { FileStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconFilter,
  IconX,
} from "@tabler/icons-react";

export type ReviewFile = {
  id: string;
  name: string;
  type: string;
  status: FileStatus;
  flagged: boolean;
  score: number | null;
  cleanedContent: string;
  actions: CleaningActionSummary[];
};

interface ReviewFilesPanelProps {
  projectId: string;
  files: ReviewFile[];
}

export function ReviewFilesPanel({ projectId, files }: ReviewFilesPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const visibleFiles = showFlaggedOnly
    ? files.filter((f) => f.flagged)
    : files;

  const flaggedCount = files.filter((f) => f.flagged).length;
  const acceptedCount = files.filter(
    (f) => !f.flagged && f.status === "COMPLETE"
  ).length;

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowFlaggedOnly((v) => !v)}
        >
          <IconFilter size={15} />
          {showFlaggedOnly ? "Show all" : "Flagged only"}
        </Button>
        <Link
          href={`/projects/${projectId}/export`}
          className="btn-primary inline-flex items-center gap-2"
        >
          Proceed to export
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {visibleFiles.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            {showFlaggedOnly
              ? "No flagged files. Everything looks good."
              : "No files to review yet. Upload files on the project page first."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-8 px-4 py-3" />
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
                  Review
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleFiles.map((f) => {
                const confidence = f.score ?? 0;
                const expanded = expandedId === f.id;

                return (
                  <Fragment key={f.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expanded ? null : f.id)
                          }
                          className="text-gray-400 hover:text-gray-600"
                          aria-label={expanded ? "Collapse" : "Expand"}
                        >
                          {expanded ? (
                            <IconChevronDown size={15} />
                          ) : (
                            <IconChevronRight size={15} />
                          )}
                        </button>
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
                            type="button"
                            title="Accept"
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <IconCheck size={15} />
                          </button>
                          <button
                            type="button"
                            title="Edit"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            type="button"
                            title="Reject"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <IconX size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${f.id}-detail`} className="bg-gray-50/80">
                        <td colSpan={6} className="px-5 py-4 space-y-4">
                          {f.cleanedContent ? (
                            (() => {
                              const voice = parseVoiceCleanedContent(
                                f.cleanedContent
                              );
                              if (voice) {
                                return (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      {voice.provider === "sunbird" && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                                          Powered by Sunbird AI
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400">
                                        {voice.sourceLanguage.toUpperCase()}
                                        {voice.provider === "sunbird"
                                          ? " · Sunbird STT"
                                          : " · Groq Whisper"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Source transcript
                                      </p>
                                      <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-white border border-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto leading-relaxed">
                                        {voice.transcript || "—"}
                                      </pre>
                                    </div>
                                    {voice.translation && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                          English translation
                                        </p>
                                        <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-white border border-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto leading-relaxed">
                                          {voice.translation}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Cleaned output
                                  </p>
                                  <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-white border border-gray-100 rounded-lg p-3 max-h-56 overflow-y-auto leading-relaxed">
                                    {f.cleanedContent}
                                  </pre>
                                </div>
                              );
                            })()
                          ) : (
                            <p className="text-xs text-gray-500">
                              No cleaned content available for this file.
                            </p>
                          )}
                          {f.actions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Pipeline steps
                              </p>
                              <ul className="space-y-1.5">
                                {f.actions.map((a) => (
                                  <li
                                    key={`${f.id}-detail-${a.type}`}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <IconCheck
                                      size={13}
                                      className="text-green-500 shrink-0 mt-0.5"
                                    />
                                    <span className="font-mono text-gray-500 w-40 shrink-0">
                                      {a.type}
                                    </span>
                                    <span className="text-gray-600">
                                      {a.description || "Applied"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
