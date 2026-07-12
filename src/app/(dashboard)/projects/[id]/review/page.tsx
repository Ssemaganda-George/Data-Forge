import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconCheck, IconX, IconEdit, IconFilterCog } from "@tabler/icons-react";

export const metadata: Metadata = { title: "Review files" };

const PLACEHOLDER_FILES = [
  {
    id: "fr_1",
    name: "call_001.mp3",
    type: "audio/mpeg",
    confidence: 0.94,
    flagged: false,
    actions: ["AUDIO_TRANSCRIPTION", "LANGUAGE_DETECT"],
    accepted: true,
  },
  {
    id: "fr_2",
    name: "call_002.wav",
    type: "audio/wav",
    confidence: 0.87,
    flagged: false,
    actions: ["AUDIO_TRANSCRIPTION", "SPEAKER_DIARIZE"],
    accepted: true,
  },
  {
    id: "fr_3",
    name: "call_004.wav",
    type: "audio/wav",
    confidence: 0.42,
    flagged: true,
    actions: ["AUDIO_TRANSCRIPTION"],
    accepted: false,
  },
  {
    id: "fr_4",
    name: "call_007.mp3",
    type: "audio/mpeg",
    confidence: 0.38,
    flagged: true,
    actions: ["AUDIO_TRANSCRIPTION", "LANGUAGE_DETECT"],
    accepted: false,
  },
  {
    id: "fr_5",
    name: "call_010.mp3",
    type: "audio/mpeg",
    confidence: 0.91,
    flagged: false,
    actions: ["AUDIO_TRANSCRIPTION", "LANGUAGE_DETECT", "SPEAKER_DIARIZE"],
    accepted: true,
  },
];

export default async function ReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const flaggedCount = PLACEHOLDER_FILES.filter((f) => f.flagged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total files",
            value: PLACEHOLDER_FILES.length,
            color: "text-gray-900",
          },
          {
            label: "Flagged",
            value: flaggedCount,
            color: "text-amber-600",
          },
          {
            label: "Accepted",
            value: PLACEHOLDER_FILES.filter((f) => f.accepted).length,
            color: "text-green-600",
          },
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

      {/* File table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
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
            {PLACEHOLDER_FILES.map((f) => (
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
                    {f.actions.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          f.confidence >= 0.8
                            ? "bg-green-500"
                            : f.confidence >= 0.6
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${f.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={f.flagged ? "flagged" : "ready"} />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
