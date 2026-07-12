import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowLeft,
  IconFileText,
  IconDownload,
  IconCheck,
} from "@tabler/icons-react";
import { ExportActions } from "@/components/export-actions";

export const metadata: Metadata = { title: "Export dataset" };

const FORMATS = [
  {
    id: "CSV",
    label: "CSV",
    description: "Comma-separated values — compatible with pandas, Excel, and most ML tools.",
  },
  {
    id: "JSON",
    label: "JSON",
    description: "Nested JSON — ideal for fine-tuning LLMs and document datasets.",
  },
  {
    id: "PARQUET",
    label: "Parquet",
    description: "Columnar binary format — optimal for large-scale analytics and HuggingFace datasets.",
  },
  {
    id: "COCO",
    label: "COCO JSON",
    description: "COCO annotation format — for computer vision and object detection tasks.",
  },
] as const;

const PLACEHOLDER_DATA_CARD = {
  batchId: "batch_1",
  generatedAt: "2026-07-12T10:24:00Z",
  sourceSummary: {
    totalFiles: 320,
    fileTypes: { "audio/mpeg": 200, "audio/wav": 120 },
    totalSizeMb: 1240,
  },
  cleaningActions: [
    { type: "AUDIO_TRANSCRIPTION", count: 320, description: "Audio transcribed to text" },
    { type: "LANGUAGE_DETECT", count: 320, description: "Language detected: en" },
    { type: "SPEAKER_DIARIZE", count: 280, description: "Speakers identified" },
    { type: "DEDUP_CHECK", count: 320, description: "Near-duplicate check" },
    { type: "PII_REDACTION", count: 14, description: "PII items redacted" },
  ],
  qualityStats: {
    avgConfidenceScore: 0.91,
    flaggedCount: 4,
    acceptedCount: 316,
    rejectedCount: 0,
  },
};

export default function ExportPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/projects/${params.id}/review`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <IconArrowLeft size={14} />
          Back to review
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Export dataset</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Choose a format and download your cleaned, model-ready dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Format + download — 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {/* Format selector */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Select format
            </h2>
            <div className="space-y-2">
              {FORMATS.map((f, i) => (
                <label
                  key={f.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 cursor-pointer hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
                >
                  <input
                    type="radio"
                    name="format"
                    value={f.id}
                    defaultChecked={i === 0}
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

          {/* Download + send */}
          <ExportActions />
        </div>

        {/* Data Card — 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconFileText size={16} className="text-gray-400" stroke={1.5} />
                <h2 className="text-sm font-semibold text-gray-900">
                  Data card
                </h2>
              </div>
              <button className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <IconDownload size={12} />
                PDF
              </button>
            </div>

            {/* Source summary */}
            <section className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Source
              </p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total files</dt>
                  <dd className="font-medium text-gray-800">
                    {PLACEHOLDER_DATA_CARD.sourceSummary.totalFiles.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total size</dt>
                  <dd className="font-medium text-gray-800">
                    {PLACEHOLDER_DATA_CARD.sourceSummary.totalSizeMb.toLocaleString()} MB
                  </dd>
                </div>
                {Object.entries(
                  PLACEHOLDER_DATA_CARD.sourceSummary.fileTypes
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <dt className="text-gray-400 font-mono">{type}</dt>
                    <dd className="text-gray-600">{count}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Cleaning actions */}
            <section className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Cleaning actions
              </p>
              <ul className="space-y-1.5">
                {PLACEHOLDER_DATA_CARD.cleaningActions.map((a) => (
                  <li key={a.type} className="flex items-center gap-2 text-xs">
                    <IconCheck
                      size={12}
                      className="text-green-500 shrink-0"
                    />
                    <span className="text-gray-600">{a.description}</span>
                    <span className="ml-auto text-gray-400">×{a.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Quality */}
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Quality
              </p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Avg confidence</dt>
                  <dd className="font-medium text-gray-800">
                    {(
                      PLACEHOLDER_DATA_CARD.qualityStats.avgConfidenceScore *
                      100
                    ).toFixed(1)}
                    %
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Accepted</dt>
                  <dd className="font-medium text-green-600">
                    {PLACEHOLDER_DATA_CARD.qualityStats.acceptedCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Flagged</dt>
                  <dd className="font-medium text-amber-600">
                    {PLACEHOLDER_DATA_CARD.qualityStats.flaggedCount}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Rejected</dt>
                  <dd className="font-medium text-gray-800">
                    {PLACEHOLDER_DATA_CARD.qualityStats.rejectedCount}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
