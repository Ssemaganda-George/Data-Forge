"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconFileText,
  IconDownload,
  IconCheck,
} from "@tabler/icons-react";
import { ExportActions } from "@/components/export-actions";
import type { DataCard } from "@/lib/data-card";
import type { ExportFormat } from "@/lib/export-builder";

const FORMATS = [
  {
    id: "CSV" as const,
    label: "CSV",
    description: "Comma-separated values — compatible with pandas, Excel, and most ML tools.",
  },
  {
    id: "JSON" as const,
    label: "JSON",
    description: "Nested JSON — ideal for fine-tuning LLMs and document datasets.",
  },
  {
    id: "PARQUET" as const,
    label: "Parquet",
    description: "Ships JSON fallback until native Parquet encoding is enabled.",
  },
  {
    id: "COCO" as const,
    label: "COCO JSON",
    description: "COCO annotation format — for computer vision and object detection tasks.",
  },
];

interface ExportPageClientProps {
  projectId: string;
  batchId: string | null;
  dataCard: DataCard | null;
  fileCount: number;
}

export function ExportPageClient({
  projectId,
  batchId,
  dataCard,
  fileCount,
}: ExportPageClientProps) {
  const [format, setFormat] = useState<ExportFormat>("JSON");

  async function downloadDatacard() {
    if (!dataCard) return;
    const blob = new Blob([JSON.stringify(dataCard, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datacard-${batchId?.slice(0, 8) ?? "batch"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!batchId || fileCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`/projects/${projectId}/review`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4"
          >
            <IconArrowLeft size={14} />
            Back to review
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Export dataset</h1>
          <p className="mt-2 text-sm text-gray-500">
            No cleaned files in this project yet. Upload and process files from the dashboard first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/projects/${projectId}/review`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <IconArrowLeft size={14} />
          Back to review
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Export dataset</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Choose a format and download your cleaned, model-ready dataset ({fileCount} file
          {fileCount === 1 ? "" : "s"}).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Select format</h2>
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <label
                  key={f.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
                >
                  <input
                    type="radio"
                    name="format"
                    value={f.id}
                    checked={format === f.id}
                    onChange={() => setFormat(f.id)}
                    className="mt-0.5 text-brand-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <ExportActions batchId={batchId} format={format} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconFileText size={16} className="text-gray-400" stroke={1.5} />
                <h2 className="text-sm font-semibold text-gray-900">Data card</h2>
              </div>
              <button
                type="button"
                onClick={() => downloadDatacard()}
                disabled={!dataCard}
                className="text-xs text-brand-600 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <IconDownload size={12} />
                JSON
              </button>
            </div>

            {dataCard ? (
              <>
                <section className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Source
                  </p>
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total files</dt>
                      <dd className="font-medium text-gray-800">
                        {dataCard.sourceSummary.totalFiles.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total size</dt>
                      <dd className="font-medium text-gray-800">
                        {dataCard.sourceSummary.totalSizeMb.toLocaleString()} MB
                      </dd>
                    </div>
                    {Object.entries(dataCard.sourceSummary.fileTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <dt className="text-gray-400 font-mono">{type}</dt>
                        <dd className="text-gray-600">{count}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Cleaning actions
                  </p>
                  <ul className="space-y-1.5">
                    {dataCard.cleaningActions.map((a) => (
                      <li key={a.type} className="flex items-center gap-2 text-xs">
                        <IconCheck size={12} className="text-green-500 shrink-0" />
                        <span className="text-gray-600">{a.description}</span>
                        <span className="ml-auto text-gray-400">×{a.count}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Quality
                  </p>
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Avg confidence</dt>
                      <dd className="font-medium text-gray-800">
                        {(dataCard.qualityStats.avgConfidenceScore * 100).toFixed(1)}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Accepted</dt>
                      <dd className="font-medium text-green-600">
                        {dataCard.qualityStats.acceptedCount}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Flagged</dt>
                      <dd className="font-medium text-amber-600">
                        {dataCard.qualityStats.flaggedCount}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Rejected</dt>
                      <dd className="font-medium text-gray-800">
                        {dataCard.qualityStats.rejectedCount}
                      </dd>
                    </div>
                  </dl>
                </section>
              </>
            ) : (
              <p className="text-xs text-gray-400">No data card available for this batch.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
