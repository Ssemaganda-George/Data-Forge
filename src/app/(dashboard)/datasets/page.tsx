import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { IconDatabase, IconDownload } from "@tabler/icons-react";

export const metadata: Metadata = { title: "Datasets" };

const DATASETS = [
  {
    id: "ds_1",
    name: "Customer support transcripts — CSV",
    format: "CSV",
    project: "Customer support transcripts",
    fileCount: 316,
    sizeMb: 48,
    createdAt: "Jul 11, 2026",
  },
  {
    id: "ds_2",
    name: "Invoice OCR — JSON",
    format: "JSON",
    project: "Invoice OCR dataset",
    fileCount: 85,
    sizeMb: 12,
    createdAt: "Jul 9, 2026",
  },
  {
    id: "ds_3",
    name: "Product images — COCO",
    format: "COCO",
    project: "Product image catalogue",
    fileCount: 1402,
    sizeMb: 980,
    createdAt: "Jul 8, 2026",
  },
];

export default function DatasetsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Datasets</h1>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
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
            {DATASETS.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    <IconDatabase size={15} className="text-gray-400 shrink-0" stroke={1.5} />
                    {d.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{d.project}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700">
                    {d.format}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{d.fileCount.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{d.sizeMb} MB</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{d.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
                    <IconDownload size={13} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
